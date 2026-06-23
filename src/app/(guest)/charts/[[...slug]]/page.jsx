export default async function ChartPage({ params }) {
  const { slug } = await params;
  const [platform, country, category] = slug ?? [];

  return (
    <div>
    </div>
  );
}
