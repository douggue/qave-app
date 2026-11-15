"""Give split emoji one consistent white die-cut rim (use after split-sheet.py).

Usage: python3 sticker-rim.py <in.png> <out.png> [--holes]

- Strips a leftover white or near-white edge (a partial rim, or white background the split
  could not tell apart from the rim), up to about 2% of the sticker size.
- --holes: also clears enclosed, flat near-white areas (the inside of onion rings, a donut hole).
- Adds a pure white rim of 1.6% of the size, like the approved set, with a soft edge.
"""
import sys

import numpy as np
from PIL import Image, ImageFilter
from scipy import ndimage

src, dst, *flags = sys.argv[1:]
im = Image.open(src).convert("RGBA")
a = np.array(im)
H, W = a.shape[:2]
size = max(H, W)
rgb = a[:, :, :3].astype(int)
solid = a[:, :, 3] > 128
whiteish = (rgb.min(axis=2) > 232) & (rgb.max(axis=2) - rgb.min(axis=2) < 14)

# Peel near-white pixels off the outside, one layer at a time.
for _ in range(int(size * 0.02)):
    edge = solid & ~ndimage.binary_erosion(solid)
    peel = edge & whiteish
    if not peel.any():
        break
    solid &= ~peel

if "--holes" in flags:
    lab, n = ndimage.label(whiteish & solid)
    for i in range(1, n + 1):
        part = lab == i
        if part.sum() > size * size * 0.004:
            solid &= ~part

solid = ndimage.binary_opening(solid, iterations=1)
solid = ndimage.binary_fill_holes(solid) if "--holes" not in flags else solid

rim_px = max(2, int(round(size * 0.016)))
pad = rim_px + 4
big = np.zeros((H + 2 * pad, W + 2 * pad), bool)
big[pad:pad + H, pad:pad + W] = solid
yy, xx = np.ogrid[-rim_px:rim_px + 1, -rim_px:rim_px + 1]
rim = ndimage.binary_dilation(big, structure=(xx * xx + yy * yy) <= rim_px * rim_px)

out = Image.new("RGBA", (W + 2 * pad, H + 2 * pad), (0, 0, 0, 0))
rim_alpha = Image.fromarray((rim * 255).astype("uint8")).filter(ImageFilter.GaussianBlur(0.9))
out.paste(Image.new("RGBA", out.size, (255, 255, 255, 255)), (0, 0), rim_alpha)
body = im.copy()
body.putalpha(Image.fromarray((solid * 255).astype("uint8")).filter(ImageFilter.GaussianBlur(0.7)))
out.alpha_composite(body, (pad, pad))
out.save(dst)
print(dst, out.size)
