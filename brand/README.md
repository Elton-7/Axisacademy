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

`axis-mark.svg` and `axis-logo.svg` were traced from the supplied bitmap. They
are close but they are a reconstruction, not the artwork the designer drew.

**The mark is faithful.** Measured against the source it differs by an average
of 4.7 levels out of 255, and only 1.6% of pixels differ by more than 60 —
essentially the anti-aliased boundary. At any size it is indistinguishable.

**The lockup is good, not perfect.** Letterforms are solid and correct, but at
roughly 2.5x magnification faint seams are visible inside one or two letters,
where the wordmark's gradient crosses a colour boundary. Fine for print at
normal sizes; worth knowing before it goes on a banner.

Both carry per-shape linear gradients fitted from the bitmap, so the depth in
the original is preserved rather than flattened.

**If Axis can obtain the original vector artwork (SVG, AI or EPS) from whoever
designed the logo, use that instead.** It would remove the caveat above and
make a light-on-dark version of the wordmark straightforward, which would let
the full lockup work in the footer and on the login pages.

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
