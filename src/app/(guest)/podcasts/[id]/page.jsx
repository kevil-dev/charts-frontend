import PodcastProfile from "@/features/podcasts/components/PodcastProfile";

export async function generateMetadata({ params }) {
  // If you wanted to SSR metadata, you'd fetch it here.
  // For now, we'll just set a generic title.
  const resolvedParams = await params;
  return {
    title: "Podcast Profile - Million Charts",
  };
}

export default async function PodcastPage({ params }) {
  const resolvedParams = await params;
  const matchKey = decodeURIComponent(resolvedParams.id);

  return <PodcastProfile matchKey={matchKey} />;
}
