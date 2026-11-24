import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import satori from 'satori';
import sharp from 'sharp';
import { buildCard, HEIGHT, WIDTH } from './_card.js';

const require = createRequire(import.meta.url);
// Satori's HarfBuzz loader opens this file dynamically, so trace it into the function bundle.
require.resolve('harfbuzzjs/hb.wasm');
const font = readFileSync(require.resolve('@fontsource/geist/files/geist-latin-400-normal.woff'));

async function handler(request: Request): Promise<Response> {
    const card = buildCard(new URL(request.url).searchParams);
    const svg = await satori(card, {
        width: WIDTH,
        height: HEIGHT,
        fonts: [{ name: 'Geist', data: font, weight: 400, style: 'normal' }],
    });
    const png = await sharp(Buffer.from(svg)).png().toBuffer();
    return new Response(new Uint8Array(png), {
        headers: {
            'content-type': 'image/png',
            'cache-control': 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800',
        },
    });
}

export default { fetch: handler };
