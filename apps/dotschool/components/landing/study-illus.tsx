import type { SVGProps } from "react";

export function StudyIllus({
  className,
  ...props
}: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 1200 200"
      className={className ? `block ${className}` : "block"}
      aria-hidden
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="xMidYMax meet"
      {...props}
    >
      <g
        className="stroke-white/[0.14] [stroke-linecap:round]"
        strokeWidth={1.5}
        fill="none"
      >
        <path d="M0 180Q200 140 400 155Q600 170 800 145Q1000 120 1200 140" />
        <path d="M0 160Q200 120 400 135Q600 150 800 125Q1000 100 1200 120" />
        <path d="M0 140Q200 100 400 115Q600 130 800 105Q1000 80 1200 100" />
        <path d="M0 120Q200 80 400 95Q600 110 800 85Q1000 60 1200 80" />
        <path d="M0 100Q200 60 400 75Q600 90 800 65Q1000 40 1200 60" />
        <path d="M0 80Q200 40 400 55Q600 70 800 45Q1000 20 1200 40" />

      </g>
    </svg>
  );
}
