import type { CSSProperties } from "react";

export interface IMessageContextValue {
  setFooterOffset: (offset: number) => void;
}

export type MessageStyle = CSSProperties & { "--message-footer-offset": string };
