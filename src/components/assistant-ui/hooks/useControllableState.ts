import { useCallback, useEffect, useRef, useState } from "react";

type UseControllableStateProps<T> = {
  prop: T | undefined;
  defaultProp: T | undefined;
  onChange: ((next: T) => void) | undefined;
};
type ControllableState<T> = readonly [T | undefined, (next: T) => void];

export function useControllableState<T>({
  prop,
  defaultProp,
  onChange,
}: UseControllableStateProps<T>): ControllableState<T> {
  const [internal, setInternal] = useState(defaultProp);
  const isControlled = prop !== undefined;
  const value = isControlled ? prop : internal;
  // Read onChange through a ref so inline callbacks don't recreate the setter
  // (and with it the memoized context value) every render.
  const onChangeRef = useRef(onChange);
  useEffect(() => {
    onChangeRef.current = onChange;
  });
  const setValue = useCallback(
    (next: T) => {
      if (!isControlled) setInternal(next);
      onChangeRef.current?.(next);
    },
    [isControlled],
  );
  return [value, setValue] as const;
}
