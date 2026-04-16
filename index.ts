/**
 * motomarks-js — Official JavaScript/TypeScript client for the Motomarks API
 * 420+ automotive brands, CDN-delivered logos in multiple formats and sizes.
 *
 * @see https://motomarks.io/docs
 */

// ─── Types ───────────────────────────────────────────────────────────────────

export type LogoFormat = 'full' | 'badge' | 'wordmark';
export type LogoSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl';
export type LogoType = 'png' | 'webp' | 'avif';

export interface MotomarksOptions {
  /** Your Motomarks API token. Get one free at https://motomarks.io */
  token: string;
  /** Base URL override — defaults to https://img.motomarks.io */
  baseUrl?: string;
  /** API base URL — defaults to https://api.motomarks.io */
  apiUrl?: string;
  /** Request timeout in milliseconds — defaults to 10000 */
  timeout?: number;
}

export interface LogoUrlOptions {
  /** Logo format: full logo, badge/emblem, or wordmark text. Defaults to 'full'. */
  format?: LogoFormat;
  /** Image size. Defaults to 'md'. */
  size?: LogoSize;
  /** Image type/format. Defaults to 'webp'. */
  type?: LogoType;
}

export interface MakeResult {
  /** URL-safe slug identifier (e.g. 'toyota', 'mercedes-benz') */
  slug: string;
  /** Display name of the brand */
  name: string;
  /** Country of origin */
  country?: string;
  /** Year the brand was founded */
  founded?: number;
  /** Available logo formats for this brand */
  formats: LogoFormat[];
  /** Whether this brand is active/current */
  active: boolean;
  /** CDN URL for the default logo */
  logoUrl: string;
}

export interface SearchResult {
  makes: MakeResult[];
  total: number;
  query: string;
}

export interface MotomarksError extends Error {
  status?: number;
  code?: string;
}

// ─── Size pixel map (for reference) ─────────────────────────────────────────

export const SIZE_PIXELS: Record<LogoSize, number> = {
  xs: 32,
  sm: 64,
  md: 128,
  lg: 256,
  xl: 512,
  xxl: 1024,
};

// ─── Client ──────────────────────────────────────────────────────────────────

export class MotomarksClient {
  private readonly token: string;
  private readonly baseUrl: string;
  private readonly apiUrl: string;
  private readonly timeout: number;

  constructor(options: MotomarksOptions) {
    if (!options.token) {
      throw new Error(
        '[motomarks] API token is required. Get yours free at https://motomarks.io'
      );
    }

    this.token = options.token;
    this.baseUrl = (options.baseUrl ?? 'https://img.motomarks.io').replace(/\/$/, '');
    this.apiUrl = (options.apiUrl ?? 'https://api.motomarks.io').replace(/\/$/, '');
    this.timeout = options.timeout ?? 10_000;
  }

  // ── URL Builder ─────────────────────────────────────────────────────────

  /**
   * Build a CDN logo URL for a given make slug.
   *
   * @example
   * client.getLogoUrl('toyota')
   * // → 'https://img.motomarks.io/toyota?token=YOUR_KEY&format=full&size=md&type=webp'
   *
   * client.getLogoUrl('bmw', { format: 'badge', size: 'lg', type: 'avif' })
   * // → 'https://img.motomarks.io/bmw?token=YOUR_KEY&format=badge&size=lg&type=avif'
   */
  getLogoUrl(slug: string, options: LogoUrlOptions = {}): string {
    const { format = 'full', size = 'md', type = 'webp' } = options;
    const params = new URLSearchParams({
      token: this.token,
      format,
      size,
      type,
    });
    return `${this.baseUrl}/${encodeURIComponent(slug)}?${params}`;
  }

  // ── API Methods ──────────────────────────────────────────────────────────

  /**
   * Fetch metadata for a specific automotive make by its slug.
   *
   * @param slug - URL-safe brand slug (e.g. 'toyota', 'mercedes-benz', 'rolls-royce')
   *
   * @example
   * const make = await client.getMake('ferrari');
   * console.log(make.name);    // "Ferrari"
   * console.log(make.country); // "Italy"
   * console.log(make.logoUrl); // CDN URL
   */
  async getMake(slug: string): Promise<MakeResult> {
    const data = await this.fetch<{ make: MakeResult }>(`/makes/${encodeURIComponent(slug)}`);
    return {
      ...data.make,
      logoUrl: this.getLogoUrl(slug),
    };
  }

  /**
   * Search for automotive makes by name or keyword.
   *
   * @param query - Search string (e.g. 'mer' matches Mercedes-Benz, Mercury, etc.)
   *
   * @example
   * const results = await client.searchMakes('ford');
   * results.makes.forEach(make => {
   *   console.log(`${make.name}: ${make.logoUrl}`);
   * });
   */
  async searchMakes(query: string): Promise<SearchResult> {
    const params = new URLSearchParams({ q: query });
    const data = await this.fetch<{ makes: MakeResult[]; total: number }>(
      `/makes/search?${params}`
    );
    return {
      makes: data.makes.map((make) => ({
        ...make,
        logoUrl: this.getLogoUrl(make.slug),
      })),
      total: data.total,
      query,
    };
  }

  /**
   * Fetch all available makes (paginated).
   *
   * @param page - Page number (1-indexed, default: 1)
   * @param limit - Results per page (default: 50, max: 100)
   */
  async listMakes(page = 1, limit = 50): Promise<SearchResult> {
    const params = new URLSearchParams({
      page: String(page),
      limit: String(Math.min(limit, 100)),
    });
    const data = await this.fetch<{ makes: MakeResult[]; total: number }>(`/makes?${params}`);
    return {
      makes: data.makes.map((make) => ({
        ...make,
        logoUrl: this.getLogoUrl(make.slug),
      })),
      total: data.total,
      query: '',
    };
  }

  // ── Internal ─────────────────────────────────────────────────────────────

  private async fetch<T>(path: string): Promise<T> {
    const url = `${this.apiUrl}${path}`;
    const separator = url.includes('?') ? '&' : '?';

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(`${url}${separator}token=${this.token}`, {
        signal: controller.signal,
        headers: {
          Accept: 'application/json',
          'User-Agent': 'motomarks-js/1.0.0',
        },
      });

      if (!response.ok) {
        const err: MotomarksError = new Error(
          `[motomarks] API error ${response.status}: ${response.statusText}`
        );
        err.status = response.status;
        throw err;
      }

      return response.json() as Promise<T>;
    } finally {
      clearTimeout(timer);
    }
  }
}

// ─── Convenience factory ──────────────────────────────────────────────────────

/**
 * Create a Motomarks API client.
 *
 * @example
 * import { createClient } from 'motomarks-js';
 *
 * const motomarks = createClient({ token: 'YOUR_API_KEY' });
 * const make = await motomarks.getMake('toyota');
 */
export function createClient(options: MotomarksOptions): MotomarksClient {
  return new MotomarksClient(options);
}

// Default export for simpler imports
export default createClient;
