"use client";

import { signOut } from "next-auth/react";

import { ActionStatusButton } from "@/components/ui/status-button";

export function LogoutButton() {
  return (
    <ActionStatusButton
      idleLabel="Log out"
      loadingLabel="Logging-out"
      successLabel="Logged-out"
      onAction={async () => {
        await signOut({ callbackUrl: "/" });
      }}
      className="h-10 min-w-[120px] px-5 text-sm"
      variant="outline"
    />
  );
}
