# Codex prompt: remove the spec line from product cards

Copy everything below the line into Codex.

---

You are working in the GEMOIRE storefront repo: Next.js 15 (App Router), React 19. Storefront styling is hand-written CSS in `src/app/globals.css` and `src/app/storefront.css`. This document is the whole brief. Ignore the other `codex-prompt*.md` and `*-PROMPT*.md` files in the repo root.

## The request

The client sent a screenshot of a product card with the line "0.05ct Charm, 18ct Yellow Gold" boxed in red, and this note:

> 0.2 Short line. Remove the short product description displayed below the product title. It is not needed.

That line is the muted 12px text between the product name and the price on every product card. It shows the carat, the setting and the selected metal. It is one element in `src/components/commerce/product-card.tsx`:

```tsx
<p className="product-spec" aria-live="polite">{product.carat} {product.setting}, {metal}</p>
```

The original build brief (`codex-prompt.md`) asked for this line. The client has now dropped it.

## The change

Delete that element. Nothing replaces it. The card then reads: image, name, price, metal swatches, rating.

`ProductCard` is the only product card in the storefront. It renders in three places, and all three lose the line. That is intended.

- Collection pages: `src/app/collections/[slug]/collection-client.tsx`
- "You may also like" on product pages: `src/app/products/[slug]/page.tsx`
- The Card preview in the admin product editor: `src/components/admin/connected-product-editor.tsx`

This should be a one-line deletion in one file. These things look related and must stay as they are:

- **The `.product-spec` rules in `storefront.css`.** The class has a second user: the result count above the grid ("31 pieces") is `<p className="product-spec" role="status">` in `collection-client.tsx`, and `scripts/verify-storefront.mjs` reads the count through that exact markup. Don't delete, rename or restyle the class.
- **The product data.** `carat`, `setting` and `metal` stay on `Product`. The card still uses `product.carat` and `metal` for the price and the link, and the collection filters and the product page read all three.
- **Other places that show carat or metal.** The spec row (`.spec-quick`) and the "Metal — …" label on the product page, and the "carat · metal" line in the cart drawer and on the cart page. The client's note is about the card only.
- **No substitute for `aria-live`.** The element was also the card's live region for the metal name. The swatch buttons already expose `aria-pressed` and `aria-label`, and the image link's `aria-label` names the selected metal, so don't add a visually hidden replacement.

No CSS change should be needed. On a production build of today's working tree I removed the node in the page in headless Chrome and measured `/collections/engagement` at 320, 375, 768, 1024 and 1536. The gap from the bottom of the name to the top of the price goes from 31px (50px at 375, where the line wraps onto two rows) to 8px, which is `.price-pair`'s own top margin. Each card gets 23px shorter (42px at 375) and the rows stay aligned. If your screenshots show something else, fix it inside the existing `.product-info` and `.price-pair` rules and say so in your report.

## Before you start

1. Run `git status`. Another task, the homepage shape picker, may have uncommitted work in this folder. As I write this it is in progress on `fix/homepage-shape-picker`, with changes in `src/app/storefront.css`, `src/components/commerce/shape-selector.tsx`, `src/components/marketing/split-screen-shape-hero.tsx` and `tests/domain.test.mjs`. Leave that work exactly as it is: no stash, no revert, no reformatting, and none of it in your commit. Untracked `codex-prompt*.md` files and a modified `next-env.d.ts` are fine too. If `src/components/commerce/product-card.tsx` is itself modified, stop and say so.
2. Pick the branch.
   - If nothing under `src/`, `tests/` or `scripts/` is modified, create `fix/product-card-spec-line` from the current HEAD.
   - If files there are modified, stay on the branch that is checked out. Switching would carry another session's unfinished work onto a new branch, and its later commits would land there.
