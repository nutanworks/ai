import React, { useEffect, useRef } from 'react';
import Message from './Message';
import LoadingSpinner from './LoadingSpinner';
import type { Message as MessageType } from '../types';

interface ChatWindowProps {
    messages: MessageType[];
    isLoading: boolean;
    onRetry: (messageId: string) => void;
}

const ChatWindow: React.FC<ChatWindowProps> = ({ messages, isLoading, onRetry }) => {
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // Automatically scroll to the bottom when messages or loading state change
        const scrollContainer = scrollContainerRef.current;
        if (scrollContainer) {
            scrollContainer.scrollTop = scrollContainer.scrollHeight;
        }
    }, [messages, isLoading]);

    return (
        <div ref={scrollContainerRef} className="flex-1 p-6 overflow-y-auto bg-gray-800">
            {messages.map((msg) => (
                <Message key={msg.id} message={msg} onRetry={onRetry} />
            ))}
            {isLoading && <LoadingSpinner />}
        </div>
    );
};

export default ChatWindow;