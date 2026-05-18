export class TemporalDataEntity {
  constructor(
    public readonly date: string,
    public readonly sales: number,
    public readonly dayOfWeek: number,
    public readonly month: number,
    public readonly year: number,
    public readonly enPromotion: boolean,
  ) {}

  static fromDatabricks(data: {
    annee: number;
    mois: number;
    jour_semaine: number;
    ventes: number;
    en_promotion?: boolean;
  }): TemporalDataEntity {
    return new TemporalDataEntity(
      `${data.annee}-${String(data.mois).padStart(2, '0')}-${data.jour_semaine}`,
      Number(data.ventes) ?? 0,
      data.jour_semaine,
      data.mois,
      data.annee,
      data.en_promotion ?? false,
    );
  }

  toJSON() {
    return {
      date: this.date,
      sales: this.sales,
      dayOfWeek: this.dayOfWeek,
      month: this.month,
      year: this.year,
      enPromotion: this.enPromotion,
    };
  }
}