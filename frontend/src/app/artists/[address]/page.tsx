import { ArtistProfileView } from "@/components/ArtistProfileView";

type Props = {
  params: Promise<{ address: string }>;
};

export default async function ArtistProfilePage({ params }: Props) {
  const { address } = await params;
  const decodedAddress = decodeURIComponent(address);
  return (
    <div className="px-6 py-16 sm:px-12 lg:px-20">
      <ArtistProfileView address={decodedAddress} />
    </div>
  );
}
