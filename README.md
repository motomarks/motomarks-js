# motomarks-js

> The official JavaScript/TypeScript client for [Motomarks](https://motomarks.io) — automotive logos for 420+ brands, delivered via CDN in milliseconds.

[![npm version](https://img.shields.io/npm/v/motomarks-js.svg?style=flat-square)](https://www.npmjs.com/package/motomarks-js)
[![npm downloads](https://img.shields.io/npm/dm/motomarks-js.svg?style=flat-square)](https://www.npmjs.com/package/motomarks-js)
[![TypeScript](https://img.shields.io/badge/TypeScript-ready-blue.svg?style=flat-square)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](./LICENSE)

```ts
import { createClient } from 'motomarks-js';

const motomarks = createClient({ token: 'YOUR_API_KEY' });

// Get a logo URL — no fetch needed, instant.
const url = motomarks.getLogoUrl('ferrari', { format: 'badge', size: 'lg', type: 'webp' });
// → https://img.motomarks.io/ferrari?token=...&format=badge&size=lg&type=webp

// Or fetch rich metadata
const make = await motomarks.getMake('ferrari');
console.log(make.name);    // "Ferrari"
console.log(make.country); // "Italy"
```

---

## What is Motomarks?

[Motomarks](https://motomarks.io) is an automotive brand logo API. Point your `<img>` tag at it and get a crisp, CDN-optimised logo for any of 420+ car brands — right now, in the right format, at the right size.

- **420+ brands** — from Acura to Zastava
- **3 logo formats** — full logo, badge/emblem, wordmark
- **6 sizes** — xs (32px) through xxl (1024px)
- **3 image types** — PNG, WebP, AVIF
- **700+ CDN edge locations** — fast everywhere on earth
- **REST API + JSON metadata** — not just images
- **Free tier** — 1,000 requests/day, no credit card needed

---

## Installation

```bash
npm install motomarks-js
# or
yarn add motomarks-js
# or
pnpm add motomarks-js
```

**Requirements:** Node.js 16+ or any modern browser. Uses the native `fetch` API (no dependencies).

---

## Quick Start

```ts
import { createClient } from 'motomarks-js';

const motomarks = createClient({
  token: process.env.MOTOMARKS_API_KEY!,
});

// Build a logo URL (synchronous, no network call)
const logoUrl = motomarks.getLogoUrl('toyota');

// Fetch brand metadata
const toyota = await motomarks.getMake('toyota');

// Search brands
const results = await motomarks.searchMakes('mercedes');
results.makes.forEach(make => console.log(make.name, make.logoUrl));
```

Get your free API key at → **[motomarks.io](https://motomarks.io)**

---

## API Reference

### `createClient(options)`

Creates a new Motomarks client.

```ts
const motomarks = createClient({
  token: 'YOUR_API_KEY',   // required
  baseUrl: '...',          // optional: CDN URL override
  apiUrl: '...',           // optional: API URL override
  timeout: 10000,          // optional: request timeout ms
});
```

---

### `client.getLogoUrl(slug, options?)`

Build a logo URL **without** making a network request. Use this directly in `<img>` tags.

```ts
// Defaults: format=full, size=md, type=webp
motomarks.getLogoUrl('bmw')
// → https://img.motomarks.io/bmw?token=...&format=full&size=md&type=webp

motomarks.getLogoUrl('bmw', { format: 'badge', size: 'xl', type: 'avif' })
// → https://img.motomarks.io/bmw?token=...&format=badge&size=xl&type=avif
```

**Options:**

| Option   | Type                               | Default  | Description                  |
|----------|------------------------------------|----------|------------------------------|
| `format` | `'full' \| 'badge' \| 'wordmark'`  | `'full'` | Logo format variant          |
| `size`   | `'xs' \| 'sm' \| 'md' \| 'lg' \| 'xl' \| 'xxl'` | `'md'` | Image size     |
| `type`   | `'png' \| 'webp' \| 'avif'`        | `'webp'` | Image file format            |

**Size reference:**

| Size | Pixels |
|------|--------|
| `xs` | 32×32  |
| `sm` | 64×64  |
| `md` | 128×128 |
| `lg` | 256×256 |
| `xl` | 512×512 |
| `xxl` | 1024×1024 |

---

### `client.getMake(slug)`

Fetch metadata for a specific brand.

```ts
const make = await motomarks.getMake('rolls-royce');

console.log(make.slug);     // "rolls-royce"
console.log(make.name);     // "Rolls-Royce"
console.log(make.country);  // "United Kingdom"
console.log(make.founded);  // 1904
console.log(make.formats);  // ["full", "badge", "wordmark"]
console.log(make.active);   // true
console.log(make.logoUrl);  // CDN URL (auto-generated)
```

---

### `client.searchMakes(query)`

Search brands by name.

```ts
const { makes, total } = await motomarks.searchMakes('aston');

// makes → [{ slug: 'aston-martin', name: 'Aston Martin', ... }]
// total → 1
```

---

### `client.listMakes(page?, limit?)`

List all available brands (paginated).

```ts
const { makes, total } = await motomarks.listMakes(1, 50);
console.log(`Showing ${makes.length} of ${total} brands`);
```

---

## Examples

### Plain HTML — dead simple

```html
<img
  src="https://img.motomarks.io/ferrari?token=YOUR_KEY&format=badge&size=md&type=webp"
  alt="Ferrari logo"
  width="128"
  height="128"
/>
```

### Next.js / React

```tsx
import { createClient } from 'motomarks-js';

const motomarks = createClient({ token: process.env.MOTOMARKS_API_KEY! });

function CarLogo({ slug, name }: { slug: string; name: string }) {
  const src = motomarks.getLogoUrl(slug, {
    format: 'badge',
    size: 'lg',
    type: 'webp',
  });

  return (
    <img
      src={src}
      alt={`${name} logo`}
      width={256}
      height={256}
      loading="lazy"
    />
  );
}

// Usage
<CarLogo slug="lamborghini" name="Lamborghini" />
```

### React with `next/image` (optimized)

```tsx
import Image from 'next/image';
import { createClient } from 'motomarks-js';

const motomarks = createClient({ token: process.env.MOTOMARKS_API_KEY! });

export default function BrandGrid({ slugs }: { slugs: string[] }) {
  return (
    <div className="grid grid-cols-4 gap-4">
      {slugs.map((slug) => (
        <div key={slug} className="flex flex-col items-center gap-2">
          <Image
            src={motomarks.getLogoUrl(slug, { format: 'badge', size: 'xl', type: 'avif' })}
            alt={`${slug} logo`}
            width={128}
            height={128}
            className="object-contain"
          />
          <span className="text-sm capitalize">{slug.replace(/-/g, ' ')}</span>
        </div>
      ))}
    </div>
  );
}
```

### React hook for dynamic logo fetching

```tsx
import { useState, useEffect } from 'react';
import { createClient, type MakeResult } from 'motomarks-js';

const motomarks = createClient({ token: process.env.REACT_APP_MOTOMARKS_KEY! });

function useMake(slug: string) {
  const [make, setMake] = useState<MakeResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    setLoading(true);
    motomarks.getMake(slug)
      .then(setMake)
      .catch(setError)
      .finally(() => setLoading(false));
  }, [slug]);

  return { make, loading, error };
}

// Usage
function BrandCard({ slug }: { slug: string }) {
  const { make, loading, error } = useMake(slug);

  if (loading) return <div className="skeleton w-32 h-32" />;
  if (error) return null;

  return (
    <div className="brand-card">
      <img src={make!.logoUrl} alt={make!.name} />
      <h3>{make!.name}</h3>
      <p>{make!.country} · Est. {make!.founded}</p>
    </div>
  );
}
```

### Brand search with autocomplete

```tsx
import { useState } from 'react';
import { createClient, type MakeResult } from 'motomarks-js';

const motomarks = createClient({ token: process.env.MOTOMARKS_API_KEY! });

export function BrandSearch() {
  const [results, setResults] = useState<MakeResult[]>([]);

  async function handleSearch(query: string) {
    if (query.length < 2) return setResults([]);
    const { makes } = await motomarks.searchMakes(query);
    setResults(makes);
  }

  return (
    <div>
      <input
        type="search"
        placeholder="Search 420+ brands..."
        onChange={(e) => handleSearch(e.target.value)}
      />
      <ul>
        {results.map((make) => (
          <li key={make.slug} className="flex items-center gap-3">
            <img
              src={motomarks.getLogoUrl(make.slug, { format: 'badge', size: 'sm' })}
              alt=""
              width={32}
              height={32}
            />
            {make.name}
          </li>
        ))}
      </ul>
    </div>
  );
}
```

### Express.js proxy (server-side token protection)

```ts
import express from 'express';
import { createClient } from 'motomarks-js';

const app = express();
const motomarks = createClient({ token: process.env.MOTOMARKS_API_KEY! });

// Expose logo URLs without leaking your token to the browser
app.get('/api/logo/:slug', (req, res) => {
  const { format, size, type } = req.query as Record<string, string>;
  const url = motomarks.getLogoUrl(req.params.slug, { format, size, type } as any);
  res.redirect(url);
});

app.get('/api/makes/search', async (req, res) => {
  const { q } = req.query as { q: string };
  const results = await motomarks.searchMakes(q);
  res.json(results);
});
```

---

## Supported Brands (Sample)

Acura · Alfa Romeo · Aston Martin · Audi · Bentley · BMW · Bugatti · Buick · Cadillac · Chevrolet · Chrysler · Citroën · Dacia · Dodge · Ferrari · Fiat · Ford · Genesis · GMC · Honda · Hyundai · Infiniti · Jaguar · Jeep · Kia · Lamborghini · Land Rover · Lexus · Lincoln · Lotus · Maserati · Mazda · McLaren · Mercedes-Benz · MINI · Mitsubishi · Nissan · Pagani · Peugeot · Porsche · RAM · Renault · Rivian · Rolls-Royce · SEAT · ŠKODA · Subaru · Suzuki · Tesla · Toyota · Volkswagen · Volvo · and 370+ more...

→ Search the full brand list at [motomarks.io/browse](https://motomarks.io/browse)

---

## TypeScript Support

Full TypeScript support is built-in — no `@types` package needed.

```ts
import {
  createClient,
  type MotomarksClient,
  type MakeResult,
  type SearchResult,
  type LogoFormat,
  type LogoSize,
  type LogoType,
  type LogoUrlOptions,
  SIZE_PIXELS,
} from 'motomarks-js';
```

---

## Contributing

Issues and PRs welcome! → [github.com/motomarks/motomarks-js](https://github.com/motomarks/motomarks-js)

---

## License

MIT © [Motomarks](https://motomarks.io)
