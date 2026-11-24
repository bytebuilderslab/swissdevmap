import { landingPaths } from '../src/lib/landing.js';
import { companyPath } from '../src/lib/paths.js';
import { buildSitemap } from '../src/lib/sitemap.js';
import type { Company } from '../src/store/mapStore';
import { apiBase, fetchJson } from './_upstream.js';

// Built from the live company list and cached at the edge, so new companies appear within the hour.

async function handler(): Promise<Response> {
    const base = apiBase();
    const companies = base
        ? await fetchJson<Company[]>(`${base}/api/companies`)
        : null;
    if (!companies) {
        return new Response('Company list unavailable', { status: 503, headers: { 'retry-after': '300' } });
    }

    return new Response(buildSitemap(['/', ...landingPaths(companies), ...companies.map(companyPath)]), {
        headers: {
            'content-type': 'application/xml; charset=utf-8',
            'cache-control': 'public, max-age=0, s-maxage=3600, stale-while-revalidate=86400',
        },
    });
}

export default { fetch: handler };
