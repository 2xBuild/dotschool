"use client";

import { useSound } from "@/hooks/use-sound";
import { click002Sound } from "@/lib/click-002";
import { beltHandle1Sound } from "@/lib/belt-handle-1";
import { switch001Sound } from "@/lib/switch-001";
import { click004Sound } from "@/lib/click-004";
import { clickSoftSound } from "@/lib/click-soft";
import { confirmation001Sound } from "@/lib/confirmation-001";
import { close001Sound } from "@/lib/close-001";

/** Primary action buttons (Join batch, Save, Submit, OAuth login) */
export function useClickSound(volume = 0.35) {
  return useSound(click002Sound, { volume, interrupt: true });
}

/** Landing page How It Works tab clicks */
export function useHowItWorksClickSound(volume = 0.28) {
  return useSound(beltHandle1Sound, { volume, interrupt: true });
}

/** Tab switching (BatchTabs pill toggle, team panel tabs) */
export function useTabSwitchSound(volume = 0.3) {
  return useSound(clickSoftSound, { volume, interrupt: true });
}

/** Navigation tab clicks (BatchNav underline tabs) */
export function useNavClickSound(volume = 0.25) {
  return useSound(click004Sound, { volume, interrupt: true });
}

/** Toggle buttons (theme toggle) */
export function useToggleSound(volume = 0.35) {
  return useSound(switch001Sound, { volume, interrupt: true });
}

/** Soft click for secondary actions (module browser items, "More detail" links) */
export function useSoftClickSound(volume = 0.3) {
  return useSound(clickSoftSound, { volume, interrupt: true });
}

/** Success confirmation (status button success state) */
export function useSuccessSound(volume = 0.35) {
  return useSound(confirmation001Sound, { volume, interrupt: true });
}

/** Back / close actions */
export function useBackSound(volume = 0.25) {
  return useSound(close001Sound, { volume, interrupt: true });
}
