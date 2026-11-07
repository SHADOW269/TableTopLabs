export function PageBanner({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <section className="ri-hero-new">
      <div className="work-wrap-new">
        <div className="ri-hero-copy">
          <p className="ri2-eyebrow">{eyebrow}</p>
          <h1 className="ri-hero-title-new">{title}</h1>
          <p className="ri-hero-desc-new">{description}</p>
        </div>
      </div>
    </section>
  );
}
