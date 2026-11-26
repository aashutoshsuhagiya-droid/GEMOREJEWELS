"use client";

import type { MouseEvent } from "react";
import { paginationItems } from "@/lib/pagination";

type Direction = "previous" | "next";

const Chevron = ({ direction }: { direction: Direction }) => <svg viewBox="0 0 16 16" aria-hidden="true" focusable="false"><path d={direction === "previous" ? "M10 3 5 8l5 5" : "m6 3 5 5-5 5"}/></svg>;

// Page links are real links (href, so they can be crawled and opened in a new tab). The owner
// decides in onNavigate whether a click is handled in the page.
export function Pagination({ page, pageCount, hrefFor, onNavigate }: { page: number; pageCount: number; hrefFor: (page: number) => string; onNavigate: (page: number, event: MouseEvent<HTMLAnchorElement>) => void }) {
  if (pageCount <= 1) return null;
  const arrow = (direction: Direction) => {
    const target = direction === "previous" ? page - 1 : page + 1;
    // At either end the arrow stays in place, greyed out, so the row does not shift.
    if (target < 1 || target > pageCount) return <span className="pagination-link pagination-arrow is-disabled" aria-hidden="true"><Chevron direction={direction}/></span>;
    return <a className="pagination-link pagination-arrow" href={hrefFor(target)} rel={direction === "previous" ? "prev" : "next"} aria-label={direction === "previous" ? "Previous page" : "Next page"} onClick={event => onNavigate(target, event)}><Chevron direction={direction}/></a>;
  };
  return <nav className="pagination" aria-label="Pagination">
    <ul className="pagination-list" role="list">
      <li>{arrow("previous")}</li>
      {paginationItems(page, pageCount).map((item, index) => item === "gap"
        ? <li className="pagination-gap" aria-hidden="true" key={`gap-${index}`}>…</li>
        : <li key={item}>{item === page
          ? <span className="pagination-link" aria-current="page"><span className="sr-only">Page </span>{item}</span>
          : <a className="pagination-link" href={hrefFor(item)} onClick={event => onNavigate(item, event)}><span className="sr-only">Page </span>{item}</a>}</li>)}
      <li>{arrow("next")}</li>
    </ul>
  </nav>;
}
