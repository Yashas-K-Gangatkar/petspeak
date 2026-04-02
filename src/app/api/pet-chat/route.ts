import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(request: NextRequest) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'GEMINI_API_KEY is not configured. Please add it to your environment variables.' },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { messages, petType } = body;

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: 'Messages array is required' },
        { status: 400 }
      );
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    const systemPrompt = `You are PetSpeak AI, a friendly and knowledgeable pet communication expert and animal behaviorist. You specialize in helping pet owners understand their cats and dogs better.

Your personality:
- Warm, friendly, and encouraging
- Scientifically informed but accessible
- Passionate about animal welfare
- You occasionally use fun pet-related expressions
- You give practical, actionable advice

${petType ? `The user has a ${petType}. Tailor your responses specifically for ${petType} behavior and communication patterns.` : 'The user may ask about cats, dogs, or other pets.'}

Keep your responses concise (3-5 sentences typically) but informative. Use emojis sparingly for warmth. Focus on being helpful and educational.`;

    const chatHistory = messages.map((msg: { role: string; content: string }) => ({
      role: msg.role === 'assistant' ? 'model' : 'user' as const,
      parts: [{ text: msg.content }],
    }));

    const chat = model.startChat({
      history: [
        { role: 'user', parts: [{ text: 'System: ' + systemPrompt }] },
        { role: 'model', parts: [{ text: 'Understood! I am PetSpeak AI, ready to help with pet communication questions.' }] },
        ...chatHistory,
      ],
    });

    const lastMessage = messages[messages.length - 1];
    const result = await chat.sendMessage(lastMessage.content);
    const responseContent = result.response.text();

    return NextResponse.json({ message: responseContent });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to get AI response';
    console.error('Pet chat error:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
