import React from 'react';

const LoadingSpinner: React.FC = () => {
  return (
    <div className="flex items-start gap-3 my-4">
      <div className="w-8 h-8 rounded-full bg-blue-600 flex-shrink-0 flex items-center justify-center text-white font-bold text-sm">
        SA
      </div>
      <div className="px-4 py-3 max-w-lg rounded-2xl shadow-sm bg-gray-700 text-gray-100 rounded-tl-none flex items-center space-x-2">
        <div className="flex items-center space-x-1">
          <span className="h-2 w-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
          <span className="h-2 w-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
          <span className="h-2 w-2 bg-gray-400 rounded-full animate-bounce"></span>
        </div>
        <span className="text-sm text-gray-400 italic">Sirsi is typing...</span>
      </div>
    </div>
  );
};

export default LoadingSpinner;