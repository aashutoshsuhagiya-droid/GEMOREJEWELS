import Link from "next/link";

// Self-contained, on-brand "virtual appointment" illustration — no external image,
// so it can't 404 and it never duplicates a photo used elsewhere on the site.
function VirtualAppointmentVisual() {
  return (
    <svg
      className="lets-connect-art"
      viewBox="0 0 440 550"
      role="img"
      aria-labelledby="lets-connect-art-title"
      preserveAspectRatio="xMidYMid meet"
    >
      <title id="lets-connect-art-title">A one-on-one virtual consultation with a Gemoire advisor on a laptop</title>
      {/* panel */}
      <rect x="0" y="0" width="440" height="550" fill="#FBF8F2" />
      <rect x="16" y="16" width="408" height="518" fill="none" stroke="#E7E3DA" strokeWidth="1.5" />
      <rect x="200" y="16" width="40" height="4" fill="#C5A880" />

      {/* sparkles */}
      <path d="M356 110 l4 9 9 4 -9 4 -4 9 -4 -9 -9 -4 9 -4 Z" fill="#C5A880" />
      <path d="M84 128 l3 7 7 3 -7 3 -3 7 -3 -7 -7 -3 7 -3 Z" fill="#C5A880" opacity=".7" />

      {/* laptop base */}
      <path d="M84 326 L356 326 L372 342 L68 342 Z" fill="#1B382B" />
      <rect x="68" y="340" width="304" height="5" rx="2.5" fill="#13291F" />

      {/* laptop screen */}
      <rect x="100" y="150" width="240" height="176" rx="6" fill="#1B382B" />
      <rect x="112" y="162" width="216" height="152" rx="4" fill="#1C1917" />
      {/* video-call header strip */}
      <rect x="112" y="162" width="216" height="20" rx="4" fill="#1B382B" />
      <circle cx="130" cy="172" r="3.5" fill="#C5A880" />
      <circle cx="144" cy="172" r="3.5" fill="#C5A880" />
      <circle cx="158" cy="172" r="3.5" fill="#C5A880" />
      <circle cx="316" cy="172" r="4" fill="#D9383A" />

      {/* advisor (left of the call) */}
      <path d="M132 296 q40 -30 80 0" fill="none" stroke="#FDFBF7" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="172" cy="234" r="30" fill="none" stroke="#FDFBF7" strokeWidth="2.5" />
      <circle cx="194" cy="208" r="9" fill="#FDFBF7" />
      <path d="M162 246 q10 8 20 0" fill="none" stroke="#C5A880" strokeWidth="2" strokeLinecap="round" />
      <circle cx="144" cy="238" r="3" fill="#C5A880" />

      {/* floating ring card (right of the call) */}
      <rect x="222" y="202" width="92" height="104" rx="4" fill="#FDFBF7" />
      <path d="M268 222 L292 238 L284 272 L252 272 L244 238 Z" fill="none" stroke="#1B382B" strokeWidth="2" strokeLinejoin="round" />
      <path d="M244 238 L292 238 M268 222 L268 272" stroke="#C5A880" strokeWidth="1" />
      <rect x="240" y="290" width="56" height="4" rx="2" fill="#C5A880" />
      <rect x="240" y="300" width="40" height="4" rx="2" fill="#D6D1C6" />

      {/* table items */}
      <line x1="48" y1="430" x2="392" y2="430" stroke="#E7E3DA" strokeWidth="1.5" />
      {/* vase + stems */}
      <path d="M80 430 L84 402 h24 L112 430 Z" fill="#FBF8F2" stroke="#1B382B" strokeWidth="2" strokeLinejoin="round" />
      <path d="M96 402 L84 372 M96 402 L96 366 M96 402 L108 374" stroke="#1B382B" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="84" cy="370" r="5" fill="#C5A880" />
      <circle cx="96" cy="364" r="5" fill="#C5A880" />
      <circle cx="108" cy="372" r="5" fill="#C5A880" />
      {/* ring on a stand (center front) */}
      <path d="M200 430 L240 430 L220 410 Z" fill="#1B382B" />
      <circle cx="220" cy="400" r="16" fill="none" stroke="#1B382B" strokeWidth="2" />
      <circle cx="220" cy="400" r="10" fill="none" stroke="#1B382B" strokeWidth="1.5" />
      <path d="M214 390 L220 384 L226 390 L220 396 Z" fill="#C5A880" />
      {/* cup (right) */}
      <path d="M330 430 L330 410 h28 L358 430 Z" fill="#FBF8F2" stroke="#1B382B" strokeWidth="2" strokeLinejoin="round" />
      <path d="M358 416 q10 2 0 12" fill="none" stroke="#1B382B" strokeWidth="2" />
    </svg>
  );
}

export function LetUsConnect() {
  return (
    <section className="section lets-connect">
      <div className="shell lets-connect-grid">
        <div className="lets-connect-media">
          <VirtualAppointmentVisual />
        </div>
        <div className="lets-connect-content">
          <p className="eyebrow">Let&apos;s connect</p>
          <h2>Book a private, one-on-one virtual appointment.</h2>
          <p className="lede">
            Talk through your choice with our team over a live video call — or reach us by
            phone or email. Pick a time that suits you and we&apos;ll be there.
          </p>
          <div className="lets-connect-actions">
            <Link href="/virtual-appointment" className="button">Book a virtual appointment</Link>
            <Link href="/contact" className="button button-outline">Contact us</Link>
          </div>
          <div className="lets-connect-contact">
            <a href="tel:+918849760876">Call · +91 884 976 0876</a>
            <a href="mailto:hello@gemoirejewels.com">Email · hello@gemoirejewels.com</a>
          </div>
        </div>
      </div>
    </section>
  );
}
