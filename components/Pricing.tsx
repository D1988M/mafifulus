
import React, { useState } from 'react';
import { Check, Zap, MessageCircle, Shield, Star } from 'lucide-react';

export const Pricing: React.FC = () => {
  const [billing, setBilling] = useState<'MONTHLY' | 'YEARLY'>('YEARLY');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-fade-in">
      <div className="text-center max-w-3xl mx-auto mb-12">
        <h2 className="text-4xl font-bold text-gray-900 mb-4 tracking-tight">Simple, transparent pricing</h2>
        <p className="text-xl text-gray-500 mb-8">
          One plan, all features. Invest in your financial future today.
        </p>
        
        {/* Toggle */}
        <div className="flex items-center justify-center gap-4 mb-8">
            <span className={`text-sm font-bold ${billing === 'MONTHLY' ? 'text-gray-900' : 'text-gray-500'}`}>Monthly</span>
            <button 
                onClick={() => setBilling(billing === 'MONTHLY' ? 'YEARLY' : 'MONTHLY')}
                className="w-14 h-8 bg-emerald-600 rounded-full relative transition-colors focus:outline-none cursor-pointer"
            >
                <div className={`absolute top-1 bg-white w-6 h-6 rounded-full shadow-md transition-all duration-300 ${billing === 'YEARLY' ? 'left-7' : 'left-1'}`}></div>
            </button>
            <span className={`text-sm font-bold ${billing === 'YEARLY' ? 'text-gray-900' : 'text-gray-500'}`}>Yearly <span className="text-emerald-600 text-xs">(2 Months Free)</span></span>
        </div>
      </div>

      <div className="max-w-md mx-auto">
        <div className="bg-gray-900 p-8 rounded-3xl shadow-xl relative overflow-hidden text-center transform hover:scale-105 transition-transform duration-300">
          <div className="absolute top-0 right-0 bg-emerald-500 text-white text-xs font-bold px-3 py-1 rounded-bl-xl">
             PREMIUM
          </div>
          
          <h3 className="text-2xl font-bold text-white mb-2">Mafi<span className="text-emerald-400">fulus</span> Pro</h3>
          <p className="text-gray-400 text-sm mb-8">Full access to AI financial tools.</p>
          
          <div className="flex items-baseline justify-center gap-1 mb-4">
            <span className="text-5xl font-bold text-white">
                {billing === 'MONTHLY' ? 'AED 19' : 'AED 190'}
            </span>
            <span className="text-gray-400">
                {billing === 'MONTHLY' ? '/mo' : '/yr'}
            </span>
          </div>
          
          {billing === 'YEARLY' ? (
              <p className="text-emerald-400 text-sm font-bold mb-8 animate-pulse">Save AED 38 per year!</p>
          ) : (
              <div className="mb-8 h-5"></div>
          )}
          
          <button className="w-full py-4 px-6 bg-emerald-500 text-white font-bold rounded-xl hover:bg-emerald-600 transition-colors mb-8 shadow-lg shadow-emerald-500/20">
            Get Started Now
          </button>

          <ul className="space-y-4 text-sm text-gray-300 text-left px-4">
            <li className="flex items-center gap-3">
              <Check className="w-5 h-5 text-emerald-400 shrink-0" />
              <span>Unlimited PDF Analysis</span>
            </li>
            <li className="flex items-center gap-3">
              <Zap className="w-5 h-5 text-emerald-400 shrink-0" />
              <span>Merrit AI Financial Advisor (Live Voice)</span>
            </li>
            <li className="flex items-center gap-3">
              <MessageCircle className="w-5 h-5 text-emerald-400 shrink-0" />
              <span>WhatsApp Daily Digests</span>
            </li>
             <li className="flex items-center gap-3">
              <Shield className="w-5 h-5 text-emerald-400 shrink-0" />
              <span>Subscription Hunting & Cancellation</span>
            </li>
            <li className="flex items-center gap-3">
              <Star className="w-5 h-5 text-emerald-400 shrink-0" />
              <span>Goal Tracking & Forecasting</span>
            </li>
          </ul>
        </div>
        
        <p className="text-center text-gray-400 text-sm mt-6">
            30-day money-back guarantee. Cancel anytime.
        </p>
      </div>
    </div>
  );
};
