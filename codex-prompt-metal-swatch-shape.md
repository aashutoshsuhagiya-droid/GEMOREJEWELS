# Codex prompt: keep the metal swatches round (no more long ovals)

Copy everything below the line into Codex.

---

You are working in the GEMOIRE storefront repo: Next.js 15 (App Router), React 19. Storefront styling is hand-written CSS in `src/app/globals.css` and `src/app/storefront.css`; the admin under `/admin` is styled with Tailwind utilities. This document is the whole brief. Ignore the other `codex-prompt*.md` and `*-PROMPT*.md` files in the repo root.

## The request

The client sent a screenshot of a product card with the row of four metal colour swatches boxed in red. Each swatch in it is a tall pill, roughly 14px wide and 34px high. Their note:

> Metal Tone. Change the metal tone selection options to small square buttons or round instead of the current long oval shapes.

The swatches are the four buttons (18ct Yellow Gold, 18ct Rose Gold, 18ct White Gold, Platinum) rendered by `src/components/commerce/metal-swatches.tsx`. That component is used by the product card (`product-card.tsx`) and by the product page (`product-detail.tsx`).

## What I found

Most of this is already fixed on this branch. One place is not.

The client's screenshot is from an older build (it still shows the spec line under the product name, which commit `39ca97d` removed). `main` still has an element rule in `globals.css` that gives every `<button>` `min-height: 48px`. A swatch is a `<button>` with a width, a height and `border-radius: 9999px`, and `min-height` outranks `height`, so the swatch is stretched into a pill. The responsive work on this branch removed that rule for the storefront.

I measured a production build of `39ca97d` in headless Chrome:

| Where | Button (hit box) | Coloured dot | Shape |
| --- | --- | --- | --- |
| Collection cards, at 1536, 768, 375 and 320 wide | 28×28 | 20×20 | round |
| "You may also like" cards on a product page | 28×28 | 20×20 | round |
| Product page metal picker, at 1536 and 375 | 40×40 | 24×24 | round |
| **Card preview in the admin product editor** (`/admin/products/new`) | **28×48** | **20×40** | **long oval** |

No swatch row overflows its card or the viewport at any of those widths.

The admin case has the same cause as the old storefront bug. `globals.css` keeps the old sizing for admin pages only:

```css
:where(body:has(.admin-root)) :is(button, input, select, textarea) {
  font-size: clamp(15px, 1.1vw, 16px);
  min-height: 48px;
}
```

The admin editor's "Live storefront preview" renders the real `ProductCard`, so its swatches get that 48px. The swatch rules set `height` but never `min-height`, so nothing stops it.

## The decision

The client accepts round or square. **Round stays.** It is what the storefront already shows, and it is what the original build brief asked for. Don't restyle the swatches as squares, and don't change their size, gap, colours or selection ring.

## The change

Make the swatch immune to any element-level `min-height`, so it stays round wherever a product card renders.

1. In `src/app/storefront.css`, add `min-height: 0;` to the base `.metal-swatch` rule (about line 408, the one that holds `padding: 0` and `flex: 0 0 14px`). Add a short comment that says why it is there, so nobody removes it later as redundant. I suggest the base rule and not the scoped `.product-card .metal-swatch, .pdp-info .metal-swatch` rule further down, because the base rule covers a swatch in any container. Its specificity (one class) beats the admin rule (one element; the `:where()` part counts for nothing), so source order doesn't matter.

   I tested exactly this by injecting `.metal-swatch { min-height: 0; }` into the page on that build. The admin preview went from 28×48 with a 20×40 dot to 28×28 with a 20×20 dot, and the swatch row from 48px to 28px high. Collection cards and the product page did not change at all.

2. In `tests/domain.test.mjs`, add one test after "homepage shape picker never loads the mislabelled artwork folders" (about line 363). It reads `storefrontCss`, which is already defined at the top of that file, and asserts that a rule whose selector ends in `.metal-swatch` declares `min-height: 0`. Name it for the behaviour, for example "metal swatches cannot be stretched by a global button min-height". Write it with your patch tool and not a shell heredoc: heredocs in Git Bash on this machine drop backslashes, which silently breaks regex literals.

That is the whole change: one declaration with its comment, and one test. If you find a cause I missed, or a better place for the declaration, do what is right and say so in your report.

These things look related and must stay as they are:

- **The admin element rule in `globals.css`** (shown above). The Tailwind admin was built against that sizing. It also stretches the heart button in the same preview to 40×48 (it is 40×40 on the storefront). The client did not ask about that. Leave it, and mention it in your report.
- **The base size in `globals.css`.** `.metal-swatch { width: 14px; height: 14px; … }` stays. `scripts/verify-storefront.mjs` asserts those two values (lines 164–165).
- **The hit-box design in `storefront.css`.** In cards the button is a transparent 28px box and the coloured dot is its 20px content box (40px and 24px on the product page). That is how a 20px dot gets a larger tap target without overflowing a two-column phone card. Don't shrink the box to match the dot.
- **`metal-swatches.tsx`.** No markup change is needed. `aria-pressed`, `aria-label`, `title` and the `active` class stay.
- **The "Metal swatches *" field in the admin editor form.** Those are labelled text chips ("Platinum", "18ct Yellow Gold") for choosing which metals a product offers. They are a different control and are meant to be pills.

## Before you start

