"use client";

import Image from "next/image";
import Link from "next/link";

import type { ArtistProfile } from "@/lib/profileStore";

type Props = {
  address: string;
  totalReceived?: bigint;
  profile?: ArtistProfile;
};

export function ArtistCard({ address, totalReceived = 0n, profile }: Props) {
  const displayName = profile?.displayName || shorten(address);
  const previewImage = profile?.featuredImage || "/file.svg";

  return (
    <Link
      href={`/artists/${address}`}
      className="group flex flex-col gap-4 rounded-2xl border border-white/5 bg-white/5 p-5 shadow-lg shadow-black/30 transition hover:-translate-y-1 hover:bg-white/[0.08]"
    >
      <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-zinc-900/70">
        <Image
          src={previewImage}
          alt={displayName}
          fill
          sizes="(max-width: 768px) 100vw, 33vw"
          unoptimized
          className="object-cover opacity-80 transition group-hover:scale-105"
        />
      </div>
      <div>
        <h3 className="text-lg font-semibold text-white">{displayName}</h3>
        <p className="text-xs text-zinc-400">{shorten(address)}</p>
      </div>
      <div className="text-sm text-emerald-300">
        {(Number(totalReceived) / 1e6).toFixed(2)} μΞ raised
      </div>
    </Link>
  );
}

function shorten(value: string) {
  return `${value.slice(0, 6)}…${value.slice(-4)}`;
}
