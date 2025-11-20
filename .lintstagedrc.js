module.exports = {
  'frontend/**/*.{js,jsx,ts,tsx}': [
    'cd frontend && npm run lint:fix',
    'cd frontend && npm run format'
  ],
  'contracts/src/nr/**/*.nr': [
    'cd contracts && aztec-nargo fmt'
  ],
  'contracts/src/ts/**/*.{js,ts}': [
    'cd contracts && npm run lint:fix'
  ]
};
