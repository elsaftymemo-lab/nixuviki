import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();
    
    // Pollinations AI text endpoint
    // We'll format the history as part of the prompt or just send the last message
    const lastMessage = messages[messages.length - 1].content;
    
    // You can customize the system prompt here
    const systemPrompt = "You are Zeko, a smart library assistant for the NIXUVIK platform. You are friendly, helpful, and expert in literature and book organization. Respond in the same language as the user (Arabic or English).";
    
    // We could include book context here if we fetched it from the DB
    const fullPrompt = `${systemPrompt}\n\nUser: ${lastMessage}`;

    const response = await fetch(`https://text.pollinations.ai/${encodeURIComponent(fullPrompt)}`);
    const text = await response.text();

    return NextResponse.json({ content: text });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to get response from Zeko' }, { status: 500 });
  }
}