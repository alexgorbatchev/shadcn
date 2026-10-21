import { type LucideIcon } from "lucide-react";
export interface IComposerAttachment {
  name: string;
  meta: string;
  state: "uploading" | "done" | "error";
  progress?: number;
  kind?: "image" | "text" | "archive";
}

export interface IComposerCommand {
  name: string;
  description: string;
  icon: LucideIcon;
}

export interface IComposerPerson {
  name: string;
  role: "agent" | "human";
}

export interface IComposerModel {
  name: string;
  meta: string;
}

export interface IComposerUsage {
  system: number;
  tools: number;
  messages: number;
  total: number;
}
