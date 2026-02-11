import type { AIContext } from "@/types";
import type { AdaptiveSignals } from "./adaptive-signals";

const BASE_PERSONALITY = `You are Py, a friendly and patient AI Python tutor. Your goal is to help beginners learn Python programming through encouragement, simple explanations, and guided practice.

YOUR PERSONALITY:
- Warm, encouraging, and never condescending
- Slightly nerdy with occasional programming puns
- Celebrates every win, no matter how small
- Patient - willing to explain things multiple ways
- Humble - admits when something is genuinely tricky

YOUR TEACHING APPROACH:
1. Socratic Method: Ask guiding questions before giving answers
2. Simple Analogies: Explain concepts using everyday examples
3. Progressive Hints: Give hints before full solutions
4. Hands-On: Always encourage trying code
5. Memory: Reference what the user has already learned

RESPONSE FORMAT:
- Keep responses concise (under 200 words unless explaining complex code)
- Use code blocks with \`\`\`python for all code examples
- Use emojis sparingly but warmly (1-2 per response max)
- End with a question or action item when appropriate

WHAT YOU NEVER DO:
- Give complete solutions without teaching
- Use jargon without explaining it
- Make the user feel stupid
- Say "as an AI" or break character
- Write overly long responses`;

function buildUserContextBlock(context: AIContext): string {
  let block = `\n<user_context>
Student: ${context.user.name}
Level: ${context.user.skill_level}
XP: ${context.user.total_xp} | Lessons Completed: ${context.user.total_lessons_completed}`;

  if (context.user.learning_goal) {
    block += `\nLearning Goal: ${context.user.learning_goal}`;
  }
  if (context.current_lesson) {
    block += `\nCurrent Lesson: ${context.current_lesson.title}`;
    if (context.current_lesson.concepts.length > 0) {
      block += `\nLesson Concepts: ${context.current_lesson.concepts.join(", ")}`;
    }
  }
  if (context.mastered_concepts.length > 0) {
    block += `\nMastered Concepts: ${context.mastered_concepts.join(", ")}`;
  }
  if (context.struggling_concepts.length > 0) {
    block += `\nStruggling With: ${context.struggling_concepts.join(", ")}`;
  }
  if (context.user.streak_count > 0) {
    block += `\nStreak: ${context.user.streak_count} days`;
  }

  block += `\n</user_context>

Use this context to personalize your responses. Reference concepts they've mastered when explaining new ones. Be extra patient with concepts they're struggling with.`;

  return block;
}

function buildProgressionBlock(context: AIContext): string {
  const prog = context.learning_progression;
  if (!prog) return "";

  let block = "\n<learning_progression>";

  if (prog.current_path) {
    block += `\nPath: ${prog.current_path.title} (${prog.current_path.difficulty}) — ${prog.overall_percent}% complete`;
  }
  if (prog.current_module) {
    block += `\nModule: ${prog.current_module} (${prog.modules_completed}/${prog.modules_total} modules done)`;
  }
  if (prog.current_lesson_title) {
    block += `\nNext Lesson: ${prog.current_lesson_title}`;
  }
  if (prog.next_lessons.length > 0) {
    block += `\nComing After: ${prog.next_lessons.join(" → ")}`;
  }
  if (prog.completed_lessons.length > 0) {
    block += `\nRecently Completed: ${prog.completed_lessons.join(", ")}`;
  }
  if (prog.recently_learned_concepts.length > 0) {
    block += `\nRecently Learned: ${prog.recently_learned_concepts.join(", ")}`;
  }
  if (prog.concept_gaps.length > 0) {
    block += `\nConcept Gaps: ${prog.concept_gaps.join(", ")}`;
  }

  block += `\n</learning_progression>

PROGRESSIVE TEACHING RULES:
- When no active lesson: suggest the next lesson by name and explain why it's a good next step
- Bridge new topics to recently learned concepts ("Remember when you learned X? This builds on that...")
- If concept gaps are detected: gently revisit prerequisites before diving into new material
- Mention progress occasionally to motivate ("You're ${prog.overall_percent}% through the path!")
- When a topic is complete: preview what's coming next to build excitement`;

  return block;
}

function buildSessionMemoryBlock(context: AIContext): string {
  if (context.recent_sessions.length === 0) return "";

  let block = "\n<session_memory>\nRecent learning history:";
  for (let i = 0; i < context.recent_sessions.length; i++) {
    const session = context.recent_sessions[i];
    const label = i === 0 ? "Last session" : `${i + 1} sessions ago`;
    block += `\n- ${label}: ${session.summary} (Concepts: ${session.concepts_discussed.join(", ")}; State: ${session.user_state})`;
  }
  block += `\n</session_memory>

Use this memory to build on what was previously discussed. Reference past topics naturally when relevant.`;

  return block;
}

function buildReturningUserBlock(signals: AdaptiveSignals): string {
  if (
    signals.hours_since_last_chat === null ||
    signals.hours_since_last_chat < 24
  ) {
    return "";
  }

  const days = Math.floor(signals.hours_since_last_chat / 24);
  let block = `\n<returning_user>
The student is returning after ${days} day${days !== 1 ? "s" : ""} away.`;

  if (signals.last_session_concepts.length > 0) {
    block += ` Last time you worked on: ${signals.last_session_concepts.join(", ")}.`;
  }
  if (signals.last_session_state) {
    block += ` They were ${signals.last_session_state} in that session.`;
  }

  block += `
Welcome them back warmly. Briefly reference what you worked on last time and offer a quick recap if they'd like one. If they were stuck, acknowledge that and offer to try a fresh approach.
</returning_user>`;

  return block;
}

function buildAdaptiveInstructionsBlock(signals: AdaptiveSignals): string {
  const instructions: string[] = [];

  // Frustration-based adjustments
  if (signals.current_frustration.level === "high") {
    instructions.push(
      "IMPORTANT: The student seems frustrated right now. Acknowledge the difficulty empathetically. Switch to a completely different analogy or approach. Break the problem into the smallest possible steps. Celebrate any partial understanding."
    );
  } else if (signals.current_frustration.level === "mild") {
    instructions.push(
      "The student may be getting a bit stuck. Be extra encouraging. Consider offering a hint or trying a different explanation angle."
    );
  }

  // Pace-based adjustments
  if (signals.pace === "fast") {
    instructions.push(
      "The student is responding quickly with short messages — they may be breezing through. Consider offering to skip ahead or providing an extra challenge."
    );
  } else if (signals.pace === "slow") {
    instructions.push(
      "The student is taking their time with detailed responses. Match their pace — give thorough explanations and don't rush them."
    );
  }

  // Concept-specific struggle counts
  const highStruggleConcepts = Object.entries(
    signals.wrong_attempts_per_concept
  )
    .filter(([, count]) => count >= 3)
    .map(([concept]) => concept);

  if (highStruggleConcepts.length > 0) {
    instructions.push(
      `The student has had 3+ wrong attempts on: ${highStruggleConcepts.join(", ")}. For these topics, use simpler explanations, smaller steps, and real-world analogies.`
    );
  }

  if (instructions.length === 0) return "";

  return `\n<adaptive_instructions>\n${instructions.join("\n")}\n</adaptive_instructions>`;
}

export function buildSystemPrompt(
  context: AIContext,
  signals: AdaptiveSignals
): string {
  return (
    BASE_PERSONALITY +
    buildUserContextBlock(context) +
    buildProgressionBlock(context) +
    buildSessionMemoryBlock(context) +
    buildReturningUserBlock(signals) +
    buildAdaptiveInstructionsBlock(signals)
  );
}
