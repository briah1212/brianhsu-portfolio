import { EXPERIENCES, FOCUS_AREAS, PROFILE, SKILLS } from "@/data/profile";
import { getAllProjects } from "@/data/projects";

export interface ChatTurn {
  role: "user" | "assistant";
  content: string;
}

export const MAX_TURNS = 20;
export const MAX_TURN_CHARS = 2000;

/**
 * Builds the chatbot's system prompt from the same data the site renders,
 * so the assistant can never claim something the site doesn't show.
 */
export function buildSystemPrompt(): string {
  const experience = EXPERIENCES.map(
    (exp) => `### ${exp.role}, ${exp.org} (${exp.period})\n${exp.detail}`,
  ).join("\n\n");

  const projects = getAllProjects()
    .map(
      (p) =>
        `### ${p.title}\n${p.description}\nTech: ${p.techStack.join(", ")}`,
    )
    .join("\n\n");

  return `You are Brian Hsu's portfolio assistant. You help visitors learn about Brian's work, experience, and projects.

## About Brian
${PROFILE.tagline} ${PROFILE.intro}
Education: ${PROFILE.education.degree}, ${PROFILE.education.school} (${PROFILE.education.detail}).

## Focus areas
${FOCUS_AREAS.map((f) => `- ${f.label}`).join("\n")}

## Experience

${experience}

## Projects

${projects}

## Skills
${SKILLS.join(", ")}

## Instructions
- Be concise and technical. Brian's audience includes engineers and researchers.
- Only state facts written above. Never invent numbers, employers, projects, or results. If something isn't covered here, say you don't know and suggest the Contact app.
- You can suggest opening specific projects or apps if relevant to the conversation.
- Keep responses focused and avoid unnecessary elaboration unless asked.`;
}

/**
 * Keeps only well-formed user/assistant turns from an untrusted request body,
 * so a visitor can't inject system messages or send unbounded input.
 * Returns null when nothing usable remains or the last turn isn't the user's.
 */
export function sanitizeTurns(input: unknown): ChatTurn[] | null {
  if (!Array.isArray(input)) return null;

  const turns = input
    .filter(
      (m): m is ChatTurn =>
        typeof m === "object" &&
        m !== null &&
        (m.role === "user" || m.role === "assistant") &&
        typeof m.content === "string" &&
        m.content.trim().length > 0,
    )
    .slice(-MAX_TURNS)
    .map((m) => ({ role: m.role, content: m.content.slice(0, MAX_TURN_CHARS) }));

  // Both providers expect the conversation to start with the user.
  while (turns.length > 0 && turns[0].role !== "user") turns.shift();

  if (turns.length === 0 || turns[turns.length - 1].role !== "user") {
    return null;
  }
  return turns;
}
