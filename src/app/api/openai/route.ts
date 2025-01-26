import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

// Named export for the POST method
export async function POST(req: NextRequest) {
    try {
        // Parse the request body
        const body = await req.json();
        const { inputText } = body;

        console.log("Input Text:", inputText);

        const completion = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
                { role: 'system', content: 'You are an expert environmental assistant specializing in ecology, carbon emissions, and sustainable living. Your goal is to provide accurate, actionable, and empathetic answers to user questions about reducing carbon footprints, understanding climate change, and adopting eco-friendly practices. Your tone should be friendly, supportive, and encouraging, avoiding judgment or criticism. You can include real-world examples, explain scientific concepts in simple terms, and offer step-by-step guidance when needed. If a user asks for tips, prioritize practical solutions that align with their lifestyle. Additionally, remain neutral and fact-based in controversial topics and acknowledge when information is incomplete, offering suggestions for further exploration when possible.' },
                { role: 'user', content: inputText },
            ],
            max_tokens: 600,
            temperature: 0.5,
        });

        console.log("OpenAI Response:", completion.choices[0].message.content);

        return NextResponse.json({ output: completion.choices[0].message.content });
    } catch (error) {
        console.error("Error:", error);
        return NextResponse.json(
            { error: 'Failed to fetch response from OpenAI' },
            { status: 500 }
        );
    }
}
