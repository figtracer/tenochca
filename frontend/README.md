## Tenochca Frontend

This folder contains the experimental UI for the Tenochca contract. It connects to
the Aztec PXE sandbox, instantiates the generated `TenochcaContract` artifact, and
reads/writes artist data.

### Prerequisites

1. Run the Aztec sandbox (`aztec start --sandbox`) so the PXE endpoint is
   available locally.
2. Deploy the Tenochca contract from the root project and note the deployed
   address.
3. Copy `.env.example` to `.env.local` and set:

```
NEXT_PUBLIC_PXE_URL=http://localhost:8080
NEXT_PUBLIC_TENOCHCA_CONTRACT=0xYourContractAddress
NEXT_PUBLIC_DEFAULT_DELAY_SECONDS=300
```

The UI relies on the generated artifact at `../src/artifacts/Tenochca.ts`, so the
root project must be compiled (`yarn compile && yarn codegen`).

### Development

Install dependencies (already done when scaffolding) and start the dev server:

```bash
npm run dev
```

Navigate to <http://localhost:3000>. Use the dashboard to connect a test wallet
and register an artist profile. Metadata such as display name, bio, and artwork
links are persisted in `localStorage` for now, while the registration status and
donation totals come directly from the Tenochca contract.

### Notable directories

- `src/hooks/usePXE.tsx` – connects to the PXE node and exposes basic status.
- `src/hooks/useWallet.tsx` – reuses Aztec’s test wallets for a quick UX.
- `src/hooks/useTenochca.ts` – typed wrapper around the generated contract.
- `src/lib/profileStore.ts` – lightweight metadata store (localStorage).
- `src/app/artists/*` – list and detail pages for artist profiles.
- `src/app/dashboard/page.tsx` – registration + metadata manager for the
  connected wallet.

The UI intentionally mirrors the Noir contract’s semantics: registrations use
`DelayedPublicMutable`, so newly registered artists show a pending badge until
the delay elapses. Donations are routed through the contract’s `donate` method.

### Testing & linting

- `npm run lint` – ESLint check
- `npm run dev` – local dev server with hot reload

No automated component tests are configured yet; hooks are exercised through the
manual flows above.