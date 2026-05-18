export class StoreStatEntity {
  constructor(
    public readonly storeType: string,
    public readonly city: string,
    public readonly totalSales: number,
    public readonly storeCount: number,
    public readonly averageSalesPerStore: number,
  ) {}

  static fromDatabricks(data: {
    type_magasin: string;
    ville: string;
    totalSales: number;
    storeCount: number;
  }): StoreStatEntity {
    return new StoreStatEntity(
      data.type_magasin,
      data.ville,
      Number(data.totalSales) ?? 0,
      Number(data.storeCount) ?? 0,
      Number(data.totalSales) / Math.max(Number(data.storeCount), 1),
    );
  }

  toJSON() {
    return {
      storeType: this.storeType,
      city: this.city,
      totalSales: this.totalSales,
      storeCount: this.storeCount,
      averageSalesPerStore: this.averageSalesPerStore,
    };
  }
}