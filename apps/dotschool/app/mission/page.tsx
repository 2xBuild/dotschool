import type { Metadata } from "next";

import { MarketingShell } from "@/components/marketing/marketing-shell";

export const metadata: Metadata = {
  title: "Mission | dotschool",
  description:
    "Why dotschool exists, what is broken in software learning today, and how a free, community-led model can help people learn with direction, practice, and support.",
};

export default function MissionPage() {
  return (
    <MarketingShell minimalNav>
      <article className="mx-auto max-w-3xl space-y-10">
        <header className="space-y-8 pb-6">
          <h1 className="font-headline text-2xl font-light tracking-tight text-foreground">
            Story behind it
          </h1>
          <div className="space-y-6 text-base font-light leading-loose text-foreground/80">
            <p>so at a random day i came with a heated debate on twitter about paid courses on software education and personal growth. this really had me pondering about it for a while. like why do people still have to buy some courses to learn computer science, tech, or such things when every damn resource is available for free on the internet? literally why don't you just FAFO and learn it yourself for no cost and better understanding and building shyt yourself?</p>

            <p>data says that totally makes sense for a few but not for the majority. this got me thinking. did a quick brainstorm and talked a few fella who are part of the course ecosystem. and everything was clear..</p>

            <p>actually resources aren't even a big deal; the deal is the process, community and exclusivity.</p>

            <p>so i believe these are a few important factors that matter a lot for learning and growth. and they are:</p>

            <p><strong className="font-medium">high quality closed community:</strong> having a global community of people chasing the same goal, having the same energy and vibe with a similar intellectual level is a real moat. it pushes you every day, it is a never-ending source of motivation, it alerts you when you are missing out, and make you believe “YOU GOT IT CHAMP!!", "YOU CAN TOTALLY DO IT.”</p>

            <p><strong className="font-medium">exclusivity:</strong> things that are easily available are least valued; exclusive access creates the value and motivation to pursue them.</p>

            <p><strong className="font-medium">challenges and competitions:</strong> if the study were a video game, no doubt how fun, exciting and interesting it becomes.</p>

            <p><strong className="font-medium">and lastly fun and prizes:</strong> getting rewards, recognition and having fun and thrill makes the path easier and enjoyable.</p>

            <p><strong className="font-medium">Validation or face value:</strong> human beings naturally want to hear from someone who did it already or got the experience. as we all know, the whole influencer marketing and most courses industry is built on this face value. so yeah it is another imp factor why people prefer paid courses over free internet resources.</p>

            <p>so i came up with dotschool, this exactly does what i talked about. but we create exclusivity on merit and not on paid users.</p>

            <p>Seats are limited for each batch, and we conduct entrance test to choose deserving candidates.</p>

            <p>and cherry on top tech projects can sponsor batches, conduct hackathons and prizes for mutual benefits. and it make the learning more fun and rewarding you know.</p>

            <p>we don't have any teachers to teach here, self study is the way to go. but we do have amazing volunteers to run this, share their experience, answer your questions, and collect amazing resources be it articles, yt videos, research paper, docs etc.</p>

            <p>i believe programming and tech is something, that shouldn't be spoonfed, learning here and there, exploring, building and figuring out yourself teaches you better.</p>

            <p>and yeah that's it. we welcome everyone joining us either as a learner, volunteer or sponsor. we are building this for the community, by the community and with the community.</p>

            <p>best regards<br />Hanu (<a href="https://x.com/izzHanu" target="_blank" className="underline" rel="noopener noreferrer">@izzHanu</a>)</p>
          </div>
        </header>
      </article>
    </MarketingShell>
  );
}
