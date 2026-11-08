"use client";

import { useState, type FormEvent } from "react";

export function NewsletterBand() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  async function subscribe(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setSaving(true); setError("");
    try {
      const response = await fetch("/api/storefront/newsletter", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email }) });
      const result = await response.json() as { error?: string };
      if (!response.ok) throw new Error(result.error || "Subscription could not be saved.");
      setSubscribed(true);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Subscription could not be saved.");
    } finally { setSaving(false); }
  }
  return <section className="section section-oatmeal"><div className="shell newsletter-grid"><div><p className="eyebrow">A thoughtful welcome</p><h3>Get AUD $500 off your first ring</h3><p className="lede">By entering our monthly voucher draw.</p></div>{subscribed ? <p><strong>You&apos;re in. Good luck with the draw.</strong></p> : <form className="newsletter-form" onSubmit={subscribe}><div className="email-row"><input required type="email" value={email} onChange={event => setEmail(event.target.value)} placeholder="Your email address" aria-label="Email address"/><button className="button" disabled={saving}>{saving ? "Saving…" : "Subscribe"}</button></div><label className="check-row"><input required type="checkbox"/> I agree to receive considered notes from GEMOIREJEWELSLLP.</label>{error ? <p className="promo-message" role="alert">{error}</p> : null}</form>}</div></section>;
}
