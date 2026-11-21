"use client";

import { useState, type FormEvent } from "react";

export function FooterNewsletter() {
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!email.trim()) return;
    setSaving(true);
    setError("");
    try {
      const response = await fetch("/api/storefront/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const result = await response.json() as { error?: string };
      if (!response.ok) throw new Error(result.error || "Subscription could not be saved.");
      setDone(true);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Subscription could not be saved.");
    } finally {
      setSaving(false);
    }
  }

  if (done) {
    return <p className="footer-newsletter-confirmation">You&apos;re in. Look out for our first note.</p>;
  }

  return (
    <form className="footer-newsletter-form" onSubmit={submit}>
      <input
        required
        type="email"
        inputMode="email"
        autoComplete="email"
        value={email}
        onChange={event => setEmail(event.target.value)}
        placeholder="Your Email"
        aria-label="Your Email"
      />
      <button type="submit" className="button button-ghost" disabled={saving}>
        {saving ? "Saving…" : "Enter"}
      </button>
      {error ? <p className="footer-newsletter-error" role="alert">{error}</p> : null}
    </form>
  );
}
