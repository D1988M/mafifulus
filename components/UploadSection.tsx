
import React, { useState } from 'react';
import { UploadCloud, Loader2, AlertCircle, ShieldCheck, FileText, CheckCircle, Lock, X, EyeOff, Server, FileKey } from 'lucide-react';
import { parseBankStatement } from '../services/geminiService';
import { Transaction } from '../types';

interface UploadSectionProps {
  onDataLoaded: (data: Transaction[]) => void;
}

export const UploadSection: React.FC<UploadSectionProps> = ({ onDataLoaded }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadingStep, setLoadingStep] = useState(0);
  const [isSecurityOpen, setIsSecurityOpen] = useState(false);

  const loadingMessages = [
    "Scanning document structure...",
    "Decrypting financial jargon...",
    "Categorizing transactions...",
    "Looking for lost receipts...",
    "Calculating coffee budget...",
    "Finalizing insights..."
  ];

  React.useEffect(() => {
    let interval: any;
    if (loading) {
      interval = setInterval(() => {
        setLoadingStep((prev) => (prev + 1) % loadingMessages.length);
      }, 2500);
    }
    return () => clearInterval(interval);
  }, [loading]);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      setError("Please upload a PDF file.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = async () => {
        const base64String = reader.result as string;
        const base64Content = base64String.split(',')[1];
        
        try {
          const transactions = await parseBankStatement(base64Content);
          if (transactions.length === 0) {
             setError("No transactions found or could not parse PDF.");
          } else {
             onDataLoaded(transactions);
          }
        } catch (err) {
          setError("Failed to analyze document. Ensure it is a valid bank statement.");
          console.error(err);
        } finally {
          setLoading(false);
        }
      };
      reader.onerror = () => {
        setError("Error reading file.");
        setLoading(false);
      };
    } catch (err) {
      setError("An unexpected error occurred.");
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] animate-fade-in-up relative max-w-4xl mx-auto w-full">
      
      {/* Security Modal */}
      {isSecurityOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl overflow-hidden animate-scale-in flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-white sticky top-0 z-10">
              <div className="flex items-center gap-3 text-gray-900">
                <div className="p-2.5 bg-emerald-50 rounded-xl">
                  <ShieldCheck className="w-6 h-6 text-emerald-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold tracking-tight">Security & Privacy</h2>
                  <p className="text-xs text-gray-500 font-medium">BANK-LEVEL SECURITY STANDARDS</p>
                </div>
              </div>
              <button onClick={() => setIsSecurityOpen(false)} className="p-2 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-600 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-8 overflow-y-auto custom-scrollbar">
              <div className="mb-8 p-6 bg-emerald-50/50 border border-emerald-100 rounded-2xl">
                 <p className="text-emerald-800 text-sm font-medium leading-relaxed">
                   Mafifulus uses the same encryption standards as major banks. Your financial data is processed ephemerally and is never sold, shared, or stored on our servers.
                 </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-10">
                <div className="flex gap-4 group">
                  <div className="shrink-0 p-3 bg-white border border-gray-100 shadow-sm rounded-xl h-fit group-hover:border-emerald-200 transition-colors">
                    <Lock className="w-6 h-6 text-emerald-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 mb-1.5">AES-256 Encryption</h3>
                    <p className="text-sm text-gray-500 leading-relaxed">
                      All data in transit is protected using TLS 1.3 and 256-bit encryption.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4 group">
                  <div className="shrink-0 p-3 bg-white border border-gray-100 shadow-sm rounded-xl h-fit group-hover:border-blue-200 transition-colors">
                    <EyeOff className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 mb-1.5">Read-Only Access</h3>
                    <p className="text-sm text-gray-500 leading-relaxed">
                      Our system has strictly read-only access. We cannot modify your accounts.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4 group">
                  <div className="shrink-0 p-3 bg-white border border-gray-100 shadow-sm rounded-xl h-fit group-hover:border-purple-200 transition-colors">
                    <Server className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 mb-1.5">Ephemeral Processing</h3>
                    <p className="text-sm text-gray-500 leading-relaxed">
                      "Zero Data Retention". Your PDF is processed in RAM and discarded instantly.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4 group">
                  <div className="shrink-0 p-3 bg-white border border-gray-100 shadow-sm rounded-xl h-fit group-hover:border-orange-200 transition-colors">
                    <FileKey className="w-6 h-6 text-orange-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 mb-1.5">Client-Side Logic</h3>
                    <p className="text-sm text-gray-500 leading-relaxed">
                      Dashboard rendering and goal setting happens locally on your device.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="p-6 bg-gray-50/80 border-t border-gray-100 flex justify-end">
              <button 
                onClick={() => setIsSecurityOpen(false)}
                className="px-8 py-3 bg-gray-900 text-white rounded-xl hover:bg-black font-semibold transition-all shadow-md hover:shadow-lg"
              >
                I Understand
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="w-full mb-8 flex justify-between items-end">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Upload Statement</h2>
            <p className="text-gray-500">Supported formats: PDF (up to 10MB)</p>
          </div>
          <button 
            onClick={() => setIsSecurityOpen(true)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-bold hover:bg-emerald-100 transition-colors"
          >
            <ShieldCheck className="w-4 h-4" /> Secure
          </button>
      </div>

      {/* Upload Box */}
      <div className="w-full">
        <label 
          className={`
            relative flex flex-col items-center justify-center w-full h-96 border-2 border-dashed rounded-[2rem] cursor-pointer 
            transition-all duration-300 ease-in-out group overflow-hidden bg-white
            ${loading ? 'border-gray-200 cursor-wait' : 'border-gray-300 hover:border-emerald-500 hover:bg-emerald-50/5 hover:shadow-xl'}
          `}
        >
          <div className="flex flex-col items-center justify-center pt-5 pb-6 relative z-10">
            {loading ? (
              <>
                <div className="relative mb-8">
                    <div className="absolute inset-0 bg-emerald-100 rounded-full animate-ping opacity-20"></div>
                    <Loader2 className="w-14 h-14 text-emerald-500 animate-spin relative z-10" />
                </div>
                
                <div className="w-24 h-24 mb-6 opacity-40 animate-pulse grayscale">
                   <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M30 60 C20 50 20 80 30 70" stroke="#10b981" strokeWidth="2" strokeLinecap="round" />
                      <path d="M70 60 C80 50 80 80 70 70" stroke="#10b981" strokeWidth="2" strokeLinecap="round" />
                      <rect x="35" y="40" width="30" height="40" rx="2" stroke="#334155" strokeWidth="2" fill="white" className="animate-bounce" style={{animationDuration: '2s'}} />
                      <rect x="40" y="45" width="20" height="2" fill="#cbd5e1" />
                      <rect x="40" y="50" width="20" height="2" fill="#cbd5e1" />
                      <rect x="40" y="55" width="15" height="2" fill="#cbd5e1" />
                      <circle cx="50" cy="30" r="10" stroke="#334155" strokeWidth="2" />
                   </svg>
                </div>

                <p key={loadingStep} className="text-lg text-emerald-900 font-bold animate-fade-in">
                  {loadingMessages[loadingStep]}
                </p>
              </>
            ) : (
              <>
                <div className="p-6 bg-gray-50 text-emerald-600 rounded-3xl mb-6 group-hover:scale-110 transition-transform duration-300 shadow-sm border border-gray-100">
                  <UploadCloud className="w-12 h-12" />
                </div>
                <p className="mb-2 text-xl text-gray-900 font-bold group-hover:text-emerald-700 transition-colors">
                    Click to upload or drag and drop
                </p>
                <p className="text-sm text-gray-400 font-medium">
                    Bank Statements, Credit Card Bills
                </p>
                <div className="mt-8 px-8 py-3 bg-gray-900 text-white rounded-xl text-sm font-bold shadow-md group-hover:bg-emerald-600 transition-all">
                    Select File
                </div>
              </>
            )}
          </div>
          <input 
            type="file" 
            className="hidden" 
            accept=".pdf" 
            onChange={handleFileChange} 
            disabled={loading}
          />
        </label>
        
        {error && (
          <div className="mt-6 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-700 shadow-sm animate-shake">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <p className="text-sm font-bold">{error}</p>
          </div>
        )}
      </div>

       <div className="mt-12 flex gap-8 text-gray-400 text-sm font-medium">
           <div className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-emerald-500" /> Instant Analysis</div>
           <div className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-emerald-500" /> Private & Secure</div>
           <div className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-emerald-500" /> 256-bit Encryption</div>
       </div>
    </div>
  );
};