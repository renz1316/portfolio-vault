import Link from "next/link";
import { forwardRef, type ButtonHTMLAttributes, type ComponentProps } from "react";

// Primary_Action_Button: Default / Hover / Active / Disabled. 52px tall (> 44px target).
const BASE =
  "h-[52px] w-full rounded-xl bg-[#0A6CFF] text-base font-semibold text-white transition-colors hover:bg-[#0858D6] active:bg-[#0646AA] disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-600";

export const PrimaryButton = forwardRef<HTMLButtonElement, ButtonHTMLAttributes<HTMLButtonElement>>(
  function PrimaryButton({ className = "", ...props }, ref) {
    return <button ref={ref} {...props} className={`${BASE} ${className}`} />;
  },
);

export function PrimaryLink({ className = "", ...props }: ComponentProps<typeof Link>) {
  return <Link {...props} className={`flex items-center justify-center ${BASE} ${className}`} />;
}

export function OutlineLink({ className = "", ...props }: ComponentProps<typeof Link>) {
  return (
    <Link {...props} className={`flex h-[52px] w-full items-center justify-center rounded-xl border border-slate-300 text-base font-semibold text-slate-600 hover:bg-slate-50 ${className}`} />
  );
}
