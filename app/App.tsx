
import React, { useState, useEffect } from 'react';
import { RouterProvider } from "react-router-dom";
import { router } from "./router";
import SetupScreen from '../components/Welcome/WelcomeScreen';
import ErrorBoundary from '../components/ErrorBoundary/ErrorBoundary';

const SETUP_KEY = 'nexora_setup_complete_v2.5';

export default function App() {
  const [isSetupComplete, setIsSetupComplete] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Verifica no localStorage se a configuração já foi feita
    const setupDone = localStorage.getItem(SETUP_KEY) === 'true';
    setIsSetupComplete(setupDone);
    setIsLoading(false);
  }, []);

  const handleSetupComplete = () => {
    localStorage.setItem(SETUP_KEY, 'true');
    setIsSetupComplete(true);
  };

  if (isLoading) {
    // Evita piscar a tela errada enquanto verifica o localStorage
    return <div className="w-full h-full bg-slate-950"></div>;
  }
  
  if (!isSetupComplete) {
    return <SetupScreen onComplete={handleSetupComplete} />;
  }
  
  return (
    <ErrorBoundary>
      <RouterProvider router={router} />
    </ErrorBoundary>
  );
}
