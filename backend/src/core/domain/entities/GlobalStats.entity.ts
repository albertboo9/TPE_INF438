export class GlobalStatsEntity {
  constructor(
    public readonly totalRevenue: number,
    public readonly totalVolume: number,
    public readonly promotionImpact: number,
    public readonly promotionPercentage: number,
    public readonly transactionCount?: number,
  ) {}

  static create(data: {
    totalRevenue: number;
    totalVolume: number;
    promotionImpact: number;
    promotionPercentage: number;
    transactionCount?: number;
  }): GlobalStatsEntity {
    return new GlobalStatsEntity(
      data.totalRevenue ?? 0,
      data.totalVolume ?? 0,
      data.promotionImpact ?? 0,
      data.promotionPercentage ?? 0,
      data.transactionCount,
    );
  }

  toJSON() {
    return {
      totalRevenue: this.totalRevenue,
      totalVolume: this.totalVolume,
      promotionImpact: this.promotionImpact,
      promotionPercentage: this.promotionPercentage,
      transactionCount: this.transactionCount,
    };
  }
}