# dotschool

dotschool is a free and community-driven school to self-study the best way with cracked peers and mentors, by building real-world projects with fun, prizes and competitions.

## What it is

Every resource you need to learn tech is already free on the internet. The thing missing is not content but the **process, community, and exclusivity** that actually make people stick with learning.

dotschool is an attempt to rebuild that wrapper around free resources:

- **High-quality closed community** — global peers chasing the same goal, with the same energy and intellectual level.
- **Exclusivity on merit, not money** — seats are limited per batch, and we run an entrance test to pick deserving candidates. No paid tiers.
- **Challenges and competitions** — hackathons, weekly tests, and prizes make learning feel like a game.
- **Validation and rewards** — certificates, reputation, and recognition that actually mean something.
- **No teachers, self-study first** — volunteers run the place, share experience, answer questions, and curate resources (articles, YouTube, papers, docs). Programming shouldn't be spoon-fed; you learn better by exploring and building things yourself.
- **Sponsor-backed batches** — tech projects can sponsor cohorts, run hackathons, and offer prizes for mutual benefit.

Built for the community, by the community, with the community. Read the full story at [dotschool.org/mission](https://dotschool.org/mission).

## Tech Stack

| Layer | Tech |
|-------|------|
| Framework | Next.js 16, React 19, TypeScript |
| Database | PostgreSQL + Drizzle ORM |
| Auth | NextAuth (Google, GitHub, Apple, Discord) |
| Styling | Tailwind CSS 4, Base UI |
| Editor | Tiptap (rich text) |
| Bot | Discord.js |
| Storage | Cloudflare R2 |
| Monorepo | Turborepo + Bun |

## Project Structure

```
apps/
  dotschool/     Main student platform (Next.js)
  admin/         Admin panel for managing batches, modules, volunteers
  e-test/        Entrance test application
  dot-bot/       Discord bot (verify, tag, concern voting, announcements)

packages/
  db/            Database schemas and client (Drizzle + Postgres)
  ui/            Shared React components
  auth/          NextAuth configuration
  entrance-test/ Test question sets
  eslint-config/ Shared ESLint configs
  typescript-config/ Shared tsconfig
```

## Getting Started

```bash
# install dependencies
bun install

# run all apps in dev mode
bun dev

# run a specific app
bun dev --filter=dotschool

# build everything
bun run build
```

You'll need a `.env` file with database credentials, OAuth keys, and any service-specific config. Check each app's usage for required env vars.

## Contributing

1. Fork the repo and create a branch from `main`
2. Make your changes — keep PRs focused and small
3. Test locally with `bun dev`
4. Open a pull request with a clear description of what and why

All contributions are welcome: code, docs, bug reports, design, or ideas. Join the [Discord](https://discord.gg/dotschool) to connect with the community.

## Star History

[![Star History Chart](https://api.star-history.com/svg?repos=2xBuild/dotschool&type=Date)](https://star-history.com/#2xBuild/dotschool&Date)

## License

Open source. Built for the community, by the community.