1. Run `git status`. I expect branch `fix/product-card-spec-line` at `39ca97d fix: remove spec line from product cards`, or a later commit, with a clean tree apart from untracked `codex-prompt*.md` files and possibly a modified `next-env.d.ts`. If `src/app/storefront.css` or `tests/domain.test.mjs` is already modified, stop and say so: that is another session's unfinished work and it would end up in your commit.
2. Pick the branch.
   - If nothing under `src/`, `tests/` or `scripts/` is modified, create `fix/metal-swatch-shape` from the current HEAD.
   - If other files there are modified, stay on the branch that is checked out and leave that work exactly as it is: no stash, no revert, no reformatting.
3. Record a baseline with `npm run typecheck` and `npm run test:domain`. A failing domain test prints a whole stylesheet, so filter the output: `node --test tests/domain.test.mjs 2>&1 | grep -aE "^(ℹ|✖)"`. At `39ca97d` I get a clean typecheck and 30 tests, 27 passing and 3 failing ("currency choice is searchable…", "header exposes the requested click-to-call number", "storefront responsive rules cover tablet, mobile, and narrow phones"). Those three are old regex mismatches and have nothing to do with this task. Don't fix them. If your numbers differ, your own baseline is the one that counts.

## Verify

1. **Static.** `npm run typecheck` is clean. `npm run test:domain` shows one more test and one more pass than your baseline (31 and 28 against my numbers) and the same three failures. Then confirm the new test can fail: remove the declaration, run the test, see it fail, put the declaration back.
2. **Server.** Look at what is listening before you build: `netstat -ano | grep -E ":(3000|3100) "`.
   - Port 3100 is free: run `npm run build` (about two minutes), then `npx next start -p 3100`, and stop that server by PID when you finish. If the build fails in a file you did not touch, don't fix it. Report it.
   - Port 3100 is in use: another session is serving `.next` from there. Don't run `npm run build`, because it rewrites the files that server is reading, and don't stop that server. Use the dev server on port 3000 if it answers (`curl --max-time 60 http://localhost:3000/`). It picks up your edit by hot reload.
   - Port 3000 belongs to the user. Never stop or restart it. While I was writing this it did not answer within 60 seconds, so don't count on it.
   - Never start a second `next dev` in this folder, because both would write `.next-dev`. If no server is usable, report the static checks and say that the browser checks were not run.
3. **Wait for network idle** before navigating away or closing Chrome. On `next start`, a `/_next/image` request that is aborted in its first few milliseconds can leave that image hanging for every later request until the server restarts.
4. **Browser checks** in headless Chrome (`C:/Program Files/Google/Chrome/Application/chrome.exe`; Node 24 has a built-in `WebSocket`, so the DevTools Protocol needs no dependencies). Measure with `getBoundingClientRect()` and `getComputedStyle()`. The dot is the button's content box: its size minus padding and border.
   - **Admin Card preview.** From a page on the same origin, `POST /api/auth/login` with the JSON body `{"email":"probe@gemoirejewels.test","password":"demo123","role":"Admin"}`. It only sets a session cookie. Open `/admin/products/new` at 1536×1400. The viewport is that tall because a sticky Save/Publish bar covers the bottom of the preview card at normal heights. The "Live storefront preview" panel opens on its Card view. All four swatches there are 28×28 with a 20×20 dot and a computed `min-height` of `0px`, and the swatch row is 28px high. With a real mouse click on Rose Gold, `aria-pressed="true"` moves to that swatch. Don't press Save draft or Publish.
   - **Storefront, unchanged.** On `/collections/engagement` at 1536, 768, 375 and 320: every swatch on every card is 28×28 with a 20×20 dot, and no swatch row extends past its card or the viewport. On one product page at 1536 and 375: the page's own picker is 40×40 with a 24×24 dot, and the "You may also like" cards are 28×28 with a 20×20 dot.
   - The page sets `scroll-behavior: smooth` on `html`. If you scroll an element into view and measure it straight away you get the old position, so scroll with `behavior: "instant"`.
5. **Screenshots to take and look at:** the admin Card preview (title, price, swatches and rating), the first row of cards on `/collections/engagement` at 1536 and at 375, and the metal picker on a product page at 1536. In all of them the swatches are circles and the selected one has a thin dark ring around it.

The script I used does all of the measuring and may still be on this machine: `C:\Users\aashu\AppData\Local\Temp\gemoire-audit\swatch\probe.mjs`. It imports the driver `..\sub\cdp3.mjs`, and `ORIGIN=http://localhost:3100 node probe.mjs` prints one summary line per page. It writes `report.json` and the screenshots to `swatch\out\`, replacing my baseline files there. After your edit its admin line should read `box 28x28 dot 20x20` with `groupHeights` of `[28]`, and every `cards` and `pdp` line should be the same as in the table above. Running it with `SIMULATE=1` also injects the fix in the page, which is how I tested it before any source change; you don't need that once the real edit is built. Recreate the script if the folder is gone.

`scripts/verify-storefront.mjs` is not a gate for this task. It asserts product cards on the homepage, which no longer renders any.

## Commit

One commit that contains only the two files. Use the path form, which commits those files alone whatever else is staged:

```
git commit -m "fix: keep metal swatches round in the admin card preview" -- src/app/storefront.css tests/domain.test.mjs
```

`git show --stat` on that commit should report two files, a handful of added lines and no deletions. Both files use CRLF line endings throughout. If the stat shows deletions or hundreds of changed lines, your editor rewrote the endings: undo that and make the edit without touching the rest of the file. Don't push.

## Report

In your final message give the diff, the baseline and final test numbers, which server you used for the browser checks, the measured sizes for each check, and which screenshots you looked at. List anything you assumed, anything you changed that this brief did not ask for, and anything you could not verify.
