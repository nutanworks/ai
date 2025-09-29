import React, { useState, useEffect, useRef } from 'react';

// FIX: Add type definitions for the Web Speech API to resolve TypeScript errors.
interface SpeechRecognition {
    continuous: boolean;
    interimResults: boolean;
    lang: string;
    onresult: (event: any) => void;
    onerror: (event: any) => void;
    onend: () => void;
    start: () => void;
    stop: () => void;
}

interface SpeechRecognitionStatic {
    new(): SpeechRecognition;
}

declare global {
    interface Window {
        SpeechRecognition: SpeechRecognitionStatic;
        webkitSpeechRecognition: SpeechRecognitionStatic;
    }
}

interface ChatInputProps {
    onSendMessage: (message: string) => void;
    isLoading: boolean;
}

const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage, isLoading }) => {
    const [input, setInput] = useState('');
    const [isRecording, setIsRecording] = useState(false);
    const recognitionRef = useRef<SpeechRecognition | null>(null);

    useEffect(() => {
        const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognitionAPI) {
            console.warn("Speech Recognition is not supported by this browser.");
            return;
        }

        const recognition = new SpeechRecognitionAPI();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onresult = (event) => {
            let transcript = '';
            for (let i = 0; i < event.results.length; i++) {
                transcript += event.results[i][0].transcript;
            }
            setInput(transcript);
        };

        recognition.onerror = (event) => {
            console.error("Speech recognition error:", event.error);
            setIsRecording(false);
        };
        
        recognition.onend = () => {
            setIsRecording(false);
        };

        recognitionRef.current = recognition;

        return () => {
            recognitionRef.current?.stop();
        };
    }, []);

    const handleToggleRecording = () => {
        const recognition = recognitionRef.current;
        if (!recognition) return;

        if (isRecording) {
            recognition.stop();
        } else {
            setInput('');
            recognition.start();
            setIsRecording(true);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (input.trim() && !isLoading) {
            onSendMessage(input.trim());
            setInput('');
        }
    };

    const canUseSpeech = !!(window.SpeechRecognition || window.webkitSpeechRecognition);

    return (
        <div className="p-4 bg-gray-900 border-t border-gray-700">
            <form onSubmit={handleSubmit} className="flex items-center space-x-3">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder={isRecording ? 'Listening...' : 'Type your message...'}
                    disabled={isLoading}
                    className="flex-1 px-4 py-2 bg-gray-700 text-gray-100 border border-gray-600 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 transition-shadow"
                    aria-label="Chat input"
                />
                {canUseSpeech && (
                    <button
                        type="button"
                        onClick={handleToggleRecording}
                        disabled={isLoading}
                        className={`p-3 rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${
                            isRecording 
                                ? 'bg-red-500 text-white hover:bg-red-600 focus:ring-red-500'
                                : 'bg-gray-600 text-gray-200 hover:bg-gray-500 focus:ring-blue-500'
                        }`}
                        aria-label={isRecording ? 'Stop recording' : 'Start recording'}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                        </svg>
                    </button>
                )}
                <button
                    type="submit"
                    disabled={isLoading || !input.trim()}
                    className="bg-blue-600 text-white rounded-full p-3 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 disabled:bg-blue-800 disabled:cursor-not-allowed transition-colors"
                    aria-label="Send message"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                </button>
            </form>
        </div>
    );
};

export default ChatInput;