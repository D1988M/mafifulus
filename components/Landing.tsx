
import React from 'react';
import { ArrowRight, ShieldCheck, FileText, ListFilter, PieChart, CheckCircle, Smartphone, Zap } from 'lucide-react';
import { AppView } from '../types';

interface LandingProps {
  onGetStarted: () => void;
  onNavigate: (view: AppView) => void;
}

export const Landing: React.FC<LandingProps> = ({ onGetStarted, onNavigate }) => {
  return (
    <div className="flex flex-col items-center animate-fade-in">
      
      {/* Hero Section */}
      <div className="text-center max-w-4xl mx-auto pt-10 pb-20 px-4">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs font-bold uppercase tracking-wide mb-8 shadow-sm">
          <Zap className="w-3.5 h-3.5 fill-emerald-700" /> New: Gemini Live API Integration
        </div>
        
        <h1 className="text-5xl md:text-7xl font-bold text-gray-900 tracking-tight leading-tight mb-6">
          Know your money,<br />
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 to-teal-500">
            Own your future.
          </span>
        </h1>
        
        <p className="text-xl text-gray-500 max-w-2xl mx-auto leading-relaxed mb-10">
           Stop guessing. Transform your messy bank statements into clarity, actionable insights, and AI-powered financial advice in seconds.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button 
                onClick={onGetStarted}
                className="px-8 py-4 bg-gray-900 text-white rounded-2xl font-bold text-lg hover:bg-black transition-all shadow-xl shadow-gray-900/20 hover:scale-105 flex items-center gap-2"
            >
                Get Started <ArrowRight className="w-5 h-5" />
            </button>
            <button 
                onClick={() => onNavigate(AppView.ABOUT)}
                className="px-8 py-4 bg-white text-gray-600 border border-gray-200 rounded-2xl font-bold text-lg hover:bg-gray-50 transition-all"
            >
                How it works
            </button>
        </div>
      </div>

      {/* Visualized Steps */}
      <div className="w-full max-w-5xl mb-24 px-4">
        <div className="relative flex flex-col md:flex-row justify-between items-start gap-8 md:gap-0">
          <div className="absolute top-6 left-0 w-full h-0.5 bg-gray-100 -z-10 hidden md:block"></div>

          <div className="flex flex-col items-center gap-4 relative z-10 group w-full md:w-1/3 text-center">
             <div className="w-14 h-14 rounded-2xl bg-white border border-gray-100 shadow-xl flex items-center justify-center text-emerald-600 mb-2">
                <FileText className="w-7 h-7" />
             </div>
             <h3 className="text-lg font-bold text-gray-900">1. Upload PDF</h3>
             <p className="text-sm text-gray-500 max-w-[200px]">Drag & drop your bank statement. We parse the messiest data instantly.</p>
          </div>

          <div className="flex flex-col items-center gap-4 relative z-10 group w-full md:w-1/3 text-center">
            <div className="w-14 h-14 rounded-2xl bg-white border border-gray-100 shadow-xl flex items-center justify-center text-blue-600 mb-2">
                <ListFilter className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">2. Review & Clean</h3>
            <p className="text-sm text-gray-500 max-w-[200px]">Verify categories and organize your transactions with AI assistance.</p>
          </div>

          <div className="flex flex-col items-center gap-4 relative z-10 group w-full md:w-1/3 text-center">
             <div className="w-14 h-14 rounded-2xl bg-white border border-gray-100 shadow-xl flex items-center justify-center text-purple-600 mb-2">
                <PieChart className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">3. Get Insights</h3>
            <p className="text-sm text-gray-500 max-w-[200px]">Talk to Merrit, your AI advisor, and track your life goals in real-time.</p>
          </div>
        </div>
      </div>

      {/* Feature Grid */}
      <div className="bg-gray-50 w-full py-20 border-y border-gray-100">
          <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                  <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center mb-6">
                      <ShieldCheck className="w-6 h-6 text-emerald-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Bank-Grade Security</h3>
                  <p className="text-gray-500 leading-relaxed">
                      Your data is encrypted and processed ephemerally. We don't store your bank statements or sell your data.
                  </p>
              </div>
              <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                  <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center mb-6">
                      <Zap className="w-6 h-6 text-indigo-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Powered by Gemini 2.5</h3>
                  <p className="text-gray-500 leading-relaxed">
                      Experience the latest in multimodal AI. Talk to your finances like you talk to a financial advisor.
                  </p>
              </div>
              <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                  <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mb-6">
                      <Smartphone className="w-6 h-6 text-orange-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">WhatsApp Digests</h3>
                  <p className="text-gray-500 leading-relaxed">
                      Get daily morning briefings on your spending and goal progress delivered straight to your phone.
                  </p>
              </div>
          </div>
      </div>

      {/* Social Proof / CTA */}
      <div className="py-24 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Ready to take control?</h2>
          <button 
                onClick={onGetStarted}
                className="px-10 py-4 bg-emerald-600 text-white rounded-2xl font-bold text-lg hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-600/20"
            >
                Get Started
            </button>
            <p className="mt-4 text-sm text-gray-400">Cancel anytime</p>
      </div>

    </div>
  );
};