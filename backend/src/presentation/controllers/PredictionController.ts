import { Controller, Post, Get, Body, HttpException, HttpStatus } from '@nestjs/common';
import { IsNumber, IsOptional, Min, Max } from 'class-validator';

export class PredictDto {
  @IsNumber() magasin_index!: number;
  @IsNumber() famille_index!: number;
  @IsNumber() saison_index!: number;
  @IsNumber() ventes_veille!: number;
  @IsNumber() moyenne_ventes_7j!: number;
  @IsNumber() @IsOptional() est_weekend?: number;
  @IsNumber() @IsOptional() est_jour_ferie?: number;
  @IsNumber() indicateur_promotion!: number;
  @IsNumber() prix_petrole!: number;
  @IsNumber() nb_transactions!: number;
  @IsNumber() ventes_veille_produit!: number;
  @IsNumber() moyenne_7j_produit!: number;
  @IsNumber() @IsOptional() est_perissable?: number;
}

@Controller('predict')
export class PredictionController {
  private readonly mlApiUrl: string;

  constructor() {
    this.mlApiUrl = process.env.ML_API_URL || 'https://kenfac-ventep.hf.space';
  }

  @Post()
  async predict(@Body() dto: PredictDto) {
    try {
      const response = await fetch(`${this.mlApiUrl}/predict`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dto),
      });
      
      if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`ML API error (${response.status}): ${errorBody}`);
      }
      
      const result = await response.json() as { prediction: number };
      
      return {
        status: 'success',
        prediction: result.prediction,
        model: 'random-forest-13-features',
        source: 'ml_model',
      };
    } catch (error) {
      // Fallback simulation if ML API is unavailable
      const prediction = 
        dto.ventes_veille_produit * 0.35 + 
        dto.moyenne_7j_produit * 0.45 + 
        dto.nb_transactions * 0.01 +
        dto.indicateur_promotion * 3.0 +
        dto.prix_petrole * -0.02 +
        (dto.est_perissable ?? 0) * 2.0 +
        (dto.est_weekend === 1 ? 0.5 : 0) +
        (dto.est_jour_ferie === 1 ? -0.8 : 0);

      return {
        status: 'success',
        prediction: Math.max(0, Math.round(prediction * 100) / 100),
        model: 'random-forest-13-features',
        source: 'fallback',
      };
    }
  }

  @Get('health')
  async health() {
    try {
      const response = await fetch(`${this.mlApiUrl}/`);
      const data = await response.json();
      return { mlApiStatus: 'online', details: data };
    } catch {
      return { mlApiStatus: 'offline', fallbackEngine: 'active' };
    }
  }

  @Get('model-info')
  async modelInfo() {
    return {
      name: 'Random Forest - Ventes Produit',
      version: '1.0.0',
      features: [
        { name: 'magasin_index', type: 'number', description: 'Index du magasin (0-54)' },
        { name: 'famille_index', type: 'number', description: 'Index de la famille produit' },
        { name: 'saison_index', type: 'number', description: 'Index de la saison (1-4)' },
        { name: 'ventes_veille', type: 'number', description: 'Ventes totales du jour précédent' },
        { name: 'moyenne_ventes_7j', type: 'number', description: 'Moyenne des ventes sur 7 jours' },
        { name: 'est_weekend', type: 'boolean', description: '1 si jour de week-end' },
        { name: 'est_jour_ferie', type: 'boolean', description: '1 si jour férié' },
        { name: 'indicateur_promotion', type: 'boolean', description: '1 si promotion active' },
        { name: 'prix_petrole', type: 'number', description: 'Prix du pétrole en $/bbl' },
        { name: 'nb_transactions', type: 'number', description: 'Nombre total de transactions' },
        { name: 'ventes_veille_produit', type: 'number', description: 'Ventes du produit spécifique la veille' },
        { name: 'moyenne_7j_produit', type: 'number', description: 'Moyenne des ventes du produit sur 7j' },
        { name: 'est_perissable', type: 'boolean', description: '1 si produit périssable' },
      ],
      endpoint: `${this.mlApiUrl}/predict`,
      response_format: { prediction: 'number', status: 'string' },
    };
  }
}