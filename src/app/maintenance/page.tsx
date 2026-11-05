import Link from "next/link";

export default function MaintenancePage() {
  return (
    <>
      <style>{`
        @media (max-width: 560px) {
          .kf-maintenance-actions { flex-direction: column !important; width: 100%; }
          .kf-maintenance-actions a { width: 100%; justify-content: center; }
        }
      `}</style>
      <main
        style={{
          position: "relative",
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "relative",
            textAlign: "center",
            maxWidth: 720,
            padding: "0 24px",
          }}
        >
          {/* Status indicator */}
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              marginBottom: 32,
            }}
          >
            <span
              style={{
                width: 7,
                height: 7,
                borderRadius: "50%",
                background: "var(--acc, #E2E800)",
                boxShadow: "0 0 12px rgba(226, 232, 0,0.4)",
              }}
            />
            <span
              style={{
                fontFamily: "var(--ff-display, 'Space Grotesk', sans-serif)",
                fontSize: "0.58rem",
                fontWeight: 700,
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                color: "var(--acc, #E2E800)",
              }}
            >
              System maintenance in progress
            </span>
          </div>

          {/* Tag */}
          <div
            style={{
              fontFamily: "var(--ff-display, 'Space Grotesk', sans-serif)",
              fontSize: "0.6rem",
              fontWeight: 700,
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              color: "var(--t3, #979797)",
              marginBottom: 20,
            }}
          >
            MAINTENANCE
          </div>

          {/* Heading */}
          <h1
            style={{
              fontFamily: "var(--ff-display, 'Space Grotesk', sans-serif)",
              fontSize: "clamp(2.2rem, 7vw, 4.2rem)",
              fontWeight: 700,
              letterSpacing: "-0.03em",
              color: "var(--t1, #F4F4F4)",
              lineHeight: 1.05,
              marginBottom: 24,
            }}
          >
            We&apos;ll be back
            <br />
            shortly.
          </h1>

          {/* Description */}
          <p
            style={{
              fontSize: "clamp(0.88rem, 2vw, 1rem)",
              color: "var(--t2, #D6D6D6)",
              lineHeight: 1.7,
              marginBottom: 44,
              maxWidth: 480,
              marginLeft: "auto",
              marginRight: "auto",
            }}
          >
            TableTopLabs is currently undergoing maintenance.
            <br />
            We&apos;re making a few improvements and will be back online soon.
          </p>

          {/* Action buttons */}
          <div
            className="kf-maintenance-actions"
            style={{
              display: "flex",
              gap: 12,
              justifyContent: "center",
              flexWrap: "wrap",
              marginBottom: 40,
            }}
          >
            <Link
              href="https://shop.keebforge.in/"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                fontFamily: "var(--ff-display, 'Space Grotesk', sans-serif)",
                fontSize: "0.82rem",
                fontWeight: 700,
                letterSpacing: "0.03em",
                color: "#141414",
                background: "var(--acc, #E2E800)",
                padding: "12px 28px",
                borderRadius: "var(--r-sm, 10px)",
                border: "1px solid var(--acc, #E2E800)",
                cursor: "pointer",
                textDecoration: "none",
                transition: "box-shadow 0.2s",
              }}
            >
              Visit Shop <span style={{ marginLeft: 2 }}>→</span>
            </Link>
            <Link
              href="https://shop.keebforge.in/contact/"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                fontFamily: "var(--ff-display, 'Space Grotesk', sans-serif)",
                fontSize: "0.82rem",
                fontWeight: 600,
                letterSpacing: "0.03em",
                color: "var(--t2, #D6D6D6)",
                background: "none",
                padding: "12px 28px",
                borderRadius: "var(--r-sm, 10px)",
                border: "1px solid var(--bdr, rgba(214, 214, 214,0.16))",
                cursor: "pointer",
                textDecoration: "none",
                transition: "border-color 0.2s, color 0.2s",
              }}
            >
              Contact Us <span style={{ marginLeft: 2 }}>→</span>
            </Link>
          </div>
        </div>
      </main>
    </>
  );
}
