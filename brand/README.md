# Brand assets

`Axis_Learning_Logo.pdf` is the file supplied by Axis and is the source for
everything else here. It is a 1536x1024 bitmap wrapped in a PDF, not vector
artwork, so the largest usable size is fixed by that.

Derived, and committed under `client/`:

| File | Where it is used |
| --- | --- |
| `client/src/assets/axis-mark.png` | the mark in the header and footer |
| `client/src/assets/axis-logo.png` | full lockup; the source for the social preview |
| `client/public/favicon-32.png`, `favicon-192.png` | browser tab |
| `client/public/apple-touch-icon.png` | iOS home screen |
| `client/public/og-image.png` | link previews on WhatsApp, Facebook, LinkedIn |

The mark is used rather than the full lockup wherever the background is navy:
the wordmark is navy and would disappear. The background was made transparent
by flood fill from the edges rather than by keying every white pixel, so the
white gaps between the book's pages survive.

**If Axis can supply vector artwork (SVG, AI or EPS), it is worth replacing
these.** Everything here is limited by the resolution of the supplied bitmap;
vector would stay sharp at any size and make a dark-background wordmark
straightforward to produce.
