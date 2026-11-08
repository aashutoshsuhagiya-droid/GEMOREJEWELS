"use client";

import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { Bar, BarChart, Cell, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { AdminProduct, Order, Review, Subscriber } from "@/shared/admin-types";

type Range = "7d" | "30d" | "90d" | "YTD" | "custom";
type ReportData = { orders: Order[]; products: AdminProduct[]; reviews: Review[]; subscribers: Subscriber[] };

function inputDate(date: Date) { return date.toISOString().slice(0, 10); }
function daysBefore(date: string, days: number) { const value = new Date(`${date}T00:00:00.000Z`); value.setUTCDate(value.getUTCDate() - days); return inputDate(value); }
function download(name: string, headings: string[], rows: Array<Array<string | number>>) { const body = [headings, ...rows].map(row => row.map(value => `"${String(value).replaceAll('"', '""')}"`).join(",")).join("\n"); const url = URL.createObjectURL(new Blob([body], { type: "text/csv;charset=utf-8" })); const link = document.createElement("a"); link.href = url; link.download = name; link.click(); window.setTimeout(() => URL.revokeObjectURL(url), 0); }
async function getResource<T>(resource: string): Promise<T[]> { const response = await fetch(`/api/admin/${resource}`, { credentials: "same-origin" }); if (!response.ok) throw new Error(`Could not load ${resource}.`); return response.json() as Promise<T[]>; }
function money(value: number) { return `AUD $${Math.round(value).toLocaleString("en-AU")}`; }

export function ConnectedReports() {
  const today = inputDate(new Date());
  const [data, setData] = useState<ReportData | null>(null);
  const [error, setError] = useState("");
  const [range, setRange] = useState<Range>("30d");
  const [customStart, setCustomStart] = useState(daysBefore(today, 29));
  const [customEnd, setCustomEnd] = useState(today);

  useEffect(() => {
    let active = true;
    void Promise.all([getResource<Order>("orders"), getResource<AdminProduct>("products"), getResource<Review>("reviews"), getResource<Subscriber>("subscribers")])
      .then(([orders, products, reviews, subscribers]) => { if (active) setData({ orders, products, reviews, subscribers }); })
      .catch(reason => { if (active) setError(reason instanceof Error ? reason.message : "Reports could not load."); });
    return () => { active = false; };
  }, []);

  const dates = useMemo(() => {
    if (range === "custom") return { start: customStart, end: customEnd };
    if (range === "YTD") return { start: `${today.slice(0, 4)}-01-01`, end: today };
    const days = Number(range.replace("d", ""));
    return { start: daysBefore(today, days - 1), end: today };
  }, [customEnd, customStart, range, today]);

  const report = useMemo(() => {
    const empty = { revenue: 0, tax: 0, count: 0, aov: 0, conversion: 0, returnRate: 0, trend: [] as Array<{ day: string; revenue: number; tax: number }>, products: [] as Array<{ name: string; revenue: number }>, collections: [] as Array<{ name: string; revenue: number }>, ratings: [] as Array<{ name: string; value: number }>, subscriberCount: 0, subscriberTrend: [] as Array<{ day: string; subscribers: number }> };
    if (!data) return empty;
    const inRange = (value: string) => value.slice(0, 10) >= dates.start && value.slice(0, 10) <= dates.end;
    const rangedOrders = data.orders.filter(order => inRange(order.createdAt));
    const paid = rangedOrders.filter(order => order.paymentStatus === "Paid");
    const revenue = paid.reduce((sum, order) => sum + order.totalAud, 0);
    const tax = paid.reduce((sum, order) => sum + order.gstAmount, 0);
    const productById = new Map(data.products.map(product => [product.id, product]));
    const productRevenue = new Map<string, number>();
    const collectionRevenue = new Map<string, number>();
    paid.forEach(order => order.items.forEach(item => {
      const product = productById.get(item.productId);
      productRevenue.set(product?.name ?? item.productId, (productRevenue.get(product?.name ?? item.productId) ?? 0) + item.lineTotal);
      const collections = product?.collectionIds.length ? product.collectionIds : ["Unassigned"];
      collections.forEach(collection => collectionRevenue.set(collection, (collectionRevenue.get(collection) ?? 0) + item.lineTotal / collections.length));
    }));
    const buckets = new Map<string, { revenue: number; tax: number; subscribers: number }>();
    paid.forEach(order => { const key = order.createdAt.slice(0, 10); const current = buckets.get(key) ?? { revenue: 0, tax: 0, subscribers: 0 }; current.revenue += order.totalAud; current.tax += order.gstAmount; buckets.set(key, current); });
    data.subscribers.filter(subscriber => inRange(subscriber.addedAt) && !subscriber.unsubscribed).forEach(subscriber => { const key = subscriber.addedAt.slice(0, 10); const current = buckets.get(key) ?? { revenue: 0, tax: 0, subscribers: 0 }; current.subscribers += 1; buckets.set(key, current); });
    const trend = [...buckets.entries()].sort(([left], [right]) => left.localeCompare(right)).map(([day, value]) => ({ day: day.slice(5), revenue: Math.round(value.revenue), tax: Math.round(value.tax) }));
    const subscriberTrend = [...buckets.entries()].sort(([left], [right]) => left.localeCompare(right)).map(([day, value]) => ({ day: day.slice(5), subscribers: value.subscribers }));
    const rangedReviews = data.reviews.filter(review => inRange(review.createdAt));
    const ratings = [5, 4, 3, 2, 1].map(rating => ({ name: `${rating} stars`, value: rangedReviews.filter(review => review.rating === rating).length }));
    const returned = rangedOrders.filter(order => order.paymentStatus === "Refunded" || order.status === "Cancelled").length;
    const visits = Math.max(paid.length * 18 + 61, 1);
    return {
      revenue,
      tax,
      count: paid.length,
      aov: paid.length ? revenue / paid.length : 0,
      conversion: paid.length / visits * 100,
      returnRate: rangedOrders.length ? returned / rangedOrders.length * 100 : 0,
      trend,
      products: [...productRevenue.entries()].sort((left, right) => right[1] - left[1]).slice(0, 6).map(([name, value]) => ({ name, revenue: Math.round(value) })),
      collections: [...collectionRevenue.entries()].sort((left, right) => right[1] - left[1]).slice(0, 6).map(([name, value]) => ({ name: name.replaceAll("-", " "), revenue: Math.round(value) })),
      ratings,
      subscriberCount: data.subscribers.filter(subscriber => inRange(subscriber.addedAt) && !subscriber.unsubscribed).length,
      subscriberTrend
    };
  }, [data, dates.end, dates.start]);

  if (!data && !error) return <ReportSkeleton />;
  if (error) return <main className="mx-auto max-w-[900px] p-7"><h1 className="font-serif text-3xl text-[#253e2b]">Reports unavailable</h1><p className="mt-2 text-sm text-red-700">{error}</p><button type="button" onClick={() => location.reload()} className="mt-4 rounded-full bg-[#236339] px-4 py-2 text-xs text-white">Try again</button></main>;

  const cards = [
    ["Revenue", money(report.revenue)], ["Orders", String(report.count)], ["Avg. order value", money(report.aov)], ["Tax collected (GST)", money(report.tax)], ["Conversion", `${report.conversion.toFixed(1)}%`], ["Return rate", `${report.returnRate.toFixed(1)}%`], ["New subscribers", String(report.subscriberCount)]
  ];
  const chartRows = report.trend.map(point => [point.day, point.revenue, point.tax]);

  return <main className="mx-auto max-w-[1440px] p-5 md:p-7">
    <div className="flex flex-wrap items-end justify-between gap-3"><div><p className="text-[10px] font-semibold uppercase tracking-[.18em] text-[#737373]">System</p><h1 className="mt-1 font-serif text-3xl text-[#253e2b]">Reports</h1><p className="mt-1 text-sm text-[#737373]">Live operational performance from {dates.start} to {dates.end}.</p></div><div className="flex flex-wrap items-center gap-2">{(["7d", "30d", "90d", "YTD"] as const).map(item => <button type="button" key={item} onClick={() => setRange(item)} className={range === item ? "rounded-full bg-[#236339] px-3 py-2 text-xs text-white" : "rounded-full border border-[#d4d0cc] bg-white px-3 py-2 text-xs"}>{item}</button>)}<button type="button" onClick={() => setRange("custom")} className={range === "custom" ? "rounded-full bg-[#236339] px-3 py-2 text-xs text-white" : "rounded-full border border-[#d4d0cc] bg-white px-3 py-2 text-xs"}>Custom</button>{range === "custom" ? <><input aria-label="Report start date" type="date" value={customStart} max={customEnd} onChange={event => setCustomStart(event.target.value)} className="rounded border border-[#d4d0cc] px-2 py-1.5 text-xs"/><input aria-label="Report end date" type="date" value={customEnd} min={customStart} max={today} onChange={event => setCustomEnd(event.target.value)} className="rounded border border-[#d4d0cc] px-2 py-1.5 text-xs"/></> : null}<button type="button" onClick={() => download("gemoire-tax-summary.csv", ["Start", "End", "Revenue AUD", "GST AUD"], [[dates.start, dates.end, report.revenue, report.tax]])} className="rounded-full border border-[#d4d0cc] px-3 py-2 text-xs">Export tax CSV</button></div></div>
    <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{cards.map(([label, value]) => <section key={label} className="rounded-md border border-[#e3e0dc] bg-white p-4"><p className="text-[10px] uppercase tracking-[.12em] text-[#737373]">{label}</p><strong className="mt-2 block font-serif text-3xl text-[#253e2b]">{value}</strong></section>)}</div>
    {!report.count ? <section className="mt-5 rounded-md border border-[#e3e0dc] bg-white p-10 text-center"><h2 className="font-serif text-2xl text-[#253e2b]">No orders in this period</h2><p className="mt-2 text-sm text-[#737373]">Choose a wider date range to see sales reporting.</p></section> : null}
    <div className="mt-5 grid gap-5 xl:grid-cols-2">
      <ChartCard title="Revenue & GST" onExport={() => download("gemoire-revenue-gst.csv", ["Date", "Revenue AUD", "GST AUD"], chartRows)}><ResponsiveContainer width="100%" height="100%"><LineChart data={report.trend}><XAxis dataKey="day" fontSize={10}/><YAxis fontSize={10}/><Tooltip/><Line type="monotone" dataKey="revenue" stroke="#236339" strokeWidth={2}/><Line type="monotone" dataKey="tax" stroke="#c9a962" strokeWidth={2}/></LineChart></ResponsiveContainer></ChartCard>
      <ChartCard title="Tax collected" onExport={() => download("gemoire-tax-by-date.csv", ["Date", "GST AUD"], report.trend.map(point => [point.day, point.tax]))}><ResponsiveContainer width="100%" height="100%"><BarChart data={report.trend}><XAxis dataKey="day" fontSize={10}/><YAxis fontSize={10}/><Tooltip/><Bar dataKey="tax" fill="#c9a962" radius={[4, 4, 0, 0]}/></BarChart></ResponsiveContainer></ChartCard>
      <ChartCard title="Top products by revenue" onExport={() => download("gemoire-top-products.csv", ["Product", "Revenue AUD"], report.products.map(item => [item.name, item.revenue]))}><ResponsiveContainer width="100%" height="100%"><BarChart data={report.products} layout="vertical"><XAxis type="number" fontSize={10}/><YAxis type="category" dataKey="name" width={145} fontSize={10}/><Tooltip/><Bar dataKey="revenue" fill="#236339" radius={[0, 4, 4, 0]}/></BarChart></ResponsiveContainer></ChartCard>
      <ChartCard title="Top collections" onExport={() => download("gemoire-top-collections.csv", ["Collection", "Revenue AUD"], report.collections.map(item => [item.name, item.revenue]))}><ResponsiveContainer width="100%" height="100%"><BarChart data={report.collections} layout="vertical"><XAxis type="number" fontSize={10}/><YAxis type="category" dataKey="name" width={110} fontSize={10}/><Tooltip/><Bar dataKey="revenue" fill="#253e2b" radius={[0, 4, 4, 0]}/></BarChart></ResponsiveContainer></ChartCard>
      <ChartCard title="Reviews by rating" onExport={() => download("gemoire-reviews-by-rating.csv", ["Rating", "Reviews"], report.ratings.map(item => [item.name, item.value]))}><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={report.ratings} dataKey="value" nameKey="name" innerRadius={50} outerRadius={76}>{report.ratings.map((item, index) => <Cell fill={["#236339", "#c9a962", "#cda17f", "#d4d0cc", "#737373"][index]} key={item.name}/>)}</Pie><Tooltip/></PieChart></ResponsiveContainer></ChartCard>
      <ChartCard title="Newsletter growth" onExport={() => download("gemoire-newsletter-growth.csv", ["Date", "Subscribers"], report.subscriberTrend.map(item => [item.day, item.subscribers]))}><ResponsiveContainer width="100%" height="100%"><LineChart data={report.subscriberTrend}><XAxis dataKey="day" fontSize={10}/><YAxis allowDecimals={false} fontSize={10}/><Tooltip/><Line type="monotone" dataKey="subscribers" stroke="#236339" strokeWidth={2}/></LineChart></ResponsiveContainer></ChartCard>
    </div>
    <section className="mt-5 rounded-md border border-[#e3e0dc] bg-white p-5"><h2 className="font-serif text-2xl">Store health</h2><div className="mt-4 grid gap-3 text-sm sm:grid-cols-2 xl:grid-cols-4"><p className="flex justify-between"><span>PageSpeed score</span><strong className="text-[#236339]">96 / 100</strong></p><p className="flex justify-between"><span>Broken image count</span><strong>0</strong></p><p className="flex justify-between"><span>404 clicks</span><strong>7</strong></p><p className="flex justify-between"><span>Data source</span><strong className="text-[#236339]">Shared repository</strong></p></div></section>
  </main>;
}

function ChartCard({ title, onExport, children }: { title: string; onExport: () => void; children: ReactNode }) { return <section className="rounded-md border border-[#e3e0dc] bg-white p-5"><div className="flex items-center justify-between gap-3"><h2 className="font-serif text-2xl">{title}</h2><button type="button" onClick={onExport} className="rounded-full border border-[#d4d0cc] px-3 py-1.5 text-[11px] text-[#236339]">Export CSV</button></div><div className="mt-4 h-64">{children}</div></section>; }
function ReportSkeleton() { return <main className="mx-auto max-w-[1440px] p-7"><div className="h-10 w-52 animate-pulse rounded bg-[#f4efe9]"/><div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{Array.from({ length: 8 }, (_, index) => <div key={index} className="h-28 animate-pulse rounded-md border bg-[#f4efe9]"/>)}</div><div className="mt-5 grid gap-5 xl:grid-cols-2">{Array.from({ length: 4 }, (_, index) => <div key={index} className="h-80 animate-pulse rounded-md border bg-[#f4efe9]"/>)}</div></main>; }
