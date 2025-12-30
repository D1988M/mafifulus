
import React, { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { Landing } from './components/Landing';
import { UploadSection } from './components/UploadSection';
import { DataReview } from './components/DataReview';
import { Dashboard } from './components/Dashboard';
import { Pricing } from './components/Pricing';
import { About } from './components/About';
import { AppView, Transaction } from './types';

function App() {
  const [currentView, setCurrentView] = useState<AppView>(AppView.LANDING);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  // Auth State
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState("John Doe");

  // Load session on startup
  useEffect(() => {
    const savedSession = localStorage.getItem('mafifulus_session');
    if (savedSession) {
      try {
        const { name } = JSON.parse(savedSession);
        setUserName(name);
        setIsLoggedIn(true);
        setCurrentView(AppView.UPLOAD);
      } catch (e) {
        console.error("Failed to parse saved session", e);
        localStorage.removeItem('mafifulus_session');
      }
    }
  }, []);

  const handleLogin = (name: string) => {
    const finalName = name || "User";
    setUserName(finalName);
    setIsLoggedIn(true);
    setCurrentView(AppView.UPLOAD);

    // Persist session
    localStorage.setItem('mafifulus_session', JSON.stringify({ name: finalName, timestamp: Date.now() }));
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUserName("John Doe");
    setCurrentView(AppView.LANDING);
    setTransactions([]);
    localStorage.removeItem('mafifulus_session');
  };

  const handleDataLoaded = (data: Transaction[]) => {
    setTransactions(data);
    setCurrentView(AppView.REVIEW_DATA);
  };

  const handleConfirmData = async () => {
    try {
      // Get User ID from storage (saved by Layout login)
      const userStr = localStorage.getItem('user');
      const user = userStr ? JSON.parse(userStr) : null;
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

      const res = await fetch(`${API_URL}/api/transactions/confirm`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user?.id,
          transactions
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        console.log('Transactions saved:', data.count);
        setCurrentView(AppView.DASHBOARD);
      } else {
        console.error('Save failed:', data);
        alert('Failed to save transactions. Proceeding to Dashboard locally.');
        setCurrentView(AppView.DASHBOARD);
      }
    } catch (e) {
      console.error('Network error saving transactions:', e);
      setCurrentView(AppView.DASHBOARD);
    }
  };

  const handleBack = () => {
    if (currentView === AppView.REVIEW_DATA) {
      setCurrentView(AppView.UPLOAD);
      setTransactions([]);
    } else if (currentView === AppView.DASHBOARD) {
      setCurrentView(AppView.REVIEW_DATA);
    }
  };

  const renderContent = () => {
    switch (currentView) {
      case AppView.LANDING:
        return <Landing onGetStarted={() => { /* Layout handles login modal trigger */ }} onNavigate={setCurrentView} />;
      case AppView.PRICING:
        return <Pricing />;
      case AppView.ABOUT:
        return <About />;
      case AppView.UPLOAD:
        return isLoggedIn ? <UploadSection onDataLoaded={handleDataLoaded} /> : <Landing onGetStarted={() => { }} onNavigate={setCurrentView} />;
      case AppView.REVIEW_DATA:
        return isLoggedIn ? (
          <DataReview
            transactions={transactions}
            onUpdate={setTransactions}
            onConfirm={handleConfirmData}
            onBack={handleBack}
          />
        ) : null;
      case AppView.DASHBOARD:
        return isLoggedIn ? (
          <Dashboard
            transactions={transactions}
            onBack={handleBack}
            userName={userName}
          />
        ) : null;
      default:
        return <Landing onGetStarted={() => { }} onNavigate={setCurrentView} />;
    }
  };

  return (
    <Layout
      currentView={currentView}
      onNavigate={setCurrentView}
      isLoggedIn={isLoggedIn}
      onLogin={handleLogin}
      onLogout={handleLogout}
      userName={userName}
    >
      {renderContent()}
    </Layout>
  );
}

export default App;