3. Record a baseline with `npm run typecheck` and `npm run test:domain`. A failing domain test prints the whole stylesheet, so filter the output: `node --test tests/domain.test.mjs 2>&1 | grep -aE "^(ℹ|✖)"`. On today's working tree I get 30 tests, 27 passing and 3 failing ("currency choice is searchable…", "header exposes the requested click-to-call number", "storefront responsive rules cover tablet, mobile, and narrow phones"). Those three are regex matches against source text and have nothing to do with this task. If the other task has moved on and your numbers differ, your own baseline is the one that counts. The rule is the same numbers after your edit as before. Don't fix the old failures.

Don't add a test for this change and don't edit `tests/domain.test.mjs`. A source-text check for a deleted line adds little, and that file may hold the other task's uncommitted work.

## Verify

1. **Static.** `npm run typecheck` and `npm run test:domain` give the same results as your baseline. A search for `product-spec` under `src/` finds exactly two files: `collection-client.tsx` (the count line) and `storefront.css`.
2. **Server.** Look at what is listening before you build: `netstat -ano | grep -E ":(3000|3100) "`.
   - Port 3100 is free: run `npm run build`, then `npx next start -p 3100`, and stop that server by PID when you finish. If the build fails in a file you did not touch, don't fix it. Report it and use the dev server instead.
   - Port 3100 is in use: another session is serving `.next` from there. Don't run `npm run build`, because it rewrites the files that server is reading, and don't stop that server. Use the dev server on port 3000 for the browser checks. It picks up your edit by hot reload.
   - Never start a second `next dev` in this folder, because both would write `.next-dev`. If no server is usable, report the static checks and say the browser checks were not run.
3. **Wait for network idle** before navigating away or closing Chrome. On `next start`, a `/_next/image` request that is aborted in its first few milliseconds can leave that image hanging for every later request until the server restarts.
4. **Browser checks** in headless Chrome (`C:/Program Files/Google/Chrome/Application/chrome.exe`; Node 24 has a built-in `WebSocket`, so the DevTools Protocol needs no dependencies). Use real mouse events, not synthetic DOM events.
   - `/collections/engagement` at 1536, 768, 375 and 320: no card contains a `.product-spec` element. The page has exactly one `.product-spec`, the count line, and it still reads "N pieces" in 12px muted text. In every card the children of `.product-info` are, in order, the `h3`, `.price-pair`, `.metal-swatches` and `.card-rating`. The gap from the bottom of the name to the top of the price is 8px. Nothing in a card extends past the viewport.
   - At 1536, in a fresh Chrome profile (the currency is then USD), click the Rose Gold swatch on the first card: `aria-pressed="true"` moves to that swatch, the price rises by $59.00, and the card's links point to `/products/<slug>?metal=18ct+Rose+Gold`.
   - On one product page: the "You may also like" cards have no spec line, and the page's own `.spec-quick` row and "Metal — …" label are still there.
   - The served HTML of `/collections/engagement` contains `class="product-spec"` exactly once.
5. **Screenshots to take and look at:** the first row of cards on `/collections/engagement` at 1536 and at 375, and "You may also like" on a product page at 1536.

The script I used for the measurements may still be on this machine: `C:\Users\aashu\AppData\Local\Temp\gemoire-audit\card\probe.mjs`, with its screenshots and `report.json` in `card\out\`. It imports the driver `..\sub\cdp3.mjs` and takes `ORIGIN=http://localhost:3100`. It measures the cards, removes the spec node in the page and measures again, so after your edit its "before" numbers should equal my "after" numbers. Recreate both files if the folder is gone.

`scripts/verify-storefront.mjs` is not a gate for this task. It also asserts product cards on the homepage, which no longer renders any.

## Commit

One commit that contains only the card file. Use the path form, which commits that file alone whatever else is staged:

```
git commit -m "fix: remove spec line from product cards" -- src/components/commerce/product-card.tsx
```

`git show --stat` on that commit should report one file and one deleted line. `product-card.tsx` has mixed CRLF and LF line endings, so if the stat shows more than one line changed, your editor rewrote the endings: undo that and delete the line without touching the rest of the file. Don't push.

## Report

In your final message give the diff, the baseline and final test numbers, which server you used for the browser checks, the result of each check, and which screenshots you looked at. List anything you assumed, anything you changed that this brief did not ask for, and anything you could not verify.
