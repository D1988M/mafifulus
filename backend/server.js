require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const axios = require('axios');
const multer = require('multer');
const jwt = require('jsonwebtoken');
const XLSX = require('xlsx');
const { PrismaClient } = require('@prisma/client');

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-key-change-in-prod';

// --- Middleware ---
app.use(cors());
app.use(bodyParser.json({ limit: '50mb' })); // Increased limit for large file uploads

// --- Database Setup ---
const prisma = new PrismaClient();
let dbAvailable = false;

// Check DB connection on start
prisma.$connect()
  .then(() => {
    console.log('[DB] Connected to Database successfully.');
    dbAvailable = true;
  })
  .catch((e) => {
    console.warn('[DB Warning] Could not connect to Database. Running in Mock/Dev mode.');
    console.warn('    -> To fix: Ensure DATABASE_URL is set in .env and Postgres is running.');
  });

// --- File Upload Setup (Multer) ---
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// --- In-Memory Mock Store (Fallback) ---
const mockUsers = new Map();

// --- API Routes ---

/**
 * AUTH: Login or Register
 */
app.post('/api/auth/login', async (req, res) => {
  const { phoneNumber, name } = req.body;
  if (!phoneNumber) return res.status(400).json({ error: 'Phone number required' });

  try {
    let user;
    if (dbAvailable) {
      // Check if user exists first
      const existingUser = await prisma.user.findUnique({ where: { phoneNumber } });

      if (!existingUser) {
        // New User? Check Invite Code
        const { inviteCode } = req.body;
        const SERVER_CODE = process.env.INVITE_CODE;

        if (SERVER_CODE && inviteCode !== SERVER_CODE) {
          return res.status(403).json({ error: 'Invalid Invite Code. Access Denied.' });
        }
      }

      user = await prisma.user.upsert({
        where: { phoneNumber },
        update: { fullName: name },
        create: { phoneNumber, fullName: name || 'Anonymous' },
      });
    } else {
      console.log(`[Mock DB] Login for ${phoneNumber}`);
      user = { id: 'mock-user-id-' + Date.now(), phoneNumber, fullName: name };
      mockUsers.set(phoneNumber, user);
    }

    const token = jwt.sign({ userId: user.id, phone: user.phoneNumber }, JWT_SECRET, { expiresIn: '7d' });

    res.json({
      success: true,
      token,
      user: { id: user.id, name: user.fullName }
    });

  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

/**
 * EXPORT: Generate Excel File (Backend Implementation)
 * Receives JSON transactions, returns .xlsx file
 */
app.post('/api/export/excel', (req, res) => {
  try {
    const { transactions } = req.body;
    if (!transactions || !Array.isArray(transactions)) {
      return res.status(400).json({ error: 'Invalid transactions data' });
    }

    console.log(`[Export] Generating Excel for ${transactions.length} transactions...`);

    // 1. Format data for Excel
    const excelData = transactions.map(t => ({
      Date: t.date,
      Description: t.description,
      Category: t.category,
      Amount: t.amount,
      Currency: t.currency || 'AED'
    }));

    // 2. Create Workbook
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(excelData);

    // Adjust column widths
    const wscols = [
      { wch: 12 }, // Date
      { wch: 40 }, // Description
      { wch: 15 }, // Category
      { wch: 10 }, // Amount
      { wch: 8 }   // Currency
    ];
    ws['!cols'] = wscols;

    XLSX.utils.book_append_sheet(wb, ws, "Mafifulus Report");

    // 3. Write to buffer
    const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

    // 4. Send response
    res.setHeader('Content-Disposition', 'attachment; filename="Mafifulus_Report.xlsx"');
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.send(buffer);

  } catch (error) {
    console.error('Excel Generation Error:', error);
    res.status(500).json({ error: 'Failed to generate Excel file' });
  }
});

/**
 * DATA: Confirm Transactions
 * Saves reviewed transactions to the database
 */
app.post('/api/transactions/confirm', async (req, res) => {
  const { userId, transactions } = req.body;
  if (!transactions || !Array.isArray(transactions)) {
    return res.status(400).json({ error: 'Invalid transactions data' });
  }

  try {
    const userExists = userId ? await prisma.user.findUnique({ where: { id: userId } }) : null;

    // Filter out items marked for deletion (if any logic assumes that)
    // For now we assume the frontend sends only what should be kept.

    if (dbAvailable) {
      // Batch Insert
      const count = await prisma.transaction.createMany({
        data: transactions.map(t => ({
          userId: userExists ? userId : undefined, // Link if user exists
          date: new Date(t.date),
          description: t.description,
          amount: parseFloat(t.amount),
          currency: t.currency || 'AED',
          category: t.category,
          type: t.amount < 0 ? 'expense' : 'income'
        }))
      });
      console.log(`[DB] Saved ${count.count} transactions.`);
      res.json({ success: true, count: count.count });
    } else {
      console.log(`[Mock DB] Would save ${transactions.length} transactions.`);
      res.json({ success: true, count: transactions.length, mock: true });
    }
  } catch (error) {
    console.error('Save Transactions Error:', error);
    res.status(500).json({ error: 'Failed to save transactions' });
  }
});

/**
 * UPLOAD: Handle PDF Upload
 */
app.post('/api/statements/upload', upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  console.log(`[Upload] Received file: ${req.file.originalname} (${req.file.size} bytes)`);

  // In a real app, we would process the PDF here using Gemini API server-side
  // For now, we simulate success as the frontend handles the parsing in this MVP.

  res.json({
    success: true,
    message: 'File uploaded successfully',
    fileId: 'file-' + Date.now(),
  });
});

app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
  console.log(`Infrastructure Mode: ${dbAvailable ? 'PERSISTENT (Postgres)' : 'EPHEMERAL (Mock)'}`);
});