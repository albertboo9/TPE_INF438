import { Controller, Post, Get, Body, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { IsString, IsNumber, IsOptional, Min, Max } from 'class-validator';
import { OilPriceService } from '../../infrastructure/adapters/external/OilPriceService';

// ─────────────────────────────────────────────
// DTOs
// ─────────────────────────────────────────────

/** Ancien modèle (features numériques) */
export class PredictV1Dto {
  @IsNumber() @Min(0) @Max(53) magasin_index!: number;
  @IsNumber() @Min(0) famille_index!: number;
  @IsNumber() @Min(0) @Max(3) saison_index!: number;
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

/** Nouveau modèle (features métier J+45) */
export class PredictV2Dto {
  @IsString() numero_magasin!: string;
  @IsString() numero_produit!: string;
  @IsString() famille!: string;
  @IsOptional() @IsString() saison?: string;
  @IsNumber() @Min(0) @Max(1) est_perissable!: number;
  @IsNumber() @IsOptional() @Min(0) @Max(1) est_weekend?: number;
  @IsNumber() @IsOptional() @Min(0) @Max(1) est_jour_ferie?: number;
  @IsNumber() @Min(0) @Max(1) indicateur_promotion!: number;
  @IsOptional() @IsNumber() prix_petrole?: number;
  @IsNumber() ventes_veille_produit!: number;
  @IsNumber() moyenne_7j_produit!: number;
}

/** Prédiction catégorie (bottom-to-up) */
export class PredictCategoryDto {
  @IsString() numero_magasin!: string;
  @IsString() famille!: string;
  @IsOptional() @IsString() saison?: string;
  @IsNumber() @Min(0) @Max(1) indicateur_promotion!: number;
  @IsOptional() @IsNumber() prix_petrole?: number;
  /** Liste des produits de la catégorie avec leurs historiques */
  @IsString() produits_json!: string; // JSON array
}

/** Type pour une prédiction produit dans une catégorie */
interface ProduitPrediction {
  numero_produit: string;
  ventes_veille_produit: number;
  moyenne_7j_produit: number;
  est_perissable: number;
}

interface ProduitPredictResult {
  numero_produit: string;
  prediction: number;
  unite: string;
  source?: string;
}

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

const SAISONS: ReadonlyArray<{mois: ReadonlyArray<number>; nom: string}> = [
  { mois: [12, 1, 2], nom: 'HIVER' },
  { mois: [3, 4, 5], nom: 'PRINTEMPS' },
  { mois: [6, 7, 8], nom: 'ETE' },
  { mois: [9, 10, 11], nom: 'AUTOMNE' },
];

function getSaison(date: Date): string {
  const m = date.getMonth() + 1;
  const found = SAISONS.find(s => s.mois.includes(m));
  return found ? found.nom : 'ETE';
}

function formatDate(date: Date): string {
  const parts = date.toISOString().split('T');
  return parts[0] || '';
}

function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function getDayOfWeek(date: Date): number {
  return date.getDay();
}

function isWeekend(date: Date): number {
  const d = getDayOfWeek(date);
  return (d === 0 || d === 6) ? 1 : 0;
}

// ─────────────────────────────────────────────
// Mapping magasin: store_nbr → MAG_XXX
// ─────────────────────────────────────────────
function buildMagasinMaps(): { direct: Map<number, string>; reverse: Map<string, number> } {
  const direct = new Map<number, string>();
  const reverse = new Map<string, number>();
  for (let n = 1; n <= 54; n++) {
    const key = `MAG_${String(n).padStart(3, '0')}`;
    direct.set(n, key);
    reverse.set(key, n);
  }
  return { direct, reverse };
}

const MAGASIN_REVERSE = buildMagasinMaps().reverse;

// ─────────────────────────────────────────────
// Controller
// ─────────────────────────────────────────────

@Controller('predict')
export class PredictionController {
  private readonly logger = new Logger(PredictionController.name);
  private readonly mlApiUrlV1: string;
  private readonly mlApiUrlV2: string;

  constructor(private readonly oilPriceService: OilPriceService) {
    this.mlApiUrlV1 = process.env.ML_API_URL || 'https://kenfac-ventep.hf.space';
    this.mlApiUrlV2 = process.env.ML_API_URL_V2 || 'https://Allawaipedemgue-Projet-Api1.hf.space';
  }

  // ═══════════════════════════════════════════
  //  ANCIEN MODÈLE V1 (features numériques)
  // ═══════════════════════════════════════════

  @Post('v1')
  async predictV1(@Body() dto: PredictV1Dto) {
    this.logger.log(`[V1] Prédiction avec features numériques (magasin_index=${dto.magasin_index})`);
    
    try {
      const response = await fetch(`${this.mlApiUrlV1}/predict`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dto),
      });

      if (!response.ok) {
        throw new Error(`ML API V1 error (${response.status})`);
      }

      const result = await response.json() as { prediction: number; status: string };
      
      return {
        status: 'success',
        prediction: parseFloat(result.prediction.toFixed(2)),
        model: 'random-forest-v1',
        model_type: 'numeric_features',
        source: 'ml_api_v1',
      };
    } catch (error) {
      // Fallback local
      const prediction = this.fallbackV1(dto);
      return {
        status: 'success',
        prediction,
        model: 'random-forest-v1',
        model_type: 'numeric_features',
        source: 'fallback_local',
        warning: `API V1 indisponible, calcul local utilisé: ${(error as Error).message}`,
      };
    }
  }

  private fallbackV1(dto: PredictV1Dto): number {
    return Math.max(0, Math.round(
      (dto.ventes_veille_produit * 0.35 +
       dto.moyenne_7j_produit * 0.45 +
       dto.nb_transactions * 0.01 +
       dto.indicateur_promotion * 3.0 +
       dto.prix_petrole * -0.02 +
       (dto.est_perissable ?? 0) * 2.0 +
       (dto.est_weekend === 1 ? 0.5 : 0) +
       (dto.est_jour_ferie === 1 ? -0.8 : 0)) * 100
    ) / 100);
  }

  // ═══════════════════════════════════════════
  //  NOUVEAU MODÈLE V2 (features métier J+45)
  // ═══════════════════════════════════════════

  @Post('v2')
  async predictV2(@Body() dto: PredictV2Dto) {
    this.logger.log(`[V2] Prédiction J+45: ${dto.numero_produit} dans ${dto.numero_magasin} (${dto.famille})`);

    // 1. Calculer la date J+45 et les paramètres calendaires
    const aujourdhui = new Date();
    const dateJplus45 = addDays(aujourdhui, 45);
    const saison = dto.saison || getSaison(dateJplus45);
    const weekend = dto.est_weekend ?? isWeekend(dateJplus45);
    const jourFerie = dto.est_jour_ferie ?? 0;

    // 2. Récupérer le prix du pétrole en temps réel
    const prixPetrole = dto.prix_petrole ?? await this.oilPriceService.getCurrentPrice();

    // 3. Construire le payload pour l'API V2
    const payload = {
      numero_magasin: dto.numero_magasin,
      numero_produit: dto.numero_produit,
      famille: dto.famille,
      saison,
      est_perissable: dto.est_perissable,
      est_weekend: weekend,
      est_jour_ferie: jourFerie,
      indicateur_promotion: dto.indicateur_promotion,
      prix_petrole: prixPetrole,
      ventes_veille_produit: dto.ventes_veille_produit,
      moyenne_7j_produit: dto.moyenne_7j_produit,
    };

    this.logger.log(`[V2] Payload envoyé: J+45=${formatDate(dateJplus45)}, saison=${saison}, weekend=${weekend}, pétrole=$${prixPetrole}`);

    try {
      const response = await fetch(`${this.mlApiUrlV2}/predict`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`ML API V2 error (${response.status})`);
      }

      const result = await response.json() as { prediction: number; status: string; unite?: string };

      return {
        status: 'success',
        prediction: parseFloat(result.prediction.toFixed(2)),
        unite: result.unite || 'unités',
        model: 'random-forest-v2-j45',
        model_type: 'business_features',
        source: 'ml_api_v2',
        date_prediction: formatDate(dateJplus45),
        saison,
        calendrier: {
          aujourdhui: formatDate(aujourdhui),
          jour_estime: formatDate(dateJplus45),
          saison_estimee: saison,
          weekend: weekend === 1,
          jour_ferie: jourFerie === 1,
        },
        input: payload,
      };
    } catch (error) {
      // Fallback: utiliser le modèle V1 comme backup
      this.logger.warn(`[V2] API V2 indisponible, fallback V1 : ${(error as Error).message}`);
      return this.fallbackToV1(dto, saison, weekend, jourFerie, prixPetrole, dateJplus45);
    }
  }

  /**
   * Fallback V2 → V1 : convertir les features métier en features numériques
   * pour utiliser l'ancien modèle comme backup
   */
  private async fallbackToV1(
    dto: PredictV2Dto,
    saison: string,
    weekend: number,
    jourFerie: number,
    prixPetrole: number,
    dateJplus45: Date,
  ): Promise<Record<string, unknown>> {
    // Mapping magasin: MAG_001 → 0, MAG_002 → 1, etc.
    const magasinIndex = MAGASIN_REVERSE.get(dto.numero_magasin) ?? 0;
    
    // Mapping famille (approximatif depuis les données connues)
    const familleMap: Record<string, number> = {
      'DAIRY': 0, 'BEVERAGES': 1, 'MEAT': 2, 'GROCERY': 3,
      'BREAD/BAKERY': 4, 'PRODUCE': 5, 'DELI': 6, 'FROZEN FOODS': 7,
      'CLEANING': 8, 'PERSONAL CARE': 9, 'BABY CARE': 10, 'PET SUPPLIES': 11,
      'HOME CARE': 12, 'ELECTRONICS': 13, 'CLOTHING': 14, 'BOOKS': 15,
    };
    const familleIndex = familleMap[dto.famille] ?? 0;
    
    // Mapping saison
    const saisonMap: Record<string, number> = {
      'HIVER': 1, 'PRINTEMPS': 2, 'ETE': 3, 'AUTOMNE': 4,
    };
    const saisonIndex = saisonMap[saison] ?? 3;

    const v1Payload: PredictV1Dto = {
      magasin_index: magasinIndex,
      famille_index: familleIndex,
      saison_index: saisonIndex,
      ventes_veille: 0,
      moyenne_ventes_7j: 0,
      est_weekend: weekend,
      est_jour_ferie: jourFerie,
      indicateur_promotion: dto.indicateur_promotion,
      prix_petrole: prixPetrole,
      nb_transactions: 0,
      ventes_veille_produit: dto.ventes_veille_produit,
      moyenne_7j_produit: dto.moyenne_7j_produit,
      est_perissable: dto.est_perissable,
    };

    try {
      const response = await fetch(`${this.mlApiUrlV1}/predict`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(v1Payload),
      });

      if (response.ok) {
        const result = await response.json() as { prediction: number };
        return {
          status: 'success',
          prediction: parseFloat(result.prediction.toFixed(2)),
          unite: 'unités',
          model: 'random-forest-v1',
          model_type: 'fallback_v1',
          source: 'fallback_to_v1',
          date_prediction: formatDate(dateJplus45),
          saison,
          calendrier: {
            aujourdhui: formatDate(new Date()),
            jour_estime: formatDate(dateJplus45),
            saison_estimee: saison,
          },
          warning: 'API V2 indisponible, prédiction via fallback V1',
        };
      }
    } catch {
      // Silent fail, on continue vers le fallback local
    }

    // Dernier recours : calcul local
    const localPrediction = Math.max(0, Math.round(
      (dto.ventes_veille_produit * 0.35 +
       dto.moyenne_7j_produit * 0.45 +
       dto.indicateur_promotion * 3.0 +
       prixPetrole * -0.02 +
       dto.est_perissable * 2.0 +
       (weekend === 1 ? 0.5 : 0) +
       (jourFerie === 1 ? -0.8 : 0)) * 100
    ) / 100);

    return {
      status: 'success',
      prediction: localPrediction,
      unite: 'unités',
      model: 'fallback-local',
      model_type: 'local_calculation',
      source: 'fallback_local',
      date_prediction: formatDate(dateJplus45),
      saison,
      calendrier: {
        aujourdhui: formatDate(new Date()),
        jour_estime: formatDate(dateJplus45),
        saison_estimee: saison,
      },
      warning: 'Modèles API indisponibles, calcul local utilisé',
    };
  }

  // ═══════════════════════════════════════════
  //  PRÉDICTION PAR CATÉGORIE (Bottom-to-Up)
  // ═══════════════════════════════════════════

  @Post('category')
  async predictCategory(@Body() dto: PredictCategoryDto) {
    this.logger.log(`[CATEGORY] Prédiction J+45 pour la catégorie ${dto.famille} dans ${dto.numero_magasin}`);

    let produits: ProduitPrediction[];

    try {
      produits = JSON.parse(dto.produits_json) as ProduitPrediction[];
    } catch {
      throw new HttpException('produits_json doit être un JSON valide', HttpStatus.BAD_REQUEST);
    }

    if (!Array.isArray(produits) || produits.length === 0) {
      throw new HttpException('La liste des produits ne peut pas être vide', HttpStatus.BAD_REQUEST);
    }

    const predictions: ProduitPredictResult[] = [];
    for (const produit of produits) {
      const pred = await this.predictV2({
        numero_magasin: dto.numero_magasin,
        numero_produit: produit.numero_produit,
        famille: dto.famille,
        saison: dto.saison,
        est_perissable: produit.est_perissable,
        indicateur_promotion: dto.indicateur_promotion,
        prix_petrole: dto.prix_petrole,
        ventes_veille_produit: produit.ventes_veille_produit,
        moyenne_7j_produit: produit.moyenne_7j_produit,
      });
      predictions.push({
        numero_produit: produit.numero_produit,
        prediction: pred.prediction as number,
        unite: (pred.unite as string) || 'unités',
        source: pred.source as string,
      });
    }

    const totalCategorie = predictions.reduce((sum, p) => sum + p.prediction, 0);

    return {
      status: 'success',
      famille: dto.famille,
      numero_magasin: dto.numero_magasin,
      total_categorie: parseFloat(totalCategorie.toFixed(2)),
      unite: 'unités',
      produits: predictions,
      nombre_produits: predictions.length,
      date_prediction: formatDate(addDays(new Date(), 45)),
      source: predictions[0] ? (predictions[0].source || 'composite') : 'composite',
    };
  }

  // ═══════════════════════════════════════════
  //  ENDPOINTS UTILITAIRES
  // ═══════════════════════════════════════════

  @Get('calendar')
  async getCalendarInfo() {
    const aujourdhui = new Date();
    const dateJplus45 = addDays(aujourdhui, 45);
    
    return {
      aujourdhui: formatDate(aujourdhui),
      jour_semaine: ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'][aujourdhui.getDay()],
      jplus45: formatDate(dateJplus45),
      jour_semaine_jplus45: ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'][dateJplus45.getDay()],
      saison_jplus45: getSaison(dateJplus45),
      est_weekend_jplus45: isWeekend(dateJplus45) === 1,
      horizon_jours: 45,
    };
  }

  @Get('oil-price')
  async getOilPrice() {
    const price = await this.oilPriceService.getCurrentPrice();
    return {
      status: 'success',
      prix_petrole: price,
      unite: 'USD/baril',
      source: price === 80.0 ? 'default_fallback' : 'api_or_cache',
    };
  }

  @Get('models')
  async getModelsInfo() {
    return {
      models: [
        {
          id: 'v1',
          name: 'Random Forest V1 - Features Numériques',
          endpoint: `${this.mlApiUrlV1}/predict`,
          features: [
            'magasin_index', 'famille_index', 'saison_index',
            'ventes_veille', 'moyenne_ventes_7j', 'est_weekend',
            'est_jour_ferie', 'indicateur_promotion', 'prix_petrole',
            'nb_transactions', 'ventes_veille_produit', 'moyenne_7j_produit', 'est_perissable',
          ],
          horizon: 'non spécifié',
          unit: 'non spécifiée',
        },
        {
          id: 'v2',
          name: 'Random Forest V2 - Features Métier J+45',
          endpoint: `${this.mlApiUrlV2}/predict`,
          features: [
            'numero_magasin', 'numero_produit', 'famille',
            'saison', 'est_perissable', 'est_weekend',
            'est_jour_ferie', 'indicateur_promotion', 'prix_petrole',
            'ventes_veille_produit', 'moyenne_7j_produit',
          ],
          horizon: 'J+45',
          unit: 'unités',
        },
      ],
      endpoints_disponibles: [
        { path: '/predict/v1', method: 'POST', description: 'Ancien modèle (features numériques)' },
        { path: '/predict/v2', method: 'POST', description: 'Nouveau modèle J+45 (features métier)' },
        { path: '/predict/category', method: 'POST', description: 'Prédiction catégorie (bottom-to-up)' },
        { path: '/predict/calendar', method: 'GET', description: 'Info calendrier J+45' },
        { path: '/predict/oil-price', method: 'GET', description: 'Prix du pétrole actuel' },
        { path: '/predict/models', method: 'GET', description: 'Info sur les modèles' },
        { path: '/predict/health', method: 'GET', description: 'Santé des APIs ML' },
      ],
    };
  }

  @Get('health')
  async health() {
    const results: Record<string, string> = {};
    
    // Test V1
    try {
      const r = await fetch(`${this.mlApiUrlV1}/`);
      results.v1 = r.ok ? 'online' : `error_${r.status}`;
    } catch {
      results.v1 = 'offline';
    }

    // Test V2
    try {
      const r = await fetch(`${this.mlApiUrlV2}/`);
      results.v2 = r.ok ? 'online' : `error_${r.status}`;
    } catch {
      results.v2 = 'offline';
    }

    try {
      const price = await this.oilPriceService.getCurrentPrice();
      results.oil_price_api = price !== 80.0 ? 'online' : 'using_default';
    } catch {
      results.oil_price_api = 'offline';
    }

    return {
      status: results.v2 === 'online' ? 'operational' : 'degraded',
      models: results,
      timestamp: new Date().toISOString(),
    };
  }

  // Garder la compatibilité avec l'ancien endpoint POST /predict (sans version)
  @Post()
  async predictLegacy(@Body() body: Record<string, unknown>) {
    // Détection automatique du format
    if (body.numero_magasin && body.numero_produit) {
      // C'est du V2
      const dto = Object.assign(new PredictV2Dto(), body);
      return this.predictV2(dto);
    } else {
      // C'est du V1
      const dto = Object.assign(new PredictV1Dto(), body);
      return this.predictV1(dto);
    }
  }
}