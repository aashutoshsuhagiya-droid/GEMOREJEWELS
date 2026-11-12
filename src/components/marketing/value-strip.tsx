type ValueIcon = "delivery" | "resize" | "warranty" | "custom";

function Icon({ type }: { type: ValueIcon }) {
  const paths = {
    delivery: (
      <>
        <path d="M3 6h11v11H3z" />
        <path d="M14 10h4l3 3v4h-7z" />
        <path d="M5.5 17a2 2 0 1 0 4 0M16.5 17a2 2 0 1 0 4 0" />
        <path d="M6 10h5M8.5 7.5v5" />
      </>
    ),
    resize: (
      <>
        <path d="M4 15.5 15.5 4 20 8.5 8.5 20 4 15.5Z" />
        <path d="m12.5 7 1.5 1.5M9.5 10l1.5 1.5M6.5 13l1.5 1.5" />
        <circle cx="16.8" cy="16.8" r="3.2" />
      </>
    ),
    warranty: (
      <>
        <path d="M12 3 20 6v5c0 5-3.4 8.3-8 10-4.6-1.7-8-5-8-10V6l8-3Z" />
        <path d="m8.5 12 2.2 2.2 4.8-5" />
      </>
    ),
    custom: (
      <>
        <path d="m15 4 5 5L9 20H4v-5L15 4Z" />
        <path d="m13 6 5 5" />
        <path d="M5 4v3M3.5 5.5h3M19 16v4M17 18h4" />
      </>
    ),
  };

  return (
    <span className="value-icon-shell" aria-hidden="true">
      <svg
        className="line-icon"
        fill="none"
        viewBox="0 0 24 24"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {paths[type]}
      </svg>
    </span>
  );
}

const items: Array<[ValueIcon, string]> = [
  ["delivery", "Free 10-day delivery"],
  ["resize", "Free resizing for life"],
  ["warranty", "Lifetime warranty"],
  ["custom", "Free customisation"],
];

export function ValueStrip() {
  return (
    <section className="section value-strip-section">
      <div className="shell value-strip">
        {items.map(([icon, label]) => (
          <div className="value-item" key={label}>
            <Icon type={icon} />
            <span>{label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
