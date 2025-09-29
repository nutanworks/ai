
import { GoogleGenAI, Chat } from "@google/genai";
import { SYSTEM_INSTRUCTION } from '../constants';

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export function createChatSession(): Chat {
    const chat = ai.chats.create({
        model: 'gemini-2.5-flash',
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