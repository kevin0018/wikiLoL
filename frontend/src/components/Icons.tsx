import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

const defaults = {
  fill: "none",
  viewBox: "0 0 24 24",
  stroke: "currentColor",
  strokeWidth: 1.8,
  "aria-hidden": true,
} as const;

export function SearchIcon(props: IconProps) {
  return (
    <svg {...defaults} {...props}>
      <circle cx="11" cy="11" r="7" />
      <path d="m16.25 16.25 4 4" strokeLinecap="round" />
    </svg>
  );
}

export function MenuIcon(props: IconProps) {
  return (
    <svg {...defaults} {...props}>
      <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />
    </svg>
  );
}

export function CloseIcon(props: IconProps) {
  return (
    <svg {...defaults} {...props}>
      <path d="m6 6 12 12M18 6 6 18" strokeLinecap="round" />
    </svg>
  );
}

export function ArrowIcon(props: IconProps) {
  return (
    <svg {...defaults} {...props}>
      <path d="M5 12h14m-5-5 5 5-5 5" strokeLinecap="round" />
    </svg>
  );
}

export function ChevronIcon(props: IconProps) {
  return (
    <svg {...defaults} {...props}>
      <path
        d="m9 5 7 7-7 7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function FilterIcon(props: IconProps) {
  return (
    <svg {...defaults} {...props}>
      <path
        d="M4 6h16M7 12h10m-7 6h4"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function RefreshIcon(props: IconProps) {
  return (
    <svg {...defaults} {...props}>
      <path
        d="M20 7v5h-5M4 17v-5h5m10.1-2A8 8 0 0 0 5.5 6.5L4 9m16 6-1.5 2.5A8 8 0 0 1 4.9 14"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
