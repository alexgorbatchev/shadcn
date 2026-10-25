import { type BaseComponentProps } from "@json-render/react";
import { Skeleton } from "../../index.js";
import { type JsonProps } from "./catalog.js";
export const JsonSkeleton = ({ props }: BaseComponentProps<JsonProps<"Skeleton">>) => {
  return (
    <Skeleton
      className={props.rounded ? "rounded-full" : "rounded-md"}
      style={{
        width: props.width ?? "100%",
        height: props.height ?? "1.25rem",
      }}
    />
  );
};
