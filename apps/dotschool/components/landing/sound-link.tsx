"use client";

import Link from "next/link";
import type { ComponentProps } from "react";
import { useClickSound } from "@/hooks/use-app-sound";

export function SoundLink(props: ComponentProps<typeof Link>) {
  const [playClick] = useClickSound();
  return (
    <Link
      {...props}
      onClick={(e) => {
        playClick();
        props.onClick?.(e);
      }}
    />
  );
}
