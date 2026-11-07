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
    <section className="ttl-page-banner" aria-labelledby="ttl-banner-title">
      <div className="ttl-page-banner__inner">
        <div className="ttl-page-banner__copy">
          <p className="ttl-page-banner__eyebrow">{eyebrow}</p>
          <h1 id="ttl-banner-title" className="ttl-page-banner__title">
            {title}
          </h1>
          <p className="ttl-page-banner__desc">{description}</p>
        </div>
      </div>
    </section>
  );
}
