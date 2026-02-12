import { GoogleGenAI, Type, Modality, LiveServerMessage } from "@google/genai";
import { Transaction, LifeObjective } from "../types";

const apiKey = import.meta.env.VITE_GEMINI_API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

// --- Helper Functions for Audio Encoding/Decoding ---

function encode(bytes: Uint8Array) {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

/**
 * Downsamples Float32 audio data to 16kHz Int16.
 * Uses linear interpolation for basic quality resampling.
 */
function downsampleTo16k(inputData: Float32Array, inputSampleRate: number): Int16Array {
  const targetSampleRate = 16000;

  if (inputSampleRate === targetSampleRate) {
    const l = inputData.length;
    const int16 = new Int16Array(l);
    for (let i = 0; i < l; i++) {
      int16[i] = Math.max(-1, Math.min(1, inputData[i])) * 32768;
    }
    return int16;
  }

  const ratio = inputSampleRate / targetSampleRate;
  const newLength = Math.round(inputData.length / ratio);
  const result = new Int16Array(newLength);

  for (let i = 0; i < newLength; i++) {
    const offset = i * ratio;
    const index = Math.floor(offset);
    const nextIndex = Math.min(index + 1, inputData.length - 1);
    const weight = offset - index;

    // Linear interpolation
    const val = inputData[index] * (1 - weight) + inputData[nextIndex] * weight;

    // Clamp and convert to Int16
    result[i] = Math.max(-1, Math.min(1, val)) * 32768;
  }
  return result;
}

function createPCM16Blob(data: Int16Array): { data: string, mimeType: string } {
  return {
    data: encode(new Uint8Array(data.buffer)),
    mimeType: 'audio/pcm;rate=16000',
  };
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  // Safety check for 16-bit PCM alignment
  if (data.byteLength % 2 !== 0) {
    console.warn("Received odd byte length for PCM16 audio, trimming one byte.");
    data = data.subarray(0, data.byteLength - 1);
  }

  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

// --- Live Session Logic ---

export const startLiveSession = async (
  systemInstruction: string,
  onSpeakingStateChanged: (isSpeaking: boolean) => void,
  onError: (error: Error) => void,
  onClose: () => void
) => {
  if (!apiKey) throw new Error("API Key is missing");

  // Audio Contexts - Create without sampleRate first to match hardware
  const inputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  const outputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)();

  // CRITICAL: Resume audio context to prevent browser autoplay blocking
  try {
    await outputAudioContext.resume();
  } catch (e) {
    console.error("Audio Context Resume failed", e);
  }

  let inputSource: MediaStreamAudioSourceNode | null = null;
  let processor: ScriptProcessorNode | null = null;
  let nextStartTime = 0;
  const sources = new Set<AudioBufferSourceNode>();

  const outputNode = outputAudioContext.createGain();
  outputNode.gain.value = 1.0;
  outputNode.connect(outputAudioContext.destination);

  let session: any = null;

  try {
    // Parallelize: Start connecting to API and Requesting Mic at the same time
    const streamPromise = navigator.mediaDevices.getUserMedia({ audio: true });

    const sessionPromise = ai.live.connect({
      model: 'gemini-2.5-flash-native-audio-preview-09-2025',
      config: {
        responseModalities: [Modality.AUDIO],
        systemInstruction: systemInstruction,
        speechConfig: {
          voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } }
        },
        inputAudioTranscription: {},
        outputAudioTranscription: {}
      },
      callbacks: {
        onopen: async () => {
          console.log("Live session connected");

          // Wait for stream to be ready (if API connected faster than user clicked allow)
          const stream = await streamPromise;

          // Start Input Stream
          inputSource = inputAudioContext.createMediaStreamSource(stream);
          processor = inputAudioContext.createScriptProcessor(4096, 1, 1);

          processor.onaudioprocess = (e) => {
            const inputData = e.inputBuffer.getChannelData(0);

            // Downsample from hardware rate (e.g. 44.1k/48k) to 16k required by Gemini
            const pcm16Data = downsampleTo16k(inputData, inputAudioContext.sampleRate);
            const pcmBlob = createPCM16Blob(pcm16Data);

            sessionPromise.then(s => {
              s.sendRealtimeInput({ media: pcmBlob });
            });
          };

          inputSource.connect(processor);
          processor.connect(inputAudioContext.destination);
        },
        onmessage: async (message: LiveServerMessage) => {
          // Handle Audio Output - Iterate over all parts
          const parts = message.serverContent?.modelTurn?.parts;
          if (parts) {
            for (const part of parts) {
              const base64Audio = part.inlineData?.data;
              if (base64Audio) {
                onSpeakingStateChanged(true);

                // Sync play time
                nextStartTime = Math.max(nextStartTime, outputAudioContext.currentTime);

                try {
                  const audioBuffer = await decodeAudioData(
                    decode(base64Audio),
                    outputAudioContext,
                    24000, // Response is always 24kHz
                    1
                  );

                  const source = outputAudioContext.createBufferSource();
                  source.buffer = audioBuffer;
                  source.connect(outputNode);

                  source.onended = () => {
                    sources.delete(source);
                    if (sources.size === 0) {
                      onSpeakingStateChanged(false);
                    }
                  };

                  source.start(nextStartTime);
                  nextStartTime += audioBuffer.duration;
                  sources.add(source);
                } catch (decodeErr) {
                  console.error("Audio Decode Error:", decodeErr);
                }
              }
            }
          }

          if (message.serverContent?.interrupted) {
            sources.forEach(s => s.stop());
            sources.clear();
            nextStartTime = 0;
            onSpeakingStateChanged(false);
          }
        },
        onclose: () => {
          console.log("Live session closed");
          onClose();
        },
        onerror: (err) => {
          console.error("Live session error:", err);
          onError(err instanceof Error ? err : new Error("Unknown error"));
        }
      }
    });

    const [connectedSession, stream] = await Promise.all([sessionPromise, streamPromise]);
    session = connectedSession;

    return () => {
      // Cleanup function
      inputSource?.disconnect();
      processor?.disconnect();
      stream.getTracks().forEach(t => t.stop());
      inputAudioContext.close();

      sources.forEach(s => s.stop());
      outputAudioContext.close();

      session?.close();
    };

  } catch (error) {
    console.error("Failed to start live session:", error);
    if (inputAudioContext.state !== 'closed') inputAudioContext.close();
    if (outputAudioContext.state !== 'closed') outputAudioContext.close();
    throw error;
  }
};


