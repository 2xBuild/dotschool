"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowUpRight } from "lucide-react";

import { VolunteerForm } from "@/components/volunteer/volunteer-form";
import { useClickSound } from "@/hooks/use-app-sound";

type Props = {
  isSignedIn: boolean;
  userName: string;
};

export function VolunteerPageContent({ isSignedIn, userName }: Props) {
  const [showForm, setShowForm] = useState(false);
  const [playClick] = useClickSound();

  if (showForm && isSignedIn) {
    return (
      <div>
        <p className="pixel-kicker text-primary">Apply to volunteer</p>
        <div className="mt-6">
          <VolunteerForm userName={userName} onBack={() => setShowForm(false)} />
        </div>
      </div>
    );
  }

  return (
    <article>
      <div className="space-y-6">
        <p className="pixel-kicker text-primary">Volunteer with dotschool</p>

        <div className="space-y-4 text-base leading-7 text-muted-foreground sm:text-lg sm:leading-8">
          <p>
            Dotschool is totally free, open source and community driven platform. Hence amazing people coming ahead and volunteering their time, energy and skills is the only way to go. 
          </p>
          <p>
      Ofcourse you get the deserved recognition on <a href="/fund" className="text-blue-400 hover:underline">
                our funding page
              </a>, batch and on server.
          </p>
          <p>
           While having significant portfolio adds weight but we don't have any barriers to entry. all we care is having a will to do something helpful for the community.</p>
          <p>
           One can be a mentor, content creator, designer, developer etc. If you have a skill and want to use it for a good cause, we would love to have you on board.
          </p>
        </div>
      </div>

      <div className="mt-10">
        {isSignedIn ? (
          <button
            type="button"
            onClick={() => { playClick(); setShowForm(true); }}
            className="inline-flex items-center gap-1.5 rounded-full btn-blue px-5 py-2.5 text-sm font-semibold transition-colors"
          >
            Apply
            <ArrowUpRight className="size-3.5" />
          </button>
        ) : (
          <Link
            href="/login?redirectTo=/volunteer"
            className="inline-flex items-center gap-1.5 rounded-full btn-blue px-5 py-2.5 text-sm font-semibold transition-colors"
          >
            Log in to apply
            <ArrowUpRight className="size-3.5" />
          </Link>
        )}
      </div>
    </article>
  );
}
