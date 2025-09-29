import React from 'react';
import { Role } from '../types';
import type { Message as MessageType } from '../types';

interface MessageProps {
    message: MessageType;
    onRetry: (messageId: string) => void;
}

const BotIcon: React.FC = () => (
    <div className="w-8 h-8 rounded-full bg-blue-600 flex-shrink-0 flex items-center justify-center text-white font-bold text-sm">
      SA
    </div>
);

const UserIcon: React.FC = () => (
    <div className="w-8 h-8 rounded-full bg-gray-600 flex-shrink-0 flex items-center justify-center text-white font-bold text-sm">
      U
    </div>
);

const Message: React.FC<MessageProps> = ({ message, onRetry }) => {
    const isBot = message.role === Role.BOT;
    const isError = message.error === true;

    return (
        <div className={`flex flex-col mb-4 ${isBot ? 'items-start' : 'items-end'}`}>
            <div className={`flex items-start gap-3 ${isBot ? '' : 'flex-row-reverse'}`}>
                {isBot ? <BotIcon /> : <UserIcon />}
                <div
                    className={`px-4 py-3 max-w-lg rounded-2xl shadow-sm ${
                        isBot 
                            ? 'bg-gray-700 text-gray-100 rounded-tl-none' 
                            : 'bg-blue-600 text-white rounded-br-none'
                    } ${isError ? 'border border-red-500' : ''}`}
                >
                    <p className="text-sm break-words">{message.text}</p>
                </div>
            </div>
             {isError && (
                <div className="flex items-center gap-2 mt-2 text-xs text-red-400 pr-11"> 
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    <span>Message failed.</span>
                    <button 
                        onClick={() => onRetry(message.id)} 
                        className="font-semibold underline hover:text-red-300 focus:outline-none"
                        aria-label={`Retry sending message: ${message.text}`}
                    >
                        Retry
                    </button>
                </div>
            )}
        </div>
    );
};

export default Message;