import React from 'react';

const Header: React.FC = () => {
    return (
        <div className="bg-gray-900 p-4 border-b border-gray-700 shadow-sm flex items-center justify-between">
            <div className="flex items-center">
                <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-xl mr-3">
                    SA
                </div>
                <div>
                    <h1 className="text-lg font-semibold text-gray-100">Sirsi AI Chatbot</h1>
                    <div className="flex items-center text-sm text-gray-400">
                        <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                        Online
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Header;