export default async function ChartPage({ params }) {
  const { slug } = await params;
  const [platform, country, category] = slug ?? [];

  return (
    <div>
      <h1 className="text-5xl font-bold mt-4">The podcast chart.</h1>
    </div>
  );
}
