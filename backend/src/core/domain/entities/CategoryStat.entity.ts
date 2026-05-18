export class CategoryStatEntity {
  constructor(
    public readonly categoryGroup: string,
    public readonly totalSales: number,
    public readonly percentage: number,
    public readonly transactionCount: number,
  ) {}

  static fromDatabricks(data: {
    categorie_groupe: string;
    totalSales: number;
    percentage: number;
    transactionCount?: number;
  }): CategoryStatEntity {
    return new CategoryStatEntity(
      data.categorie_groupe,
      Number(data.totalSales) ?? 0,
      Number(data.percentage) ?? 0,
      data.transactionCount ?? 0,
    );
  }

  toJSON() {
    return {
      categoryGroup: this.categoryGroup,
      totalSales: this.totalSales,
      percentage: this.percentage,
      transactionCount: this.transactionCount,
    };
  }
}