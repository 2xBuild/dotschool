"use client";

import { AlertDialog } from "@base-ui/react/alert-dialog";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { withdrawFromBatch } from "@/server/batches/enroll";

type BatchOptOutButtonProps = {
  batchId: string;
  batchTitle: string;
  enrollmentStatus: "applied" | "approved";
  className?: string;
};

export function BatchOptOutButton({
  batchId,
  batchTitle,
  enrollmentStatus,
  className,
}: BatchOptOutButtonProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const description =
    enrollmentStatus === "approved"
      ? "You'll give up your approved spot in this batch. You can apply again later, but approval is not guaranteed."
      : "We'll remove your application for this batch. If you change your mind before it starts, you can still apply again.";

  function onConfirm() {
    setError(null);
    startTransition(async () => {
      const result = await withdrawFromBatch(batchId);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setOpen(false);
      router.refresh();
    });
  }

  return (
    <AlertDialog.Root
      open={open}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen);
        if (!nextOpen) {
          setError(null);
        }
      }}
    >
      <AlertDialog.Trigger type="button" className={className}>
        Opt out
      </AlertDialog.Trigger>

      <AlertDialog.Portal>
        <AlertDialog.Backdrop className="fixed inset-0 z-40 bg-black/45" />
        <AlertDialog.Viewport className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <AlertDialog.Popup className="w-full max-w-md rounded-[1.5rem] border border-border bg-background p-5 shadow-xl outline-none sm:p-6">
            <AlertDialog.Title className="font-headline text-lg leading-tight text-balance sm:text-xl">
              Opt out of {batchTitle}?
            </AlertDialog.Title>
            <AlertDialog.Description className="mt-2 text-sm leading-relaxed text-muted-foreground text-pretty">
              {description}
            </AlertDialog.Description>

            {error ? (
              <p
                className="mt-4 rounded-xl border border-destructive/20 bg-destructive/10 px-3 py-2 text-sm text-destructive text-pretty"
                role="alert"
              >
                {error}
              </p>
            ) : null}

            <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <AlertDialog.Close
                type="button"
                disabled={pending}
                className="inline-flex min-w-[7rem] items-center justify-center rounded-full border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted disabled:pointer-events-none disabled:opacity-50"
              >
                Keep batch
              </AlertDialog.Close>
              <button
                type="button"
                disabled={pending}
                onClick={onConfirm}
                className="inline-flex min-w-[7rem] items-center justify-center rounded-full border border-destructive/40 bg-destructive/10 px-4 py-2 text-sm font-medium text-destructive transition-colors hover:bg-destructive/15 disabled:pointer-events-none disabled:opacity-50"
              >
                {pending ? "Opting out..." : "Opt out"}
              </button>
            </div>
          </AlertDialog.Popup>
        </AlertDialog.Viewport>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
}
