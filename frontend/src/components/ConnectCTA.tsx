"use client";

import { useRouter } from "next/navigation";
import { useMemo } from "react";

import { useAztecWallet } from "@/hooks/useAztecWallet";

export function ConnectCTA({ variant = "primary" }: { variant?: "primary" | "ghost" }) {
  const router = useRouter();
  const { isConnected, connectWallet } = useAztecWallet();

  const styles = useMemo(() => {
    if (variant === "ghost") {
      return "rounded-full border border-zinc-800 px-6 py-2 text-sm font-medium text-zinc-200 hover:bg-zinc-900 transition";
    }
    return "rounded-full bg-emerald-400/90 px-8 py-3 text-sm font-semibold text-emerald-950 shadow-lg shadow-emerald-400/30 hover:bg-emerald-300 transition";
  }, [variant]);

  const handleClick = async () => {
    if (!isConnected) {
      await connectWallet();
    }
    router.push("/dashboard");
  };

  return (
    <button type="button" onClick={handleClick} className={styles}>
      {isConnected ? "Go to dashboard" : "Connect wallet"}
    </button>
  );
}

