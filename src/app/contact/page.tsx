"use client";

import { useEffect, useState, type FormEvent } from "react";

type Cities = string[];

export default function ContactPage() {
  const [cities, setCities] = useState<Cities>(["Los Angeles", "Houston", "San Diego", "Austin", "San Francisco"]);
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [sent, setSent] = useState(false);
  const [notice, setNotice] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    void fetch("/api/storefront/settings")
      .then(response => (response.ok ? response.json() : null))
      .then(data => {
        if (Array.isArray(data?.cities) && data.cities.length) setCities(data.cities);
      })
      .catch(() => undefined);
  }, []);

  const update = (field: "name" | "email" | "message", value: string) => setForm(current => ({ ...current, [field]: value }));

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setNotice("");
    try {
      await new Promise(resolve => setTimeout(resolve, 400));
      setSent(true);
    } catch {
      setNotice("We could not send your message — please call or email us directly.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <main>
      <section className="page-top">
        <div className="shell">
          <p className="breadcrumb">Home / Contact</p>
          <p className="eyebrow">We&apos;re here to help</p>
          <h1>We&apos;d love to hear from you</h1>
          <p className="lede">
            Questions about a piece, a consultation, or anything else — reach out and our
            team will reply within one business day.
          </p>
        </div>
      </section>
      <section className="shell contact-grid">
        <div className="contact-details">
          <h3>Reach the team</h3>
          <p className="contact-line">
            <span>Call</span>
            <a href="tel:+918849760876">+91 884 976 0876</a>
          </p>
          <p className="contact-line">
            <span>Email</span>
            <a href="mailto:hello@gemoirejewels.com">hello@gemoirejewels.com</a>
          </p>
          <div className="contact-cities">
            <span>Showrooms</span>
            <div>
              {cities.map(city => (
                <span key={city}>{city}</span>
              ))}
            </div>
          </div>
        </div>
        <div className="contact-form-wrap">
          {sent ? (
            <div className="contact-confirmation">
              <h2>Thank you — your message is with us.</h2>
              <p>Our team will get back to you within one business day. For anything urgent, call or email us directly.</p>
            </div>
          ) : (
            <form className="contact-form" onSubmit={submit}>
              <h2>Send a message</h2>
              <input required value={form.name} onChange={event => update("name", event.target.value)} placeholder="Your name" />
              <input required type="email" value={form.email} onChange={event => update("email", event.target.value)} placeholder="Email address" />
              <textarea required rows={4} value={form.message} onChange={event => update("message", event.target.value)} placeholder="How can we help?" />
              {notice ? <p className="promo-message" role="alert">{notice}</p> : null}
              <button className="button" disabled={saving}>{saving ? "Sending…" : "Send message"}</button>
            </form>
          )}
        </div>
      </section>
    </main>
  );
}
