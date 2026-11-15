"""Split an AI-generated emoji sheet (2x2 or 3x3) into clean, square, transparent PNGs.

Usage: python3 split-sheet.py <sheet.png> <out-dir> name1 ... nameN   (N = 4 or 9; the grid follows N)

- Works on a real transparent background, or on a plain or fake-checkerboard background that
  ChatGPT sometimes draws instead: background connected to the image edge is removed.
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
G = int(round(len(names) ** 0.5))
assert G * G == len(names), "give 4 or 9 names"

# No real transparency: treat the edge colors (plain, or a fake checkerboard) as background.
if (arr[:, :, 3] < 200).mean() < 0.05:
    rgb = arr[:, :, :3].astype(int)
    border = np.concatenate([rgb[0], rgb[-1], rgb[:, 0], rgb[:, -1]])
    keys, counts = np.unique((border // 8), axis=0, return_counts=True)
    bg_colors = keys[np.argsort(-counts)[:2]] * 8 + 4
    near = np.zeros((H, W), bool)
    for col in bg_colors:
        near |= np.abs(rgb - col).sum(axis=2) < 40
    lab, _ = ndimage.label(near)
    edge_ids = np.unique(np.concatenate([lab[0], lab[-1], lab[:, 0], lab[:, -1]]))
    bg = np.isin(lab, edge_ids[edge_ids > 0])
    arr[:, :, 3] = np.where(bg, 0, 255)
    src = Image.fromarray(arr)
    print("background removed from edge colors", [tuple(c) for c in bg_colors])
solid = ndimage.binary_opening(arr[:, :, 3] >= 200, iterations=2)
labels, count = ndimage.label(solid)
cells = [np.zeros_like(solid) for _ in range(G * G)]


def cell_of(y, x):
    return min(G - 1, int(y / (H / G))) * G + min(G - 1, int(x / (W / G)))


def thinnest(mask, axis, lo, hi):
    """Index of the line between lo and hi with the fewest mask pixels."""
    sums = mask.sum(axis=axis)[lo:hi]
    return lo + int(sums.argmin())


for i in range(1, count + 1):
    part = labels == i
    if part.sum() < 300:  # specks
        continue
    ys, xs = np.where(part)
    col_lo, col_hi = int(xs.min() / (W / G)), int(xs.max() / (W / G))
    row_lo, row_hi = int(ys.min() / (H / G)), int(ys.max() / (H / G))
    big = part.sum() > 0.04 * H * W / (G * G)
    if big and (col_hi > col_lo or row_hi > row_lo) and part.sum() > 0.9 * H * W / (G * G):
        # Two emoji touching: cut at the thinnest column or row near each crossed border.
        pieces = [part]
        for b in range(1, G):
            edge = int(b * W / G)
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
        for b in range(1, G):
            edge = int(b * H / G)
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
