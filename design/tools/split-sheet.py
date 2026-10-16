"""Split a 3x3 AI-generated emoji sheet into clean, square, transparent PNGs.

Usage: python3 split-sheet.py <sheet.png> <out-dir> name1 name2 ... name9

- Removes the faint haze and makes each emoji fully solid (alpha >= 200 becomes opaque).
- Keeps detached parts (raindrops, steam) with the emoji in the same grid cell.
- Separates emoji that touch a neighbour by cutting at the thinnest line near the cell border.
"""
import sys
import numpy as np
from PIL import Image, ImageFilter
from scipy import ndimage

src_path, out_dir, *names = sys.argv[1:]
src = Image.open(src_path).convert("RGBA")
arr = np.array(src)
H, W = arr.shape[:2]
solid = ndimage.binary_opening(arr[:, :, 3] >= 200, iterations=2)
labels, count = ndimage.label(solid)
cells = [np.zeros_like(solid) for _ in range(9)]


def cell_of(y, x):
    return min(2, int(y / (H / 3))) * 3 + min(2, int(x / (W / 3)))


def thinnest(mask, axis, lo, hi):
    """Index of the line between lo and hi with the fewest mask pixels."""
    sums = mask.sum(axis=axis)[lo:hi]
    return lo + int(sums.argmin())


for i in range(1, count + 1):
    part = labels == i
    if part.sum() < 300:  # specks
        continue
    ys, xs = np.where(part)
    col_lo, col_hi = int(xs.min() / (W / 3)), int(xs.max() / (W / 3))
    row_lo, row_hi = int(ys.min() / (H / 3)), int(ys.max() / (H / 3))
    big = part.sum() > 0.04 * H * W / 9
    if big and (col_hi > col_lo or row_hi > row_lo) and part.sum() > 0.9 * H * W / 9:
        # Two emoji touching: cut at the thinnest column or row near each crossed border.
        pieces = [part]
        for b in range(1, 3):
            edge = int(b * W / 3)
            new = []
            for p in pieces:
                pys, pxs = np.where(p)
                if pxs.min() < edge - 40 and pxs.max() > edge + 40:
                    cut = thinnest(p, 0, edge - 60, edge + 60)
                    left, right = p.copy(), p.copy()
                    left[:, cut:] = False
                    right[:, :cut] = False
                    new += [left, right]
                else:
                    new.append(p)
            pieces = new
        for b in range(1, 3):
            edge = int(b * H / 3)
            new = []
            for p in pieces:
                pys, pxs = np.where(p)
                if pys.min() < edge - 40 and pys.max() > edge + 40:
                    cut = thinnest(p, 1, edge - 60, edge + 60)
                    top, bottom = p.copy(), p.copy()
                    top[cut:, :] = False
                    bottom[:cut, :] = False
                    new += [top, bottom]
                else:
                    new.append(p)
            pieces = new
    else:
        pieces = [part]
    for p in pieces:
        pys, pxs = np.where(p)
        if len(pys):
            cells[cell_of(pys.mean(), pxs.mean())] |= p

for mask, name in zip(cells, names):
    if not mask.any():
        print(f"{name}: EMPTY CELL")
        continue
    # Fill only tiny pinholes; real gaps (inside a bike frame, between drops) stay see-through.
    holes = ndimage.binary_fill_holes(mask) & ~mask
    hole_labels, hole_count = ndimage.label(holes)
    hole_sizes = ndimage.sum(holes, hole_labels, range(1, hole_count + 1))
    for h, size in enumerate(hole_sizes, 1):
        if size < 150:
            mask |= hole_labels == h
    alpha = Image.fromarray((mask * 255).astype("uint8")).filter(ImageFilter.GaussianBlur(1.1))
    ys, xs = np.where(mask)
    im = src.copy()
    im.putalpha(alpha)
    im = im.crop((max(0, xs.min() - 2), max(0, ys.min() - 2), min(W, xs.max() + 3), min(H, ys.max() + 3)))
    side = max(im.size)
    square = Image.new("RGBA", (side, side))
    square.paste(im, ((side - im.width) // 2, (side - im.height) // 2))
    square.save(f"{out_dir}/{name}.png")
    print(f"{name}: {side}px")
