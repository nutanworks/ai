
import { GoogleGenAI, Chat } from "@google/genai";
import { SYSTEM_INSTRUCTION } from '../constants';
import { Role } from '../types';
import type { Message } from '../types';

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Maps our internal message format to the format expected by the Gemini API
const toGeminiHistory = (history: Message[]) => {
    return history
        .filter(msg => msg.id !== 'initial-greeting' && !msg.error) // Don't include the UI greeting or errors in history
        .map(msg => ({
            role: msg.role === Role.USER ? 'user' : 'model',
            parts: [{ text: msg.text }],
        }));
};

export function createChatSession(history: Message[] = []): Chat {
    const chat = ai.chats.create({
        model: 'gemini-2.5-flash',
        // Pass the formatted history to the chat session
        history: toGeminiHistory(history),
        config: {
            systemInstruction: SYSTEM_INSTRUCTION,
            temperature: 0.7,
            topP: 0.9,
            topK: 40,
        },
    });
    return chat;
}

export async function sendMessage(chat: Chat, message: string): Promise<string> {
    try {
        const result = await chat.sendMessage({ message });
        return result.text;
    } catch (error) {
        console.error("Error sending message to Gemini:", error);
        // Let the UI layer handle the user-facing error message
        throw error;
    }
}
