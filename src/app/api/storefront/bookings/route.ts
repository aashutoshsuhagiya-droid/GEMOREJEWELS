import { NextResponse } from "next/server";
import { adminRepository } from "@/lib/admin-repository";
import type { Booking } from "@/shared/admin-types";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({})) as Partial<Booking>;
  const name = body.name?.trim();
  const email = body.email?.trim().toLowerCase();
  const city = body.city?.trim();
  const date = body.date?.trim();
  const preferredTime = body.preferredTime?.trim() || "11:00";
  const settings = adminRepository.getSettings();
  if (!name || !email || !city || !date) return NextResponse.json({ error: "Please complete your name, email, city and preferred date." }, { status: 400 });
  if (!settings.cities.includes(city)) return NextResponse.json({ error: "Please choose one of our current showroom cities." }, { status: 422 });
  const booking: Booking = { id: `booking-${crypto.randomUUID()}`, name, email, city, date, preferredTime, status: "New" };
  adminRepository.upsert("bookings", booking);
  return NextResponse.json({ booking }, { status: 201 });
}
