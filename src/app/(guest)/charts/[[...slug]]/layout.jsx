import DynamicBreadcrumb from "@/components/DynamicBreadcrumb";

export default function ChartsLayout({ children }) {
  return (
    <section className="relative overflow-hidden min-h-[420px]">
      <div className="hero-mesh" />
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <DynamicBreadcrumb />
        {children}
      </div>
    </section>
  );
}
