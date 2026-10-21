import { useMemo, useSyncExternalStore } from "react";
import { useAuiState } from "@assistant-ui/react";
import { useShallow } from "zustand/react/shallow";

interface IAttachmentSource {
  file?: File;
  src?: string;
}

interface IFileSourceStore {
  subscribe: (onChange: VoidFunction) => VoidFunction;
  getSnapshot: () => string | undefined;
}

function createFileSourceStore(file: File | undefined): IFileSourceStore {
  let url: string | undefined;
  return {
    subscribe(onChange) {
      if (file === undefined) return () => {};
      const objectUrl = URL.createObjectURL(file);
      url = objectUrl;
      onChange();
      return () => {
        URL.revokeObjectURL(objectUrl);
        url = undefined;
      };
    },
    getSnapshot: () => url,
  };
}

function readServerSnapshot(): undefined {
  return undefined;
}

export function useAttachmentSrc(): string | undefined {
  const { file, src } = useAuiState(
    useShallow((state): IAttachmentSource => {
      if (state.attachment.type !== "image") return {};
      if (state.attachment.file) return { file: state.attachment.file };
      const image = state.attachment.content?.find((part) => part.type === "image")?.image;
      return image ? { src: image } : {};
    }),
  );
  const store = useMemo(() => createFileSourceStore(file), [file]);
  return useSyncExternalStore(store.subscribe, store.getSnapshot, readServerSnapshot) ?? src;
}
