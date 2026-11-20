type ValueIcon = "delivery" | "certificate" | "warranty" | "engraving";

function Icon({ type }: { type: ValueIcon }) {
  const paths = {
    delivery: (
      <>
        <path d="M3 7h11v9H3z" />
        <path d="M14 10h4l3 3v3h-7z" />
        <path d="M6 18.5a1.8 1.8 0 1 0 3.6 0M16 18.5a1.8 1.8 0 1 0 3.6 0" />
        <path d="M6.5 10h4" />
      </>
    ),
    certificate: (
      <>
        <rect x="4" y="3.5" width="11" height="14" rx="1" />
        <path d="M7 7h5M7 10h5" />
        <circle cx="16" cy="15.5" r="3.2" />
        <path d="M14.6 17.8 13.8 21l2.2-1 2.2 1-.8-3.2" />
      </>
    ),
    warranty: (
      <>
        <path d="M12 3 20 6v5c0 4.6-3.3 8-8 9.8C7.3 19 4 15.6 4 11V6l8-3Z" />
        <path d="m8.6 11.4 2.1 2.1 4.5-4.6" />
      </>
    ),
    engraving: (
      <>
        <path d="m14.5 4 5.5 5.5L9 20.5H3.5V15L14.5 4Z" />
        <path d="m12.5 6 5.5 5.5" />
      </>
    ),
  };

  return (
    <span className="value-icon-shell" aria-hidden="true">
      <svg className="line-icon" fill="none" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
        {paths[type]}
      </svg>
    </span>
  );
}

const items: Array<{ icon: ValueIcon; label: string; description: string }> = [
  { icon: "delivery", label: "Express Shipping Available", description: "Dispatched fast and fully insured, so your piece arrives safely on time." },
  { icon: "certificate", label: "Free Gemoire Certificate", description: "Every diamond arrives with an independent certificate of authenticity." },
  { icon: "warranty", label: "Lifetime Warranty", description: "Coverage for the life of your jewellery, with complimentary care." },
  { icon: "engraving", label: "Free Engraving", description: "Personalise your piece with complimentary engraving, always." },
];

export function ValueStrip() {
  return (
    <section className="section value-strip-section">
      <div className="shell value-strip">
        {items.map((item, index) => (
          <div className="value-item" key={item.label}>
            {index > 0 ? <span className="value-divider" aria-hidden="true" /> : null}
            <Icon type={item.icon} />
            <span className="value-item-label">{item.label}</span>
            <span className="value-item-desc">{item.description}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
