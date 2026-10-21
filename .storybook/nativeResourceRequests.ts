import type { BrowserCommand } from "vitest/node";
import type { Page, Request } from "playwright";

interface IRequestRecording {
  urls: string[];
  listener: (request: Request) => void;
}
const recordings = new WeakMap<Page, IRequestRecording>();

export const beginResourceRequests: BrowserCommand<[]> = async (context): Promise<void> => {
  const previous = recordings.get(context.page);
  if (previous) context.page.off("request", previous.listener);
  const urls: string[] = [];
  const listener = (request: Request) => {
    urls.push(request.url());
  };
  recordings.set(context.page, { urls, listener });
  context.page.on("request", listener);
};

export const endResourceRequests: BrowserCommand<[]> = async (context): Promise<string[]> => {
  const recording = recordings.get(context.page);
  if (!recording) throw new Error("Resource request recording was not started.");
  context.page.off("request", recording.listener);
  recordings.delete(context.page);
  return recording.urls;
};

declare module "vitest/browser" {
  interface BrowserCommands {
    beginResourceRequests: () => Promise<void>;
    endResourceRequests: () => Promise<string[]>;
  }
}
