# Brand assets

`Axis_Learning_Logo.pdf` is the file supplied by Axis and is the source for
everything else here. It is a 1536x1024 bitmap wrapped in a PDF by ReportLab,
not vector artwork.

## What is used where

| File | Used for |
| --- | --- |
| `client/src/assets/axis-mark.svg` | the mark in the header and footer |
| `client/public/favicon.svg` | browser tab, on browsers that take SVG |
| `client/public/favicon-32.png` | browser tab, everywhere else |
| `client/public/favicon-192.png` | large tab and pinned-site icon |
| `client/public/apple-touch-icon.png` | iOS home screen |
| `client/public/og-image.png` | link previews on WhatsApp, Facebook, LinkedIn |
| `client/src/assets/axis-logo.png` | full lockup; the source for the preview above |
| `axis-logo.svg` | traced full lockup — print and large formats, see the caveat |

The mark is used rather than the full lockup wherever the background is navy,
because the wordmark is navy and would disappear against it.

**Small icons use only the figure and star, not the whole mark.** A browser tab
is often 16px, and at that size the full mark — book, figure, star and rays —
collapses into an unreadable smudge. The figure reaching for the star is close
to square, so it fills the icon instead of being letterboxed, and it still
reads at 16px. `favicon-192.png` and `apple-touch-icon.png` keep the full mark,
which has room for the detail. `trace/trace.js` takes a `keepComponent` filter
and re-crops the viewBox, which is how the reduced version is produced.

## The vectors are traced, not original

`axis-mark.svg` and `axis-logo.svg` were traced from the supplied bitmap, so
they are a reconstruction rather than the curves the designer drew. Both are
now close enough to use anywhere.

Measured against the source, the mark differs by an average of 4.7 levels out
of 255 and the lockup by 6.0, with under 2.2% of pixels differing by more than
60 — which is the anti-aliased boundary, where any reconstruction differs. Side
by side at full size neither is distinguishable from the original.

The earlier caveat about seams inside the letters is fixed. It was not a gap
between shapes but a misclassification: nearest-centroid matching, seeded from
the most saturated pixels, put the blue centroid near the bright figure and
swoosh, far enough from the dark navy of the wordmark that some of it landed
closer to the violet of "Thrive". A 301-pixel violet patch inside the letter I
then fitted its own gradient and drew a lighter band across it. Hue now decides
wherever a pixel has enough colour to have one, and the centroids are only
consulted for washed-out pixels — where they are still needed, since
anti-aliased pixels inside a stroke have no hue at all.

Both carry per-shape linear gradients fitted from the bitmap, so the depth in
the original is preserved rather than flattened.

Original vector artwork from the designer would still be preferable if it
exists — it is the real thing rather than a reconstruction, and it would make a
light-on-dark wordmark trivial. It is no longer needed for quality.

## Reproducing the trace

`trace/` holds the scripts, which need only Node:

```
node extract.js     # pull the bitmap out of the PDF
node trace.js       # segment, trace and fit gradients
node measure.js x.svg   # render it and report the difference from the source
```

They are kept because they are the record of how the current files were made,
and because they can be re-run against better source art if it arrives.

How it works, briefly: the background is removed by flood fill from the edges,
so the white gaps between the book's pages survive. Pixels are assigned to the
nearest of the artwork's colour families, which keeps anti-aliased pixels
inside letter strokes instead of dropping them and leaving holes. Thin slivers
left where a gradient crosses a family boundary are absorbed into whatever
surrounds them, because rendering them produced hairlines through the letters.
Outlines are smoothed before simplification, and sharp vertices are detected
and kept sharp so the star keeps its points.
