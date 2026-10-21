import { Button } from "../../Button.js";
import type { JSX } from "react";
import type { ComponentProps } from "react";
import { FileTextIcon, ImageIcon, PaperclipIcon } from "lucide-react";
import { cn } from "../../../utils/cn.js";
import { field } from "./constants.js";
import { mono } from "./constants.js";
import { paper } from "./constants.js";
export interface IMessageAttachmentItem {
  id: string;
  name: string;
  size: string;
  kind: "image" | "document" | "file";
  pages?: number;
  image?: string;
}
export function MessageAttachments({ attachments, onOpen, ...props }: IMessageAttachmentsProps): JSX.Element {
  return (
    <div
      data-testid="MessageAttachments"
      data-slot="message-attachments"
      className="flex w-full max-w-sm flex-col gap-1.5"
      {...props}
    >
      {attachments.map((item) => {
        const content =
          item.kind === "image" ? (
            <>
              {item.image ? (
                <img src={item.image} alt="" className="size-10 shrink-0 rounded-md object-cover" />
              ) : (
                <ImageIcon
                  aria-hidden="true"
                  className={cn("size-4", "text-muted-foreground", "rounded-sm bg-secondary p-1")}
                />
              )}
              <span className="flex min-w-0 flex-1 flex-col gap-0.5 pe-2">
                <span className="text-foreground/90 truncate text-base">{item.name}</span>
                <span className={cn(mono, "text-muted-foreground")}>{item.size}</span>
              </span>
              <ImageIcon aria-hidden="true" className={cn("size-4")} />
            </>
          ) : (
            <>
              {item.kind === "document" ? (
                <FileTextIcon
                  aria-hidden="true"
                  className={cn("size-4", "text-muted-foreground", "rounded-sm bg-secondary p-1")}
                />
              ) : (
                <PaperclipIcon
                  aria-hidden="true"
                  className={cn("size-4", "text-muted-foreground", "rounded-sm bg-secondary p-1")}
                />
              )}
              <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                <span className="text-foreground/90 truncate text-base">{item.name}</span>
                <span className={cn(mono, "text-muted-foreground")}>
                  {item.size}
                  {item.pages !== undefined && ` · ${item.pages} pages`}
                </span>
              </span>
            </>
          );
        const className = cn(
          item.kind === "image" ? paper : field,
          item.kind === "image"
            ? "fade-in animate-in fill-mode-both group flex w-full items-center gap-3 overflow-hidden rounded-md p-2 text-start duration-300"
            : cn(
                "fade-in animate-in fill-mode-both flex w-full items-center gap-2.5 rounded-md px-3 py-2.5 text-start transition-colors duration-300",
                onOpen && "hover:bg-foreground/[0.07]",
              ),
        );
        return onOpen ? (
          <Button variant="outline" key={item.id} type="button" onClick={() => onOpen(item.id)}>
            {content}
          </Button>
        ) : (
          <div key={item.id} className={className}>
            {content}
          </div>
        );
      })}
    </div>
  );
}
interface IMessageAttachmentsProps extends Omit<
  ComponentProps<"div">,
  "children" | "attachments" | "onOpen" | "className" | "style"
> {
  attachments: readonly IMessageAttachmentItem[];
  onOpen?: (id: string) => void;
}
