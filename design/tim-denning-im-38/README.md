# I’m 38, Mapped

An explainer graphic for Tim Denning’s essay **“I’m 38. If You’re in Your 20’s or 30’s, Read This.”**
([X Article, 20 Jan 2026](https://x.com/Tim_Denning/status/2013552215097778231) ·
[Substack](https://timdenning.substack.com/p/im-38-if-youre-in-your-20s-or-30s)), drawn as an
orienteering map.

| File | What it is |
| --- | --- |
| `index.html` | The interactive page (artifact body: no `<html>`/`<head>` wrapper). |
| `standalone.html` | The same page wrapped in a full HTML document, so you can open it locally in a browser. |
| `poster.png` | The whole page as one tall image (1248 px wide). |
| `share-card.png` | 4:5 share card (2160 × 2700) listing every lesson on one card. |
| `twitter/` | The simple version for X: `what-to-do-in-your-20s.png`, one image with ten lessons in big type, plus ready-to-post copy in `POST.md`. `earlier/` keeps previous versions. |
| `generator/` | The generator: terrain, page assembly and content. |

## How to read it

- **Purple ink is Tim’s own wording. Black ink is ours.** `[…]` marks where we trimmed a quote;
  a plain `…` inside a quote is his.
- Every lesson is a **control** (a purple circle) on one course. Controls 1–3 follow his published
  order; the rest are grouped by subject, with terrain strips between groups.
- The **scale bar is measured in years** (20–39). Pick your age (tap, drag or arrow keys) and the page
  tells you where you stand relative to 35, the age he says the difference shows.
- **Route choice** draws his central claim: the straight line over the hill against the crowded
  “conventional path”, with a dashed line marking age 35.
- The **clue card** summarises all 28 lessons in seven words or fewer. That wording is ours.

## How the text was sourced

The X Article and Substack pages could not be fetched from the build environment, so the text
was reconstructed from search-engine snippets of both pages. Several independent search passes
were merged, and then each lesson was checked by an adversarial verifier.

- 28 lessons were kept. Each headline was tied to this essay by at least one search result that
  pointed at the X Article or the Substack post.
- One lesson (flow states over productivity) is in black because its topic is confirmed but its
  exact sentence is not.
- Dropped as unverifiable or as coming from other Denning posts: free social media to build an email
  list, VC-funded unicorns, “the strongest animals only eat plants”, “haters are a tax on being a writer”,
  and several lines from his other “I’m 38” threads.
- The essay may contain more lessons than these 28. The page says so.

If you have the full text, check the purple strings in `generator/content.js` against it before
sharing widely.

## Rebuild

```bash
cd generator
npm install          # d3-contour, simplex-noise, alea
node build.js        # writes out/index.html
node card.js         # writes out/card.html (share card source)
node tw.js           # writes out/tw-cover.html and out/tw-sheet.html (earlier Twitter set)
node tw3.js          # writes out/tw-final.html (final one-image Twitter version)
```

Terrain is generated at build time from fixed seeds, so every build is identical.

Unofficial. Not affiliated with Tim Denning.
