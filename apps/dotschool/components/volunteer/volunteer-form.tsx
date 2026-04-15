"use client";

import { useState, useTransition } from "react";
import { ArrowUpRight, Sparkles } from "lucide-react";

import { submitVolunteerApplication } from "@/server/volunteer/actions";

const ROLES = [
  { id: "developer", label: "Developer" },
  { id: "discord_mod", label: "Moderator" },
  { id: "content_writer", label: "Writer" },
  { id: "mentor", label: "Mentor" },
  { id: "other", label: "Other" },
];

type VolunteerFormProps = {
  userName: string;
  onBack: () => void;
};

export function VolunteerForm({ userName, onBack }: VolunteerFormProps) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  if (submitted) {
    return (
      <div className="flex items-center gap-3 text-sm text-muted-foreground">
        
        <span>Application submitted. Thank you! We will get you back soon.</span>
       
      </div>
    );
  }

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      setError(null);
      const res = await submitVolunteerApplication(formData);
      if (res.ok) {
        setSubmitted(true);
      } else {
        setError(res.error ?? "Something went wrong.");
      }
    });
  }

  return (
    <form action={handleSubmit} className="max-w-lg space-y-5">
      {/* Role */}
      <label className="block text-sm font-medium text-foreground">
        Role
        <select
          name="role"
          required
          defaultValue=""
          className="mt-1.5 w-full appearance-none rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none"
        >
          <option value="" disabled>Select a role</option>
          {ROLES.map((r) => (
            <option key={r.id} value={r.id}>{r.label}</option>
          ))}
        </select>
      </label>

      {/* Name */}
      <label className="block text-sm font-medium text-foreground">
        Name
        <input
          type="text"
          name="name"
          required
          maxLength={100}
          defaultValue={userName}
          className="mt-1.5 w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
          placeholder="How should we call you?"
        />
      </label>

      {/* Motivation */}
      <label className="block text-sm font-medium text-foreground">
        Why do you want to join?
        <textarea
          name="motivation"
          required
          maxLength={2000}
          rows={3}
          className="mt-1.5 w-full resize-y rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
          placeholder="What drew you here? What would you like to contribute?"
        />
      </label>

      {/* Experience */}
      <label className="block text-sm font-medium text-foreground">
        Relevant experience
        <span className="ml-1 text-xs font-normal text-muted-foreground">(optional)</span>
        <textarea
          name="experience"
          maxLength={2000}
          rows={2}
          className="mt-1.5 w-full resize-y rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
          placeholder="Links, past projects, communities..."
        />
      </label>

      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={isPending}
          className="inline-flex items-center gap-1.5 rounded-full btn-blue px-5 py-2.5 text-sm font-semibold transition-colors disabled:pointer-events-none disabled:opacity-50"
        >
          {isPending ? "Submitting..." : "Submit"}
          {!isPending && <ArrowUpRight className="size-3.5" />}
        </button>
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center rounded-full border border-border px-5 py-2.5 text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
