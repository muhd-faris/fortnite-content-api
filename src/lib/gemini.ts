import {
    createGoogleGenerativeAI,
    GoogleGenerativeAIProvider
} from '@ai-sdk/google';

export const getGeminiConfig = (): GoogleGenerativeAIProvider => {
    const google = createGoogleGenerativeAI({
        apiKey: process.env.GEMINI_API_KEY
    });

    return google;
};