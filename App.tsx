
import React, { useState, useEffect, useRef, useCallback } from 'react';
import Header from './components/Header';
import ChatWindow from './components/ChatWindow';
import ChatInput from './components/ChatInput';
import { createChatSession, sendMessage } from './services/geminiService';
import { GREETING_MESSAGE } from './constants';
import { Role } from './types';
import type { Message } from './types';
import type { Chat } from '@google/genai';

const CHAT_HISTORY_KEY = 'chatHistory';

const App: React.FC = () => {
    // Load messages from localStorage or use the initial greeting
    const [messages, setMessages] = useState<Message[]>(() => {
        try {
            const savedMessages = localStorage.getItem(CHAT_HISTORY_KEY);
            if (savedMessages) {
                const parsedMessages = JSON.parse(savedMessages);
                if (Array.isArray(parsedMessages) && parsedMessages.length > 0) {
                    return parsedMessages;
                }
            }
        } catch (error) {
            console.error("Failed to load chat history from localStorage", error);
        }
        return [GREETING_MESSAGE];
    });

    const [isLoading, setIsLoading] = useState<boolean>(false);
    const chatSession = useRef<Chat | null>(null);

    // Save messages to localStorage whenever they change
    useEffect(() => {
        try {
             // Don't save if it's just the initial greeting message
            if (messages.length > 1 || (messages.length === 1 && messages[0].id !== 'initial-greeting')) {
                 localStorage.setItem(CHAT_HISTORY_KEY, JSON.stringify(messages));
            }
        } catch (error) {
            console.error("Failed to save chat history to localStorage", error);
        }
    }, [messages]);


    // Initialize the chat session with history on mount
    useEffect(() => {
        chatSession.current = createChatSession(messages);
    }, []);

    const processMessage = useCallback(async (text: string, messageId: string) => {
        if (!chatSession.current) {
            // Re-initialize session if it's missing (e.g., after an error)
            chatSession.current = createChatSession(messages);
        };
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
    }, [messages]);


    const handleSendMessage = useCallback((text: string) => {
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
            // Find the failed message and remove the bot error message that follows it
            return prev.filter(msg => {
                const failedMsgIndex = prev.findIndex(m => m.id === messageId);
                const errorMsgId = prev[failedMsgIndex + 1]?.id;
                return msg.id !== errorMsgId;
            }).map(msg => 
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
