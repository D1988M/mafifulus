
import React, { useState } from 'react';
import { Leaf, MessageCircle, X, Loader2, ArrowRight, CheckCircle, Github, Twitter, Linkedin, Bell, User } from 'lucide-react';
import { AppView } from '../types';
import { RoadmapSlides } from './RoadmapSlides';

interface LayoutProps {
    children: React.ReactNode;
    currentView: AppView;
    onNavigate: (view: AppView) => void;
    isLoggedIn: boolean;
    onLogin: (name: string) => void;
    onLogout: () => void;
    userName: string;
}

export const Layout: React.FC<LayoutProps> = ({ children, currentView, onNavigate, isLoggedIn, onLogin, onLogout, userName }) => {
    // Login / Auth State
    const [spotsLeft] = useState(12); // Dynamic urgency
    const [isLoginOpen, setIsLoginOpen] = useState(false);
    const [loginStep, setLoginStep] = useState<'DETAILS' | 'SUCCESS'>('DETAILS');
    const [nameInput, setNameInput] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [inviteCode, setInviteCode] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // Roadmap Slide State
    const [showRoadmap, setShowRoadmap] = useState(false);

    const handleLoginSubmit = async () => {
        if (!phoneNumber || !nameInput) return;
        setIsLoading(true);

        try {
            // Use env var or default to localhost:5000
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

            const res = await fetch(`${API_URL}/api/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phoneNumber, name: nameInput, inviteCode }),
            });

            const data = await res.json();

            if (res.ok && data.success) {
                // Store Auth Token
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));

                setIsLoading(false);
                setLoginStep('SUCCESS');

                // Proceed after short optional animation delay
                setTimeout(() => {
                    onLogin(data.user.name); // Notify Parent with Name
                    setIsLoginOpen(false);
                    setLoginStep('DETAILS');
                    setPhoneNumber('');
                    setNameInput('');
                }, 800);
            } else {
                console.error('Login failed:', data);
                alert(data.error || 'Login failed. Please try again.');
                setIsLoading(false);
            }
        } catch (error) {
            console.error('Network error during login:', error);
            alert('Could not connect to server. Is the backend running on port 5000?');
            setIsLoading(false);
        }
    };

    // Helper to get initials
    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    // Inject the triggerLogin prop into Landing if it's the current child
    const childrenWithProps = React.Children.map(children, child => {
        if (React.isValidElement(child)) {
            // @ts-ignore - Dynamic prop injection
            return React.cloneElement(child, { onGetStarted: () => setIsLoginOpen(true) });
        }
        return child;
    });

    return (
        <div className="min-h-screen bg-[#F9FAFB] text-gray-900 font-sans selection:bg-emerald-100 selection:text-emerald-900 flex flex-col relative">

            {/* Urgency Bar */}
            <div className="bg-gradient-to-r from-red-600 to-orange-500 text-white py-3 px-4 text-center sticky top-0 z-50 shadow-sm">
                <p className="text-lg font-bold">
                    ⚠️ High Demand: Only {spotsLeft} spots remaining for early access.
                    <button className="ml-4 underline hover:text-red-100 font-extrabold">Join Waiting List</button>
                </p>
            </div>

            {/* Navigation */}
            <nav className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-8 z-40">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div
                            className="flex items-center gap-2.5 cursor-pointer"
                            onClick={() => onNavigate(AppView.LANDING)}
                        >
                            <div className="bg-emerald-100/50 p-2 rounded-xl">
                                <Leaf className="h-6 w-6 text-emerald-600" />
                            </div>
                            <span className="font-bold text-xl tracking-tight text-gray-900">
                                Mafi<span className="text-emerald-600">fulus</span>
                            </span>
                        </div>

                        <div className="flex items-center gap-4">
                            <div className="hidden md:flex text-sm font-medium text-gray-500 gap-6">
                                <span
                                    onClick={() => isLoggedIn ? onNavigate(AppView.UPLOAD) : onNavigate(AppView.LANDING)}
                                    className={`cursor-pointer transition-colors ${currentView === AppView.UPLOAD || currentView === AppView.DASHBOARD ? 'text-emerald-600 font-semibold' : 'hover:text-emerald-600'}`}
                                >
                                    Product
                                </span>
                                <span
                                    onClick={() => onNavigate(AppView.PRICING)}
                                    className={`cursor-pointer transition-colors ${currentView === AppView.PRICING ? 'text-emerald-600 font-semibold' : 'hover:text-emerald-600'}`}
                                >
                                    Pricing
                                </span>
                                <span
                                    onClick={() => onNavigate(AppView.ABOUT)}
                                    className={`cursor-pointer transition-colors ${currentView === AppView.ABOUT ? 'text-emerald-600 font-semibold' : 'hover:text-emerald-600'}`}
                                >
                                    About
                                </span>
                            </div>

                            <div className="h-8 w-px bg-gray-200 mx-2 hidden md:block"></div>

                            {isLoggedIn ? (
                                <div className="relative group">
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-400 p-[2px] cursor-pointer ring-2 ring-transparent hover:ring-emerald-100 transition-all">
                                        <div className="w-full h-full rounded-full bg-white flex items-center justify-center">
                                            <span className="text-xs font-bold text-emerald-700">{getInitials(userName)}</span>
                                        </div>
                                    </div>
                                    {/* Logout Dropdown - stays visible when hovering over it */}
                                    <div className="absolute top-10 right-0 bg-white shadow-xl border border-gray-100 p-2 rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 w-32 z-50">
                                        <button
                                            onClick={onLogout}
                                            className="text-xs font-bold text-red-500 w-full text-left px-2 py-1.5 hover:bg-red-50 rounded transition-colors"
                                        >
                                            Sign Out
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <button
                                    onClick={() => setIsLoginOpen(true)}
                                    className="bg-gray-900 text-white px-5 py-2 rounded-full text-sm font-bold hover:bg-black transition-colors shadow-sm"
                                >
                                    Login
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in flex-1 w-full">
                {childrenWithProps}
            </main>

            {/* Footer */}
            <footer className="bg-white border-t border-gray-200 py-12 mt-auto">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
                        <div className="col-span-1 md:col-span-1">
                            <div className="flex items-center gap-2 mb-4">
                                <Leaf className="h-5 w-5 text-emerald-600" />
                                <span className="font-bold text-lg text-gray-900">Mafi<span className="text-emerald-600">fulus</span></span>
                            </div>
                            <p className="text-gray-500 text-sm leading-relaxed">
                                Empowering your financial future with AI-driven insights. Know your money, own your life.
                            </p>
                        </div>

                        <div>
                            <h4 className="font-bold text-gray-900 mb-4">Product</h4>
                            <ul className="space-y-2 text-sm text-gray-500">
                                <li className="hover:text-emerald-600 cursor-pointer" onClick={() => isLoggedIn ? onNavigate(AppView.UPLOAD) : setIsLoginOpen(true)}>Features</li>
                                <li className="hover:text-emerald-600 cursor-pointer" onClick={() => onNavigate(AppView.PRICING)}>Pricing</li>
                                <li className="hover:text-emerald-600 cursor-pointer" onClick={() => setShowRoadmap(true)}>Roadmap</li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="font-bold text-gray-900 mb-4">Company</h4>
                            <ul className="space-y-2 text-sm text-gray-500">
                                <li className="hover:text-emerald-600 cursor-pointer" onClick={() => onNavigate(AppView.ABOUT)}>About Us</li>
                                <li className="hover:text-emerald-600 cursor-pointer">Careers</li>
                                <li className="hover:text-emerald-600 cursor-pointer">Privacy Policy</li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="font-bold text-gray-900 mb-4">Connect</h4>
                            <div className="flex gap-4">
                                <a href="#" className="p-2 bg-gray-50 rounded-full text-gray-400 hover:text-gray-900 hover:bg-gray-100 transition-colors">
                                    <Twitter className="w-5 h-5" />
                                </a>
                                <a href="#" className="p-2 bg-gray-50 rounded-full text-gray-400 hover:text-gray-900 hover:bg-gray-100 transition-colors">
                                    <Github className="w-5 h-5" />
                                </a>
                                <a href="#" className="p-2 bg-gray-50 rounded-full text-gray-400 hover:text-gray-900 hover:bg-gray-100 transition-colors">
                                    <Linkedin className="w-5 h-5" />
                                </a>
                            </div>
                        </div>
                    </div>
                    <div className="pt-8 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4">
                        <p className="text-sm text-gray-400">© 2024 Mafifulus. All rights reserved.</p>
                        <div className="flex gap-6 text-sm text-gray-400">
                            <span className="hover:text-gray-600 cursor-pointer">Terms</span>
                            <span className="hover:text-gray-600 cursor-pointer">Privacy</span>
                            <span className="hover:text-gray-600 cursor-pointer">Cookies</span>
                        </div>
                    </div>
                </div>
            </footer>

            {/* Login Modal */}
            {isLoginOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-scale-in relative">
                        <button
                            onClick={() => setIsLoginOpen(false)}
                            className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-full transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <div className="p-8 text-center">
                            <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6">
                                <User className="w-8 h-8 text-emerald-600" />
                            </div>

                            {loginStep === 'DETAILS' && (
                                <>
                                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome Back</h2>
                                    <p className="text-gray-500 text-sm mb-8">Enter your details to access your dashboard.</p>

                                    <div className="space-y-4 text-left">
                                        <div>
                                            <label className="text-xs font-bold text-gray-500 uppercase ml-1">Full Name</label>
                                            <input
                                                type="text"
                                                placeholder="John Doe"
                                                className="w-full mt-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all outline-none font-medium"
                                                value={nameInput}
                                                onChange={(e) => setNameInput(e.target.value)}
                                            />
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold text-gray-500 uppercase ml-1">Phone Number</label>
                                            <input
                                                type="tel"
                                                placeholder="+1 (555) 000-0000"
                                                className="w-full mt-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all outline-none font-medium"
                                                value={phoneNumber}
                                                onChange={(e) => setPhoneNumber(e.target.value)}
                                            />
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold text-amber-600 uppercase ml-1">Invite Code (New Users)</label>
                                            <input
                                                type="text"
                                                placeholder="e.g. FIFULUS2026"
                                                className="w-full mt-1 px-4 py-3 bg-amber-50/10 border border-amber-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:bg-white transition-all outline-none font-medium placeholder:text-gray-300"
                                                value={inviteCode}
                                                onChange={(e) => setInviteCode(e.target.value)}
                                            />
                                        </div>
                                        <button
                                            onClick={handleLoginSubmit}
                                            disabled={!phoneNumber || !nameInput || isLoading}
                                            className="w-full py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Login <ArrowRight className="w-4 h-4" /></>}
                                        </button>
                                    </div>
                                </>
                            )}

                            {loginStep === 'SUCCESS' && (
                                <div className="py-8 animate-fade-in">
                                    <CheckCircle className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
                                    <h2 className="text-2xl font-bold text-gray-900">Success!</h2>
                                    <p className="text-gray-500">Redirecting you to dashboard...</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Slide Deck Modal */}
            {showRoadmap && (
                <div className="fixed inset-0 z-[60] bg-black">
                    <RoadmapSlides onClose={() => setShowRoadmap(false)} />
                </div>
            )}

        </div>
    );
};
