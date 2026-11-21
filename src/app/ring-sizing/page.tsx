import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { metadataForPath } from "@/lib/seo";

export const dynamic = "force-dynamic";
export function generateMetadata(): Metadata {
  return metadataForPath("/ring-sizing", "Ring sizing guide", "Measure your ring size at home in five simple steps — with our full ring size chart and fitting tips.");
}

type SizeRow = { india: number; uk: string; us: number; diameter: string; circumference: string };

const sizeChart: SizeRow[] = [
  { india: 6, uk: "L", us: 3, diameter: "14.7", circumference: "46.1" },
  { india: 7, uk: "N", us: 4, diameter: "15.0", circumference: "47.1" },
  { india: 8, uk: "P", us: 5, diameter: "15.3", circumference: "48.0" },
  { india: 9, uk: "R", us: 6, diameter: "15.7", circumference: "49.3" },
  { india: 10, uk: "T", us: 7, diameter: "16.0", circumference: "50.2" },
  { india: 11, uk: "V", us: 8, diameter: "16.3", circumference: "51.2" },
  { india: 12, uk: "X", us: 9, diameter: "16.7", circumference: "52.5" },
  { india: 13, uk: "Z1", us: 10, diameter: "17.0", circumference: "53.4" },
  { india: 14, uk: "Z3", us: 11, diameter: "17.3", circumference: "54.5" },
  { india: 15, uk: "Z5", us: 12, diameter: "17.7", circumference: "55.6" },
  { india: 16, uk: "Z7", us: 13, diameter: "18.0", circumference: "56.5" },
  { india: 17, uk: "Z9", us: 14, diameter: "18.3", circumference: "57.6" },
  { india: 18, uk: "Z+1", us: 15, diameter: "18.7", circumference: "58.7" },
];

const steps = [
  {
    number: "01",
    title: "Measure your finger",
    body: "Take a thin strip of paper or a piece of string. Wrap it gently around the base of the finger you plan to wear the ring on — near the knuckle.",
    image: "/images/ring-sizing/step1-measure.jpg",
    alt: "Measure your finger with a paper strip",
  },
  {
    number: "02",
    title: "Mark the overlap",
    body: "Mark the exact point where the paper or string meets itself with a pen or pencil. Make sure the mark is clear and precise.",
    image: "/images/ring-sizing/step2-wrap.jpg",
    alt: "Mark the overlap point on the paper strip",
  },
  {
    number: "03",
    title: "Measure in millimetres",
    body: "Lay the marked strip flat on a ruler and measure the distance from the start edge to your mark. Note the measurement in millimetres.",
    image: "/images/ring-sizing/step3-ruler.jpg",
    alt: "Measure the paper strip against a ruler in millimetres",
  },
  {
    number: "04",
    title: "Match the chart",
    body: "Find your measurement in the circumference column of our ring size chart below. The corresponding India size is your perfect fit.",
    image: "/images/ring-sizing/step4-chart.jpg",
    alt: "Ring size chart showing circumference and sizes",
  },
];

const tips = [
  "Measure at the end of the day, when your fingers are at their natural size.",
  "Avoid measuring when your hands are too cold or too warm.",
  "If you are between two sizes, choose the larger size for comfort.",
  "Wider bands fit tighter — consider going one size up for broader designs.",
];

const faqs = [
  { q: "How can I find my ring size at home?", a: "You can easily measure your ring size at home using a thin strip of paper or string. Wrap it around the base of your finger, mark where it overlaps, and measure the length in millimetres. Compare the measurement with our ring size chart to find your closest size." },
  { q: "What is the easiest way to measure my ring size?", a: "If you already own a ring that fits comfortably, measure its inner diameter with a ruler and compare it with the diameter column in our ring size chart. This is one of the easiest ways to find your size." },
  { q: "When is the best time to measure my finger?", a: "We recommend measuring at the end of the day, when your fingers are at their normal size. Avoid measuring when your hands are extremely cold or hot, as finger size can change slightly with temperature." },
  { q: "What should I do if I am between two ring sizes?", a: "If your measurement falls between two sizes, we recommend choosing the larger size for a more comfortable fit — especially for wider-band rings." },
  { q: "Can my ring size change over time?", a: "Yes. Finger size can vary slightly with temperature, swelling and time of day. For the most accurate result, measure your finger more than once at different times and take the consistent reading." },
  { q: "Does the width of the ring affect the fit?", a: "Yes. Wider rings can feel slightly tighter than thinner bands. If you are purchasing a wider design and you are between sizes, choosing the next size up will provide a more comfortable fit." },
];

