export interface FrustrationResult {
  score: number;
  level: "none" | "mild" | "high";
  signals: string[];
  contains_question: boolean;
  message_length: number;
}

const FRUSTRATION_KEYWORDS = [
  /i\s*don'?t\s*(get|understand)/i,
  /i'?m\s*(stuck|confused|lost)/i,
  /this\s*(doesn'?t|does\s*not)\s*(make\s*sense|work)/i,
  /what\s*(am\s*i|do\s*you)\s*mean/i,
  /i\s*(still|keep)\s*(don'?t|can'?t)/i,
  /why\s*(doesn'?t|won'?t|isn'?t)\s*(this|it)/i,
  /help\s*me/i,
  /i\s*give\s*up/i,
  /this\s+is\s+(so\s+)?(hard|difficult|confusing|frustrating)/i,
  /nothing\s*(works|is\s*working)/i,
  /i\s*can'?t\s*(figure|do|get|understand)/i,
];

function getWordSet(text: string): Set<string> {
  return new Set(
    text
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, "")
      .split(/\s+/)
      .filter((w) => w.length > 2)
  );
}

function wordOverlap(a: string, b: string): number {
  const setA = getWordSet(a);
  const setB = getWordSet(b);
  if (setA.size === 0 || setB.size === 0) return 0;
  let overlap = 0;
  setA.forEach((word) => {
    if (setB.has(word)) overlap++;
  });
  return overlap / Math.max(setA.size, setB.size);
}

export function analyzeFrustration(
  message: string,
  recentHistory: { role: string; content: string }[]
): FrustrationResult {
  let score = 0;
  const signals: string[] = [];

  // 1. Frustration keywords (weight: 0.3)
  for (const pattern of FRUSTRATION_KEYWORDS) {
    if (pattern.test(message)) {
      score += 0.3;
      signals.push("frustration_keyword");
      break;
    }
  }

  // 2. Repeated similar question — >50% word overlap with last 3 user messages (weight: 0.25)
  const recentUserMessages = recentHistory
    .filter((m) => m.role === "user")
    .slice(-3);

  for (const prev of recentUserMessages) {
    if (wordOverlap(message, prev.content) > 0.5) {
      score += 0.25;
      signals.push("repeated_question");
      break;
    }
  }

  // 3. Very short response after Py's explanation — <10 chars (weight: 0.15)
  const lastMessage = recentHistory[recentHistory.length - 1];
  if (
    lastMessage?.role === "assistant" &&
    lastMessage.content.length > 100 &&
    message.length < 10
  ) {
    score += 0.15;
    signals.push("short_after_explanation");
  }

  // 4. ALL CAPS — >50% uppercase, msg > 5 chars (weight: 0.1)
  if (message.length > 5) {
    const letters = message.replace(/[^a-zA-Z]/g, "");
    const uppercase = letters.replace(/[^A-Z]/g, "");
    if (letters.length > 0 && uppercase.length / letters.length > 0.5) {
      score += 0.1;
      signals.push("all_caps");
    }
  }

  // 5. Multiple question marks — 2+ (weight: 0.1)
  const questionMarks = (message.match(/\?/g) || []).length;
  if (questionMarks >= 2) {
    score += 0.1;
    signals.push("multiple_question_marks");
  }

  // Clamp score to [0, 1]
  score = Math.min(1, Math.max(0, score));

  let level: "none" | "mild" | "high";
  if (score < 0.2) level = "none";
  else if (score <= 0.5) level = "mild";
  else level = "high";

  return {
    score,
    level,
    signals,
    contains_question: questionMarks > 0,
    message_length: message.length,
  };
}
