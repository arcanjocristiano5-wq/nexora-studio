import React from 'react';

const LoadingSpinner: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <div className="w-12 h-12 border-4 border-slate-700 border-t-blue-500 rounded-full animate-spin" />
      <p className="text-sm font-medium text-slate-500">Carregando Módulo...</p>
    </div>
  );
};

export default LoadingSpinner;