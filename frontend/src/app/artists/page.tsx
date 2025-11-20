'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

import { ArtistCard } from '@/components/ArtistCard';
import { useTenochca } from '@/hooks/useTenochca';
import { getProfile } from '@/lib/profileStore';

type ArtistDisplay = {
  address: string;
  totalReceived: bigint;
};

export default function ArtistsPage() {
  const { contract, getArtistSummaries } = useTenochca();
  const [artists, setArtists] = useState<ArtistDisplay[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!contract) return;
    let ignore = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const data = await getArtistSummaries();
        if (!ignore) setArtists(data);
      } catch (err) {
        if (ignore) return;
        const message =
          err instanceof Error ? err.message : 'Unable to fetch artists.';
        setError(message);
      } finally {
        if (!ignore) setLoading(false);
      }
    }
    load();
    return () => {
      ignore = true;
    };
  }, [contract, getArtistSummaries]);

  return (
    <div className="px-6 py-16 sm:px-12 lg:px-20">
      <header className="mx-auto flex max-w-5xl flex-col gap-4 text-center">
        <p className="text-xs uppercase tracking-[0.4em] text-emerald-300/80">
          Featured artists
        </p>
        <h1 className="text-4xl font-semibold text-white">
          Browse anonymous creators funding their work
        </h1>
        <p className="text-base text-zinc-300">
          Connect your wallet to fetch the current roster directly from the Tenochca
          contract. Each profile only appears after the required delay.
        </p>
      </header>

      {!contract && (
        <p className="mx-auto mt-10 max-w-2xl rounded-2xl border border-dashed border-white/10 p-6 text-center text-sm text-zinc-400">
          Connect your wallet from the dashboard to load the live artist list.
        </p>
      )}

      {error ? (
        <p className="mx-auto mt-10 max-w-2xl rounded-2xl border border-red-500/30 bg-red-500/10 p-6 text-center text-sm text-red-200">
          {error}
        </p>
      ) : null}

      <div className="mx-auto mt-12 grid max-w-5xl gap-6 md:grid-cols-2 lg:grid-cols-3">
        {artists.map((artist) => (
          <ArtistCard
            key={artist.address}
            address={artist.address}
            totalReceived={artist.totalReceived}
            profile={getProfile(artist.address)}
          />
        ))}
      </div>

      {contract && !loading && artists.length === 0 ? (
        <p className="mx-auto mt-10 max-w-2xl text-center text-sm text-zinc-400">
          No registered artists yet. Be the first one to{' '}
          <Link href="/dashboard" className="font-semibold text-emerald-300">
            register
          </Link>
          .
        </p>
      ) : null}

      {loading ? (
        <div className="mx-auto mt-10 flex max-w-5xl animate-pulse flex-col gap-4 rounded-3xl border border-white/5 bg-white/5 p-8 text-center text-sm text-zinc-400">
          Loading artists from Aztec…
        </div>
      ) : null}
    </div>
  );
}