export default function RingSizingPage() {
  return (
    <main>
      {/* ===== HERO ===== */}
      <section className="rs-hero">
        <div className="rs-hero-image">
          <Image
            src="/images/ring-sizing/step4-chart.jpg"
            alt="Ring size chart — find your perfect fit"
            fill
            priority
            sizes="100vw"
          />
        </div>
        <div className="rs-hero-shade" />
        <div className="shell rs-hero-inner">
          <div className="rs-hero-copy">
            <p className="eyebrow eyebrow-light">The perfect fit</p>
            <h1>Find your ring size<br />at home</h1>
            <p className="rs-hero-lede">
              Measure your finger in just a few simple steps and confidently choose
              the right size for your Gemoire piece.
            </p>
            <div className="rs-hero-actions">
              <a href="#steps" className="button button-white">How to measure</a>
              <a href="#chart" className="button button-ghost">Size chart</a>
            </div>
          </div>
        </div>
      </section>

      {/* ===== STEPS ===== */}
      <section id="steps" className="section rs-section">
        <div className="shell">
          <div className="section-heading center">
            <p className="eyebrow">4 simple steps</p>
            <h2>How to measure your ring size</h2>
            <p className="lede">Follow these easy steps at home to find your perfect fit.</p>
          </div>

          <div className="rs-steps">
            {steps.map((step, index) => (
              <div className={`rs-step ${index % 2 === 0 ? "rs-step--image-left" : "rs-step--image-right"}`} key={step.number}>
                <div className="rs-step-image">
                  <div className="rs-step-image-inner">
                    <Image
                      src={step.image}
                      alt={step.alt}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 600px"
                    />
                  </div>
                  <span className="rs-step-number">{step.number}</span>
                </div>
                <div className="rs-step-content">
                  <h3>{step.title}</h3>
                  <p>{step.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== TIPS BAND ===== */}
      <section className="rs-tips-band">
        <div className="shell">
          <div className="rs-tips">
            <div className="rs-tips-head">
              <p className="eyebrow">Pro tips</p>
              <h2>For the most accurate result</h2>
            </div>
            <ul className="rs-tips-list">
              {tips.map((tip) => (
                <li key={tip}>{tip}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ===== SIZE CHART ===== */}
      <section id="chart" className="section rs-section rs-chart-section">
        <div className="shell">
          <div className="section-heading center">
            <p className="eyebrow">Reference guide</p>
            <h2>Ring size chart</h2>
            <p className="lede">Match your finger circumference to your India ring size below.</p>
          </div>

          <div className="rs-chart-wrapper">
            <div className="rs-chart-scroll">
              <table className="rs-chart-table">
                <thead>
                  <tr>
                    <th>India</th>
                    <th>UK</th>
                    <th>US</th>
                    <th>Diameter (mm)</th>
                    <th>Circumference (mm)</th>
                  </tr>
                </thead>
                <tbody>
                  {sizeChart.map((row) => (
                    <tr key={row.india}>
                      <td className="rs-chart-size">{row.india}</td>
                      <td>{row.uk}</td>
                      <td>{row.us}</td>
                      <td>{row.diameter}</td>
                      <td className="rs-chart-circumference">{row.circumference}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="rs-chart-note">Sizes shown in Indian standard. Measurements are approximate and may vary slightly by manufacturer.</p>
          </div>
        </div>
      </section>

      {/* ===== CTA BAND ===== */}
      <section className="rs-cta-band">
        <div className="shell">
          <div className="rs-cta">
            <div className="rs-cta-image">
              <Image
                src="/images/ring-sizing/step5-hands.jpg"
                alt="Finding the perfect ring fit"
                fill
                sizes="(max-width: 768px) 100vw, 400px"
              />
            </div>
            <div className="rs-cta-content">
              <p className="eyebrow eyebrow-light">Still unsure?</p>
              <h2>Let us help you find<br />the perfect fit</h2>
              <p className="rs-cta-text">
                Not confident about your size? Book a virtual appointment with our
                jewellery consultants or visit our showroom for a personal fitting.
              </p>
              <div className="rs-cta-actions">
                <Link href="/virtual-appointment" className="button button-white">Book appointment</Link>
                <Link href="/contact" className="button button-ghost">Contact us</Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== FAQ ===== */}
      <section className="section rs-section">
        <div className="shell">
          <div className="section-heading center">
            <p className="eyebrow">Questions</p>
            <h2>Frequently asked questions</h2>
          </div>
          <div className="rs-faq-list">
            {faqs.map((item, index) => (
              <details className="rs-faq-row" key={item.q} open={index === 0}>
                <summary>{item.q}</summary>
                <p>{item.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
