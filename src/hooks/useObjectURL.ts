import { useEffect, useState } from "react";

export function useObjectURL(file: Blob | null | undefined): string | undefined {
  const [url, setURL] = useState<string>();
  useEffect(() => {
    if (!file) {
      setURL(undefined);
      return;
    }
    const next = URL.createObjectURL(file);
    setURL(next);
    return () => URL.revokeObjectURL(next);
  }, [file]);
  return url;
}
