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
    const { petType, soundDescription, context } = body;

    if (!petType || !soundDescription) {
      return NextResponse.json(
        { error: 'Pet type and sound description are required' },
        { status: 400 }
      );
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    const systemPrompt = `You are PetSpeak AI, an expert animal behaviorist and pet communication specialist. You analyze pet vocalizations and help owners understand what their pets are trying to communicate.

Based on the pet type (${petType}) and the sound description provided, give a detailed, fun, and scientifically-informed analysis.

Your response MUST be in this JSON format (no markdown, no code fences, just raw JSON):
{
  "emotion": "primary emotion (e.g., Happy, Anxious, Hungry, Playful, Territorial, Affectionate, Scared, etc.)",
  "confidence": 85,
  "humanTranslation": "What your pet is basically saying in plain English - be fun and creative, like a real translation",
  "scientificExplanation": "A brief scientific explanation of why ${petType}s make this type of sound",
  "bodyLanguage": "What body language typically accompanies this sound",
  "recommendedResponse": "How the owner should respond to their pet",
  "funFact": "An interesting fun fact about ${petType} communication",
  "urgency": "low"
}

Be specific, accurate, and entertaining. Confidence should be a number between 60-95. Keep explanations concise but informative.`;

    const userContent = `Pet Type: ${petType}\nSound Description: ${soundDescription}${context ? `\nAdditional Context: ${context}` : ''}`;

    const result = await model.generateContent([
      { text: systemPrompt },
      { text: userContent },
    ]);

    const responseText = result.response.text();
    const cleaned = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

    try {
      const parsed = JSON.parse(cleaned);
      return NextResponse.json(parsed);
    } catch {
      return NextResponse.json({
        emotion: 'Curious',
        confidence: 75,
        humanTranslation: cleaned,
        scientificExplanation: 'AI analysis based on the provided sound description.',
        bodyLanguage: 'Varies depending on the specific situation and individual pet personality.',
        recommendedResponse: 'Observe your pet closely for additional body language cues and respond with calm, gentle attention.',
        funFact: 'Pets have unique vocalizations that can vary by breed, age, and individual personality!',
        urgency: 'low'
      });
    }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to translate pet sound';
    console.error('Sound translation error:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
