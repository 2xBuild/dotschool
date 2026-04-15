"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowRight, Clock, CheckCircle2 } from "lucide-react";

import { ThemeToggle } from "@/components/ui/theme-toggle";

type Question = {
  id: string;
  format: string;
  difficulty: string;
  prompt: string;
  options: string[];
  image?: string;
  optionImages?: string[];
  context?: string;
  gridData?: unknown;
  hint?: string;
};

type FinishPayload = {
  sessionId: string;
  questionSetId: string;
  totalQuestions: number;
  answeredCount: number;
  correctCount: number;
  scorePercent: number;
  durationSeconds: number;
  finishedAt: string;
};

type TestPhase = "starting" | "running" | "submitting" | "finished";

type TestType = "entrance" | "weekly" | "custom";

type InitialSession = {
  status: "pending" | "in_progress" | "submitted" | "abandoned";
  batchTitle: string;
  testTitle: string;
  testType: TestType;
  testDescription: string | null;
  category: string;
  timeLimitMinutes: number;
  totalQuestions: number;
  questionFormats: string[];
};

type Props = {
  sessionId: string;
  dotschoolUrl: string;
  initialSession: InitialSession;
};

function formatDuration(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  if (!minutes) return `${seconds}s`;
  return `${minutes}m ${String(seconds).padStart(2, "0")}s`;
}

function formatClock(totalSeconds: number): string {
  const mins = String(Math.floor(totalSeconds / 60)).padStart(2, "0");
  const secs = String(totalSeconds % 60).padStart(2, "0");
  return `${mins}:${secs}`;
}

