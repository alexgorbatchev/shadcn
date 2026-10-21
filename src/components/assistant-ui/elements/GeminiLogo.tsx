import { useId, type JSX } from "react";
import type { ILogoProps } from "./ClaudeLogo.js";
export function GeminiLogo({ size = "md", ...props }: ILogoProps): JSX.Element {
  const id = useId();
  return (
    <svg
      data-testid="GeminiLogo"
      data-slot="icon"
      width={size === "sm" ? 12 : 14}
      height={size === "sm" ? 12 : 14}
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      fill={`url(#${id})`}
      aria-hidden="true"
      {...props}
    >
      <defs>
        <linearGradient id={id} x1="2" y1="12" x2="22" y2="12" gradientUnits="userSpaceOnUse">
          <stop stopColor="#4285F4" />
          <stop offset="0.5" stopColor="#9B72CB" />
          <stop offset="1" stopColor="#D96570" />
        </linearGradient>
      </defs>
      <path d="M12 1c.53 5.94 4.06 9.47 10 10-5.94.53-9.47 4.06-10 10-.53-5.94-4.06-9.47-10-10C7.94 10.47 11.47 6.94 12 1Z" />
    </svg>
  );
}
