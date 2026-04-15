/**
 * Build prospect list of paving & striping contractors.
 * Pulls from Yelp API across all target markets.
 * Outputs CSV ready for Instantly.ai import.
 *
 * Usage: npx tsx scripts/build-prospect-list.ts
 */

import * as fs from 'fs';
import * as path from 'path';

const MARKETS = [
  { id: 'chicago_il', city: 'Chicago', state: 'IL', location: 'Chicago, IL' },
  { id: 'dallas_tx', city: 'Dallas', state: 'TX', location: 'Dallas, TX' },
  { id: 'phoenix_az', city: 'Phoenix', state: 'AZ', location: 'Phoenix, AZ' },
];

const SEARCH_TERMS = [
  'asphalt paving contractor',
  'commercial paving',
  'parking lot paving',
  'asphalt resurfacing',
  'pavement contractor',
  'parking lot striping',
  'line striping contractor',
  'asphalt sealing',
];

// Email patterns to try for enrichment
function guessEmails(name: string, domain: string): string[] {
  const parts = name.toLowerCase().replace(/[^a-z0-9]/g, '').split(/\s+/);
  const first = parts[0] ?? '';
  const last = parts[parts.length - 1] ?? '';
  return [
    `info@${domain}`,
    `contact@${domain}`,
    `${first}@${domain}`,
    `${first}.${last}@${domain}`,
    `${first[0]}${last}@${domain}`,
  ];
}

type YelpBusiness = {
  id: string;
  name: string;
  phone: string;
  location: {
    address1: string;
    city: string;
    state: string;
    zip_code: string;
  };
  url: string;
  rating: number;
  review_count: number;
  categories: { alias: string; title: string }[];
};

async function searchYelp(term: string, location: string, offset = 0): Promise<YelpBusiness[]> {
  const params = new URLSearchParams({
    term,
    location,
    limit: '50',
    offset: String(offset),
    categories: 'pavingcontractors,asphaltpaving',
  });

  // Note: Replace with actual Yelp API key when running
  const YELP_API_KEY = process.env.YELP_API_KEY ?? '';
  if (!YELP_API_KEY) {
    console.warn('  ⚠️  YELP_API_KEY not set — using placeholder data');
    return [];
  }

  const res = await fetch(`https://api.yelp.com/v3/businesses/search?${params}`, {
    headers: { Authorization: `Bearer ${YELP_API_KEY}` },
  });

  if (!res.ok) return [];
  const data = await res.json() as { businesses: YelpBusiness[] };
  return data.businesses ?? [];
}

type Prospect = {
  company: string;
  vertical: string;
  phone: string;
  website: string;
  address: string;
  city: string;
  state: string;
  market: string;
  source: string;
  email_guess_1: string;
  email_guess_2: string;
  yelp_rating: number;
  yelp_reviews: number;
  yelp_url: string;
};

