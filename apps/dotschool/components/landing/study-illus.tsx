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
        {/* Lines from left top to bottom mid */}
        <path d="M0 0L600 200" />
        <path d="M0 30L600 200" />
        <path d="M0 60L600 200" />
        <path d="M0 90L600 200" />
        <path d="M0 120L600 200" />
        <path d="M0 150L600 200" />
        {/* Lines from right top to bottom mid */}
        <path d="M1200 0L600 200" />
        <path d="M1200 30L600 200" />
        <path d="M1200 60L600 200" />
        <path d="M1200 90L600 200" />
        <path d="M1200 120L600 200" />
        <path d="M1200 150L600 200" />
      </g>
    </svg>
  );
}
