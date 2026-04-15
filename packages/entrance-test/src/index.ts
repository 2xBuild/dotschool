import graphicInterpretation from "./data/graphic-interpretation.json";
import logicalReasoning from "./data/logical-reasoning.json";
import quantitativeReasoning from "./data/quantitative-reasoning.json";
import situationalJudgmentGlobal from "./data/situational-judgment-global.json";
import verbalCriticalReasoning from "./data/verbal-critical-reasoning.json";
import visualReasoning from "./data/visual-reasoning.json";

export type QuestionSetId =
  | "GI-2026-01"
  | "LR-2026-01"
  | "QR-2026-01"
  | "SJ-2026-01"
  | "VIS-2026-01"
  | "VR-2026-01";

export type RawQuestion = {
  id: string;
  format: string;
  difficulty: string;
  prompt: string;
  options: string[];
  answerKey: string;
  rationale?: string;
  image?: string;
  optionImages?: string[];
  context?: string;
  gridData?: unknown;
  hint?: string;
};

export type RawQuestionSet = {
  setId: QuestionSetId;
  title: string;
  category: string;
  language: string;
  targetAudience: string;
  timeLimitMinutes: number;
  questions: RawQuestion[];
};

/** Client-safe shape — excludes answer key and rationale. */
export type EntranceQuestionPublic = Omit<RawQuestion, "answerKey" | "rationale">;

export type EntranceQuestionSetSummary = {
  setId: QuestionSetId;
  title: string;
  category: string;
  language: string;
  targetAudience: string;
  timeLimitMinutes: number;
  questionCount: number;
};

const QUESTION_BANK = [
  graphicInterpretation,
  logicalReasoning,
  quantitativeReasoning,
  situationalJudgmentGlobal,
  verbalCriticalReasoning,
  visualReasoning,
] as unknown as RawQuestionSet[];

const QUESTION_SET_BY_ID = new Map(QUESTION_BANK.map((set) => [set.setId, set]));

export const DEFAULT_ENTRANCE_QUESTION_SET_ID: QuestionSetId = "LR-2026-01";

export function resolveEntranceQuestionSetId(
  stored: string | null | undefined,
): QuestionSetId {
  if (stored) {
    const set = QUESTION_SET_BY_ID.get(stored as QuestionSetId);
    if (set) return set.setId;
  }
  return DEFAULT_ENTRANCE_QUESTION_SET_ID;
}

function normalizeAnswerKey(answerKey: string) {
  return answerKey.trim().toUpperCase();
}

function optionLetterFromIndex(index: number) {
  return String.fromCharCode(65 + index);
}

export function getEntranceQuestionSetSummaries(): EntranceQuestionSetSummary[] {
  return QUESTION_BANK.map((set) => ({
    setId: set.setId,
    title: set.title,
    category: set.category,
    language: set.language,
    targetAudience: set.targetAudience,
    timeLimitMinutes: set.timeLimitMinutes,
    questionCount: set.questions.length,
  }));
}

export function getEntranceQuestionSetById(setId: string): RawQuestionSet | null {
  return QUESTION_SET_BY_ID.get(setId as QuestionSetId) ?? null;
}

export function getEntranceQuestionPublic(question: RawQuestion): EntranceQuestionPublic {
  const pub: EntranceQuestionPublic = {
    id: question.id,
    format: question.format,
    difficulty: question.difficulty,
    prompt: question.prompt,
    options: question.options,
  };

  if (question.image) pub.image = question.image;
  if (question.optionImages) pub.optionImages = question.optionImages;
  if (question.context) pub.context = question.context;
  if (question.gridData) pub.gridData = question.gridData;
  if (question.hint) pub.hint = question.hint;

  return pub;
}

export function getEntranceQuestionById(
  setId: string,
  questionId: string,
): RawQuestion | null {
  const set = getEntranceQuestionSetById(setId);
  if (!set) return null;
  return set.questions.find((q) => q.id === questionId) ?? null;
}

export function isEntranceAnswerCorrect(
  question: RawQuestion,
  selectedOption: string,
): boolean {
  const trimmedSelected = selectedOption.trim();
  if (!trimmedSelected) return false;

  const normalizedKey = normalizeAnswerKey(question.answerKey);
  const upperSelected = trimmedSelected.toUpperCase();

  if (/^[A-Z]$/.test(upperSelected)) {
    return normalizedKey === upperSelected;
  }

  const optionIndex = question.options.findIndex((option) => option === trimmedSelected);
  if (optionIndex >= 0) {
    return normalizedKey === optionLetterFromIndex(optionIndex);
  }

  return false;
}

export function getCorrectOptionText(question: RawQuestion): string {
  const answerLetter = normalizeAnswerKey(question.answerKey);
  const optionIndex = answerLetter.charCodeAt(0) - 65;
  return question.options[optionIndex] ?? "";
}
