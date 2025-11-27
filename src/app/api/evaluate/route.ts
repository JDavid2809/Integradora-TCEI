import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    try {
        const { text } = await req.json();

        if (!text) {
            return NextResponse.json({ error: 'No text provided' }, { status: 400 });
        }

        const apiKey = process.env.OPENROUTER_API_KEY || process.env.DEEPSEEK_API_KEY;

        if (!apiKey) {
            console.warn("OPENROUTER_API_KEY is missing. Using mock response.");
            return NextResponse.json({
                score: 85,
                suggestions: "OpenRouter API Key missing. Please add OPENROUTER_API_KEY to your .env file. (Mock: Good job!)",
                issues: []
            });
        }

        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${apiKey}`,
                "HTTP-Referer": "http://localhost:3000", // Required by OpenRouter
                "X-Title": "Student Speaking Evaluator" // Optional
            },
            body: JSON.stringify({
                model: "deepseek/deepseek-chat",
                messages: [
                    {
                        role: "system",
                        content: "You are an English teacher. Evaluate the student's spoken text. Return ONLY a JSON object with: 'score' (0-100), 'issues' (array of objects with 'word', 'problem', 'suggestion'), and 'suggestions' (string with general feedback). Do not include markdown formatting or extra text."
                    },
                    {
                        role: "user",
                        content: `Evaluate this text: "${text}"`
                    }
                ],
                temperature: 0.7
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error("OpenRouter API Error:", errorText);
            throw new Error(`OpenRouter API Error: ${response.status}`);
        }

        const data = await response.json();
        const content = data.choices[0].message.content;

        // Parse the JSON response from DeepSeek
        // Sometimes models wrap JSON in markdown code blocks, so we clean it
        const cleanContent = content.replace(/```json/g, '').replace(/```/g, '').trim();
        const feedback = JSON.parse(cleanContent);

        return NextResponse.json(feedback);

    } catch (error) {
        console.error('Error processing text:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
