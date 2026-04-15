"use client";

import { Button } from "@repo/ui/button";
import { cn } from "@/lib/utils";
import { Tick02Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useMemo, useRef, useState, type ComponentProps } from "react";
import { useFormStatus } from "react-dom";
import { useClickSound, useSuccessSound } from "@/hooks/use-app-sound";

type Status = "idle" | "loading" | "success";
type ButtonBaseProps = Omit<ComponentProps<typeof Button>, "children">;
type ButtonClickEvent = Parameters<NonNullable<ButtonBaseProps["onClick"]>>[0];

type StatusButtonVisualProps = ButtonBaseProps & {
  status: Status;
  idleLabel: string;
  loadingLabel: string;
  successLabel: string;
};

type ActionStatusButtonProps = ButtonBaseProps & {
  idleLabel: string;
  loadingLabel?: string;
  successLabel?: string;
  successDurationMs?: number;
  onAction?: () => Promise<void> | void;
};

type SubmitStatusButtonProps = ButtonBaseProps & {
  idleLabel: string;
  loadingLabel?: string;
  successLabel?: string;
  successDurationMs?: number;
};

const DEFAULT_SUCCESS_DURATION_MS = 1800;

function useSuccessReset(successDurationMs: number, status: Status, setStatus: (next: Status) => void) {
  const timeoutRef = useRef<number | null>(null);

  const clearResetTimer = useCallback(() => {
    if (timeoutRef.current !== null) {
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  const scheduleReset = useCallback(() => {
    clearResetTimer();
    timeoutRef.current = window.setTimeout(() => {
      setStatus("idle");
      timeoutRef.current = null;
    }, successDurationMs);
  }, [clearResetTimer, setStatus, successDurationMs]);

  useEffect(() => {
    if (status === "success") {
      scheduleReset();
    }
    return clearResetTimer;
  }, [clearResetTimer, scheduleReset, status]);

  return { clearResetTimer };
}

function StatusButtonVisual({
  status,
  idleLabel,
  loadingLabel,
  successLabel,
  className,
  disabled,
  ...props
}: StatusButtonVisualProps) {
  const text = useMemo(() => {
    switch (status) {
      case "idle":
        return idleLabel;
      case "loading":
        return loadingLabel;
      case "success":
        return successLabel;
    }
  }, [idleLabel, loadingLabel, status, successLabel]);

  return (
    <div className="relative inline-flex group font-sans">
      <Button
        className={cn(
          "relative rounded-full h-12 px-8 text-base font-medium transition-all duration-300 min-w-[140px] disabled:opacity-100",
          status === "idle"
            ? "transition-colors"
            : "bg-muted text-muted-foreground hover:bg-muted cursor-not-allowed border-muted shadow-sm",
          className
        )}
        variant={"default"}
        disabled={disabled || status !== "idle"}
        {...props}
      >
        <span className="flex items-center justify-center">
          <AnimatePresence mode="popLayout" initial={false}>
            {text.split("").map((char, i) => (
              <motion.span
                key={`${char}-${i}`}
                layout
                initial={{ opacity: 0, scale: 0, filter: "blur(4px)" }}
                animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                exit={{ opacity: 0, scale: 0, filter: "blur(4px)" }}
                transition={{
                  type: "spring",
                  stiffness: 500,
                  damping: 30,
                  mass: 1,
                }}
                className="inline-block"
              >
                {char}
              </motion.span>
            ))}
          </AnimatePresence>
        </span>
      </Button>

      <div className={cn("absolute -top-1 -right-1 z-10 pointer-events-none")}>
        <AnimatePresence mode="wait">
          {status !== "idle" && (
            <motion.div
              initial={{ opacity: 0, scale: 0, x: -8, filter: "blur(4px)" }}
              animate={{ opacity: 1, scale: 1, x: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, scale: 0, x: -8, filter: "blur(4px)" }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className={cn(
                "flex items-center justify-center size-6 rounded-full  ring-3 overflow-visible",
                status === "success"
                  ? "bg-primary text-primary-foreground  ring-muted"
                  : "bg-muted text-muted-foreground ring-muted "
              )}
            >
              <AnimatePresence mode="popLayout">
                {status === "loading" && (
                  <motion.div
                    key="loader"
                    initial={{ opacity: 1 }}
                    animate={{ opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="absolute inset-0 flex items-center justify-center"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                    >
                      <path
                        fill="currentColor"
                        d="M12 2A10 10 0 1 0 22 12A10 10 0 0 0 12 2Zm0 18a8 8 0 1 1 8-8A8 8 0 0 1 12 20Z"
                        opacity=".5"
                      />
                      <path
                        fill="currentColor"
                        d="M20 12h2A10 10 0 0 0 12 2V4A8 8 0 0 1 20 12Z"
                      >
                        <animateTransform
                          attributeName="transform"
                          dur="1s"
                          from="0 12 12"
                          repeatCount="indefinite"
                          to="360 12 12"
                          type="rotate"
                        />
                      </path>
                    </svg>
                  </motion.div>
                )}
                {status === "success" && (
                  <motion.div
                    key="check"
                    initial={{ scale: 0, opacity: 0, filter: "blur(4px)" }}
                    animate={{ scale: 1, opacity: 1, filter: "blur(0px)" }}
                    exit={{ scale: 0, opacity: 0, filter: "blur(4px)" }}
                    transition={{ type: "spring", stiffness: 500, damping: 25 }}
                    className="absolute inset-0 flex items-center justify-center"
                  >
                    <HugeiconsIcon icon={Tick02Icon} className="size-4" />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export function ActionStatusButton({
  idleLabel,
  loadingLabel = "Working",
  successLabel = "Done",
  successDurationMs = DEFAULT_SUCCESS_DURATION_MS,
  onAction,
  onClick,
  disabled,
  ...props
}: ActionStatusButtonProps) {
  const [status, setStatus] = useState<Status>("idle");
  const { clearResetTimer } = useSuccessReset(successDurationMs, status, setStatus);
  const [playClick] = useClickSound();
  const [playSuccess] = useSuccessSound();

  useEffect(() => {
    if (status === "success") {
      playSuccess();
    }
  }, [status, playSuccess]);

  const handleClick = useCallback(
    async (event: ButtonClickEvent) => {
      onClick?.(event);
      if (event.defaultPrevented || status !== "idle") {
        return;
      }
      playClick();
      setStatus("loading");
      try {
        await onAction?.();
        setStatus("success");
      } catch {
        clearResetTimer();
        setStatus("idle");
      }
    },
    [clearResetTimer, onAction, onClick, playClick, status]
  );

  return (
    <StatusButtonVisual
      {...props}
      onClick={handleClick}
      status={status}
      disabled={disabled}
      idleLabel={idleLabel}
      loadingLabel={loadingLabel}
      successLabel={successLabel}
    />
  );
}

export function SubmitStatusButton({
  idleLabel,
  loadingLabel = "Saving",
  successLabel = "Saved",
  type = "submit",
  disabled,
  onClick,
  ...props
}: SubmitStatusButtonProps) {
  const { pending } = useFormStatus();
  const status: Status = pending ? "loading" : "idle";
  const [playClick] = useClickSound();

  const handleClick = useCallback(
    (event: ButtonClickEvent) => {
      onClick?.(event);
      if (!event.defaultPrevented && !pending) {
        playClick();
      }
    },
    [onClick, pending, playClick]
  );

  return (
    <StatusButtonVisual
      {...props}
      type={type}
      status={status}
      disabled={disabled || pending}
      idleLabel={idleLabel}
      loadingLabel={loadingLabel}
      successLabel={successLabel}
      onClick={handleClick}
    />
  );
}

export function SaveButton() {
  return <ActionStatusButton idleLabel="Save" loadingLabel="Saving" successLabel="Saved" />;
}
