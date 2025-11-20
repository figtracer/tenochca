"use client";

import { AztecAddress } from "@aztec/aztec.js/addresses";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";

import { useTenochca } from "@/hooks/useTenochca";
import { useAztecWallet } from "@/hooks/useAztecWallet";
import { Artwork, ArtistProfile, getProfile } from "@/lib/profileStore";

type Props = {
  address: string;
};

export function ArtistProfileView({ address }: Props) {
  const { donate, isRegistered } = useTenochca();
  const { account, isConnected, connectWallet } = useAztecWallet();
  const walletAddress = account?.address;
  const [profile, setProfile] = useState<ArtistProfile | undefined>();
  const [registered, setRegistered] = useState<boolean | null>(null);
  const [loadingDonation, setLoadingDonation] = useState(false);
  const [amount, setAmount] = useState("0.1");

  useEffect(() => {
    setProfile(getProfile(address));
  }, [address]);

  useEffect(() => {
    async function load() {
      try {
        const result = await isRegistered(AztecAddress.fromString(address));
        setRegistered(Boolean(result));
      } catch (err) {
        console.error(err);
      }
    }
    load();
  }, [address, isRegistered]);

  const canDonate = useMemo(
    () => Boolean(isConnected && walletAddress),
    [isConnected, walletAddress]
  );

  const handleDonate = async () => {
    if (!canDonate) {
      await connectWallet();
      return;
    }
    setLoadingDonation(true);
    try {
      const value = BigInt(Math.floor(Number(amount) * 1_000_000));
      await donate(AztecAddress.fromString(address), value);
      toast.success("Donation sent!");
    } catch (err) {
      console.error(err);
      toast.error("Donation failed");
    } finally {
      setLoadingDonation(false);
    }
  };

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-10 py-10">
      <header className="rounded-3xl border border-white/5 bg-white/5 p-8 shadow-xl shadow-black/30">
        <p className="text-sm uppercase tracking-wider text-emerald-300/80">
          Artist profile
        </p>
        <h1 className="mt-2 text-4xl font-semibold text-white">
          {profile?.displayName || shorten(address)}
        </h1>
        <p className="mt-4 max-w-2xl text-base text-zinc-300">
          {profile?.bio ?? "This artist has not shared a bio yet."}
        </p>
        <div className="mt-6 flex flex-wrap items-center gap-4 text-sm text-zinc-400">
          <span className="rounded-full bg-white/10 px-4 py-1">
            {registered ? "Active" : "Pending"}
          </span>
          <span>{shorten(address)}</span>
        </div>
      </header>

      <section className="rounded-3xl border border-white/5 bg-zinc-950/70 p-6 shadow-lg shadow-black/40">
        <h2 className="text-xl font-semibold text-white">
          Support this artist
        </h2>
        <div className="mt-4 flex flex-col gap-4 md:flex-row md:items-center">
          <input
            type="number"
            value={amount}
            min="0"
            step="0.01"
            onChange={(event) => setAmount(event.target.value)}
            className="flex-1 rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-white focus:border-emerald-400 focus:outline-none"
          />
          <button
            type="button"
            onClick={handleDonate}
            disabled={loadingDonation}
            className="rounded-2xl bg-emerald-400/90 px-6 py-3 text-sm font-semibold text-emerald-950 shadow-lg shadow-emerald-400/30 transition hover:bg-emerald-300 disabled:opacity-60"
          >
            {canDonate ? "Send donation" : "Connect to donate"}
          </button>
        </div>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-white">Featured work</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {profile?.artworks?.length ? (
            profile.artworks.map((art) => (
              <ArtworkCard key={art.id} artwork={art} />
            ))
          ) : (
            <p className="rounded-2xl border border-dashed border-white/10 p-6 text-sm text-zinc-400">
              No artworks uploaded yet.
            </p>
          )}
        </div>
      </section>
    </div>
  );
}

function ArtworkCard({ artwork }: { artwork: Artwork }) {
  return (
    <div className="rounded-2xl border border-white/5 bg-white/5 p-4">
      <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-zinc-900/70">
        {artwork.imageUrl ? (
          <Image
            src={artwork.imageUrl}
            alt={artwork.title}
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            unoptimized
            className="object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-sm text-zinc-500">
            No image
          </div>
        )}
      </div>
      <h3 className="mt-3 text-lg font-semibold text-white">{artwork.title}</h3>
      {artwork.description ? (
        <p className="text-sm text-zinc-400">{artwork.description}</p>
      ) : null}
    </div>
  );
}

function shorten(value: string) {
  return `${value.slice(0, 6)}…${value.slice(-4)}`;
}
