import type ts from "typescript";

export interface PackageMetadata {
  name: string;
  description: string;
  exports: Record<string, string | { import: string }>;
  repository?: { url: string };
}

export interface StoryDoc {
  name: string;
  category: string;
  path: string;
  description: string;
  content: string;
}

export interface PublicImport {
  name: string;
  path: string;
}

export type PublicImports = Map<ts.Symbol, PublicImport[]>;
