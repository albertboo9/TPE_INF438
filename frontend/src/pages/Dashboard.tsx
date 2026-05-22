import React, { useState } from 'react';
import { GlassCard } from '../components/layout/GlassCard';
import { SkeletonLoader } from '../components/ui/SkeletonLoader';
import Button from '../components/ui/Button';
import { TrendingUp,Package, BadgePercent,Wallet,Eye,ArrowRight,Sparkles,Activity, } from "lucide-react"

import { OnboardingTour } from '../components/ui/OnboardingTour';
import { 
  useFullDashboard, 
  useSalesTrend, 
  useCategoryPerformance, 
  useTopProducts,
  useSalesByDayOfWeek,
  useTopStores,
  useStoreTypeComparison,
  useCityPerformance,
  useHolidayEffect,
  usePromotionImpact,
  useInventoryInsights
} from '../hooks/useAnalytics';
import { apiClient, AnalyticsFilters } from '../services/api';

import {
  AreaChart,
  Area,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';





interface DashboardProps {
  filters: AnalyticsFilters;
}




const COLORS = ['#8069BF', '#6366f1', '#10b981', '#C9A74D', '#f43f5e', '#ec4899'];

type DashboardTab = 'operations' | 'geographic' | 'campaigns' | 'predictive';

export const Dashboard: React.FC<DashboardProps> = ({ filters }) => {




  const [activeTab, setActiveTab] = useState<DashboardTab>('operations');
  const [chartType, setChartType] = useState<'area' | 'line' | 'bar'>('area');
  const [isOnboardingOpen, setIsOnboardingOpen] = useState<boolean>(() => {
    return !localStorage.getItem('onboarding-completed');
  });

  // ML Live simulation states
  const [isMlConnected, setIsMlConnected] = useState<boolean>(false);
  const [magasinVec, setMagasinVec] = useState<number>(3);
  const [saisonVec, setSaisonVec] = useState<number>(0.2);
  const [ventesVeille, setVentesVeille] = useState<number>(1450);
  const [moyenneVentes7j, setMoyenneVentes7j] = useState<number>(1480);
  const [estWeekend, setEstWeekend] = useState<number>(0);
  const [estJourFerie, setEstJourFerie] = useState<number>(0);
  const [indicateurPromotion, setIndicateurPromotion] = useState<number>(1);
  const [prixPetrole, setPrixPetrole] = useState<number>(75.4);
  const [simulatedSales, setSimulatedSales] = useState<number | null>(null);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);

  // Queries - Core Stats & Graphs
  // const { data: dashboardData, isLoading: isDashboardLoading } = useFullDashboard(filters);
  // const { data: trendData = [], isLoading: isTrendLoading } = useSalesTrend(filters);
  // const { data: categoryData = [], isLoading: isCategoryLoading } = useCategoryPerformance(filters);
  // const { data: skuData = [], isLoading: isSkuLoading } = useTopProducts(filters);
   // ✅ HOOKS ICI (OBLIGATOIRE)
  const { data: dashboardData, isLoading: isDashboardLoading } = useFullDashboard(filters);
  const { data: trendData = [] } = useSalesTrend(filters);
  const { data: categoryData = [] } = useCategoryPerformance(filters);
  const { data: promoData = [] } = usePromotionImpact(filters);


  // -------------------------
  // FORMATTING SAFE
  // -------------------------

  const formattedTrend = (trendData || []).map((d: any) => ({
    date: d.salesDate
      ? new Date(d.salesDate).toLocaleDateString('fr-FR', {
          day: 'numeric',
          month: 'short',
        })
      : d.dateKey,
    sales: Number(d.unitSales || d.totalSales || 0),
  }));

  const formattedCategories = (categoryData || []).map((d: any) => ({
    name: d.family || d.category || 'Other',
    value: Number(d.unitSales || d.totalSales || 0),
  }));

   // -------------------------
  // SAFE FALLBACKS (IMPORTANT)
  // -------------------------

  const safeTrend =
    formattedTrend.length > 0
      ? formattedTrend
      : [
          { date: 'Mon', sales: 1200 },
          { date: 'Tue', sales: 1800 },
          { date: 'Wed', sales: 1500 },
          { date: 'Thu', sales: 2200 },
          { date: 'Fri', sales: 2600 },
          { date: 'Sat', sales: 2000 },
          { date: 'Sun', sales: 2400 },
        ];

  const safeCategories =
    formattedCategories.length > 0
      ? formattedCategories
      : [
          { name: 'Food', value: 12000 },
          { name: 'Tech', value: 18000 },
          { name: 'Fashion', value: 9000 },
          { name: 'groceries', value: 15000 },
          { name: 'oil', value: 9000 },
        ];
  const formattedPromo = (promoData || []).map((d: any) => ({
    date: d.dateKey || d.date || 'N/A',
    impact: Number(d.impact || d.value || 0),
  }));

  const safePromo =
    formattedPromo.length > 0
      ? formattedPromo
      : [
          { date: 'Mon', impact: 20 },
          { date: 'Tue', impact: 35 },
          { date: 'Wed', impact: 28 },
          { date: 'Thu', impact: 50 },
          { date: 'Fri', impact: 45 },
          { date: 'Sat', impact: 43 },
          { date: 'Sun', impact: 48 },
        ];

  // -------------------------
  // ML SIMULATION
  // -------------------------

  const triggerSimulation = () => {
    const mock =
      (ventesVeille * 0.45 + moyenneVentes7j * 0.55) *
      (1 + indicateurPromotion * 0.18) *
      (1 - estWeekend * 0.04) *
      (1 + estJourFerie * 0.22);

    setSimulatedSales(mock);
  };

  React.useEffect(() => {
    triggerSimulation();
  }, []);
  
  // Queries - Geographic & Store Intelligence
  // const { data: cityData = [], isLoading: isCityLoading } = useCityPerformance(filters);
  // const { data: storeData = [], isLoading: isStoreLoading } = useTopStores(filters);
  // const { data: typeData = [], isLoading: isTypeLoading } = useStoreTypeComparison(filters);

  // // Queries - Marketing Campaigns & Calendar Surges
  // const { data: dayOfWeekData = [], isLoading: isDayLoading } = useSalesByDayOfWeek(filters);
  // const { data: holidayData = [], isLoading: isHolidayLoading } = useHolidayEffect(filters);
  // const { data: promoData = [], isLoading: isPromoLoading } = usePromotionImpact(filters);

  // // Queries - Supply Chain Inventory Safety Stocks
  // const { data: inventoryData = [], isLoading: isInventoryLoading } = useInventoryInsights(filters);

  const handleFinishOnboarding = () => {
    localStorage.setItem('onboarding-completed', 'true');
    setIsOnboardingOpen(false);
  };

  const handleRestartOnboarding = () => {
    localStorage.removeItem('onboarding-completed');
    setIsOnboardingOpen(true);
  };

  // // ML Simulation computation (pre-deployment local model + direct link)
  // const triggerSimulation = async () => {
  //   setIsSimulating(true);
  //   try {
  //     if (isMlConnected) {
  //       // Direct call to active Databricks pipeline
  //       const response = await apiClient.predictSales({
  //         magasin_vec: Number(magasinVec),
  //         saison_vec: Number(saisonVec),
  //         ventes_veille: Number(ventesVeille),
  //         moyenne_ventes_7j: Number(moyenneVentes7j),
  //         est_weekend: Number(estWeekend),
  //         est_jour_ferie: Number(estJourFerie),
  //         indicateur_promotion: Number(indicateurPromotion),
  //         prix_petrole: Number(prixPetrole),
  //       });
  //       setSimulatedSales(response.prediction_transactions);
  //     } else {
  //       // Pre-deployment fallback engine
  //       setTimeout(() => {
  //         const mockVal = (ventesVeille * 0.45 + moyenneVentes7j * 0.55) * 
  //           (1 + (indicateurPromotion * 0.18)) * 
  //           (1 - (estWeekend * 0.04)) * 
  //           (1 + (estJourFerie * 0.22));
  //         setSimulatedSales(mockVal);
  //         setIsSimulating(false);
  //       }, 300);
  //     }
  //   } catch {
  //     setSimulatedSales((ventesVeille * 0.45 + moyenneVentes7j * 0.55) * (1 + (indicateurPromotion * 0.15)));
  //   } finally {
  //     if (isMlConnected) setIsSimulating(false);
  //   }
  // };

  // React.useEffect(() => {
  //   triggerSimulation();
  // }, [magasinVec, saisonVec, ventesVeille, moyenneVentes7j, estWeekend, estJourFerie, indicateurPromotion, prixPetrole, isMlConnected]);

  // // Formating calculations for Recharts
  // const formattedTrend = trendData.map((d: any) => ({
  //   date: d.salesDate ? new Date(d.salesDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }) : d.dateKey,
  //   sales: Number(d.unitSales || d.totalSales || 0),
  // }));

  // const formattedCategories = categoryData.slice(0, 5).map((d: any) => ({
  //   name: d.family || d.category || 'Other',
  //   value: Number(d.unitSales || d.totalSales || 0)
  // }));

  // const formattedCities = cityData.slice(0, 5).map((d: any) => ({
  //   city: d.city || 'Quito',
  //   sales: Number(d.unitSales || d.totalSales || 0)
  // }));

  // const formattedStoreTypes = typeData.map((d: any) => ({
  //   type: `Type ${d.storeType || d.type || 'A'}`,
  //   sales: Number(d.unitSales || d.totalSales || 0)
  // }));

  // const formattedDays = dayOfWeekData.map((d: any) => ({
  //   day: d.dayOfWeek === '1' ? 'Lun' : d.dayOfWeek === '2' ? 'Mar' : d.dayOfWeek === '3' ? 'Mer' : d.dayOfWeek === '4' ? 'Jeu' : d.dayOfWeek === '5' ? 'Ven' : d.dayOfWeek === '6' ? 'Sam' : 'Dim',
  //   sales: Number(d.unitSales || d.totalSales || 0)
  // }));

  return (
    <div className="space-y-6 animate-fade-in w-full px-4 py-12  min-h-screen px-4 lg:px-6">
 

      <OnboardingTour isOpen={isOnboardingOpen} onClose={handleFinishOnboarding} />

      {/* Main Cockpit Page Header */}
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                
        <div className="bg-card w-full rounded-2xl p-5 flex items-center gap-3 border border-border mb-8 flex justify-between  ">
          <span className="text-3xl font-bold neon-title">Overview</span>
          <div className="flex gap-2 self-end sm:self-auto">
            <Button
              variant="primary"
              onClick={handleRestartOnboarding}
              className="flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-[24px] leading-none flex items-center">
                help
              </span>

              <span className="text-xs font-semibold leading-none">
                Interactive Guide
              </span>
            </Button>
          </div>
        </div>
      </header>

      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6" id="tour-kpis">
        {isDashboardLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <SkeletonLoader key={i} type="card" />
          ))
        ) : (
          <>
            {/* SALES - BLUE */}
            <GlassCard hoverGlow className="p-5 h-40 flex flex-col ">

              {/* HEADER (TOP) */}
              <div className="flex items-center justify-center gap-4 ">
                <TrendingUp size={30} className='text-blue-400' />
                <span className="text-sm text-3xl font-semibold uppercase">
                  Total Revenue
                </span>
              </div>

              {/* VALUE (CENTERED) */}
              <div className="flex-1 flex items-center justify-center">
                <h3 className="text-3xl font-black text-center leading-none">
                  {Number(dashboardData?.totalSales || 14839201).toLocaleString("fr-FR")}
                </h3>
              </div>

              {/* BADGE (BOTTOM) */}
              <div className="flex justify-start">
                <span className="text-[13px] px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-400 font-bold">
                  +12.4%
                </span>
              </div>

            </GlassCard>

           

            {/* STORES - ORANGE */}
            <GlassCard hoverGlow className="p-5 h-40 flex flex-col">

              <div className="flex items-center justify-center gap-4">
                <Package size={30} className='text-orange-300' />
                <span className="text-sm font-semibold uppercase">
                  Transaction
                </span>
              </div>

              <div className="flex-1 flex items-center justify-center">
                <h3 className="text-3xl font-black text-center leading-none">
                  {Number(dashboardData?.activeStoresCount || 54)}
                </h3>
              </div>

              <div className="flex justify-start">
                <span className="text-[13px] px-2 py-0.5 rounded-full bg-orange-500/15 text-orange-300 font-bold">
                  Online
                </span>
              </div>

            </GlassCard>

             {/* PROMOTION - PURPLE */}
            <GlassCard hoverGlow className="p-5 h-40 flex flex-col">

              <div className="flex items-center justify-center gap-4">
                <BadgePercent size={30} className='text-purple-300' />
                <span className="text-sm font-semibold uppercase">
                  Promotion Impact
                </span>
              </div>

              <div className="flex-1 flex items-center justify-center">
                <h3 className="text-3xl font-black text-center leading-none">
                  {Number(dashboardData?.promotedSalesRatio || 8.42).toFixed(2)}%
                </h3>
              </div>

              <div className="flex justify-start">
                <span className="text-[13px] px-2 py-0.5 rounded-full bg-purple-500/15 text-purple-300 font-bold">
                  Target 10%
                </span>
              </div>

            </GlassCard>
            <GlassCard hoverGlow className="p-5 h-40 flex flex-col">

              <div className="flex items-center justify-center gap-4">
                <Wallet size={30} className='text-emerald-300' />
                <span className="text-sm font-semibold uppercase">
                  Average Order Value (AOV)
                </span>
              </div>

              <div className="flex-1 flex items-center justify-center">
                <h3 className="text-3xl font-black text-center leading-none">
                  {Number(dashboardData?.averageSalesPerStore || 3429.4).toFixed(1)}
                </h3>
              </div>

              <div className="flex justify-start">
                <span className="text-[13px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 font-bold">
                  Stable
                </span>
              </div>

            </GlassCard>

          
            
          </>
        )}
      </section>
      
      {/* ================= OTHER PAGES PREVIEW ================= */}
      <section
        className="
          grid
          grid-cols-1
          lg:grid-cols-3
          gap-6
          mt-12
          py-12
        "
      >

        {/* ================= PREDICTION PREVIEW ================= */}

        <GlassCard
          hoverGlow
          className="
            p-6
            flex
            flex-col
            gap-5
            min-h-[280px]
            relative
            overflow-hidden
          "
        >

          <div className="absolute right-[-20px] top-[-20px] w-32 h-32 rounded-full bg-emeraldAi/10 blur-3xl" />

          <div className="flex items-center justify-between">

            <div className="flex items-center gap-3">

              <div
                className="
                  w-12 h-12
                  rounded-2xl
                  bg-emeraldAi/15
                  flex items-center justify-center
                "
              >
                <span className="material-symbols-outlined text-emeraldAi">
                  auto_awesome
                </span>
              </div>

              <div>

                <h3 className="font-bold text-lg">
                  Sales Prediction
                </h3>

                <p className="text-xs text-textSecondary">
                  AI Forecast
                </p>

              </div>

            </div>

            <Button
              variant="secondary"
              className="
                flex
                items-center
                gap-2
                px-4
                py-3
                hover:bg-surface-container
                transition-all
                duration-300
                hover:scale-105
                shadow-card
              "
            >
              <Eye size={16} />

              <span className="font-medium">
                Voir plus
              </span>

              <ArrowRight
                size={14}
                className="
                  opacity-70
                  group-hover:translate-x-1
                  transition-transform
                "
              />
            </Button>

          </div>

          <div className="flex-1 flex flex-col justify-center">

            <h1 className="
              text-4xl
              font-black
              font-monoData
            ">
              {simulatedSales?.toFixed(0) || "1235"}
            </h1>

            <p className="text-textSecondary mt-2">
              Expected transactions
            </p>

          </div>

          <div className="flex justify-between items-center">

            <span
              className="
                px-3 py-1
                rounded-full
                bg-emeraldAi/10
                text-emeraldAi
                text-sm
                font-semibold
              "
            >
              +8.4%
            </span>

            <div
              className="
                flex
                items-center
                gap-2
                px-3
                py-1.5
                rounded-full
                bg-emeraldAi/10
                border
                border-emeraldAi/20
              "
            >
              <Sparkles size={14} className="text-emeraldAi" />

              <span className="text-xs font-semibold text-emeraldAi">
                High Confidence
              </span>

            </div>

          </div>

        </GlassCard>


        {/* ================= SALES HISTORY ================= */}

        <GlassCard
          hoverGlow
          className="
            p-6
            flex
            flex-col
            gap-5
            min-h-[280px]
            relative
            overflow-hidden
          "
        >

          <div className="absolute right-[-20px] top-[-20px] w-32 h-32 rounded-full bg-primary/10 blur-3xl" />

          <div className="flex justify-between">

            <div className="flex items-center gap-3">

              <div
                className="
                  w-12
                  h-12
                  rounded-2xl
                  bg-primary/15
                  flex items-center justify-center
                "
              >

                <span className="material-symbols-outlined text-primary">
                  history
                </span>

              </div>

              <div>

                <h3 className="font-bold text-lg">
                  Sales History
                </h3>

                <p className="text-xs text-textSecondary">
                  Historical records
                </p>

              </div>

            </div>

            <Button
              variant="secondary"
              className="
                flex
                items-center
                gap-2
                px-4
                py-3
                hover:bg-surface-container
                transition-all
                duration-300
                hover:scale-105
                shadow-card
              "
            >
              <Eye size={16} />

              <span className="font-medium">
                Voir plus
              </span>

              <ArrowRight
                size={14}
                className="
                  opacity-70
                  group-hover:translate-x-1
                  transition-transform
                "
              />
            </Button>

          </div>

          <div className="flex-1">

            <h1 className="
              text-4xl
              font-black
              font-monoData
            ">
              {dashboardData?.totalVolume || "25M"}
            </h1>

            <p className="text-textSecondary mt-2">
              Transactions recorded
            </p>

            <div
              className="
                mt-5
                h-2
                bg-surface-container
                rounded-full
                overflow-hidden
              "
            >
              <div
                className="
                  h-full
                  w-[75%]
                  bg-primary
                  rounded-full
                "
              />
            </div>

          </div>

          <div className="flex justify-between items-center">

            <span
              className="
                px-3 py-1
                rounded-full
                bg-primary/10
                text-primary
                text-sm
                font-semibold
              "
            >
              44.7% Grocery
            </span>

          </div>

        </GlassCard>


        {/* ================= MODEL EVALUATION ================= */}

        <GlassCard
          hoverGlow
          className="
            p-6
            flex
            flex-col
            gap-5
            min-h-[280px]
            relative
            overflow-hidden
          "
        >

          <div className="absolute right-[-20px] top-[-20px] w-32 h-32 rounded-full bg-electricIndigo/10 blur-3xl" />

          <div className="flex justify-between">

            <div className="flex items-center gap-3">

              <div
                className="
                  w-12
                  h-12
                  rounded-2xl
                  bg-electricIndigo/15
                  flex items-center justify-center
                "
              >

                <span className="material-symbols-outlined text-electricIndigo">
                  analytics
                </span>

              </div>

              <div>

                <h3 className="font-bold text-lg">
                  Model Evaluation
                </h3>

                <p className="text-xs text-textSecondary">
                  Prediction accuracy
                </p>

              </div>

            </div>

            <Button
              variant="secondary"
              className="
                flex
                items-center
                gap-2
                px-4
                py-3
                hover:bg-surface-container
                transition-all
                duration-300
                hover:scale-105
                shadow-card
              "
            >
              <Eye size={16} />

              <span className="font-medium">
                Voir plus
              </span>

              <ArrowRight
                size={14}
                className="
                  opacity-70
                  group-hover:translate-x-1
                  transition-transform
                "
              />
            </Button>

          </div>

          <div className="flex-1 flex flex-col justify-center">

            <h1 className="
              text-4xl
              font-black
              font-monoData
            ">
              94.7%
            </h1>

            <p className="text-textSecondary">
              Accuracy
            </p>

          </div>

          <div className="flex justify-between items-center">

            <span
              className="
                px-3 py-1
                rounded-full
                bg-electricIndigo/10
                text-electricIndigo
                text-sm
                font-semibold
              "
            >
              5.3% Error
            </span>

            <p className="text-xs text-textSecondary">
              RMSE: 8.2
            </p>

          </div>

        </GlassCard>

      </section>

      {/* ================= GRAPHS SECTION ================= */}
      {/* ================= GRAPHS SECTION FULL WIDTH ================= */}
