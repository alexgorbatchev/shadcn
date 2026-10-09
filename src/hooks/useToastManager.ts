import type { UseToastManagerReturnValue } from "@base-ui/react/toast";
import { Toast } from "@base-ui/react/toast";

export function useToastManager<Data extends object = Record<string, unknown>>(): UseToastManagerReturnValue<Data> {
  return Toast.useToastManager<Data>();
}
