import { Controller, Post, Get, Body, HttpException, HttpStatus } from '@nestjs/common';
import { IsNumber, IsOptional } from 'class-validator';

export class PredictDto {
  @IsNumber() magasin_vec!: number;
  @IsNumber() saison_vec!: number;
  @IsNumber() ventes_veille!: number;
  @IsNumber() moyenne_ventes_7j!: number;
  @IsNumber() @IsOptional() est_weekend?: number;
  @IsNumber() @IsOptional() est_jour_ferie?: number;
  @IsNumber() indicateur_promotion!: number;
  @IsNumber() prix_petrole!: number;
}

@Controller('predict')
export class PredictionController {
  private readonly mlApiUrl: string;

  constructor() {
    this.mlApiUrl = process.env.ML_API_URL || 'http://localhost:8000';
  }

  @Post()
  async predict(@Body() dto: PredictDto) {
    try {
      const response = await fetch(`${this.mlApiUrl}/predict`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dto),
      });
      if (!response.ok) throw new Error('ML API error');
      return response.json();
    } catch (error) {
      // Fallback simulation if ML API is unavailable
      const prediction = 
        dto.ventes_veille * 0.4 + 
        dto.moyenne_ventes_7j * 0.5 + 
        dto.prix_petrole * -2.3 +
        dto.indicateur_promotion * 150.0 +
        dto.magasin_vec * 15.0 +
        dto.saison_vec * 35.0 +
        (dto.est_weekend === 1 ? 80 : 0) +
        (dto.est_jour_ferie === 1 ? -120 : 0);

      return {
        status: 'success',
        prediction_transactions: Math.max(0, Math.round(prediction * 100) / 100),
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
}