"use client";

import type { ReactNode } from "react";

type GeistButtonProps = {
  children: ReactNode;
  type?: "default" | "secondary" | "success" | "warning" | "error";
  loading?: boolean;
  disabled?: boolean;
  onClick?: () => void;
};

const variantClass: Record<NonNullable<GeistButtonProps["type"]>, string> = {
  default: "bg-zinc-900 hover:bg-zinc-800",
  secondary: "bg-zinc-200 text-zinc-900 hover:bg-zinc-300",
  success: "bg-emerald-600 hover:bg-emerald-700",
  warning: "bg-amber-500 hover:bg-amber-600",
  error: "bg-red-600 hover:bg-red-700",
};

export function GeistButton({
  children,
  type = "error",
  loading = false,
  disabled = false,
  onClick,
}: GeistButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <button
      type="button"
      disabled={isDisabled}
      onClick={onClick}
      className={`inline-flex min-w-[160px] items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium text-white transition-colors disabled:cursor-not-allowed disabled:opacity-70 ${variantClass[type]}`}
    >
      {loading && (
        <span
          className="size-4 shrink-0 animate-spin rounded-full border-2 border-white/30 border-t-white"
          aria-hidden
        />
      )}
      {loading ? "Загрузка…" : children}
    </button>
  );
}
