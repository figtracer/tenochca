export type Artwork = {
  id: string;
  title: string;
  description?: string;
  imageUrl?: string;
};

export type ArtistProfile = {
  address: string;
  displayName: string;
  bio?: string;
  featuredImage?: string;
  artworks: Artwork[];
};

const STORAGE_KEY = 'tenochca.profiles';

function readStore(): Record<string, ArtistProfile> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as Record<string, ArtistProfile>;
  } catch {
    return {};
  }
}

function writeStore(store: Record<string, ArtistProfile>) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
}

export function getProfile(address: string): ArtistProfile | undefined {
  const store = readStore();
  return store[address.toLowerCase()];
}

export function upsertProfile(profile: ArtistProfile) {
  const store = readStore();
  store[profile.address.toLowerCase()] = profile;
  writeStore(store);
}

export function getAllProfiles(): ArtistProfile[] {
  return Object.values(readStore());
}