function formatCategory(category: string): string {
  return category
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

const FORMAT_LABELS: Record<string, string> = {
  multiple_choice: "Multiple Choice",
  image_prompt: "Visual Question",
  image_options: "Pick the Image",
  sequence: "Pattern Sequence",
  code_snippet: "Code Analysis",
  true_false: "True or False",
  ordering: "Ordering",
  matrix_pattern: "Matrix Pattern",
  shape_analogy: "Shape Analogy",
  spatial_reasoning: "Spatial Reasoning",
  chart_reading: "Chart Reading",
  table_interpretation: "Table Interpretation",
  visual_comparison: "Visual Comparison",
  mental_game: "Mental Game",
  relationship: "Relationship",
  single_best_response: "Best Response",
};

function formatLabel(format: string): string {
  return FORMAT_LABELS[format] ?? format.replace(/_/g, " ");
}

const TEST_TYPE_LABELS: Record<TestType, string> = {
  entrance: "Entrance Test",
  weekly: "Weekly Test",
  custom: "Evaluation Test",
};

function QuestionPrompt({ question }: { question: Question }) {
  return (
    <div className="space-y-5">
      {question.context ? (
        <div className="overflow-x-auto rounded-xl border border-border bg-surface-soft p-5">
          <pre className="whitespace-pre-wrap font-mono text-sm leading-7 text-foreground/85">
            {question.context}
          </pre>
        </div>
      ) : null}

      {question.image ? (
        <div className="flex justify-center rounded-xl border border-border bg-surface-soft p-5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={question.image}
            alt="Question visual"
            className="max-h-80 max-w-full rounded-lg object-contain"
          />
        </div>
      ) : null}

      <p className="max-w-3xl font-headline text-base leading-8 text-foreground sm:text-lg">
        {question.prompt}
      </p>

      {question.hint ? (
        <p className="rounded-lg bg-info px-4 py-3 text-sm text-info-foreground">
          {question.hint}
        </p>
      ) : null}
    </div>
  );
}

function OptionsList({
  question,
  selectedOption,
  onSelect,
  disabled,
}: {
  question: Question;
  selectedOption: string;
  onSelect: (option: string) => void;
  disabled: boolean;
}) {
  const hasImages =
    question.optionImages &&
    question.optionImages.length === question.options.length;

  if (hasImages) {
    return (
      <div className="grid gap-3 sm:grid-cols-2">
        {question.options.map((option, i) => {
          const isSelected = selectedOption === option;
          const imgSrc = question.optionImages![i];
          return (
            <label
              key={`${question.id}-${i}`}
              className={[
                "group flex cursor-pointer flex-col items-center gap-3 rounded-xl border p-4 transition-all",
                isSelected
                  ? "border-primary bg-primary/8 shadow-[0_0_0_1px_var(--color-primary)]"
                  : "border-border hover:border-primary/40 hover:bg-primary/4",
              ].join(" ")}
            >
              <input
                type="radio"
                name={`question-${question.id}`}
                value={option}
                checked={isSelected}
                onChange={() => onSelect(option)}
                className="sr-only"
                disabled={disabled}
              />
              {imgSrc ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={imgSrc}
                  alt={`Option ${String.fromCharCode(65 + i)}`}
                  className="max-h-32 max-w-full rounded-lg object-contain"
                />
              ) : null}
              <span className="text-center text-sm font-medium text-foreground">
                {String.fromCharCode(65 + i)}. {option}
              </span>
            </label>
          );
        })}
      </div>
    );
  }

  if (question.format === "true_false" && question.options.length === 2) {
    return (
      <div className="grid grid-cols-2 gap-3">
        {question.options.map((option, i) => {
          const isSelected = selectedOption === option;
          return (
            <label
              key={`${question.id}-${i}`}
              className={[
                "flex cursor-pointer items-center justify-center rounded-xl border px-4 py-4 text-base font-semibold transition-all",
                isSelected
                  ? "border-primary bg-primary text-primary-foreground shadow-[0_0_0_1px_var(--color-primary)]"
                  : "border-border text-foreground hover:border-primary/40 hover:bg-primary/4",
              ].join(" ")}
            >
              <input
                type="radio"
                name={`question-${question.id}`}
                value={option}
                checked={isSelected}
                onChange={() => onSelect(option)}
                className="sr-only"
                disabled={disabled}
              />
              {option}
            </label>
          );
        })}
      </div>
    );
  }

  return (
    <div className="grid gap-2.5">
      {question.options.map((option, i) => {
        const isSelected = selectedOption === option;
        return (
          <label
            key={`${question.id}-${i}`}
            className={[
              "group flex cursor-pointer items-start gap-4 rounded-xl border px-4 py-3.5 text-sm transition-all sm:px-5",
              isSelected
                ? "border-primary bg-primary/8 shadow-[0_0_0_1px_var(--color-primary)]"
                : "border-border hover:border-primary/40 hover:bg-primary/4",
            ].join(" ")}
          >
            <input
              type="radio"
              name={`question-${question.id}`}
              value={option}
              checked={isSelected}
              onChange={() => onSelect(option)}
              className="sr-only"
              disabled={disabled}
            />
            <span
              className={[
                "mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold transition-colors",
                isSelected
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground group-hover:bg-primary/12 group-hover:text-primary",
              ].join(" ")}
            >
              {String.fromCharCode(65 + i)}
            </span>
            <span className="pt-0.5 leading-7">{option}</span>
          </label>
        );
      })}
    </div>
  );
}

