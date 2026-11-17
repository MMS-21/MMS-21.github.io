# Moaaz page mascot

Generated with the built-in image generation tool from the supplied blue-haired sunglasses avatar. Source sheets are retained here for rebuilding; the homepage serves the optimized WebP atlases from `public/mascots`.

Prompt set: a 3 by 3 transparent chibi portrait sheet preserving electric blue compact curls, black sunglasses, white face, varied black outlines and a narrow white shirt. Directions run up-left/up/up-right, left/center/right, down-left/down/down-right. Bodies stay front-facing with generous cell margins. Matching front-facing reactions use smiles, blush, lens reflections, heart, sparkle, surprise, sleep, dizziness and laughter. The final correction copies the center portrait size and shoulder shape throughout.

Built and verified with the installed page-mascot skill's `scripts/mascot.py moaaz --skip-generate`. Measured click shift: 0 pixels; palette match: 79.8%; width change: 11.9% (within the verifier's 12% limit). Left and right head turns visually checked.

The homepage uses the `page-mascot` React component through Astro, with click/tap and keyboard reactions and reduced-motion support.

## Cream hoodie edition

The portfolio now serves the cream hoodie artwork from the two `moaaz-hoodie-*.webp` atlases in `public/mascots`. Each atlas uses 288px square cells with a shared portrait baseline. Directions use the same 3×3 order as the original; the 4×4 reactions are in this row-major order:

1. Calm, cheerful, laughing, affectionate
2. Surprised, starstruck, bashful, skeptical
3. Sleepy, dizzy, sad, angry
4. Relieved, determined, nervous, celebrating

`MoaazMascot` is shared by the homepage, portfolio header, and workbench preview. Clicks, taps, and keyboard activations cycle through the reactions; four quick activations trigger dizziness. The original white-shirt PNGs and atlases are retained as reference.
