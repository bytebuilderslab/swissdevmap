import { Buffer } from 'node:buffer';
import { expect, it } from 'vitest';
import og from '../../api/og.js';

it('returns a cacheable 1200×630 PNG for a social card request', async () => {
    const response = await og.fetch(new Request('https://example.test/api/og?title=Rust&subtitle=Z%C3%BCrich&tags=Web'));
    const png = Buffer.from(await response.arrayBuffer());

    expect(response.status).toBe(200);
    expect(response.headers.get('content-type')).toBe('image/png');
    expect(response.headers.get('cache-control')).toContain('s-maxage=86400');
    expect(png.subarray(0, 8).toString('hex')).toBe('89504e470d0a1a0a');
    expect(png.readUInt32BE(16)).toBe(1200);
    expect(png.readUInt32BE(20)).toBe(630);
});