export function ETestRunner({
  sessionId,
  dotschoolUrl,
  initialSession,
}: Props) {
  const [phase, setPhase] = useState<TestPhase>("starting");
  const [error, setError] = useState<string | null>(null);
  const startedRef = useRef(false);
  const [showIntro, setShowIntro] = useState(
    initialSession.status === "pending",
  );

  const [batchTitle, setBatchTitle] = useState(initialSession.batchTitle);
  const [testTitle, setTestTitle] = useState(initialSession.testTitle);
  const [timeLimitSeconds, setTimeLimitSeconds] = useState(
    initialSession.timeLimitMinutes * 60,
  );
  const [totalQuestions, setTotalQuestions] = useState(
    initialSession.totalQuestions,
  );
  const [answeredCount, setAnsweredCount] = useState(0);

  const [startedAt, setStartedAt] = useState<string | null>(null);
  const [nowMs, setNowMs] = useState<number | null>(null);

  const [question, setQuestion] = useState<Question | null>(null);
  const [selectedOption, setSelectedOption] = useState("");
  const [questionPresentedAt, setQuestionPresentedAt] = useState(0);

  const [summary, setSummary] = useState<FinishPayload | null>(null);

  const showReadyState = showIntro;
  const testTypeLabel = TEST_TYPE_LABELS[initialSession.testType] ?? "Evaluation Test";

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;
    if (initialSession.status === "pending") return;
    if (initialSession.status === "abandoned") {
      setError("This test session was abandoned.");
      return;
    }
    void startSession();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialSession.status]);

  useEffect(() => {
    if (phase !== "running" && phase !== "submitting") return;
    const interval = window.setInterval(() => setNowMs(Date.now()), 1000);
    return () => window.clearInterval(interval);
  }, [phase]);

  const elapsedSeconds = useMemo(() => {
    if (!startedAt) return 0;
    const startMs = new Date(startedAt).getTime();
    const endMs = summary
      ? new Date(summary.finishedAt).getTime()
      : (nowMs ?? new Date(startedAt).getTime());
    return Math.max(0, Math.floor((endMs - startMs) / 1000));
  }, [nowMs, startedAt, summary]);

  const remainingSeconds = useMemo(() => {
    if (!timeLimitSeconds || phase === "finished") return null;
    return Math.max(0, timeLimitSeconds - elapsedSeconds);
  }, [timeLimitSeconds, elapsedSeconds, phase]);

  useEffect(() => {
    if (remainingSeconds === 0 && phase === "running") {
      finishSession();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [remainingSeconds, phase]);

  async function startSession() {
    setShowIntro(false);
    setError(null);
    setPhase("starting");
    const res = await fetch(`/api/session/${sessionId}/start`, {
      method: "POST",
    });
    const payload = await res.json();

    if (!payload.ok) {
      setError(payload.error ?? "Failed to start");
      if (initialSession.status === "pending" && !startedAt) {
        setShowIntro(true);
      }
      return;
    }

    const d = payload.data;

    if (d.status === "submitted") {
      setBatchTitle(d.batchTitle ?? "");
      setSummary({
        sessionId,
        questionSetId: "",
        totalQuestions: d.totalQuestions,
        answeredCount: d.answeredCount,
        correctCount: d.correctCount,
        scorePercent: d.scorePercent,
        durationSeconds: d.durationSeconds ?? 0,
        finishedAt: "",
      });
      setTotalQuestions(d.totalQuestions);
      setPhase("finished");
      return;
    }

    setBatchTitle(d.batchTitle ?? "");
    setTestTitle(d.questionSet.title);
    setTimeLimitSeconds(d.questionSet.timeLimitMinutes * 60);
    setTotalQuestions(d.totalQuestions);
    setStartedAt(d.startedAt);
    setAnsweredCount(d.answeredCount ?? 0);
    setNowMs(new Date(d.startedAt).getTime());
    setQuestion(d.question);
    setQuestionPresentedAt(Date.now());
    setPhase("running");
  }

  async function submitAnswer() {
    if (!question || !selectedOption) return;

    setError(null);
    setPhase("submitting");

    const responseMs =
      questionPresentedAt > 0 ? Date.now() - questionPresentedAt : null;

    const res = await fetch(`/api/session/${sessionId}/answer`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        questionId: question.id,
        selectedOption,
        responseMs,
      }),
    });
    const payload = await res.json();

    if (!payload.ok) {
      if (payload.error === "Time limit exceeded") {
        await finishSession();
        return;
      }
      setError(payload.error);
      setPhase("running");
      return;
    }

    setAnsweredCount(payload.data.answeredCount);

    if (payload.data.isComplete || !payload.data.question) {
      await finishSession();
      return;
    }

    setQuestion(payload.data.question);
    setSelectedOption("");
    setQuestionPresentedAt(Date.now());
    setPhase("running");
  }

  async function finishSession() {
    setPhase("submitting");
    const res = await fetch(`/api/session/${sessionId}/finish`, {
      method: "POST",
    });
    const payload = await res.json();

    if (!payload.ok) {
      setError(payload.error);
      setPhase("running");
      return;
    }

    setSummary(payload.data);
    setPhase("finished");
  }

  function TimerInline() {
    const timeValue =
      remainingSeconds ?? (timeLimitSeconds > 0 ? timeLimitSeconds : null);
    if (timeValue === null) return null;
    const isUrgent = remainingSeconds !== null && remainingSeconds <= 30;
    const isWarning =
      remainingSeconds !== null &&
      remainingSeconds > 30 &&
      remainingSeconds <= 60;
    const colorClass = isUrgent
      ? "text-destructive"
      : isWarning
        ? "text-amber-600 dark:text-amber-400"
        : "text-muted-foreground";
    return (
      <span
        className={`inline-flex items-center gap-1.5 font-mono text-sm tabular-nums ${colorClass}`}
      >
        <Clock className="size-3.5" />
        {formatClock(timeValue)}
      </span>
    );
  }

  const progressPercent =
    totalQuestions > 0 ? Math.round((answeredCount / totalQuestions) * 100) : 0;

  return (
    <main className="flex-1 px-4 py-6 sm:px-6 sm:py-10 lg:px-8">
      <div className="mx-auto w-full max-w-2xl">
        <header className="mb-8 space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-widest text-primary">
                {testTypeLabel}
              </p>
              <h1 className="mt-1 truncate font-headline text-lg font-semibold tracking-tight text-foreground sm:text-xl">
                {batchTitle || testTitle || "Evaluation Test"}
              </h1>
              {initialSession.testDescription ? (
                <p className="mt-1 text-sm text-muted-foreground">
                  {initialSession.testDescription}
                </p>
              ) : null}
            </div>
            <div className="flex shrink-0 items-center gap-3">
              <span className="inline-flex items-center gap-1.5 font-mono text-sm tabular-nums text-muted-foreground">
                {answeredCount}/{totalQuestions}
              </span>
              <span className="text-border">|</span>
              <TimerInline />
              <ThemeToggle />
            </div>
          </div>
          {(phase === "running" || phase === "submitting") ? (
            <div className="h-1 w-full overflow-hidden rounded-full bg-secondary">
              <div
                className="h-full rounded-full bg-primary transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          ) : null}
        </header>

        {showReadyState && !error ? (
          <section className="space-y-6">
            <div className="space-y-3">
              <h2 className="font-headline text-2xl font-semibold tracking-tight text-foreground">
                Ready when you are
              </h2>
              <p className="text-sm leading-7 text-muted-foreground">
                This test is timed and results are recorded as you go. Once you
                start, the clock begins counting down.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-xl border border-border p-4">
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Questions
                </p>
                <p className="mt-1 font-headline text-2xl font-semibold text-foreground">
                  {totalQuestions || initialSession.totalQuestions}
                </p>
              </div>
              <div className="rounded-xl border border-border p-4">
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Time limit
                </p>
                <p className="mt-1 font-headline text-2xl font-semibold text-foreground">
                  {initialSession.timeLimitMinutes}m
                </p>
              </div>
              <div className="rounded-xl border border-border p-4">
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Category
                </p>
                <p className="mt-1 font-headline text-lg font-semibold text-foreground">
                  {formatCategory(initialSession.category)}
                </p>
              </div>
            </div>

            {initialSession.questionFormats.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {initialSession.questionFormats.slice(0, 5).map((qf) => (
                  <span
                    key={qf}
                    className="inline-flex items-center rounded-full bg-primary/8 px-2.5 py-1 text-xs font-medium text-primary"
                  >
                    {formatLabel(qf)}
                  </span>
                ))}
              </div>
            ) : null}

            <button
              type="button"
              onClick={() => void startSession()}
              disabled={phase === "starting" && !showReadyState}
              className="inline-flex items-center justify-center rounded-full border-2 border-border bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-45"
            >
              Start test
              <ArrowRight className="ml-2 size-4" />
            </button>
          </section>
        ) : null}

        {phase === "starting" && !showReadyState && !error ? (
          <section className="space-y-3">
            <h2 className="font-headline text-xl font-semibold tracking-tight text-foreground">
              {initialSession.status === "in_progress"
                ? "Restoring your session..."
                : "Loading first question..."}
            </h2>
            <p className="text-sm text-muted-foreground">
              Getting everything ready.
            </p>
          </section>
        ) : null}

        {(phase === "running" || phase === "submitting") && question ? (
          <section className="space-y-6">
            <div className="flex items-center gap-3">
              <span className="font-headline text-sm font-semibold text-foreground">
                Q{answeredCount + 1}
              </span>
              <span className="text-border">/</span>
              <span className="text-xs text-muted-foreground">
                {formatLabel(question.format)}
              </span>
              <span className="rounded-full bg-primary/8 px-2 py-0.5 text-xs font-medium text-primary">
                {question.difficulty}
              </span>
            </div>

            <QuestionPrompt question={question} />

            <OptionsList
              question={question}
              selectedOption={selectedOption}
              onSelect={setSelectedOption}
              disabled={phase === "submitting"}
            />

            <div className="flex items-center justify-between gap-4 pt-2">
              <p className="text-xs text-muted-foreground">
                Select an answer to continue
              </p>
              <button
                type="button"
                onClick={submitAnswer}
                disabled={phase === "submitting" || !selectedOption}
                className="inline-flex items-center justify-center rounded-full border-2 border-border bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-45"
              >
                {phase === "submitting" ? (
                  "Submitting..."
                ) : (
                  <>
                    Next
                    <ArrowRight className="ml-1.5 size-3.5" />
                  </>
                )}
              </button>
            </div>
          </section>
        ) : null}

        {phase === "finished" && summary ? (
          <section className="space-y-8">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-primary">
                <CheckCircle2 className="size-5" />
                <span className="text-xs font-semibold uppercase tracking-widest">
                  {testTypeLabel} Complete
                </span>
              </div>
              <h2 className="font-headline text-2xl font-semibold tracking-tight text-foreground">
                {batchTitle || "Evaluation Test"}
              </h2>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {[
                { label: "Score", value: `${summary.scorePercent}%`, accent: true },
                { label: "Correct", value: String(summary.correctCount), accent: false },
                { label: "Answered", value: String(summary.answeredCount), accent: false },
                {
                  label: "Duration",
                  value:
                    summary.durationSeconds > 0
                      ? formatDuration(summary.durationSeconds)
                      : startedAt
                        ? formatDuration(elapsedSeconds)
                        : "--",
                  accent: false,
                },
              ].map(({ label, value, accent }) => (
                <div key={label} className="rounded-xl border border-border p-4">
                  <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    {label}
                  </p>
                  <p
                    className={[
                      "mt-1 font-headline text-2xl font-semibold tracking-tight",
                      accent ? "text-primary" : "text-foreground",
                    ].join(" ")}
                  >
                    {value}
                  </p>
                </div>
              ))}
            </div>

            <a
              href={dotschoolUrl}
              className="inline-flex items-center justify-center rounded-full border border-border bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Back to dotschool
            </a>
          </section>
        ) : null}

        {error ? (
          <div className="mt-4 space-y-3 rounded-xl border border-destructive/30 bg-destructive/8 px-5 py-4 text-sm text-destructive">
            <p>{error}</p>
            {phase === "starting" ? (
              <a
                href={dotschoolUrl}
                className="inline-flex items-center justify-center rounded-full border border-border bg-secondary px-4 py-2 text-sm font-medium text-secondary-foreground transition-colors hover:bg-muted"
              >
                Back to dotschool
              </a>
            ) : null}
          </div>
        ) : null}
      </div>
    </main>
  );
}
