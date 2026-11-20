"use client";

import { useEffect, useRef, useState } from "react";

export type StorefrontReview = {
  id: string;
  name: string;
  city: string;
  quote: string;
  rating: number;
  platform?: "Google" | "Trustpilot" | "Jagga" | "Facebook";
  externalUrl?: string;
  productImage?: string;
};

function initialsOf(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .map(part => part[0]?.toUpperCase() ?? "")
    .slice(0, 2)
    .join("");
}

function perViewFor(width: number) {
  if (width < 640) return 1;
  if (width < 1024) return 2;
  return 3;
}

export function Testimonials({ reviews }: { reviews: StorefrontReview[] }) {
  // Start with the SSR-safe value (3); the mount effect below syncs to the real viewport.
  // Reading window.innerWidth in the initializer caused a hydration mismatch (pv2 vs pv3).
  const [perView, setPerView] = useState(3);
  const [activeIndex, setActiveIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const touchStartX = useRef<number | null>(null);

  const maxIndex = Math.max(0, reviews.length - perView);
  const canPrev = activeIndex > 0;
  const canNext = activeIndex < maxIndex;

  const isMobile = () => typeof window !== "undefined" && window.innerWidth < 640;

  const goNext = () => {
    setActiveIndex(current => (current < maxIndex ? current + 1 : 0));
  };

  const goPrev = () => {
    setActiveIndex(current => (current > 0 ? current - 1 : maxIndex));
  };

  // Touch swipe support for mobile
  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const diff = e.changedTouches[0].clientX - touchStartX.current;
    if (diff < -40) {
      goNext();
    } else if (diff > 40) {
      goPrev();
    }
    touchStartX.current = null;
  };

  // Responsive perView update and auto-clamping on resize / zoom
  useEffect(() => {
    const handleResize = () => {
      const nextPerView = perViewFor(window.innerWidth);
      setPerView(nextPerView);
      const nextMax = Math.max(0, reviews.length - nextPerView);
      setActiveIndex(current => Math.min(current, nextMax));
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [reviews.length]);

  // Auto-advance one card every 6s on desktop; gracefully wraps back to start
  useEffect(() => {
    if (reviews.length <= perView || paused || isMobile()) return;
    const timer = window.setInterval(() => {
      setActiveIndex(curr => (curr >= maxIndex ? 0 : curr + 1));
    }, 6000);
    return () => window.clearInterval(timer);
  }, [reviews.length, perView, paused, maxIndex]);

  if (!reviews.length) return null;

  return (
    <section className="section social-proof">
      <div className="shell">
        <div className="review-heading">
          <p className="eyebrow">Client stories</p>
          <h2>Stories of Gemoire</h2>
          <p className="review-heading-lede">Quiet, considered pieces — chosen and kept by clients across Google, Trustpilot &amp; Facebook.</p>
        </div>
        <div className={`review-viewport review-viewport--pv${perView}`}>
          <button className="review-arrow review-arrow--prev" onClick={goPrev} disabled={!canPrev} aria-label="Previous review">
            <span aria-hidden="true">‹</span>
          </button>
          <div
            className="review-track-wrapper"
            onTouchStart={onTouchStart}
            onTouchEnd={onTouchEnd}
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
          >
            <div
              className="review-track"
              style={{
                transform: `translateX(calc(-${activeIndex} * (100% + 16px) / var(--cards-per-view, ${perView})))`
              }}
            >
              {reviews.map(review => (
                <article className="review-card" key={review.id}>
                  <div className="review-card-top">
                    <span className="review-platform">
                      <span className="platform-dot" aria-hidden="true" />
                      {review.platform ?? "Gemoire"}
                    </span>
                    <span className="stars" aria-label={`${review.rating} out of 5 stars`}>
                      {Array.from({ length: 5 }, (_, starIndex) => (
                        <span key={starIndex} className={starIndex < review.rating ? "star star--full" : "star"} aria-hidden="true">
                          ★
                        </span>
                      ))}
                    </span>
                  </div>
                  <div className="review-name-row">
                    <span className="review-avatar" aria-hidden="true">{initialsOf(review.name)}</span>
                    <span className="review-name-text">
                      <cite className="review-name">{review.name}</cite>
                      <span className="review-verified">
                        <span aria-hidden="true">✓</span>Verified
                      </span>
                    </span>
                  </div>
                  <blockquote className="review-quote">
                    <span className="review-quote-mark" aria-hidden="true">“</span>
                    <span>{review.quote}</span>
                  </blockquote>
                  <div className="review-card-foot">
                    {review.externalUrl ? (
                      <a className="review-read" href={review.externalUrl} target="_blank" rel="noopener noreferrer">
                        Read review<span className="review-read-arrow" aria-hidden="true">&rarr;</span>
                      </a>
                    ) : (
                      <span className="review-read review-read--inactive">
                        Read review<span className="review-read-arrow" aria-hidden="true">&rarr;</span>
                      </span>
                    )}
                  </div>
                </article>
              ))}
            </div>
          </div>
          <button className="review-arrow review-arrow--next" onClick={goNext} disabled={!canNext} aria-label="Next review">
            <span aria-hidden="true">›</span>
          </button>
        </div>
      </div>
    </section>
  );
}
