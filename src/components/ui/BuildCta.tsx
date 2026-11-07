import { CtaSection } from "@/components/ui/CtaSection";

export function BuildCta({
  primaryHref = "/collection",
  primaryLabel = "Start a Project →",
  desc = "Have a keyboard that needs work or want something custom? Send it in and the TableTopLabs workshop will take it from there.",
  imageSrc = "/img/yellowkeys-image.png",
}: {
  primaryHref?: string;
  primaryLabel?: string;
  desc?: string;
  imageSrc?: string;
} = {}) {
  return (
    <CtaSection
      tag="Let's Build"
      title={
        <>
          Ready to Build
          <br />
          Something Better?
        </>
      }
      desc={desc}
      primaryLabel={primaryLabel}
      primaryHref={primaryHref}
      imageSrc={imageSrc}
    />
  );
}
