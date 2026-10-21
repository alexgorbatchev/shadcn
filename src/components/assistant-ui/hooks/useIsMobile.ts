import { useMediaQuery } from "../../../hooks/useMediaQuery.js";
export function useIsMobile(): boolean {
  return useMediaQuery("(max-width: 767px)");
}
