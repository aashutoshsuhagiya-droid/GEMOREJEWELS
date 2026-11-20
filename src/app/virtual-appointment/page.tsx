"use client";

import { useEffect, useState, type FormEvent } from "react";

type AppointmentForm = {
  name: string;
  email: string;
  channel: "video" | "phone" | "whatsapp";
  city: string;
  date: string;
  preferredTime: string;
  notes: string;
};

const initialForm: AppointmentForm = {
  name: "",
  email: "",
  channel: "video",
  city: "",
  date: "",
  preferredTime: "11:00",
  notes: ""
};

const channels: { id: AppointmentForm["channel"]; label: string; hint: string }[] = [
  { id: "video", label: "Video call", hint: "A live 1:1 call — we'll send a private link" },
  { id: "phone", label: "Phone", hint: "We call you at the time you pick" },
  { id: "whatsapp", label: "WhatsApp", hint: "Chat over WhatsApp, share rings live" }
];

export default function VirtualAppointmentPage() {
  const [sent, setSent] = useState(false);
  const [cities, setCities] = useState<string[]>(["Los Angeles", "Houston", "San Diego", "Austin", "San Francisco"]);
  const [form, setForm] = useState<AppointmentForm>(initialForm);
  const [notice, setNotice] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    void fetch("/api/storefront/settings")
      .then(response => (response.ok ? response.json() : null))
      .then(data => {
        if (Array.isArray(data?.cities) && data.cities.length) {
          setCities(data.cities);
          setForm(current => current.city ? current : { ...current, city: data.cities[0] });
        }
      })
      .catch(() => undefined);
  }, []);

  const update = <K extends keyof AppointmentForm>(field: K, value: AppointmentForm[K]) =>
    setForm(current => ({ ...current, [field]: value }));

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setNotice("");
    try {
      const response = await fetch("/api/storefront/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      const result = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(result.error || "We could not hold this appointment.");
      setSent(true);
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "We could not hold this appointment.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <main>
      <section className="page-top">
        <div className="shell">
          <p className="breadcrumb">Home / Virtual Appointment</p>
          <p className="eyebrow">One on one, over a video call</p>
          <h1>Book a virtual appointment</h1>
          <p className="lede">
            Talk to our team live — compare diamonds, try on styles, and get honest advice
            from wherever you are. Pick a time that works for you.
          </p>
        </div>
      </section>
      <section className="shell showroom-page-grid">
        <div className="virtual-appt-intro">
          <h2>How it works</h2>
          <ol className="virtual-steps">
            <li>
              <span>1</span>
              <div>
                <strong>Choose your format</strong>
                <p>Video call, phone, or WhatsApp — whatever suits you best.</p>
              </div>
            </li>
            <li>
              <span>2</span>
              <div>
                <strong>Pick a time</strong>
                <p>We confirm within a few hours with your private link or call details.</p>
              </div>
            </li>
            <li>
              <span>3</span>
              <div>
                <strong>Explore together</strong>
                <p>See diamonds up close, compare settings, and decide at your own pace.</p>
              </div>
            </li>
          </ol>
        </div>
        {sent ? (
          <div className="appointment-form">
            <h2>Your virtual appointment is held</h2>
            <p>
              Our team will reach out shortly with your {form.channel === "video" ? "private video link" : form.channel}
              and the confirmation details. We&apos;re looking forward to talking with you.
            </p>
          </div>
        ) : (
          <form className="appointment-form" onSubmit={submit}>
            <h2>Request your slot</h2>
            <div className="virtual-channel" role="radiogroup" aria-label="Appointment format">
              {channels.map(option => (
                <label key={option.id} className={form.channel === option.id ? "is-selected" : ""}>
                  <input
                    type="radio"
                    name="channel"
                    value={option.id}
                    checked={form.channel === option.id}
                    onChange={() => update("channel", option.id)}
                  />
                  <span>{option.label}</span>
                  <small>{option.hint}</small>
                </label>
              ))}
            </div>
            <input required value={form.name} onChange={event => update("name", event.target.value)} placeholder="Your name" />
            <input required type="email" value={form.email} onChange={event => update("email", event.target.value)} placeholder="Email address" />
            <select required value={form.city} onChange={event => update("city", event.target.value)}>
              <option value="" disabled>Where are you based?</option>
              {cities.map(city => (
                <option key={city}>{city}</option>
              ))}
            </select>
            <input required type="date" value={form.date} onChange={event => update("date", event.target.value)} />
            <input required type="time" value={form.preferredTime} onChange={event => update("preferredTime", event.target.value)} />
            <textarea rows={2} value={form.notes} onChange={event => update("notes", event.target.value)} placeholder="Anything you&apos;d like us to prepare? (optional)" />
            {notice ? <p className="promo-message" role="alert">{notice}</p> : null}
            <button className="button" disabled={saving}>{saving ? "Requesting…" : "Book my virtual appointment"}</button>
          </form>
        )}
      </section>
    </main>
  );
}
