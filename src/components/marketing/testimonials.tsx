"use client";

import { useEffect, useState } from "react";

export type StorefrontReview = {
  id: string;
  name: string;
  city: string;
  quote: string;
  rating: number;
};

export function Testimonials({ reviews }: { reviews: StorefrontReview[] }) {
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (reviews.length < 2) return;
    const timer = window.setInterval(() => setActive(current => (current + 1) % reviews.length), 6000);
    return () => window.clearInterval(timer);
  }, [reviews.length]);

  if (!reviews.length) return null;

  const average = (reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1);
  return (
    <section className="section social-proof">
      <div className="shell">
        <p className="eyebrow">From our clients</p>
        <div className="rating-big">{average}</div>
        <div className="stars" aria-label={`${average} out of 5 stars`}>★★★★★</div>
        <p>from {reviews.length} verified {reviews.length === 1 ? "review" : "reviews"}</p>
        <div className="review-carousel">
          {reviews.map((review, index) => (
            <article className={`review-card ${active === index ? "active-review" : ""}`} key={review.id}>
              <span className="stars" aria-label={`${review.rating} out of 5 stars`}>{"★".repeat(review.rating)}{"☆".repeat(Math.max(0, 5 - review.rating))}</span>
              <blockquote>“{review.quote}”</blockquote>
              <cite>{review.name} · {review.city} · Verified Purchase</cite>
            </article>
          ))}
        </div>
        {reviews.length > 1 ? (
          <div className="carousel-controls">
            <button onClick={() => setActive((active + reviews.length - 1) % reviews.length)} aria-label="Previous review">←</button>
            <button onClick={() => setActive((active + 1) % reviews.length)} aria-label="Next review">→</button>
          </div>
        ) : null}
      </div>
    </section>
  );
}
