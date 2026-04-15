import type { Metadata } from "next";

import { MarketingShell } from "@/components/marketing/marketing-shell";

export const metadata: Metadata = {
  title: "Terms & Conditions | dotschool",
  description:
    "Terms and conditions for using dotschool, including user responsibilities, content policies, and community guidelines.",
};

export default function TermsPage() {
  return (
    <MarketingShell minimalNav>
      <article className="mx-auto max-w-3xl space-y-8">
        <header className="space-y-3 border-b border-border pb-6">
          <h1 className="font-headline text-2xl font-medium tracking-tight text-foreground">
            Terms &amp; Conditions
          </h1>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Last updated: April 2026
          </p>
        </header>

        <section className="space-y-3">
          <h2 className="font-headline text-lg font-medium text-foreground">
            1. Acceptance of terms
          </h2>
          <p className="text-sm leading-relaxed text-muted-foreground">
            By creating an account or using dotschool you agree to these terms.
            If you do not agree, please do not use the platform. We may update
            these terms from time to time and will notify users of material
            changes.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-headline text-lg font-medium text-foreground">
            2. Eligibility
          </h2>
          <p className="text-sm leading-relaxed text-muted-foreground">
            dotschool is open to anyone who wants to learn. If you are under 18,
            you must have a parent or guardian who agrees to these terms on your
            behalf. Accounts are for individual use and may not be shared.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-headline text-lg font-medium text-foreground">
            3. Accounts and access
          </h2>
          <p className="text-sm leading-relaxed text-muted-foreground">
            You sign in through a third-party provider (Google, GitHub, Apple, or
            Discord). You are responsible for the security of your account. We
            reserve the right to suspend or remove accounts that violate these
            terms or our community guidelines.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-headline text-lg font-medium text-foreground">
            4. Acceptable use
          </h2>
          <ul className="list-disc space-y-2 pl-5 text-sm leading-relaxed text-muted-foreground">
            <li>Be respectful to other learners, volunteers, and mentors.</li>
            <li>
              Do not submit work that is plagiarised, generated entirely by AI
              without disclosure, or otherwise dishonest.
            </li>
            <li>
              Do not use the platform to distribute spam, malware, or any
              illegal content.
            </li>
            <li>
              Do not attempt to disrupt the service or access other users'
              data.
            </li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="font-headline text-lg font-medium text-foreground">
            5. Content and intellectual property
          </h2>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Course materials, modules, and resources provided by dotschool are
            open-source unless stated otherwise. Work you submit (assignments,
            projects) remains yours, but you grant dotschool a non-exclusive
            licence to use it for educational and community purposes such as
            peer review and showcasing.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-headline text-lg font-medium text-foreground">
            6. Volunteers and mentors
          </h2>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Volunteers contribute guidance and review in good faith. dotschool
            does not guarantee the availability or quality of volunteer
            feedback. Volunteers agree to follow our community guidelines and
            to not misuse their access to learner data.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-headline text-lg font-medium text-foreground">
            7. Privacy and data
          </h2>
          <p className="text-sm leading-relaxed text-muted-foreground">
            We collect only what is necessary to run the platform: your name,
            email, profile information from your sign-in provider, and your
            activity within dotschool. We reserve the right to use activity data to improve the platform.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-headline text-lg font-medium text-foreground">
            8. Availability and changes
          </h2>
          <p className="text-sm leading-relaxed text-muted-foreground">
            dotschool is provided as-is. We aim for high availability but do
            not guarantee uninterrupted access. We may modify, pause, or
            discontinue features at any time. Significant changes will be
            communicated in advance where possible.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-headline text-lg font-medium text-foreground">
            9. Limitation of liability
          </h2>
          <p className="text-sm leading-relaxed text-muted-foreground">
            dotschool is a free, community-driven learning platform. To the
            maximum extent permitted by law, dotschool and its contributors are
            not liable for any indirect, incidental, or consequential damages
            arising from your use of the platform.
          </p>
        </section>

        <section className="space-y-3 border-t border-border pt-6">
          <h2 className="font-headline text-lg font-medium text-foreground">
            10. Contact
          </h2>
          <p className="text-sm leading-relaxed text-muted-foreground">
            If you have questions about these terms, reach out to us through the
            channels listed on the website or open an issue on our public
            repository.
          </p>
        </section>
      </article>
    </MarketingShell>
  );
}
