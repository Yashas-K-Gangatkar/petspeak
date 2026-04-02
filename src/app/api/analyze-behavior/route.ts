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
    const { petType, behaviors } = body;

    if (!petType || !behaviors) {
      return NextResponse.json(
        { error: 'Pet type and behaviors are required' },
        { status: 400 }
      );
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    const systemPrompt = `You are PetSpeak AI, a world-renowned animal behaviorist with decades of experience studying ${petType} communication and body language. You have published numerous research papers on animal behavior and have helped thousands of pet owners better understand their furry companions.

Analyze the described behaviors and provide a comprehensive interpretation. Your response MUST be valid JSON in this exact format (no markdown, no code fences, just raw JSON):
{
  "overallMood": "the primary mood/state (e.g., Relaxed, Anxious, Playful, Defensive, Content, Stressed, etc.)",
  "moodEmoji": "an emoji that represents the mood",
  "confidence": 88,
  "interpretation": "A detailed 2-3 sentence interpretation of what these combined behaviors mean",
  "detailedAnalysis": [
    {
      "behavior": "behavior name",
      "meaning": "what this specific behavior means",
      "significance": "how significant this behavior is in understanding the pet's state"
    }
  ],
  "isCalm": true,
  "needsAttention": false,
  "healthWarning": null,
  "tips": ["tip1", "tip2", "tip3"],
  "bondingSuggestions": ["suggestion1", "suggestion2"]
}`;

    const result = await model.generateContent([
      { text: systemPrompt },
      { text: `Pet Type: ${petType}\nObserved Behaviors: ${behaviors}` },
    ]);

    const responseText = result.response.text();
    const cleaned = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

    try {
      const parsed = JSON.parse(cleaned);
      return NextResponse.json(parsed);
    } catch {
      return NextResponse.json({
        overallMood: 'Uncertain',
        moodEmoji: '🤔',
        confidence: 65,
        interpretation: cleaned,
        detailedAnalysis: [],
        isCalm: null,
        needsAttention: false,
        healthWarning: null,
        tips: ['Observe your pet for additional cues', 'Consider their recent activities and environment'],
        bondingSuggestions: ['Spend quality time with your pet', 'Maintain a calm environment']
      });
    }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to analyze behavior';
    console.error('Behavior analysis error:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
