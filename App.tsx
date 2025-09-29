import React, { useState, useEffect, useRef, useCallback } from 'react';
import Header from './components/Header';
import ChatWindow from './components/ChatWindow';
import ChatInput from './components/ChatInput';
import { createChatSession, sendMessage } from './services/geminiService';
import { GREETING_MESSAGE } from './constants';
import { Role } from './types';
import type { Message } from './types';
import type { Chat } from '@google/genai';

const App: React.FC = () => {
    const [messages, setMessages] = useState<Message[]>([GREETING_MESSAGE]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const chatSession = useRef<Chat | null>(null);

    useEffect(() => {
        // Initialize the chat session when the component mounts
        chatSession.current = createChatSession();
    }, []);

    const processMessage = useCallback(async (text: string, messageId: string) => {
        if (!chatSession.current) return;
        setIsLoading(true);

        try {
            const botResponseText = await sendMessage(chatSession.current, text);
            const botMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: Role.BOT,
                text: botResponseText,
            };
            setMessages(prev => [...prev, botMessage]);
        } catch (error) {
            console.error("Failed to get response from bot:", error);
            
            setMessages(prev => {
                const failedMessageIndex = prev.findIndex(m => m.id === messageId);
                const updatedMessages = [...prev];
                
                if (failedMessageIndex !== -1) {
                    updatedMessages[failedMessageIndex] = { ...updatedMessages[failedMessageIndex], error: true };
                }

                const errorMessage: Message = {
                    id: (Date.now() + 1).toString(),
                    role: Role.BOT,
                    text: "I'm having trouble connecting right now. Please check your connection or try again later.",
                };
                
                return [...updatedMessages, errorMessage];
            });
        } finally {
            setIsLoading(false);
        }
    }, []);


    const handleSendMessage = useCallback((text: string) => {
        if (!chatSession.current) return;

        const userMessage: Message = {
            id: Date.now().toString(),
            role: Role.USER,
            text,
        };
        
        setMessages(prev => [...prev, userMessage]);
        processMessage(text, userMessage.id);
    }, [processMessage]);

    const handleRetry = useCallback((messageId: string) => {
        const messageToRetry = messages.find(m => m.id === messageId);
        if (!messageToRetry) return;

        setMessages(prev => {
            const messageIndex = prev.findIndex(m => m.id === messageId);
            if (messageIndex === -1) return prev;

            // Remove the bot's error message that immediately follows the failed user message
            const filteredMessages = prev.filter((_, index) => index !== messageIndex + 1);
            
            // Update the message being retried to remove the error flag
            return filteredMessages.map(msg => 
                msg.id === messageId ? { ...msg, error: false } : msg
            );
        });

        processMessage(messageToRetry.text, messageToRetry.id);
    }, [messages, processMessage]);


    return (
        <div className="flex flex-col h-screen max-w-3xl mx-auto bg-gray-900 shadow-2xl rounded-lg my-4 overflow-hidden border border-gray-700">
            <Header />
            <ChatWindow messages={messages} isLoading={isLoading} onRetry={handleRetry} />
            <ChatInput onSendMessage={handleSendMessage} isLoading={isLoading} />
        </div>
    );
};

export default App;