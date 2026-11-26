// Collection page pagination. Pure helpers with no imports, so tests/domain.test.mjs can
// import this file directly (Node strips the types but does not resolve the "@/" alias).

// A multiple of 6, so a full page ends on a full row in the 3-column and the 2-column grid.
export const PRODUCTS_PER_PAGE = 12;

export type PaginationItem = number | "gap";

// `?page=` as a page number. Anything but a plain positive integer ("0", "-1", "1.5", "2abc",
// "02", a missing value) is page 1.
export function parsePage(value: string | null | undefined): number {
  return value && /^[1-9][0-9]{0,8}$/.test(value) ? Number(value) : 1;
}

export function pageCount(total: number, perPage: number = PRODUCTS_PER_PAGE): number {
  return Math.max(1, Math.ceil(total / perPage));
}

// The page to show for a requested page: a page past the end shows the last page.
export function clampPage(page: number, count: number): number {
  return Math.min(Math.max(1, page), Math.max(1, count));
}

// The numbered slots between the two arrows: never more than five, so the row is at most seven
// boxes wide and fits a 320px phone. Up to five pages are all listed. Past that the first and
// the last page always show and a gap stands for at least two hidden pages.
export function paginationItems(current: number, count: number): PaginationItem[] {
  if (count <= 5) return Array.from({ length: Math.max(1, count) }, (_, index) => index + 1);
  if (current <= 3) return [1, 2, 3, "gap", count];
  if (current >= count - 2) return [1, "gap", count - 2, count - 1, count];
  return [1, "gap", current, "gap", count];
}
