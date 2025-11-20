## Tenochca Workspace

This repository now holds two separate projects:

| Path         | Description                                                                     |
| ------------ | ------------------------------------------------------------------------------- |
| `contracts/` | Noir + TypeScript test harness for the Tenochca contract (moved from the root). |
| `frontend/`  | Next.js interface that talks to Aztec PXE and the generated Tenochca artifact.  |

### Contracts

```
cd contracts
yarn install
yarn compile
yarn test
```

Everything under `contracts/` is the original setup (Nargo, vitest, scripts,
artifacts, etc.)—only the folder moved. Existing docs and scripts continue to
work from inside that directory.

### Frontend

```
cd frontend
npm install
npm run dev
```

The frontend reads the artifact from `contracts/src/artifacts/Tenochca.ts`, so
make sure the contract has been compiled before starting the UI.

# Tenochca
