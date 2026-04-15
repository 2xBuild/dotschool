"use client";

import { useState, useMemo } from "react";
import { X, Search } from "lucide-react";
import type { ComponentType } from "react";

/* ------------------------------------------------------------------ */
/*  Lucide icons                                                       */
/* ------------------------------------------------------------------ */
import {
  BarChart3,
  Brain,
  Box,
  Cloud,
  Code,
  Cpu,
  Database,
  Gamepad2,
  Globe,
  Layers,
  Lock,
  Package,
  Palette,
  Rocket,
  Server,
  Shield,
  Sparkles,
  Terminal,
  Wifi,
  Zap,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Simple Icons (react-icons/si)                                      */
/* ------------------------------------------------------------------ */
import {
  SiAndroid,
  SiAngular,
  SiApple,
  SiAstro,
  SiBootstrap,
  SiBun,
  SiC,
  SiCloudflare,
  SiCplusplus,
  SiSharp,
  SiCss,
  SiDart,
  SiDeno,
  SiDjango,
  SiDocker,
  SiDotnet,
  SiElectron,
  SiElixir,
  SiFigma,
  SiFirebase,
  SiFlask,
  SiFlutter,
  SiFortran,
  SiGit,
  SiGithub,
  SiGitlab,
  SiGo,
  SiGodotengine,
  SiGooglecloud,
  SiGrafana,
  SiGraphql,
  SiHaskell,
  SiHtml5,
  SiJavascript,
  SiJenkins,
  SiJupyter,
  SiKotlin,
  SiKubernetes,
  SiLinux,
  SiLua,
  SiMongodb,
  SiMysql,
  SiNestjs,
  SiNetlify,
  SiNextdotjs,
  SiNginx,
  SiNodedotjs,
  SiNotion,
  SiNuxt,
  SiNvidia,
  SiOpenai,
  SiOpencv,
  SiPerl,
  SiPhp,
  SiPostgresql,
  SiPrisma,
  SiPython,
  SiPytorch,
  SiR,
  SiReact,
  SiRedis,
  SiRuby,
  SiRust,
  SiSass,
  SiScala,
  SiSolidity,
  SiSqlite,
  SiSupabase,
  SiSvelte,
  SiSwift,
  SiTailwindcss,
  SiTensorflow,
  SiTerraform,
  SiTypescript,
  SiUnity,
  SiUnrealengine,
  SiVercel,
  SiVscodium,
  SiVuedotjs,
  SiWebgl,
  SiZig,
} from "react-icons/si";

/* ------------------------------------------------------------------ */
/*  Icon catalog                                                       */
/* ------------------------------------------------------------------ */

type CatalogEntry = {
  key: string;
  label: string;
  category: string;
  Icon: ComponentType<{ className?: string }>;
  kind: "brand" | "lucide";
};

const CATALOG: CatalogEntry[] = [
  // Languages
  { key: "si-javascript", label: "JavaScript", category: "Languages", Icon: SiJavascript, kind: "brand" },
  { key: "si-typescript", label: "TypeScript", category: "Languages", Icon: SiTypescript, kind: "brand" },
  { key: "si-python", label: "Python", category: "Languages", Icon: SiPython, kind: "brand" },
  { key: "si-rust", label: "Rust", category: "Languages", Icon: SiRust, kind: "brand" },
  { key: "si-go", label: "Go", category: "Languages", Icon: SiGo, kind: "brand" },
  { key: "si-c", label: "C", category: "Languages", Icon: SiC, kind: "brand" },
  { key: "si-cplusplus", label: "C++", category: "Languages", Icon: SiCplusplus, kind: "brand" },
  { key: "si-csharp", label: "C#", category: "Languages", Icon: SiSharp, kind: "brand" },
  { key: "si-ruby", label: "Ruby", category: "Languages", Icon: SiRuby, kind: "brand" },
  { key: "si-php", label: "PHP", category: "Languages", Icon: SiPhp, kind: "brand" },
  { key: "si-swift", label: "Swift", category: "Languages", Icon: SiSwift, kind: "brand" },
  { key: "si-kotlin", label: "Kotlin", category: "Languages", Icon: SiKotlin, kind: "brand" },
  { key: "si-dart", label: "Dart", category: "Languages", Icon: SiDart, kind: "brand" },
  { key: "si-r", label: "R", category: "Languages", Icon: SiR, kind: "brand" },
  { key: "si-lua", label: "Lua", category: "Languages", Icon: SiLua, kind: "brand" },
  { key: "si-perl", label: "Perl", category: "Languages", Icon: SiPerl, kind: "brand" },
  { key: "si-haskell", label: "Haskell", category: "Languages", Icon: SiHaskell, kind: "brand" },
  { key: "si-elixir", label: "Elixir", category: "Languages", Icon: SiElixir, kind: "brand" },
  { key: "si-scala", label: "Scala", category: "Languages", Icon: SiScala, kind: "brand" },
  { key: "si-zig", label: "Zig", category: "Languages", Icon: SiZig, kind: "brand" },
  { key: "si-solidity", label: "Solidity", category: "Languages", Icon: SiSolidity, kind: "brand" },
  { key: "si-fortran", label: "Fortran", category: "Languages", Icon: SiFortran, kind: "brand" },

  // Frontend
  { key: "si-react", label: "React", category: "Frontend", Icon: SiReact, kind: "brand" },
  { key: "si-vuedotjs", label: "Vue.js", category: "Frontend", Icon: SiVuedotjs, kind: "brand" },
  { key: "si-angular", label: "Angular", category: "Frontend", Icon: SiAngular, kind: "brand" },
  { key: "si-svelte", label: "Svelte", category: "Frontend", Icon: SiSvelte, kind: "brand" },
  { key: "si-nextdotjs", label: "Next.js", category: "Frontend", Icon: SiNextdotjs, kind: "brand" },
  { key: "si-nuxtdotjs", label: "Nuxt", category: "Frontend", Icon: SiNuxt, kind: "brand" },
  { key: "si-astro", label: "Astro", category: "Frontend", Icon: SiAstro, kind: "brand" },
  { key: "si-tailwindcss", label: "Tailwind CSS", category: "Frontend", Icon: SiTailwindcss, kind: "brand" },
  { key: "si-css3", label: "CSS", category: "Frontend", Icon: SiCss, kind: "brand" },
  { key: "si-html5", label: "HTML", category: "Frontend", Icon: SiHtml5, kind: "brand" },
  { key: "si-sass", label: "Sass", category: "Frontend", Icon: SiSass, kind: "brand" },
  { key: "si-bootstrap", label: "Bootstrap", category: "Frontend", Icon: SiBootstrap, kind: "brand" },

  // Backend & Runtime
  { key: "si-nodedotjs", label: "Node.js", category: "Backend", Icon: SiNodedotjs, kind: "brand" },
  { key: "si-deno", label: "Deno", category: "Backend", Icon: SiDeno, kind: "brand" },
  { key: "si-bun", label: "Bun", category: "Backend", Icon: SiBun, kind: "brand" },
  { key: "si-django", label: "Django", category: "Backend", Icon: SiDjango, kind: "brand" },
  { key: "si-flask", label: "Flask", category: "Backend", Icon: SiFlask, kind: "brand" },
  { key: "si-nestjs", label: "NestJS", category: "Backend", Icon: SiNestjs, kind: "brand" },
  { key: "si-dotnet", label: ".NET", category: "Backend", Icon: SiDotnet, kind: "brand" },
  { key: "si-graphql", label: "GraphQL", category: "Backend", Icon: SiGraphql, kind: "brand" },
  { key: "si-prisma", label: "Prisma", category: "Backend", Icon: SiPrisma, kind: "brand" },
  { key: "si-nginx", label: "Nginx", category: "Backend", Icon: SiNginx, kind: "brand" },

  // Databases
  { key: "si-postgresql", label: "PostgreSQL", category: "Databases", Icon: SiPostgresql, kind: "brand" },
  { key: "si-mongodb", label: "MongoDB", category: "Databases", Icon: SiMongodb, kind: "brand" },
  { key: "si-mysql", label: "MySQL", category: "Databases", Icon: SiMysql, kind: "brand" },
  { key: "si-redis", label: "Redis", category: "Databases", Icon: SiRedis, kind: "brand" },
  { key: "si-sqlite", label: "SQLite", category: "Databases", Icon: SiSqlite, kind: "brand" },
  { key: "si-supabase", label: "Supabase", category: "Databases", Icon: SiSupabase, kind: "brand" },
  { key: "si-firebase", label: "Firebase", category: "Databases", Icon: SiFirebase, kind: "brand" },

  // DevOps & Cloud
  { key: "si-docker", label: "Docker", category: "DevOps", Icon: SiDocker, kind: "brand" },
  { key: "si-kubernetes", label: "Kubernetes", category: "DevOps", Icon: SiKubernetes, kind: "brand" },
  { key: "si-googlecloud", label: "Google Cloud", category: "DevOps", Icon: SiGooglecloud, kind: "brand" },
  { key: "si-vercel", label: "Vercel", category: "DevOps", Icon: SiVercel, kind: "brand" },
  { key: "si-netlify", label: "Netlify", category: "DevOps", Icon: SiNetlify, kind: "brand" },
  { key: "si-cloudflare", label: "Cloudflare", category: "DevOps", Icon: SiCloudflare, kind: "brand" },
  { key: "si-linux", label: "Linux", category: "DevOps", Icon: SiLinux, kind: "brand" },
  { key: "si-terraform", label: "Terraform", category: "DevOps", Icon: SiTerraform, kind: "brand" },
  { key: "si-jenkins", label: "Jenkins", category: "DevOps", Icon: SiJenkins, kind: "brand" },
  { key: "si-grafana", label: "Grafana", category: "DevOps", Icon: SiGrafana, kind: "brand" },

  // Tools
  { key: "si-git", label: "Git", category: "Tools", Icon: SiGit, kind: "brand" },
  { key: "si-github", label: "GitHub", category: "Tools", Icon: SiGithub, kind: "brand" },
  { key: "si-gitlab", label: "GitLab", category: "Tools", Icon: SiGitlab, kind: "brand" },
  { key: "si-vscodium", label: "VS Code", category: "Tools", Icon: SiVscodium, kind: "brand" },
  { key: "si-figma", label: "Figma", category: "Tools", Icon: SiFigma, kind: "brand" },
  { key: "si-notion", label: "Notion", category: "Tools", Icon: SiNotion, kind: "brand" },

  // AI & ML
  { key: "si-openai", label: "OpenAI", category: "AI & ML", Icon: SiOpenai, kind: "brand" },
  { key: "si-tensorflow", label: "TensorFlow", category: "AI & ML", Icon: SiTensorflow, kind: "brand" },
  { key: "si-pytorch", label: "PyTorch", category: "AI & ML", Icon: SiPytorch, kind: "brand" },
  { key: "si-jupyter", label: "Jupyter", category: "AI & ML", Icon: SiJupyter, kind: "brand" },
  { key: "si-opencv", label: "OpenCV", category: "AI & ML", Icon: SiOpencv, kind: "brand" },
  { key: "si-nvidia", label: "NVIDIA", category: "AI & ML", Icon: SiNvidia, kind: "brand" },

  // Mobile
  { key: "si-android", label: "Android", category: "Mobile", Icon: SiAndroid, kind: "brand" },
  { key: "si-apple", label: "Apple", category: "Mobile", Icon: SiApple, kind: "brand" },
  { key: "si-flutter", label: "Flutter", category: "Mobile", Icon: SiFlutter, kind: "brand" },

  // Game & Graphics
  { key: "si-unity", label: "Unity", category: "Game", Icon: SiUnity, kind: "brand" },
  { key: "si-godotengine", label: "Godot", category: "Game", Icon: SiGodotengine, kind: "brand" },
  { key: "si-unrealengine", label: "Unreal Engine", category: "Game", Icon: SiUnrealengine, kind: "brand" },
  { key: "si-webgl", label: "WebGL", category: "Game", Icon: SiWebgl, kind: "brand" },

  // Desktop
  { key: "si-electron", label: "Electron", category: "Desktop", Icon: SiElectron, kind: "brand" },

  // Lucide (general)
  { key: "lucide-code", label: "Code", category: "General", Icon: Code, kind: "lucide" },
  { key: "lucide-terminal", label: "Terminal", category: "General", Icon: Terminal, kind: "lucide" },
  { key: "lucide-sparkles", label: "Sparkles", category: "General", Icon: Sparkles, kind: "lucide" },
  { key: "lucide-gamepad-2", label: "Gamepad", category: "General", Icon: Gamepad2, kind: "lucide" },
  { key: "lucide-bar-chart-3", label: "Chart", category: "General", Icon: BarChart3, kind: "lucide" },
  { key: "lucide-brain", label: "Brain", category: "General", Icon: Brain, kind: "lucide" },
  { key: "lucide-globe", label: "Globe", category: "General", Icon: Globe, kind: "lucide" },
  { key: "lucide-server", label: "Server", category: "General", Icon: Server, kind: "lucide" },
  { key: "lucide-database", label: "Database", category: "General", Icon: Database, kind: "lucide" },
  { key: "lucide-shield", label: "Shield", category: "General", Icon: Shield, kind: "lucide" },
  { key: "lucide-zap", label: "Zap", category: "General", Icon: Zap, kind: "lucide" },
  { key: "lucide-rocket", label: "Rocket", category: "General", Icon: Rocket, kind: "lucide" },
  { key: "lucide-cpu", label: "CPU", category: "General", Icon: Cpu, kind: "lucide" },
  { key: "lucide-wifi", label: "Wifi", category: "General", Icon: Wifi, kind: "lucide" },
  { key: "lucide-lock", label: "Lock", category: "General", Icon: Lock, kind: "lucide" },
  { key: "lucide-palette", label: "Palette", category: "General", Icon: Palette, kind: "lucide" },
  { key: "lucide-layers", label: "Layers", category: "General", Icon: Layers, kind: "lucide" },
  { key: "lucide-box", label: "Box", category: "General", Icon: Box, kind: "lucide" },
  { key: "lucide-package", label: "Package", category: "General", Icon: Package, kind: "lucide" },
  { key: "lucide-cloud", label: "Cloud", category: "General", Icon: Cloud, kind: "lucide" },
];

const CATALOG_MAP = new Map(CATALOG.map((e) => [e.key, e]));

const MAX_ICONS = 6;

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

type IconPickerProps = {
  value: string[];
  onChange: (keys: string[]) => void;
};

export function IconPicker({ value, onChange }: IconPickerProps) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);

  const selectedSet = useMemo(() => new Set(value), [value]);

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return CATALOG;
    return CATALOG.filter(
      (e) =>
        e.label.toLowerCase().includes(q) ||
        e.key.toLowerCase().includes(q) ||
        e.category.toLowerCase().includes(q),
    );
  }, [query]);

  const grouped = useMemo(() => {
    const map = new Map<string, CatalogEntry[]>();
    for (const entry of filtered) {
      const list = map.get(entry.category) ?? [];
      list.push(entry);
      map.set(entry.category, list);
    }
    return map;
  }, [filtered]);

  function add(key: string) {
    if (value.length >= MAX_ICONS || selectedSet.has(key)) return;
    onChange([...value, key]);
  }

  function remove(key: string) {
    onChange(value.filter((k) => k !== key));
  }

  return (
    <div className="space-y-2">
      <label className="block text-xs font-medium text-muted-foreground">
        Card Icons ({value.length}/{MAX_ICONS})
      </label>

      {/* Selected icons */}
      {value.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {value.map((key) => {
            const entry = CATALOG_MAP.get(key);
            if (!entry) return null;
            const { Icon } = entry;
            return (
              <span
                key={key}
                className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-2 py-1 text-xs"
              >
                <Icon className="size-3.5" />
                {entry.label}
                <button
                  type="button"
                  onClick={() => remove(key)}
                  className="ml-0.5 rounded-sm p-0.5 hover:bg-muted transition-colors"
                >
                  <X className="size-3" />
                </button>
              </span>
            );
          })}
        </div>
      )}

      {/* Toggle picker */}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="text-xs font-medium text-primary hover:text-primary/80 transition-colors"
      >
        {open ? "Close picker" : value.length >= MAX_ICONS ? "Change icons..." : "Add icons..."}
      </button>

      {/* Picker dropdown */}
      {open && (
        <div className="rounded-lg border border-border bg-card p-3 space-y-3">
          {/* Search */}
          <div className="relative">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search icons..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full rounded-md border border-input bg-background py-1.5 pl-8 pr-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors"
              autoFocus
            />
          </div>

          {/* Icon grid by category */}
          <div className="max-h-72 overflow-y-auto space-y-3">
            {[...grouped.entries()].map(([category, entries]) => (
              <div key={category}>
                <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  {category}
                </p>
                <div className="grid grid-cols-6 gap-1 sm:grid-cols-8 md:grid-cols-10">
                  {entries.map((entry) => {
                    const isSelected = selectedSet.has(entry.key);
                    const disabled = !isSelected && value.length >= MAX_ICONS;
                    const { Icon } = entry;
                    return (
                      <button
                        key={entry.key}
                        type="button"
                        title={entry.label}
                        disabled={disabled}
                        onClick={() =>
                          isSelected ? remove(entry.key) : add(entry.key)
                        }
                        className={`flex flex-col items-center gap-0.5 rounded-md p-1.5 text-[10px] transition-colors ${
                          isSelected
                            ? "bg-primary/10 text-primary ring-1 ring-primary/30"
                            : disabled
                              ? "opacity-30 cursor-not-allowed"
                              : "hover:bg-muted"
                        }`}
                      >
                        <Icon className="size-5" />
                        <span className="truncate w-full text-center leading-tight">
                          {entry.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
            {filtered.length === 0 && (
              <p className="py-4 text-center text-xs text-muted-foreground">
                No icons match "{query}"
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
