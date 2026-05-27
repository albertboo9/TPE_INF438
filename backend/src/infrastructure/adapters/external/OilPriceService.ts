import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class OilPriceService {
  private readonly logger = new Logger(OilPriceService.name);
  private cachedPrice: number | null = null;
  private lastFetchTime: number = 0;
  private readonly cacheTtl: number;
  private readonly apiUrl: string;
  private readonly apiKey: string;

  constructor() {
    this.apiUrl = process.env.OIL_PRICE_API_URL || 'https://api.api-ninjas.com/v1/oilprice';
    this.apiKey = process.env.OIL_PRICE_API_KEY || '';
    this.cacheTtl = parseInt(process.env.OIL_PRICE_CACHE_TTL || '3600', 10) * 1000;
  }

  async getCurrentPrice(): Promise<number> {
    // Return cached price if still valid
    if (this.cachedPrice !== null && (Date.now() - this.lastFetchTime) < this.cacheTtl) {
      this.logger.log(`Using cached oil price: $${this.cachedPrice}/bbl`);
      return this.cachedPrice;
    }

    // Try external API
    if (this.apiKey) {
      try {
        const price = await this.fetchFromAPI();
        this.cachedPrice = price;
        this.lastFetchTime = Date.now();
        this.logger.log(`Oil price fetched from API: $${price}/bbl`);
        return price;
      } catch (error) {
        this.logger.warn(`Oil price API failed: ${(error as Error).message}`);
      }
    }

    // Fallback: return last cached value (even if expired)
    if (this.cachedPrice !== null) {
      this.logger.log(`Using expired cached oil price: $${this.cachedPrice}/bbl (API unavailable)`);
      return this.cachedPrice;
    }

    // Ultimate fallback: hardcoded default (average 2023-2026 ~$80)
    const defaultPrice = 80.0;
    this.logger.log(`Using default oil price: $${defaultPrice}/bbl (no cache, no API key)`);
    return defaultPrice;
  }

  private async fetchFromAPI(): Promise<number> {
    const response = await fetch(this.apiUrl, {
      headers: {
        'X-Api-Key': this.apiKey,
      },
    });

    if (!response.ok) {
      throw new Error(`Oil price API returned ${response.status}: ${response.statusText}`);
    }

    const data = await response.json() as Record<string, unknown>;
    
    // API Ninjas returns: { value: number, ... }
    if (data && typeof (data as any).value === 'number') {
      return (data as any).value;
    }

    // Alternative: try { price: number }
    if (data && typeof (data as any).price === 'number') {
      return (data as any).price;
    }

    throw new Error('Unexpected oil price API response format');
  }

  /**
   * Force refresh the cached oil price
   */
  async refreshPrice(): Promise<number> {
    this.cachedPrice = null;
    this.lastFetchTime = 0;
    return this.getCurrentPrice();
  }
}