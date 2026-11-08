"use client";
import Image from "next/image";
import { useEffect, useState, type FormEvent } from "react";

type BookingForm = { name: string; email: string; city: string; date: string; preferredTime: string };
const initialForm: BookingForm = { name: "", email: "", city: "", date: "", preferredTime: "11:00" };

export default function ShowroomPage() {
  const [sent, setSent] = useState(false);
  const [cities, setCities] = useState<string[]>(["Los Angeles", "Houston", "San Diego", "Austin", "San Francisco"]);
  const [form, setForm] = useState<BookingForm>(initialForm);
  const [notice, setNotice] = useState("");
  const [saving, setSaving] = useState(false);
  useEffect(() => { void fetch("/api/storefront/settings").then(response => response.ok ? response.json() : null).then(data => { if (Array.isArray(data?.cities) && data.cities.length) { setCities(data.cities); setForm(current => current.city ? current : { ...current, city: data.cities[0] }); } }).catch(() => undefined); }, []);
  const update = (field: keyof BookingForm, value: string) => setForm(current => ({ ...current, [field]: value }));
  async function submit(event: FormEvent<HTMLFormElement>) { event.preventDefault(); setSaving(true); setNotice(""); try { const response = await fetch("/api/storefront/bookings", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) }); const result = await response.json() as { error?: string }; if (!response.ok) throw new Error(result.error || "We could not hold this appointment."); setSent(true); } catch (error) { setNotice(error instanceof Error ? error.message : "We could not hold this appointment."); } finally { setSaving(false); } }
  return <main><section className="page-top"><div className="shell"><p className="breadcrumb">Home / Showrooms</p><p className="eyebrow">A little time, well spent</p><h1>Meet us in person</h1><p className="lede">Try on the details, compare diamonds in a considered light, and leave with a clearer feeling.</p></div></section><section className="shell showroom-page-grid"><Image src="https://images.unsplash.com/photo-1506630448388-4e683c67ddb0?auto=format&fit=crop&w=1200&q=85" alt="Placeholder GEMOIREJEWELSLLP showroom interior" width={1000} height={900}/>{sent ? <div className="appointment-form"><h2>Your appointment is held</h2><p>Our client team will write shortly with the details. We&apos;re looking forward to welcoming you.</p></div> : <form className="appointment-form" onSubmit={submit}><h2>Book an appointment</h2><input required value={form.name} onChange={event => update("name", event.target.value)} placeholder="Your name"/><input required type="email" value={form.email} onChange={event => update("email", event.target.value)} placeholder="Email address"/><select required value={form.city} onChange={event => update("city", event.target.value)}><option value="" disabled>Select a city</option>{cities.map(city => <option key={city}>{city}</option>)}</select><input required type="date" value={form.date} onChange={event => update("date", event.target.value)}/><input required type="time" value={form.preferredTime} onChange={event => update("preferredTime", event.target.value)}/>{notice ? <p className="promo-message" role="alert">{notice}</p> : null}<button className="button" disabled={saving}>{saving ? "Requesting…" : "Request appointment"}</button></form>}</section></main>;
}
