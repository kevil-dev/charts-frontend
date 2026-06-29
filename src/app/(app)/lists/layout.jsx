export default function ListsLayout({ children }) {
  return (
    <section className="relative overflow-hidden min-h-[400px]">
      <div className="hero-mesh" aria-hidden="true" />
      <div className="relative z-10 max-w-4xl mx-auto px-6 py-9">
        {children}
      </div>
    </section>
  );
}
