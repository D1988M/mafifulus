
import React, { useState, useMemo } from 'react';
import { Transaction } from '../types';
import { Download, ArrowRight, Trash2, Search, ArrowLeft, Table as TableIcon, List as ListIcon, DollarSign, Tag, Sparkles } from 'lucide-react';

interface DataReviewProps {
  transactions: Transaction[];
  onUpdate: (transactions: Transaction[]) => void;
  onConfirm: () => void;
  onBack: () => void;
}

const CATEGORIES = [
  "Dining Out", "Supermarket", "Fuel", "Housing", "Education",
  "Subscriptions", "Healthcare", "Transportation", "Travel",
  "Shopping", "Utilities", "Income", "Transfer", "Entertainment", "Other"
];

export const DataReview: React.FC<DataReviewProps> = ({ transactions, onUpdate, onConfirm, onBack }) => {
  const [filterText, setFilterText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [viewMode, setViewMode] = useState<'table' | 'list'>('table');
  const [sortConfig, setSortConfig] = useState<{ key: keyof Transaction | 'date_val'; direction: 'asc' | 'desc' }>({
    key: 'date_val',
    direction: 'desc'
  });

  // Undo History
  const [history, setHistory] = useState<Transaction[][]>([]);

  // Helper to save current state before making changes
  const saveToHistory = () => {
    setHistory(prev => [...prev, transactions]);
  };

  const handleUndo = () => {
    if (history.length === 0) return;
    const previousState = history[history.length - 1];
    setHistory(prev => prev.slice(0, -1));
    onUpdate(previousState);
  };

  // Keyboard support for Undo
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        e.preventDefault();
        handleUndo();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [history, transactions]);

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    saveToHistory();
    onUpdate(transactions.filter(t => t.id !== id));
  };

  const handleCategoryChange = (id: string, newCategory: string) => {
    saveToHistory();
    onUpdate(transactions.map(t => t.id === id ? { ...t, category: newCategory } : t));
  };

  const filteredTransactions = useMemo(() => {
    let data = [...transactions];

    // 1. Filter by Text (Global)
    if (filterText) {
      const lower = filterText.toLowerCase();
      data = data.filter(t =>
        t.description.toLowerCase().includes(lower) ||
        t.category.toLowerCase().includes(lower) ||
        t.date.includes(lower)
      );
    }

    // 2. Filter by Category
    if (selectedCategory !== 'All') {
      data = data.filter(t => t.category === selectedCategory);
    }

    // 3. Sort
    data.sort((a, b) => {
      const key = sortConfig.key;
      let comparison = 0;

      if (key === 'date_val') {
        const dateA = new Date(a.date).getTime();
        const dateB = new Date(b.date).getTime();
        comparison = dateA - dateB;
      } else if (key === 'amount') {
        comparison = a.amount - b.amount;
      } else {
        // String comparison (Description, Category)
        const valA = String(a[key as keyof Transaction] || '').toLowerCase();
        const valB = String(b[key as keyof Transaction] || '').toLowerCase();
        comparison = valA.localeCompare(valB);
      }

      return sortConfig.direction === 'asc' ? comparison : -comparison;
    });

    return data;
  }, [transactions, filterText, selectedCategory, sortConfig]);

  const requestSort = (key: keyof Transaction | 'date_val') => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const groupedTransactions = useMemo(() => {
    const groups: { [key: string]: Transaction[] } = {};
    filteredTransactions.forEach(t => {
      const dateKey = new Date(t.date).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      if (!groups[dateKey]) groups[dateKey] = [];
      groups[dateKey].push(t);
    });
    return groups;
  }, [filteredTransactions]);

  const downloadCSV = () => {
    const headers = ['Date', 'Description', 'Category', 'Amount', 'Currency'];
    const csvContent = [
      headers.join(','),
      ...transactions.map(t =>
        [t.date, `"${t.description.replace(/"/g, '""')}"`, t.category, t.amount, t.currency].join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'mafifulus_export.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="animate-fade-in space-y-8 max-w-5xl mx-auto px-4 pb-20">

      {/* Demo Data Warning */}
      {transactions.some(t => t.isDemo) && (
        <div className="bg-orange-50 border-l-4 border-orange-500 p-4 rounded-r-xl shadow-sm">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <span className="text-2xl">⚠️</span>
            </div>
            <div className="ml-3">
              <p className="text-sm text-orange-700 font-bold">
                Using Demo Data
              </p>
              <p className="text-sm text-orange-600">
                We couldn't process your PDF.
                <br />
                <strong>Reason:</strong> {transactions[0]?.debugError || "Unknown Error"}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 pb-6 border-b border-gray-200">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="p-2.5 text-gray-400 hover:text-gray-900 bg-white border border-gray-200 hover:bg-gray-50 rounded-xl transition-all shadow-sm"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Review Transactions</h2>
            <p className="text-gray-500 text-sm">Verify your data before generating insights.</p>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={downloadCSV}
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 hover:border-gray-300 font-medium transition-all text-sm shadow-sm"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
          <button
            onClick={onConfirm}
            className="flex items-center gap-2 px-6 py-2.5 bg-gray-900 text-white rounded-xl hover:bg-black font-semibold shadow-md hover:shadow-lg transition-all text-sm"
          >
            Generate Dashboard
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Merrit's Initial Review */}
      <div className="bg-indigo-50 border border-indigo-100 p-5 rounded-2xl flex gap-4 items-start shadow-sm">
        <div className="p-2.5 bg-white border border-indigo-100 rounded-xl shadow-sm text-indigo-600">
          <Sparkles className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-gray-900 mb-1">Merrit's Initial Review</h3>
          <p className="text-sm text-gray-700 leading-relaxed">
            I noticed <span className="font-semibold text-indigo-700">deletable items</span> (Islamic banks salam delivery/profit sharing) that could improve your cash flow accuracy. You can remove them below before we finalize your analysis.
          </p>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-white p-3 rounded-2xl border border-gray-200 shadow-sm">
        <div className="flex gap-3 items-center flex-1 w-full px-2">
          <Search className="w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search transactions..."
            className="bg-transparent border-none outline-none w-full text-gray-700 placeholder-gray-400 text-sm"
            value={filterText}
            onChange={e => setFilterText(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-3 px-2">
          <Tag className="w-4 h-4 text-gray-400" />
          <select
            className="bg-transparent border-none outline-none text-gray-700 text-sm cursor-pointer"
            value={selectedCategory}
            onChange={e => setSelectedCategory(e.target.value)}
          >
            <option value="All">All Categories</option>
            {CATEGORIES.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
        <div className="flex bg-gray-100/50 rounded-xl p-1 shrink-0">
          <button
            onClick={() => setViewMode('table')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${viewMode === 'table' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
          >
            <TableIcon className="w-4 h-4" />
            Table
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${viewMode === 'list' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
          >
            <ListIcon className="w-4 h-4" />
            Stream
          </button>
        </div>
      </div>

      {/* View Rendering */}
      {viewMode === 'table' ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50 border-b border-gray-100 text-xs uppercase text-gray-500 font-semibold tracking-wider">
                  <th className="px-6 py-4 cursor-pointer hover:text-emerald-600 transition-colors" onClick={() => requestSort('date_val')}>
                    <div className="flex items-center gap-1">Date {sortConfig.key === 'date_val' && (sortConfig.direction === 'asc' ? '↑' : '↓')}</div>
                  </th>
                  <th className="px-6 py-4 w-1/3 cursor-pointer hover:text-emerald-600 transition-colors" onClick={() => requestSort('description')}>
                    <div className="flex items-center gap-1">Description {sortConfig.key === 'description' && (sortConfig.direction === 'asc' ? '↑' : '↓')}</div>
                  </th>
                  <th className="px-6 py-4 cursor-pointer hover:text-emerald-600 transition-colors" onClick={() => requestSort('category')}>
                    <div className="flex items-center gap-1">Category {sortConfig.key === 'category' && (sortConfig.direction === 'asc' ? '↑' : '↓')}</div>
                  </th>
                  <th className="px-6 py-4 text-right cursor-pointer hover:text-emerald-600 transition-colors" onClick={() => requestSort('amount')}>
                    <div className="flex items-center gap-1 justify-end">Amount {sortConfig.key === 'amount' && (sortConfig.direction === 'asc' ? '↑' : '↓')}</div>
                  </th>
                  <th className="px-6 py-4 text-center"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredTransactions.map(t => (
                  <tr key={t.id} className="hover:bg-gray-50 transition-colors group">
                    <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">{t.date}</td>
                    <td className="px-6 py-4 text-sm text-gray-900 font-medium">{t.description}</td>
                    <td className="px-6 py-4 text-sm">
                      <input
                        list={`categories-table-${t.id}`}
                        type="text"
                        className="bg-transparent border-none focus:ring-0 text-gray-600 w-full hover:text-emerald-600 cursor-pointer transition-colors p-0"
                        value={t.category}
                        onChange={(e) => handleCategoryChange(t.id, e.target.value)}
                      />
                      <datalist id={`categories-table-${t.id}`}>
                        {CATEGORIES.map(cat => <option key={cat} value={cat} />)}
                      </datalist>
                    </td>
                    <td className={`px-6 py-4 text-sm font-mono text-right font-medium ${t.amount > 0 ? 'text-emerald-600' : 'text-gray-900'}`}>
                      {t.amount > 0 ? '+' : ''}{t.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={(e) => handleDelete(t.id, e)}
                        className="text-gray-300 hover:text-red-500 transition-colors p-2 hover:bg-red-50 rounded-full opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filteredTransactions.length === 0 && (
            <div className="text-center py-20">
              <p className="text-gray-400">No transactions found.</p>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedTransactions).map(([date, items]: [string, Transaction[]]) => (
            <div key={date} className="space-y-3">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider px-2 sticky top-20 z-10">{date}</h3>
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden divide-y divide-gray-50">
                {items.map(t => (
                  <div key={t.id} className="group flex flex-col sm:flex-row items-start sm:items-center justify-between p-5 hover:bg-gray-50/80 transition-colors gap-4">
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 border ${t.amount < 0 ? 'bg-white border-gray-200 text-gray-500' : 'bg-emerald-50 border-emerald-100 text-emerald-600'}`}>
                        {t.amount < 0 ? <Tag className="w-5 h-5" /> : <DollarSign className="w-5 h-5" />}
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-gray-900 truncate text-sm">{t.description}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <input
                            list={`categories-${t.id}`}
                            type="text"
                            className="text-xs text-gray-500 bg-transparent border-none p-0 focus:ring-0 hover:text-emerald-600 cursor-pointer w-auto"
                            value={t.category}
                            onChange={(e) => handleCategoryChange(t.id, e.target.value)}
                          />
                          <datalist id={`categories-${t.id}`}>
                            {CATEGORIES.map(cat => <option key={cat} value={cat} />)}
                          </datalist>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between w-full sm:w-auto gap-6">
                      <div className={`text-right font-mono font-medium text-sm ${t.amount > 0 ? 'text-emerald-600' : 'text-gray-900'}`}>
                        {t.amount > 0 ? '+' : ''}{t.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </div>
                      <button
                        onClick={(e) => handleDelete(t.id, e)}
                        className="text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all p-2 hover:bg-red-50 rounded-full"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};