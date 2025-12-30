
import React from 'react';
import { Leaf, Users, Heart, Globe } from 'lucide-react';

export const About: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-fade-in">
      <div className="text-center mb-16">
        <div className="inline-flex items-center justify-center p-3 bg-emerald-50 rounded-2xl mb-6">
            <Leaf className="w-8 h-8 text-emerald-600" />
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 tracking-tight mb-6">
          Financial clarity for everyone.
        </h1>
        <p className="text-xl text-gray-500 leading-relaxed max-w-2xl mx-auto">
          Mafifulus was born from a simple belief: you shouldn't need a finance degree to understand where your money is going.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-20">
        <div>
           <h3 className="text-2xl font-bold text-gray-900 mb-4">Our Mission</h3>
           <p className="text-gray-600 leading-relaxed">
             We are building the world's most intuitive financial assistant. By combining the power of Generative AI with clean, actionable design, we help people turn raw bank data into life-changing decisions. We want to make "Financial Wellness" a reality, not just a buzzword.
           </p>
        </div>
        <div>
           <h3 className="text-2xl font-bold text-gray-900 mb-4">Why "Mafi<span className="text-emerald-600">fulus</span>"?</h3>
           <p className="text-gray-600 leading-relaxed">
             "Fulus" means money. We believe managing it should be simple, transparent, and accessible to everyone. Mafifulus combines AI intelligence with financial clarity.
           </p>
        </div>
      </div>

      <div className="bg-gray-50 rounded-3xl p-8 md:p-12">
        <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">Our Values</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex flex-col items-center text-center gap-3">
                <div className="p-3 bg-white rounded-xl shadow-sm">
                    <Users className="w-6 h-6 text-indigo-600" />
                </div>
                <h4 className="font-bold text-gray-900">User First</h4>
                <p className="text-sm text-gray-500">We don't sell data. We build for you, not advertisers.</p>
            </div>
            <div className="flex flex-col items-center text-center gap-3">
                <div className="p-3 bg-white rounded-xl shadow-sm">
                    <Heart className="w-6 h-6 text-red-500" />
                </div>
                <h4 className="font-bold text-gray-900">Empathy</h4>
                <p className="text-sm text-gray-500">Money is emotional. Our AI is designed to be supportive, not judgmental.</p>
            </div>
            <div className="flex flex-col items-center text-center gap-3">
                <div className="p-3 bg-white rounded-xl shadow-sm">
                    <Globe className="w-6 h-6 text-emerald-600" />
                </div>
                <h4 className="font-bold text-gray-900">Impact</h4>
                <p className="text-sm text-gray-500">Helping you save for what truly matters in life.</p>
            </div>
        </div>
      </div>
    </div>
  );
};
