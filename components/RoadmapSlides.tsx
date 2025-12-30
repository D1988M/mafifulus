
import React, { useState } from 'react';
import { ChevronRight, ChevronLeft, X, CheckCircle, Circle, Target, Zap, Shield, Rocket, Smartphone, Users } from 'lucide-react';

interface RoadmapSlidesProps {
  onClose: () => void;
}

const slides = [
  {
    id: 1,
    title: "Mafifulus",
    subtitle: "Roadmap to MVP",
    type: "title",
    content: (
      <div className="text-center space-y-6">
        <div className="inline-flex items-center justify-center p-4 bg-emerald-50 rounded-2xl mb-4">
          <Rocket className="w-12 h-12 text-emerald-600" />
        </div>
        <h2 className="text-4xl md:text-6xl font-bold text-gray-900 tracking-tight">
          Building the Future of <br />
          <span className="text-emerald-600">Financial Wellness</span>
        </h2>
        <p className="text-xl text-gray-500 max-w-2xl mx-auto">
          From static PDF statements to proactive, AI-driven life coaching.
        </p>
      </div>
    )
  },
  {
    id: 2,
    title: "The Vision",
    subtitle: "Why we exist",
    type: "content",
    content: (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        <div className="space-y-6">
          <div className="flex gap-4">
            <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center shrink-0">
               <X className="w-5 h-5 text-red-500" />
            </div>
            <div>
              <h4 className="font-bold text-gray-900 text-lg">The Problem</h4>
              <p className="text-gray-500">Traditional finance apps are backward-looking, manual, and disconnected from real life goals.</p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center shrink-0">
               <CheckCircle className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <h4 className="font-bold text-gray-900 text-lg">The Solution</h4>
              <p className="text-gray-500">An AI ecosystem that ingests messy data and outputs clear, actionable strategy for your future.</p>
            </div>
          </div>
        </div>
        <div className="bg-gray-50 p-8 rounded-3xl border border-gray-100 flex flex-col items-center text-center">
            <Target className="w-16 h-16 text-emerald-500 mb-4" />
            <h3 className="text-2xl font-bold text-gray-900 mb-2">"Know your money, Own your future."</h3>
        </div>
      </div>
    )
  },
  {
    id: 3,
    title: "Phase 1: The Foundation",
    subtitle: "Current State (MVP Core)",
    type: "content",
    content: (
      <div className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
           <div className="p-6 bg-white border border-gray-200 rounded-2xl shadow-sm">
              <div className="text-emerald-600 font-bold mb-2 flex items-center gap-2"><CheckCircle className="w-4 h-4"/> Done</div>
              <h4 className="font-bold text-gray-900 mb-1">Smart Ingestion</h4>
              <p className="text-sm text-gray-500">Instant PDF parsing & categorization via Gemini Flash.</p>
           </div>
           <div className="p-6 bg-white border border-gray-200 rounded-2xl shadow-sm">
              <div className="text-emerald-600 font-bold mb-2 flex items-center gap-2"><CheckCircle className="w-4 h-4"/> Done</div>
              <h4 className="font-bold text-gray-900 mb-1">Visualizer</h4>
              <p className="text-sm text-gray-500">Sankey Charts & Spending breakdowns.</p>
           </div>
           <div className="p-6 bg-white border border-gray-200 rounded-2xl shadow-sm">
              <div className="text-emerald-600 font-bold mb-2 flex items-center gap-2"><CheckCircle className="w-4 h-4"/> Done</div>
              <h4 className="font-bold text-gray-900 mb-1">Privacy Core</h4>
              <p className="text-sm text-gray-500">Client-side processing with ephemeral storage.</p>
           </div>
        </div>
        <div className="p-4 bg-emerald-50/50 rounded-xl border border-emerald-100 text-center">
          <p className="text-emerald-800 font-medium">Status: Live & Operational</p>
        </div>
      </div>
    )
  },
  {
    id: 4,
    title: "Phase 2: Intelligence Layer",
    subtitle: "In Progress",
    type: "content",
    content: (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-gray-900 text-white p-8 rounded-3xl relative overflow-hidden">
           <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500 rounded-full blur-3xl opacity-20 -mr-10 -mt-10"></div>
           <Zap className="w-10 h-10 text-emerald-400 mb-4" />
           <h3 className="text-2xl font-bold mb-2">Merrit AI</h3>
           <p className="text-gray-400 text-sm mb-4">Gemini Live API Integration</p>
           <ul className="space-y-3 text-sm text-gray-300">
             <li className="flex items-center gap-2"><Circle className="w-2 h-2 fill-emerald-400 text-emerald-400" /> Real-time Voice Conversations</li>
             <li className="flex items-center gap-2"><Circle className="w-2 h-2 fill-emerald-400 text-emerald-400" /> Proactive "Nudge" Advice</li>
             <li className="flex items-center gap-2"><Circle className="w-2 h-2 fill-emerald-400 text-emerald-400" /> Context-aware Memory</li>
           </ul>
        </div>
        <div className="space-y-4">
           <h3 className="font-bold text-gray-900">Also Shipping:</h3>
           <div className="p-4 bg-white border border-gray-200 rounded-xl flex gap-4 items-center">
              <Target className="w-8 h-8 text-indigo-600" />
              <div>
                <h4 className="font-bold text-gray-900">Dynamic Goals</h4>
                <p className="text-xs text-gray-500">Live progress bars linked to monthly surplus.</p>
              </div>
           </div>
           <div className="p-4 bg-white border border-gray-200 rounded-xl flex gap-4 items-center">
              <Shield className="w-8 h-8 text-orange-500" />
              <div>
                <h4 className="font-bold text-gray-900">Subscription Hunter</h4>
                <p className="text-xs text-gray-500">Auto-detect recurring payments & yearly cost.</p>
              </div>
           </div>
        </div>
      </div>
    )
  },
  {
    id: 5,
    title: "Phase 3: Growth & Scale",
    subtitle: "Next 3 Months",
    type: "content",
    content: (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
           <div className="bg-gray-50 p-6 rounded-2xl text-center hover:bg-white hover:shadow-md transition-all">
              <Smartphone className="w-8 h-8 text-gray-900 mx-auto mb-3" />
              <h4 className="font-bold text-gray-900">WhatsApp Integration</h4>
              <p className="text-xs text-gray-500 mt-2">Daily "Morning Coffee" digests via OTP-verified chat.</p>
           </div>
           <div className="bg-gray-50 p-6 rounded-2xl text-center hover:bg-white hover:shadow-md transition-all">
              <Users className="w-8 h-8 text-gray-900 mx-auto mb-3" />
              <h4 className="font-bold text-gray-900">Family Plans</h4>
              <p className="text-xs text-gray-500 mt-2">Multi-user households and shared budgets.</p>
           </div>
           <div className="bg-gray-50 p-6 rounded-2xl text-center hover:bg-white hover:shadow-md transition-all">
              <Rocket className="w-8 h-8 text-gray-900 mx-auto mb-3" />
              <h4 className="font-bold text-gray-900">Direct Bank API</h4>
              <p className="text-xs text-gray-500 mt-2">Plaid/Teller integration to replace PDF uploads.</p>
           </div>
        </div>
        <div className="p-6 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl text-white text-center">
            <h3 className="text-xl font-bold mb-2">Ready to define the future?</h3>
            <p className="opacity-90">Mafifulus is currently in Closed Beta.</p>
        </div>
      </div>
    )
  }
];

