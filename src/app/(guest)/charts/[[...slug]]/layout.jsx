import DynamicBreadcrumb from "@/components/DynamicBreadcrumb";

export default function ChartsLayout({ children }) {
  return (
    <section className="relative overflow-hidden min-h-105">
      <div className="hero-mesh" />
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-9">
        <DynamicBreadcrumb />
        <h1 className="text-5xl font-semibold mt-4 py-4 tracking-tighter">
          The podcast chart.
        </h1>
        <h3 className="text-gray-600 text-lg max-w-lg">
          Every show ranked across Apple, Spotify, and YouTube — refreshed
          daily, with movement, hosts, and reach in one view.
        </h3>
        
        {children}
      </div>
    </section>
  );
}
