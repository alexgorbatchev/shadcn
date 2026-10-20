import type { ComponentProps, ReactElement } from "react";
import type { IDensityProps } from "../../density/types.js";
import { useContext } from "react";
import { OTPInput, OTPInputContext } from "input-otp";
import { MinusIcon } from "lucide-react";
import { cn } from "../../utils/cn.js";

type InputOTPProps = ComponentProps<typeof OTPInput> & IDensityProps;

function InputOTP({ density, className, containerClassName, dir, ...props }: InputOTPProps): ReactElement {
  return (
    <div
      data-slot="input-otp"
      data-density={density}
      dir={dir}
      className="inline-flex [&:has(input:disabled)]:opacity-50 [&:has(input[aria-invalid=true])_[data-slot=input-otp-slot]]:border-destructive [&:has(input[aria-invalid=true])_[data-active=true]]:ring-destructive"
    >
      <OTPInput
        dir={dir}
        data-slot="input-otp-control"
        containerClassName={cn("flex items-center gap-control-gap", containerClassName)}
        spellCheck={false}
        className={cn("disabled:cursor-not-allowed", className)}
        {...props}
      />
    </div>
  );
}

function InputOTPGroup({ className, ...props }: ComponentProps<"div">): ReactElement {
  return <div data-slot="input-otp-group" className={cn("flex items-center", className)} {...props} />;
}

type InputOTPSlotProps = ComponentProps<"div"> & { index: number };

function InputOTPSlot({ index, className, ...props }: InputOTPSlotProps): ReactElement {
  const { char, placeholderChar, hasFakeCaret, isActive } = useContext(OTPInputContext).slots[index] ?? {};
  return (
    <div
      data-slot="input-otp-slot"
      data-active={isActive}
      aria-hidden="true"
      className={cn(
        "relative flex size-control items-center justify-center border-y border-e border-input bg-input text-sm first:border-s data-[active=true]:border-ring data-[active=true]:ring-1 data-[active=true]:ring-ring",
        className,
      )}
      {...props}
    >
      {char ?? <span className="text-muted-foreground">{placeholderChar}</span>}
      {hasFakeCaret && (
        <div className="pointer-events-none absolute h-3 w-px animate-caret-blink bg-foreground motion-reduce:animate-none" />
      )}
    </div>
  );
}

function InputOTPSeparator({ className, children, ...props }: ComponentProps<"div">): ReactElement {
  return (
    <div
      data-slot="input-otp-separator"
      aria-hidden="true"
      className={cn("flex items-center [&_svg]:size-4", className)}
      {...props}
    >
      {children ?? <MinusIcon />}
    </div>
  );
}

export { InputOTP, InputOTPGroup, InputOTPSlot, InputOTPSeparator };