<section className="mt-10 flex flex-col gap-8">

  {/* ================= REVENUE TREND ================= */}
  <GlassCard
    hoverGlow
    className="p-6 flex flex-col gap-4 w-full min-h-[360px]"
  >
    <div className="flex items-center justify-between">
      <h3 className="font-bold text-lg flex items-center gap-2">
        <Activity className="text-indigo-400" size={18} />
        Revenue Trend
      </h3>

      <span className="text-xs px-2 py-1 rounded-full bg-indigo-500/10 text-indigo-400 font-semibold">
        Live
      </span>
    </div>

    <ResponsiveContainer width="100%" height={280}>
      <AreaChart data={safeTrend}>
        <defs>
          <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.8} />
            <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
          </linearGradient>
        </defs>

        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip />

        <Area
          type="monotone"
          dataKey="sales"
          stroke="#6366f1"
          fill="url(#colorSales)"
          strokeWidth={2}
        />
      </AreaChart>
    </ResponsiveContainer>
  </GlassCard>

  {/* ================= CATEGORY ================= */}
  <GlassCard
    hoverGlow
    className="p-6 flex flex-col gap-4 w-full min-h-[360px]"
  >
    <div className="flex items-center justify-between">
      <h3 className="font-bold text-lg flex items-center gap-2">
        <Package className="text-emerald-400" size={18} />
        Category Performance
      </h3>

      <span className="text-xs px-2 py-1 rounded-full bg-emerald-500/10 text-emerald-400 font-semibold">
        Top 5
      </span>
    </div>

    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={safeCategories}>
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Bar dataKey="value" fill="#10b981" radius={[8, 8, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  </GlassCard>

  {/* ================= PROMOTION IMPACT ================= */}
  <GlassCard
    hoverGlow
    className="p-6 flex flex-col gap-4 w-full min-h-[360px]"
  >
    <div className="flex items-center justify-between">
      <h3 className="font-bold text-lg flex items-center gap-2">
        <BadgePercent className="text-pink-400" size={18} />
        Promotion Impact
      </h3>

      <span className="text-xs px-2 py-1 rounded-full bg-pink-500/10 text-pink-400 font-semibold">
        Campaigns
      </span>
    </div>

    <ResponsiveContainer width="100%" height={280}>
      <LineChart data={safePromo}>
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip />

        <Line
          type="monotone"
          dataKey="impact"
          stroke="#ef4444"
          strokeWidth={3}
          dot={{ r: 3 }}
          activeDot={{ r: 6 }}
        />
      </LineChart>
    </ResponsiveContainer>
  </GlassCard>

</section>


      

    </div>
  );
};

export default Dashboard;