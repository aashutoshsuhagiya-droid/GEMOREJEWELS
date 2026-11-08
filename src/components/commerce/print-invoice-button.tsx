"use client";
export function PrintInvoiceButton() { return <button className="button no-print" onClick={() => window.print()}>Download / Print PDF</button>; }
