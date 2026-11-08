"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { Discount, Review, Subscriber } from "@/shared/admin-types";
import { PageHeading } from "@/components/admin/orders";
import { formatAdminAud, useAdminOperations } from "@/components/admin/shell";

type SecondaryActivity = { reviews: Review[]; subscribers: Subscriber[]; discounts: Discount[] };

export default function AdminActivityPage() {
  const { orders } = useAdminOperations();
  const [secondary, setSecondary] = useState<SecondaryActivity | null>(null);
  useEffect(() => {
    let active = true;
    const list = async <T,>(resource: string): Promise<T[]> => { const response = await fetch(`/api/admin/${resource}`, { credentials: "same-origin" }); return response.ok ? response.json() as Promise<T[]> : []; };
    void Promise.all([list<Review>("reviews"), list<Subscriber>("subscribers"), list<Discount>("discounts")]).then(([reviews, subscribers, discounts]) => { if (active) setSecondary({ reviews, subscribers, discounts }); }).catch(() => { if (active) setSecondary({ reviews: [], subscribers: [], discounts: [] }); });
    return () => { active = false; };
  }, []);
  const activity = useMemo(() => {
    const orderItems = orders.map(order => ({ key: order.id, icon: "◎", tone: "bg-[#edf7ef] text-[#236339]", body: <>New order <strong className="font-mono">{order.code}</strong> · <strong>{formatAdminAud(order.totalAud)}</strong></>, at: order.createdAt, href: "/admin/orders" }));
    const reviewItems = (secondary?.reviews ?? []).map(review => ({ key: review.id, icon: "★", tone: "bg-[#f8f1df] text-[#80631c]", body: <>{review.rating}-star review from <strong>{review.customerName}</strong>{review.reply ? " · store reply sent" : " · reply needed"}</>, at: review.createdAt, href: "/admin/reviews" }));
    const subscriberItems = (secondary?.subscribers ?? []).map(subscriber => ({ key: subscriber.id, icon: "✦", tone: "bg-[#edf7ef] text-[#236339]", body: <>Newsletter subscriber <strong>{subscriber.email}</strong>{subscriber.unsubscribed ? " unsubscribed" : " joined"}</>, at: subscriber.addedAt, href: "/admin/newsletter" }));
    return [...orderItems, ...reviewItems, ...subscriberItems].sort((left, right) => right.at.localeCompare(left.at));
  }, [orders, secondary]);
  return <section className="mx-auto max-w-[1040px]"><PageHeading eyebrow="Overview" title="Activity log" description="A chronological view of live orders, reviews and newsletter changes." action={<Link href="/admin" className="rounded-full border border-[#d4d0cc] bg-white px-4 py-2 text-xs text-[#236339]">Back to dashboard</Link>}/><div className="overflow-hidden rounded-md border border-[#e3e0dc] bg-white"><div className="border-b border-[#e3e0dc] bg-[#faf6ef] px-5 py-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#737373]">All activity · {activity.length} records</div><div className="divide-y divide-[#eeeae5] px-5">{!secondary ? Array.from({ length: 7 }, (_, index) => <div key={index} className="my-3 h-12 animate-pulse rounded bg-[#f4efe9]"/>) : activity.length ? activity.map(item => <Link href={item.href} key={`${item.href}-${item.key}`} className="flex items-start gap-3 py-4 hover:bg-[#fcfbf8]"><span className={`mt-0.5 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs ${item.tone}`}>{item.icon}</span><p className="mb-0 flex-1 text-sm leading-6 text-[#5f5a55]">{item.body}</p><span className="whitespace-nowrap text-[11px] text-[#737373]">{relativeTime(item.at)}</span></Link>) : <p className="py-12 text-center text-sm text-[#737373]">No activity yet.</p>}</div></div></section>;
}

function relativeTime(value: string) { const hours = Math.max(0, Math.floor((Date.now() - +new Date(value)) / 3_600_000)); return hours < 1 ? "Just now" : hours < 24 ? `${hours}h ago` : `${Math.floor(hours / 24)}d ago`; }