// --- Demo Data Generator (Fallback) ---
const generateDemoTransactions = (errorMessage?: string): Transaction[] => {
  const categories = ["Dining Out", "Supermarket", "Housing", "Fuel", "Subscriptions", "Entertainment", "Income"];
  const descs = {
    "Dining Out": ["Restaurant Payment", "Coffee Shop", "Fast Food", "Local Cafe"],
    "Supermarket": ["Grocery Store", "Hypermarket", "Convenience Store"],
    "Housing": ["Rent Payment", "Utility Bill", "Maintenance Fee", "Furniture Store"],
    "Fuel": ["Petrol Station", "Service Station", "Gas Station"],
    "Subscriptions": ["Streaming Service", "Music Subscription", "App Store", "Cloud Storage"],
    "Entertainment": ["Cinema", "Video Games", "Bowling", "Concert Ticket"],
    "Income": ["Salary Transfer", "Freelance Payment", "Deposit"]
  };

  const data: Transaction[] = [];
  const today = new Date();

  // Create 20 random transactions
  for (let i = 0; i < 20; i++) {
    const cat = categories[Math.floor(Math.random() * categories.length)];
    // @ts-ignore
    const desc = descs[cat][Math.floor(Math.random() * descs[cat].length)];
    const isIncome = cat === "Income";
    const amount = isIncome ? (Math.random() * 5000 + 2000) : -(Math.random() * 300 + 20);

    const date = new Date(today);
    date.setDate(today.getDate() - Math.floor(Math.random() * 30));

    data.push({
      id: Math.random().toString(36).substring(7),
      date: date.toISOString().split('T')[0],
      description: i === 0 ? `DEMO MODE: ${errorMessage || 'Unknown Cause'}` : desc, // Show error in first item
      amount: parseFloat(amount.toFixed(2)),
      currency: 'AED',
      category: cat,
      isDemo: true,
      debugError: errorMessage
    });
  }
  return data;
};

function cleanJson(text: string): string {
  // Remove markdown code blocks if present
  let cleaned = text.replace(/```json/g, '').replace(/```/g, '');
  return cleaned.trim();
}

/**
 * Parses a PDF bank statement to extract transactions.
 */
export const parseBankStatement = async (base64Pdf: string): Promise<Transaction[]> => {
  // Set a timeout to prevent infinite loading state
  const timeoutPromise = new Promise<Transaction[]>((_, reject) =>
    setTimeout(() => reject(new Error("Analysis timed out")), 90000)
  );

  const analysisPromise = async (): Promise<Transaction[]> => {
    if (!apiKey) {
      console.warn("[GeminiService] No API Key found in VITE_GEMINI_API_KEY. Falling back to Demo Data.");
      return generateDemoTransactions("Missing API Key in VITE_GEMINI_API_KEY");
    }

    const currentYear = new Date().getFullYear();
    const prompt = `
        Analyze this bank statement PDF. Extract all transactions.
        
        CRITICAL ACCURACY INSTRUCTIONS:
        1. YEAR: Look at the top of the document (Statement Period/Date Range/Generation Date) to identify the CORRECT YEAR (e.g., 2024, 2025). 
        2. TRANSACTION DATES: Return as YYYY-MM-DD. Use the year identified in step 1.
        3. DESCRIPTION: Use the EXACT ORIGINAL TEXT found in the description column of the statement. DO NOT summarize, DO NOT rename vendors, and DO NOT truncate the text yourself. Keep every detail from the row (e.g., "PURCHASE-FUEL ADNOC 123456").
        4. AMOUNT: Positive for credits/income, negative for debits/expenses.
        5. CURRENCY: Always set to 'AED' (UAE Dirhams), regardless of the symbol in the document.
        6. CATEGORY: Classify precisely based on the description.
        
        Return ONLY a JSON array. No markdown tags.
    `;

    try {
      const response = await ai.models.generateContent({
        model: "gemini-1.5-flash-001",
        contents: {
          parts: [
            { inlineData: { mimeType: "application/pdf", data: base64Pdf } },
            { text: prompt }
          ]
        },
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                date: { type: Type.STRING },
                description: { type: Type.STRING },
                amount: { type: Type.NUMBER },
                currency: { type: Type.STRING },
                category: { type: Type.STRING },
              },
              required: ["date", "description", "amount", "category"]
            }
          }
        }
      });

      const jsonText = cleanJson(response.text || "[]");
      const rawData = JSON.parse(jsonText);

      return rawData.map((t: any) => ({
        ...t,
        id: t.id || (Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15))
      }));
    } catch (error: any) {
      console.error("Gemini API Error Details:", JSON.stringify(error, null, 2));
      console.error("Gemini API Error Message:", error.message || error);
      throw error; // Will be caught by Promise.race
    }
  }
};
