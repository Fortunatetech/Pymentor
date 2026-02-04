import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import type { AIContext } from '@/types';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const SYSTEM_PROMPT = `You are Py, a friendly and patient AI Python tutor. Your goal is to help beginners learn Python programming through encouragement, simple explanations, and guided practice.

## YOUR PERSONALITY
- Warm, encouraging, and never condescending
- Slightly nerdy with occasional programming puns
- Celebrates every win, no matter how small
- Patient - willing to explain things multiple ways
- Humble - admits when something is genuinely tricky

## YOUR TEACHING APPROACH
1. **Socratic Method**: Ask guiding questions before giving full answers
2. **Simple Analogies**: Explain concepts using everyday examples
3. **Progressive Hints**: Give hints before complete solutions
4. **Hands-On**: Always encourage trying code
5. **Memory**: Reference what the user has already learned

## RESPONSE FORMAT
- Keep responses concise (under 200 words unless explaining complex code)
- Use markdown for formatting
- Use code blocks with \`\`\`python for ALL code examples
- Use emojis sparingly but warmly (🎉 ✨ 🐍 💡)
- End with a question or action item when appropriate

## WHAT YOU NEVER DO
- Give complete solutions without teaching first
- Use jargon without explaining it
- Make the user feel stupid
- Say "as an AI" or break character
- Discuss topics outside Python/programming

## CONTEXT HANDLING
You have access to the user's learning context. Use it naturally:
- Reference concepts they've mastered
- Be extra patient with topics they've struggled with
- Acknowledge their streak and progress
- Build on their previous sessions`;

async function getUserContext(userId: string): Promise<AIContext | null> {
  const supabase = createServerSupabaseClient();

  // Fetch user profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('name, skill_level, learning_goal, streak_count')
    .eq('id', userId)
    .single();

  if (!profile) return null;

  // Fetch mastered concepts
  const { data: progress } = await supabase
    .from('user_progress')
    .select('concept, mastery_level')
    .eq('user_id', userId)
    .gte('mastery_level', 70);

  // Fetch struggling concepts
  const { data: struggles } = await supabase
    .from('user_progress')
    .select('concept, mastery_level')
    .eq('user_id', userId)
    .lt('mastery_level', 50)
    .gt('practice_count', 0);

  // Fetch session summary
  const { data: memory } = await supabase
    .from('user_memory')
    .select('content')
    .eq('user_id', userId)
    .eq('memory_type', 'session_summary')
    .single();

  return {
    user: {
      name: profile.name || 'Learner',
      skill_level: profile.skill_level,
      learning_goal: profile.learning_goal,
      streak_count: profile.streak_count,
    },
    mastered_concepts: progress?.map(p => p.concept) || [],
    struggling_concepts: struggles?.map(s => s.concept) || [],
    recent_session_summary: memory?.content?.summary as string | undefined,
  };
}

function buildContextPrompt(context: AIContext): string {
  return `
<user_context>
Student: ${context.user.name}
Level: ${context.user.skill_level}
Goal: ${context.user.learning_goal || 'general learning'}
Streak: ${context.user.streak_count} days 🔥
Mastered Concepts: ${context.mastered_concepts.length > 0 ? context.mastered_concepts.join(', ') : 'Just starting out'}
Struggling With: ${context.struggling_concepts.length > 0 ? context.struggling_concepts.join(', ') : 'Nothing yet - keep it up!'}
${context.recent_session_summary ? `Last Session: ${context.recent_session_summary}` : ''}
</user_context>

Remember to adapt your responses based on this context. Build on what they know, be patient with struggles, and celebrate their progress!
`;
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { message, session_id, lesson_id } = await request.json();

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    // Get user context for personalization
    const context = await getUserContext(user.id);
    const contextPrompt = context ? buildContextPrompt(context) : '';

    // Get or create chat session
    let chatSessionId = session_id;
    
    if (!chatSessionId) {
      const { data: newSession } = await supabase
        .from('chat_sessions')
        .insert({
          user_id: user.id,
          lesson_id: lesson_id || null,
          title: message.substring(0, 50),
        })
        .select('id')
        .single();
      
      chatSessionId = newSession?.id;
    }

    // Fetch recent messages for context
    const { data: recentMessages } = await supabase
      .from('chat_messages')
      .select('role, content')
      .eq('session_id', chatSessionId)
      .order('created_at', { ascending: false })
      .limit(10);

    // Build messages array for Claude
    const messages: { role: 'user' | 'assistant'; content: string }[] = [
      ...(recentMessages?.reverse().map(m => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      })) || []),
      { role: 'user', content: message },
    ];

    // Call Claude API
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      system: SYSTEM_PROMPT + '\n\n' + contextPrompt,
      messages: messages,
    });

    const assistantMessage = response.content[0].type === 'text' 
      ? response.content[0].text 
      : '';

    // Save messages to database
    await supabase.from('chat_messages').insert([
      {
        session_id: chatSessionId,
        role: 'user',
        content: message,
        tokens_used: response.usage?.input_tokens || 0,
      },
      {
        session_id: chatSessionId,
        role: 'assistant',
        content: assistantMessage,
        tokens_used: response.usage?.output_tokens || 0,
      },
    ]);

    // Update session message count
    await supabase
      .from('chat_sessions')
      .update({ 
        message_count: (recentMessages?.length || 0) + 2,
        updated_at: new Date().toISOString(),
      })
      .eq('id', chatSessionId);

    return NextResponse.json({
      id: Date.now().toString(),
      content: assistantMessage,
      session_id: chatSessionId,
    });

  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { error: 'Failed to process message' },
      { status: 500 }
    );
  }
}