async function main() {
  console.log('🏗️  Building prospect list...\n');

  const prospects: Prospect[] = [];
  const seen = new Set<string>();

  for (const market of MARKETS) {
    console.log(`\n📍 ${market.location}`);

    for (const term of SEARCH_TERMS) {
      console.log(`  Searching: "${term}"...`);
      const businesses = await searchYelp(term, market.location);

      for (const biz of businesses) {
        const key = biz.id;
        if (seen.has(key)) continue;
        seen.add(key);

        const isPaving = term.includes('paving') || term.includes('asphalt') || term.includes('pavement');
        const isStriping = term.includes('striping') || term.includes('line');
        const vertical = isPaving && isStriping ? 'both' : isPaving ? 'paving' : 'striping';

        const domain = biz.url ? new URL(biz.url).hostname.replace('www.', '') : '';
        const [email1, email2] = guessEmails(biz.name, domain || `${market.city.toLowerCase()}paving.com`);

        prospects.push({
          company: biz.name,
          vertical,
          phone: biz.phone,
          website: biz.url,
          address: biz.location.address1,
          city: biz.location.city || market.city,
          state: biz.location.state || market.state,
          market: market.id,
          source: 'yelp',
          email_guess_1: email1,
          email_guess_2: email2,
          yelp_rating: biz.rating,
          yelp_reviews: biz.review_count,
          yelp_url: biz.url,
        });
      }

      await new Promise((r) => setTimeout(r, 300)); // rate limit
    }

    console.log(`  Found ${prospects.filter((p) => p.market === market.id).length} unique companies`);
  }

  // If no Yelp API key, use sample data
  if (prospects.length === 0) {
    console.log('\n⚠️  No Yelp data — generating sample prospect list for demonstration');
    const SAMPLE_COMPANIES = [
      // Chicago
      { company: 'Midwest Asphalt Solutions', city: 'Chicago', state: 'IL', market: 'chicago_il', phone: '(312) 555-0101', vertical: 'paving' },
      { company: 'Windy City Paving Co', city: 'Chicago', state: 'IL', market: 'chicago_il', phone: '(312) 555-0202', vertical: 'paving' },
      { company: 'Chicago Line Striping', city: 'Chicago', state: 'IL', market: 'chicago_il', phone: '(312) 555-0303', vertical: 'striping' },
      { company: 'Great Lakes Pavement', city: 'Evanston', state: 'IL', market: 'chicago_il', phone: '(847) 555-0404', vertical: 'paving' },
      { company: 'North Shore Asphalt', city: 'Skokie', state: 'IL', market: 'chicago_il', phone: '(847) 555-0505', vertical: 'paving' },
      { company: 'Metro Paving Group', city: 'Oak Park', state: 'IL', market: 'chicago_il', phone: '(708) 555-0606', vertical: 'both' },
      { company: 'Illinois Commercial Paving', city: 'Naperville', state: 'IL', market: 'chicago_il', phone: '(630) 555-0707', vertical: 'paving' },
      { company: 'Lakeshore Striping Solutions', city: 'Chicago', state: 'IL', market: 'chicago_il', phone: '(312) 555-0808', vertical: 'striping' },
      // Dallas
      { company: 'Premier Paving Group', city: 'Dallas', state: 'TX', market: 'dallas_tx', phone: '(214) 555-0901', vertical: 'paving' },
      { company: 'Texas Star Asphalt', city: 'Dallas', state: 'TX', market: 'dallas_tx', phone: '(214) 555-1002', vertical: 'paving' },
      { company: 'DFW Parking Lot Pros', city: 'Irving', state: 'TX', market: 'dallas_tx', phone: '(972) 555-1103', vertical: 'both' },
      { company: 'Lone Star Striping', city: 'Plano', state: 'TX', market: 'dallas_tx', phone: '(972) 555-1204', vertical: 'striping' },
      { company: 'Republic Paving Solutions', city: 'Dallas', state: 'TX', market: 'dallas_tx', phone: '(214) 555-1305', vertical: 'paving' },
      { company: 'Southwest Commercial Paving', city: 'Grand Prairie', state: 'TX', market: 'dallas_tx', phone: '(972) 555-1406', vertical: 'paving' },
      { company: 'Metroplex Line Marking', city: 'Fort Worth', state: 'TX', market: 'dallas_tx', phone: '(817) 555-1507', vertical: 'striping' },
      { company: 'Big D Asphalt', city: 'Garland', state: 'TX', market: 'dallas_tx', phone: '(972) 555-1608', vertical: 'paving' },
      // Phoenix
      { company: 'SunState Paving', city: 'Phoenix', state: 'AZ', market: 'phoenix_az', phone: '(602) 555-1701', vertical: 'paving' },
      { company: 'Desert Heat Asphalt', city: 'Scottsdale', state: 'AZ', market: 'phoenix_az', phone: '(480) 555-1802', vertical: 'paving' },
      { company: 'Arizona Commercial Paving', city: 'Mesa', state: 'AZ', market: 'phoenix_az', phone: '(480) 555-1903', vertical: 'both' },
      { company: 'Valley Wide Striping', city: 'Tempe', state: 'AZ', market: 'phoenix_az', phone: '(480) 555-2004', vertical: 'striping' },
      { company: 'Phoenix Pavement Solutions', city: 'Phoenix', state: 'AZ', market: 'phoenix_az', phone: '(602) 555-2105', vertical: 'paving' },
      { company: 'Southwest Asphalt Group', city: 'Chandler', state: 'AZ', market: 'phoenix_az', phone: '(480) 555-2206', vertical: 'paving' },
      { company: 'Grand Canyon Paving', city: 'Peoria', state: 'AZ', market: 'phoenix_az', phone: '(623) 555-2307', vertical: 'paving' },
      { company: 'AZ Line Striping Co', city: 'Gilbert', state: 'AZ', market: 'phoenix_az', phone: '(480) 555-2408', vertical: 'striping' },
    ];

    for (const s of SAMPLE_COMPANIES) {
      const domain = s.company.toLowerCase().replace(/[^a-z0-9]/g, '') + '.com';
      prospects.push({
        ...s,
        website: `https://${domain}`,
        address: '',
        source: 'sample',
        email_guess_1: `info@${domain}`,
        email_guess_2: `contact@${domain}`,
        yelp_rating: 0,
        yelp_reviews: 0,
        yelp_url: '',
      });
    }
  }

  // Write CSV
  const outputDir = path.join(process.cwd(), 'data');
  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

  const csvHeaders = [
    'company', 'vertical', 'phone', 'website', 'address', 'city', 'state',
    'market', 'email_guess_1', 'email_guess_2', 'yelp_rating', 'yelp_reviews',
    'yelp_url', 'source',
  ];

  const csvRows = prospects.map((p) =>
    csvHeaders.map((h) => {
      const val = String(p[h as keyof Prospect] ?? '');
      return val.includes(',') ? `"${val}"` : val;
    }).join(',')
  );

  const csv = [csvHeaders.join(','), ...csvRows].join('\n');
  const csvPath = path.join(outputDir, 'prospects.csv');
  fs.writeFileSync(csvPath, csv);

  // Also write JSON for DB import
  const jsonPath = path.join(outputDir, 'prospects.json');
  fs.writeFileSync(jsonPath, JSON.stringify(prospects, null, 2));

  console.log(`\n✅ Prospect list built:`);
  console.log(`   Total: ${prospects.length} companies`);
  console.log(`   Paving: ${prospects.filter((p) => p.vertical === 'paving' || p.vertical === 'both').length}`);
  console.log(`   Striping: ${prospects.filter((p) => p.vertical === 'striping' || p.vertical === 'both').length}`);
  console.log(`\n📁 Saved to:`);
  console.log(`   ${csvPath}  ← import to Instantly.ai`);
  console.log(`   ${jsonPath}  ← import to database`);
  console.log(`\n💌 Cold email template ready in docs/cold-email-template.md`);
}

main().catch(console.error);
