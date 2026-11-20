import Image from "next/image";
import Link from "next/link";

// When the production video is provided, drop its URL or local path (e.g. "/videos/production.mp4") in here.
// While empty, the section shows the ring poster with a "coming soon" play affordance.
const productionVideoSrc = "";

const posterSrc = "https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=1300&q=85";

export function CraftsmanshipSection() {
  return (
    <section className="section section-forest showroom-home">
      <div className="shell showroom-grid">
        <div>
          <p className="eyebrow eyebrow-light">Our Craftsmanship</p>
          <h2>Crafted by hand, measured by nothing less than perfect</h2>
          <p className="craft-copy">
            Every Gemoire piece begins with a lab-grown diamond — cut to the same brilliance as a
            mined stone, without the footprint. We match each diamond to your setting, one at a time.
          </p>
          <p className="craft-copy">
            In our atelier a single craftsman designs, sets and finishes your ring by hand. Every
            prong is seated, polished and checked under the loupe before it earns the Gemoire name.
          </p>
          <p className="craft-copy">
            Before it ships, each ring is independently certified and covered by our lifetime
            warranty — so the craft you choose today stays flawless for decades.
          </p>
          <div className="craft-actions">
            <Link href="/collections/engagement" className="button button-white">Customize Now</Link>
          </div>
        </div>
        <div className="showroom-photo">
          {productionVideoSrc ? (
            <video className="showroom-video" src={productionVideoSrc} muted loop playsInline autoPlay controls />
          ) : (
            <div className="showroom-video-fallback">
              <Image src={posterSrc} alt="Hand-crafted diamond engagement ring in the Gemoire atelier" width={1000} height={650} />
              <span className="video-coming" aria-hidden="true">
                <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <circle cx="24" cy="24" r="22" />
                  <path d="M19 15.5v17l14-8.5Z" fill="currentColor" stroke="none" />
                </svg>
                Our production film — coming soon
              </span>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
