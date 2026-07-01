export default function ChartsLayout({ children }) {
  return (
    <>
      <div className="refined-mesh-full" aria-hidden="true" />
      <section className="relative overflow-hidden min-h-[420px]">
        <div className="hero-mesh" aria-hidden="true" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-9">
          {children}
        </div>
      </section>
    </>
  );
}