export const RoadmapSlides: React.FC<RoadmapSlidesProps> = ({ onClose }) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const nextSlide = () => {
    if (currentSlide < slides.length - 1) setCurrentSlide(curr => curr + 1);
  };

  const prevSlide = () => {
    if (currentSlide > 0) setCurrentSlide(curr => curr - 1);
  };

  // Keyboard navigation
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') nextSlide();
      if (e.key === 'ArrowLeft') prevSlide();
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentSlide]);

  return (
    <div className="h-full w-full flex items-center justify-center p-4 md:p-12 relative bg-black/90 backdrop-blur-xl">
       <button 
         onClick={onClose}
         className="absolute top-6 right-6 p-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors z-50"
       >
         <X className="w-6 h-6" />
       </button>

       <div className="w-full max-w-5xl aspect-[16/9] bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col relative animate-scale-in">
          {/* Header */}
          <div className="h-16 border-b border-gray-100 flex items-center justify-center px-8 bg-gray-50/50">
             <div className="absolute left-8 flex items-center gap-2">
                <span className="font-bold text-gray-900">Mafi<span className="text-emerald-600">fulus</span></span>
                <span className="text-gray-300">|</span>
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">MVP Roadmap</span>
             </div>
             <div className="text-sm font-medium text-gray-400">
               {currentSlide + 1} / {slides.length}
             </div>
          </div>

          {/* Slide Content */}
          <div className="flex-1 p-12 flex flex-col justify-center relative overflow-hidden">
             <div className="absolute top-0 right-0 opacity-5 pointer-events-none">
                 <Rocket className="w-96 h-96 -mr-20 -mt-20 text-gray-900" />
             </div>

             <div key={currentSlide} className="relative z-10 animate-fade-in">
                {slides[currentSlide].type !== 'title' && (
                    <div className="mb-8">
                        <h2 className="text-3xl font-bold text-gray-900 mb-1">{slides[currentSlide].title}</h2>
                        <p className="text-emerald-600 font-medium">{slides[currentSlide].subtitle}</p>
                    </div>
                )}
                {slides[currentSlide].content}
             </div>
          </div>

          {/* Footer / Controls */}
          <div className="h-20 border-t border-gray-100 flex items-center justify-between px-8 bg-gray-50">
             <button 
               onClick={prevSlide}
               disabled={currentSlide === 0}
               className="flex items-center gap-2 px-4 py-2 rounded-xl hover:bg-gray-200 disabled:opacity-30 disabled:hover:bg-transparent transition-colors font-medium text-gray-600"
             >
               <ChevronLeft className="w-5 h-5" /> Previous
             </button>

             <div className="flex gap-2">
                {slides.map((_, idx) => (
                   <div 
                     key={idx} 
                     className={`w-2 h-2 rounded-full transition-all duration-300 ${idx === currentSlide ? 'bg-emerald-500 w-6' : 'bg-gray-300'}`}
                   />
                ))}
             </div>

             <button 
               onClick={nextSlide}
               disabled={currentSlide === slides.length - 1}
               className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-xl hover:bg-black disabled:opacity-30 disabled:hover:bg-gray-900 transition-colors font-medium shadow-sm"
             >
               Next <ChevronRight className="w-5 h-5" />
             </button>
          </div>
       </div>
    </div>
  );
};