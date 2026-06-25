import { redirect } from "next/navigation";
import ChartSection from "@/components/charts/ChartSection";
const DEFAULT = { platform: "apple", country: "us", category: "top" };

export default async function ChartPage({ params }) {
  const { slug = [] } = await params;
  const [platform, country, category] = slug;

  if (!platform || !country || !category) {
    redirect(`/charts/${DEFAULT.platform}/${DEFAULT.country}/${DEFAULT.category}`);
  }

  const backendUrl = process.env.NEXT_PUBLIC_API_URL;
  const validationResponse = await fetch(
    `${backendUrl}/charts/validate?platform=${platform}&country=${country}&chart=${category}`,
    { next: { revalidate: 3600 } } // Optional: Cache this answer for 1 hour to save server costs!
  );

  if (!validationResponse.ok) {
    redirect(`/charts/${DEFAULT.platform}/${DEFAULT.country}/${DEFAULT.category}`);
  }

  return (
      <ChartSection
        platform={platform}
        country={country}
        category={category}
      />
  );
}