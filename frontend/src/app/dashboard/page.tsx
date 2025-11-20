"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";

import { ConnectCTA } from "@/components/ConnectCTA";
import { useTenochca } from "@/hooks/useTenochca";
import { useAztecWallet } from "@/hooks/useAztecWallet";
import {
  ArtistProfile,
  Artwork,
  getProfile,
  upsertProfile,
} from "@/lib/profileStore";

export default function DashboardPage() {
  const { account, isConnected } = useAztecWallet();
  const walletAddress = account?.address;
  const { contract, registerArtist, isRegistered } = useTenochca();
  const [profile, setProfile] = useState<ArtistProfile | undefined>();
  const [registered, setRegistered] = useState(false);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    if (!walletAddress) return;
    setProfile(getProfile(walletAddress.toString()));
    async function load() {
      if (!walletAddress) return;
      try {
        const reg = await isRegistered(walletAddress);
        setRegistered(Boolean(reg));
      } catch (err) {
        console.error(err);
      }
    }
    load();
  }, [walletAddress, isRegistered]);

  const [formState, setFormState] = useState({
    displayName: "",
    bio: "",
    featuredImage: "",
    artworkTitle: "",
    artworkUrl: "",
  });

  useEffect(() => {
    if (!profile) return;
    setFormState((prev) => ({
      ...prev,
      displayName: profile.displayName,
      bio: profile.bio ?? "",
      featuredImage: profile.featuredImage ?? "",
    }));
  }, [profile]);

  const artworks = useMemo<Artwork[]>(() => profile?.artworks ?? [], [profile]);

  const handleRegister = async () => {
    setPending(true);
    try {
      await registerArtist(profile?.displayName || "", profile?.bio || "", "");
      toast.success(
        "Registration submitted. Your profile will appear after the delay."
      );
      setRegistered(true);
    } catch (err) {
      console.error(err);
      toast.error("Registration failed");
    } finally {
      setPending(false);
    }
  };

  const handleMetadataSave = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!walletAddress) return;
    const nextProfile: ArtistProfile = {
      address: walletAddress.toString(),
      displayName: formState.displayName || walletAddress.toString(),
      bio: formState.bio,
      featuredImage: formState.featuredImage,
      artworks,
    };
    upsertProfile(nextProfile);
    setProfile(nextProfile);
    toast.success("Profile metadata saved locally");
  };

  const addArtwork = () => {
    if (!formState.artworkTitle) {
      toast.error("Artwork title required");
      return;
    }
    const entry: Artwork = {
      id: crypto.randomUUID(),
      title: formState.artworkTitle,
      imageUrl: formState.artworkUrl,
      description: "",
    };
    const next = [...artworks, entry];
    if (walletAddress) {
      upsertProfile({
        address: walletAddress.toString(),
        displayName: formState.displayName || walletAddress.toString(),
        bio: formState.bio,
        featuredImage: formState.featuredImage,
        artworks: next,
      });
      setProfile(getProfile(walletAddress.toString()));
    }
    setFormState((prev) => ({ ...prev, artworkTitle: "", artworkUrl: "" }));
  };

  if (!isConnected) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <div className="space-y-6 text-center">
          <h1 className="text-3xl font-semibold text-white">
            Connect to continue
          </h1>
          <p className="text-zinc-400">
            The dashboard lets you register, upload art, and manage delay
            settings.
          </p>
          <ConnectCTA />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-12 px-6 py-16 sm:px-12 lg:px-20">
      <header className="rounded-3xl border border-white/5 bg-white/5 p-8 shadow-xl shadow-black/30">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-emerald-300/80">
              Dashboard
            </p>
            <h1 className="text-3xl font-semibold text-white">
              {profile?.displayName || walletAddress?.toString()}
            </h1>
            <p className="text-sm text-zinc-400">{walletAddress?.toString()}</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="rounded-full bg-white/10 px-4 py-2 text-xs font-semibold text-zinc-200">
              {registered ? "Registered" : "Pending"}
            </span>
          </div>
        </div>
        {!registered && contract ? (
          <button
            type="button"
            onClick={handleRegister}
            disabled={pending}
            className="mt-6 rounded-2xl bg-emerald-400/90 px-6 py-3 text-sm font-semibold text-emerald-950 shadow-lg shadow-emerald-400/30 transition hover:bg-emerald-300 disabled:opacity-60"
          >
            {pending ? "Submitting…" : "Register profile"}
          </button>
        ) : null}
      </header>

      <section className="grid gap-10 lg:grid-cols-[3fr,2fr]">
        <form
          onSubmit={handleMetadataSave}
          className="rounded-3xl border border-white/5 bg-zinc-950/70 p-6 shadow-lg shadow-black/40"
        >
          <h2 className="text-xl font-semibold text-white">Profile details</h2>
          <div className="mt-6 space-y-4">
            <label className="flex flex-col gap-2 text-sm text-zinc-300">
              Display name
              <input
                type="text"
                value={formState.displayName}
                onChange={(event) =>
                  setFormState((prev) => ({
                    ...prev,
                    displayName: event.target.value,
                  }))
                }
                className="rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-white focus:border-emerald-400 focus:outline-none"
              />
            </label>
            <label className="flex flex-col gap-2 text-sm text-zinc-300">
              Bio
              <textarea
                value={formState.bio}
                rows={4}
                onChange={(event) =>
                  setFormState((prev) => ({ ...prev, bio: event.target.value }))
                }
                className="rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-white focus:border-emerald-400 focus:outline-none"
              />
            </label>
            <label className="flex flex-col gap-2 text-sm text-zinc-300">
              Featured image URL
              <input
                type="text"
                value={formState.featuredImage}
                onChange={(event) =>
                  setFormState((prev) => ({
                    ...prev,
                    featuredImage: event.target.value,
                  }))
                }
                className="rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-white focus:border-emerald-400 focus:outline-none"
              />
            </label>
          </div>
          <div className="mt-6 flex flex-wrap gap-4">
            <button
              type="submit"
              className="rounded-2xl bg-white/90 px-6 py-3 text-sm font-semibold text-black shadow-lg shadow-white/40 transition hover:bg-white"
            >
              Save metadata
            </button>
            <button
              type="button"
              onClick={() =>
                setFormState({
                  ...formState,
                  displayName: "",
                  bio: "",
                  featuredImage: "",
                  artworkTitle: "",
                  artworkUrl: "",
                })
              }
              className="rounded-2xl border border-white/20 px-6 py-3 text-sm text-white transition hover:bg-white/10"
            >
              Clear
            </button>
          </div>
        </form>

        <div className="rounded-3xl border border-white/5 bg-zinc-950/70 p-6 shadow-lg shadow-black/40">
          <h2 className="text-xl font-semibold text-white">Add artwork</h2>
          <div className="mt-4 space-y-4">
            <label className="flex flex-col gap-2 text-sm text-zinc-300">
              Title
              <input
                type="text"
                value={formState.artworkTitle}
                onChange={(event) =>
                  setFormState((prev) => ({
                    ...prev,
                    artworkTitle: event.target.value,
                  }))
                }
                className="rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-white focus:border-emerald-400 focus:outline-none"
              />
            </label>
            <label className="flex flex-col gap-2 text-sm text-zinc-300">
              Image URL
              <input
                type="text"
                value={formState.artworkUrl}
                onChange={(event) =>
                  setFormState((prev) => ({
                    ...prev,
                    artworkUrl: event.target.value,
                  }))
                }
                className="rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-white focus:border-emerald-400 focus:outline-none"
              />
            </label>
            <button
              type="button"
              onClick={addArtwork}
              className="w-full rounded-2xl bg-emerald-400/90 px-4 py-3 text-sm font-semibold text-emerald-950 shadow-lg shadow-emerald-400/30 transition hover:bg-emerald-300"
            >
              Add artwork
            </button>
          </div>
          <div className="mt-6 space-y-3">
            {artworks.length ? (
              artworks.map((art) => (
                <div
                  key={art.id}
                  className="rounded-2xl border border-white/10 p-3"
                >
                  <p className="text-sm font-semibold text-white">
                    {art.title}
                  </p>
                  <p className="text-xs text-zinc-400">{art.imageUrl}</p>
                </div>
              ))
            ) : (
              <p className="text-sm text-zinc-500">No artworks yet.</p>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
