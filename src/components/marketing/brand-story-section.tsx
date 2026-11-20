import Image from "next/image";
import Link from "next/link";

export function BrandStorySection() {
  return (
    <section className="section brand-story">
      <div className="shell brand-story-grid">
        <div className="brand-story-images" aria-hidden="true">
          <div className="brand-story-photo">
            <Image
              src="https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=800&q=80"
              alt=""
              width={420}
              height={420}
            />
          </div>
          <div className="brand-story-photo brand-story-photo--offset">
            <Image
              src="https://images.unsplash.com/photo-1617038220319-276d3cfab638?auto=format&fit=crop&w=800&q=80"
              alt=""
              width={420}
              height={420}
            />
          </div>
        </div>
        <div className="brand-story-content">
          <p className="eyebrow">Who we are</p>
          <h2>Jewelry, made to be kept for a lifetime</h2>
          <p className="brand-story-text">
            Gemoire was built on one idea: fine jewellery should be honest. Every piece begins with
            a lab-grown diamond — the same chemistry as a mined stone, made to be accessible and
            free from conflict.
          </p>
          <p className="brand-story-text">
            Each ring is set by hand in our atelier, one piece at a time, then independently
            certified and backed by a lifetime warranty.
          </p>
          <p className="brand-story-text">
            Because our stones are grown in tightly controlled environments, their origin is fully
            traceable and their footprint far lighter — responsible jewellery, without compromise.
          </p>
          <Link href="/about" className="button button-outline">About us</Link>
        </div>
      </div>
    </section>
  );
}
