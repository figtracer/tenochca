import { ConnectCTA } from "@/components/ConnectCTA";
import Link from "next/link";

const features = [
  {
    title: "Anonymous patronage",
    description:
      "Donations move through Aztec’s privacy layer so supporters can fund art without exposing identity or intent.",
  },
  {
    title: "Delayed visibility",
    description:
      "Profiles rely on DelayedPublicMutable state, giving artists a safety window before their work surfaces publicly.",
  },
  {
    title: "Verifiable provenance",
    description:
      "Each profile is anchored to an Aztec address while bios, links, and uploads stay pseudonymous.",
  },
];

export default function Home() {
  return (
    <div className="space-y-24 px-6 py-16 sm:px-12 lg:px-20">
      <header className="mx-auto flex max-w-5xl flex-col gap-8 rounded-[48px] border border-white/5 bg-white/5 p-10 text-center shadow-2xl shadow-black/40">
        <p className="text-xs uppercase tracking-[0.45em] text-emerald-300/80">
          Tenochca
        </p>
        <h1 className="text-4xl font-semibold leading-snug text-white sm:text-5xl">
          Anonymous artist patronage for the Aztec era
        </h1>
        <p className="text-lg text-zinc-300">
          Tenochca lets artists register delayed profiles, publish work, and accept private
          donations—all enforced by the Tenochca contract. Support creators without forcing
          them to dox themselves.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-4">
          <ConnectCTA />
          <Link
            href="/artists"
            className="rounded-full border border-white/15 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
          >
            Explore artists
          </Link>
        </div>
      </header>

      <section className="mx-auto grid max-w-5xl gap-6 md:grid-cols-3">
        {features.map((feature) => (
          <article
            key={feature.title}
            className="rounded-3xl border border-white/5 bg-zinc-950/60 p-6 shadow-lg shadow-black/30"
          >
            <h3 className="text-lg font-semibold text-white">{feature.title}</h3>
            <p className="mt-3 text-sm leading-relaxed text-zinc-400">
              {feature.description}
            </p>
          </article>
        ))}
      </section>

      <section className="mx-auto flex max-w-5xl flex-col gap-8 rounded-[36px] border border-white/5 bg-gradient-to-br from-white/10 to-white/[0.02] p-10 shadow-2xl shadow-black/40">
        <div>
          <p className="text-xs uppercase tracking-[0.4em] text-emerald-300/80">
            How it works
          </p>
          <h2 className="mt-3 text-3xl font-semibold text-white">
            Transparency for collectors, privacy for creators
          </h2>
        </div>
        <ol className="space-y-4 text-zinc-300">
          <li className="rounded-2xl border border-white/10 p-5">
            <span className="font-semibold text-white">1.</span> Connect your wallet to the
            PXE sandbox. Tenochca boots the contract interface using the generated
            artifacts.
          </li>
          <li className="rounded-2xl border border-white/10 p-5">
            <span className="font-semibold text-white">2.</span> Register a profile. The
            delay is enforced publicly, so you get a countdown before your art hits the
            explorer.
          </li>
          <li className="rounded-2xl border border-white/10 p-5">
            <span className="font-semibold text-white">3.</span> Upload media, share links,
            and accept donations anonymously. Supporters can still verify that the work is
            on-chain.
          </li>
        </ol>
      </section>
    </div>
  );
}
