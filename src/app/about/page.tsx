import Link from "next/link";

export const metadata = { title: "About Gemoire — GEMOIREJEWELSLLP" };

export default function AboutPage() {
  return (
    <section className="section">
      <div className="shell" style={{ textAlign: "center", maxWidth: 640, marginInline: "auto" }}>
        <p className="eyebrow">Who we are</p>
        <h1>Gemoire — fine jewellery, honestly made</h1>
        <p className="lede" style={{ margin: "16px auto 28px" }}>
          Lab-grown diamonds, set by hand, certified and covered for life. Our full story is on
          its way.
        </p>
        <Link href="/" className="button">Back to the storefront</Link>
      </div>
    </section>
  );
}
