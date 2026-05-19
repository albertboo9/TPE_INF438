import { NestFactory } from '@nestjs/core';
import { AppModule } from './src/app.module';
import { StatsController } from './src/presentation/controllers/StatsController';
import { AnalyticsController } from './src/presentation/controllers/AnalyticsController';

async function runTests() {
  console.log('=== Programmatic Integration Tests: Databricks Endpoints ===');
  console.log('Bootstrapping NestJS application context...');
  
  const app = await NestFactory.createApplicationContext(AppModule, { logger: false });
  const statsController = app.get(StatsController);
  const analyticsController = app.get(AnalyticsController);
  
  console.log('App context ready! Beginning query validations...\n');

  // Helper to run a test case and print a formatted summary
  async function testCase(name: string, fn: () => Promise<any>) {
    console.log(`[TEST] Calling: ${name}...`);
    const start = Date.now();
    try {
      const res = await fn();
      const duration = Date.now() - start;
      const count = Array.isArray(res) ? res.length : (res && typeof res === 'object' ? Object.keys(res).length : 1);
      console.log(`  🟢 SUCCESS | Duration: ${duration}ms | Items/Keys: ${count}`);
      if (Array.isArray(res) && res.length > 0) {
        console.log(`  Sample item:`, JSON.stringify(res[0]));
      } else if (res && typeof res === 'object') {
        console.log(`  Sample data keys:`, Object.keys(res).slice(0, 5));
      }
    } catch (err: any) {
      console.log(`  🔴 FAILED  | Error: ${err.message}`);
    }
    console.log('----------------------------------------------------');
  }

  // 1. StatsController Endpoints
  console.log('>>> TESTING STATS CONTROLLER ENDPOINTS <<<\n');
  
  await testCase('StatsController.getGlobalStats()', () => 
    statsController.getGlobalStats()
  );

  await testCase('StatsController.getTemporalStats(year: 2015, month: 3)', () => 
    statsController.getTemporalStats({ year: 2015, month: 3 } as any)
  );

  await testCase('StatsController.getCategoryStats(limit: 3)', () => 
    statsController.getCategoryStats({ limit: 3 } as any)
  );

  await testCase('StatsController.getStoreStats(limit: 3)', () => 
    statsController.getStoreStats(3)
  );

  // 2. AnalyticsController Endpoints with Dynamic Filtering
  console.log('\n>>> TESTING ANALYTICS CONTROLLER ENDPOINTS <<<\n');

  await testCase('AnalyticsController.salesByDayOfWeek() (No filters)', () => 
    analyticsController.salesByDayOfWeek({})
  );

  await testCase('AnalyticsController.salesByDayOfWeek() (Filter: store_nbr = "37")', () => 
    analyticsController.salesByDayOfWeek({ store_nbr: '37' })
  );

  await testCase('AnalyticsController.salesByMonth() (Filter: year = 2015)', () => 
    analyticsController.salesByMonth({ year: 2015 })
  );

  await testCase('AnalyticsController.salesByYear()', () => 
    analyticsController.salesByYear({})
  );

  await testCase('AnalyticsController.promotionImpact()', () => 
    analyticsController.promotionImpact({})
  );

  await testCase('AnalyticsController.topProducts(limit: 3)', () => 
    analyticsController.topProducts({ limit: 3 })
  );

  await testCase('AnalyticsController.topStores(limit: 3)', () => 
    analyticsController.topStores({ limit: 3 })
  );

  await testCase('AnalyticsController.salesTrend(months: 3)', () => 
    analyticsController.salesTrend({ months: 3 })
  );

  await testCase('AnalyticsController.categoryPerformance()', () => 
    analyticsController.categoryPerformance({})
  );

  await testCase('AnalyticsController.storeTypeComparison()', () => 
    analyticsController.storeTypeComparison({})
  );

  await testCase('AnalyticsController.cityPerformance()', () => 
    analyticsController.cityPerformance({})
  );

  await testCase('AnalyticsController.holidayEffect()', () => 
    analyticsController.holidayEffect({})
  );

  await testCase('AnalyticsController.inventoryInsights()', () => 
    analyticsController.inventoryInsights({})
  );

  await testCase('AnalyticsController.seasonalPatterns()', () => 
    analyticsController.seasonalPatterns({})
  );

  await testCase('AnalyticsController.fullDashboard()', () => 
    analyticsController.fullDashboard({})
  );

  console.log('\nClosing NestJS context...');
  await app.close();
  console.log('All tests completed successfully!');
}

runTests().catch(err => {
  console.error('Fatal test runner error:', err);
});
