"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const mongodb_1 = require("mongodb");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const sync_1 = require("csv-parse/sync");
// ============================================================
// CONFIGURATION
// ============================================================
const MONGO_URI = process.env.MONGO_URI || 'mongodb://admin:retail123@localhost:27017/';
const DB_NAME = 'retail_mock';
const CSV_DIR = path.resolve(__dirname, '../ml');
const BATCH_SIZE = 10000;
const SAMPLE_LIMIT = 500000; // Process only first 500K training records for speed
// ============================================================
// HELPERS
// ============================================================
function parseCSV(filePath) {
    const content = fs.readFileSync(filePath, 'utf-8');
    return (0, sync_1.parse)(content, {
        columns: true,
        skip_empty_lines: true,
        relax_column_count: true,
        relax: true,
        cast: true,
        bom: true,
    });
}
function round2(n) {
    return Math.round(n * 100) / 100;
}
// ============================================================
// MAIN INGESTION
// ============================================================
async function ingest() {
    const startTime = Date.now();
    console.log('🚀 Starting CSV → MongoDB ingestion...\n');
    // 1. Connect to MongoDB
    const client = new mongodb_1.MongoClient(MONGO_URI);
    await client.connect();
    const db = client.db(DB_NAME);
    console.log('✅ Connected to MongoDB\n');
    // 2. Parse CSVs
    console.log('📂 Parsing CSV files...');
    const stores = parseCSV(path.join(CSV_DIR, 'stores.csv'));
    console.log(`   stores.csv → ${stores.length} records`);
    const items = parseCSV(path.join(CSV_DIR, 'items.csv'));
    console.log(`   items.csv → ${items.length} records`);
    const transactions = parseCSV(path.join(CSV_DIR, 'transactions.csv'));
    console.log(`   transactions.csv → ${transactions.length} records`);
    const oil = parseCSV(path.join(CSV_DIR, 'oil.csv'));
    console.log(`   oil.csv → ${oil.length} records`);
    const holidays = parseCSV(path.join(CSV_DIR, 'holidays_events.csv'));
    console.log(`   holidays_events.csv → ${holidays.length} records`);
    const trainRaw = parseCSV(path.join(CSV_DIR, 'train.csv'));
    console.log(`   train.csv → ${trainRaw.length} total records`);
    // Use a sample for speed (configurable via SAMPLE_LIMIT)
    const train = trainRaw.slice(0, SAMPLE_LIMIT);
    console.log(`   → Using ${train.length} records for ingestion (configurable via SAMPLE_LIMIT)\n`);
    // 3. Build lookup maps for enrichment
    console.log('🔗 Building lookup maps...');
    const storeMap = new Map();
    for (const s of stores)
        storeMap.set(s.store_nbr, s);
    const itemMap = new Map();
    for (const i of items)
        itemMap.set(i.item_nbr, i);
    const transactionsMap = new Map();
    for (const t of transactions) {
        transactionsMap.set(`${t.date}|${t.store_nbr}`, t.transactions);
    }
    const oilMap = new Map();
    for (const o of oil)
        oilMap.set(o.date, o.dcoilwtico);
    const holidaySet = new Set();
    const holidayDescMap = new Map();
    for (const h of holidays) {
        holidaySet.add(h.date);
        holidayDescMap.set(h.date, h.description);
    }
    // 4. Drop and recreate collections
    console.log('🧹 Recreating collections...');
    const collectionsToDrop = [
        'daily_sales', 'monthly_aggregates', 'category_stats',
        'store_stats', 'temporal_stats', 'stores', 'items',
        'transactions', 'holidays_events', 'daily_oil'
    ];
    for (const col of collectionsToDrop) {
        try {
            await db.collection(col).drop();
        }
        catch { /* ignore if doesn't exist */ }
    }
    // Create collections with proper indexes
    await db.createCollection('daily_sales');
    await db.collection('daily_sales').createIndex({ date: 1, store_nbr: 1, family: 1 });
    await db.collection('daily_sales').createIndex({ family: 1 });
    await db.collection('daily_sales').createIndex({ store_nbr: 1 });
    await db.createCollection('stores');
    await db.createCollection('items');
    await db.createCollection('transactions');
    await db.createCollection('holidays_events');
    await db.createCollection('daily_oil');
    await db.createCollection('monthly_aggregates');
    await db.collection('monthly_aggregates').createIndex({ year: 1, month: 1, family: 1 });
    await db.createCollection('category_stats');
    await db.createCollection('store_stats');
    await db.createCollection('temporal_stats');
    // 5. Insert static reference data
    console.log('💾 Inserting reference data...');
    await db.collection('stores').insertMany(stores);
    await db.collection('items').insertMany(items);
    await db.collection('transactions').insertMany(transactions);
    await db.collection('holidays_events').insertMany(holidays);
    await db.collection('daily_oil').insertMany(oil.map(o => ({
        ...o,
        dcoilwtico: o.dcoilwtico ?? null
    })));
    // 6. Process daily_sales in batches
    console.log(`💾 Processing ${train.length} daily_sales records in batches of ${BATCH_SIZE}...`);
    let batch = [];
    let inserted = 0;
    const batchPromises = [];
    for (let i = 0; i < train.length; i++) {
        const rec = train[i];
        const store = storeMap.get(rec.store_nbr);
        const item = itemMap.get(rec.item_nbr);
        const transKey = `${rec.date}|${rec.store_nbr}`;
        const transCount = transactionsMap.get(transKey) ?? null;
        const oilPrice = oilMap.get(rec.date) ?? null;
        const isHoliday = holidaySet.has(rec.date);
        const holidayDesc = holidayDescMap.get(rec.date) ?? null;
        const enriched = {
            date: rec.date,
            year: parseInt(rec.date.substring(0, 4)),
            month: parseInt(rec.date.substring(5, 7)),
            store_nbr: rec.store_nbr,
            city: store?.city ?? null,
            state: store?.state ?? null,
            store_type: store?.type ?? null,
            cluster: store?.cluster ?? null,
            item_nbr: rec.item_nbr,
            family: item?.family ?? 'UNKNOWN',
            class: item?.class ?? null,
            perishable: item?.perishable ?? false,
            unit_sales: rec.unit_sales,
            onpromotion: rec.onpromotion,
            transactions: transCount,
            oil_price: oilPrice,
            is_holiday: isHoliday,
            holiday_description: holidayDesc,
        };
        batch.push(enriched);
        if (batch.length >= BATCH_SIZE || i === train.length - 1) {
            const batchCopy = [...batch];
            batchPromises.push(db.collection('daily_sales').insertMany(batchCopy, { ordered: false })
                .then(() => {
                inserted += batchCopy.length;
                const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
                process.stdout.write(`\r   Inserted ${inserted}/${train.length} records (${elapsed}s)`);
            })
                .catch(() => {
                inserted += batchCopy.length; // Count even if some fail
            }));
            batch = [];
            // Process in parallel batches of 5 to avoid overwhelming MongoDB
            if (batchPromises.length >= 5) {
                await Promise.all(batchPromises);
                batchPromises.length = 0;
            }
        }
    }
    // Wait for remaining batches
    if (batchPromises.length > 0) {
        await Promise.all(batchPromises);
    }
    const totalElapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log(`\r   ✅ Inserted ${inserted}/${train.length} daily_sales records in ${totalElapsed}s`);
    // 7. Pre-compute monthly aggregates
    console.log('\n📊 Computing monthly aggregates...');
    const monthlyAggs = await db.collection('daily_sales').aggregate([
        {
            $group: {
                _id: { year: '$year', month: '$month', family: '$family', store_type: '$store_type', city: '$city' },
                total_sales: { $sum: '$unit_sales' },
                avg_sales: { $avg: '$unit_sales' },
                max_sales: { $max: '$unit_sales' },
                promo_sales: { $sum: { $cond: ['$onpromotion', '$unit_sales', 0] } },
                record_count: { $sum: 1 },
            }
        },
        {
            $project: {
                _id: 0,
                year: '$_id.year', month: '$_id.month', family: '$_id.family',
                store_type: '$_id.store_type', city: '$_id.city',
                total_sales: { $round: ['$total_sales', 2] },
                avg_sales: { $round: ['$avg_sales', 2] },
                max_sales: { $round: ['$max_sales', 2] },
                promo_sales: { $round: ['$promo_sales', 2] },
                promo_percentage: {
                    $round: [{ $multiply: [{ $divide: ['$promo_sales', { $max: ['$total_sales', 1] }] }, 100] }, 2]
                },
                record_count: 1,
            }
        }
    ]).toArray();
    if (monthlyAggs.length > 0) {
        await db.collection('monthly_aggregates').insertMany(monthlyAggs);
    }
    console.log(`   ✅ Inserted ${monthlyAggs.length} monthly aggregate records`);
    // 8. Pre-compute category_stats
    console.log('📊 Computing category stats...');
    const categoryStats = await db.collection('daily_sales').aggregate([
        {
            $group: {
                _id: '$family',
                total_sales: { $sum: '$unit_sales' },
                avg_sales: { $avg: '$unit_sales' },
                max_sales: { $max: '$unit_sales' },
                record_count: { $sum: 1 },
                promo_sales: { $sum: { $cond: ['$onpromotion', '$unit_sales', 0] } },
                perishable_count: { $sum: { $cond: ['$perishable', 1, 0] } },
            }
        },
        { $sort: { total_sales: -1 } },
        {
            $project: {
                _id: 0, family: '$_id',
                total_sales: { $round: ['$total_sales', 2] },
                avg_sales: { $round: ['$avg_sales', 2] },
                max_sales: { $round: ['$max_sales', 2] },
                record_count: 1, promo_sales: { $round: ['$promo_sales', 2] }, perishable_count: 1,
            }
        }
    ]).toArray();
    if (categoryStats.length > 0) {
        const globalTotal = categoryStats.reduce((sum, c) => sum + c.total_sales, 0);
        for (const cs of categoryStats) {
            cs.percentage = round2((cs.total_sales / globalTotal) * 100);
        }
        await db.collection('category_stats').insertMany(categoryStats);
    }
    console.log(`   ✅ Inserted ${categoryStats.length} category stat records`);
    // 9. Pre-compute store_stats
    console.log('📊 Computing store stats...');
    const storeStats = await db.collection('daily_sales').aggregate([
        {
            $group: {
                _id: { store_nbr: '$store_nbr', city: '$city', store_type: '$store_type', state: '$state' },
                total_sales: { $sum: '$unit_sales' },
                avg_sales: { $avg: '$unit_sales' },
                record_count: { $sum: 1 },
            }
        },
        { $sort: { total_sales: -1 } },
        {
            $project: {
                _id: 0,
                store_nbr: '$_id.store_nbr', city: '$_id.city',
                store_type: '$_id.store_type', state: '$_id.state',
                total_sales: { $round: ['$total_sales', 2] },
                avg_sales: { $round: ['$avg_sales', 2] },
                record_count: 1,
            }
        }
    ]).toArray();
    if (storeStats.length > 0) {
        await db.collection('store_stats').insertMany(storeStats);
    }
    console.log(`   ✅ Inserted ${storeStats.length} store stat records`);
    // 10. Pre-compute temporal_stats
    console.log('📊 Computing temporal stats...');
    const temporalStats = await db.collection('daily_sales').aggregate([
        {
            $group: {
                _id: { year: '$year', month: '$month' },
                total_sales: { $sum: '$unit_sales' },
                avg_sales: { $avg: '$unit_sales' },
                record_count: { $sum: 1 },
                promo_sales: { $sum: { $cond: ['$onpromotion', '$unit_sales', 0] } },
            }
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } },
        {
            $project: {
                _id: 0, year: '$_id.year', month: '$_id.month',
                total_sales: { $round: ['$total_sales', 2] },
                avg_sales: { $round: ['$avg_sales', 2] },
                record_count: 1,
                promo_sales: { $round: ['$promo_sales', 2] },
                promo_percentage: {
                    $round: [
                        { $multiply: [{ $divide: ['$promo_sales', { $max: ['$total_sales', 1] }] }, 100] }, 2
                    ]
                },
            }
        }
    ]).toArray();
    if (temporalStats.length > 0) {
        await db.collection('temporal_stats').insertMany(temporalStats);
    }
    console.log(`   ✅ Inserted ${temporalStats.length} temporal stat records`);
    // 11. Summary
    const finalElapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log('\n═══════════════════════════════════════');
    console.log('📊 INGESTION SUMMARY');
    console.log('═══════════════════════════════════════');
    console.log(`   daily_sales:       ${await db.collection('daily_sales').countDocuments()} records`);
    console.log(`   monthly_aggregates: ${await db.collection('monthly_aggregates').countDocuments()} records`);
    console.log(`   category_stats:    ${await db.collection('category_stats').countDocuments()} records`);
    console.log(`   store_stats:       ${await db.collection('store_stats').countDocuments()} records`);
    console.log(`   temporal_stats:    ${await db.collection('temporal_stats').countDocuments()} records`);
    console.log(`   stores:            ${await db.collection('stores').countDocuments()} records`);
    console.log(`   items:             ${await db.collection('items').countDocuments()} records`);
    console.log(`   ⏱️  Total time:    ${finalElapsed}s`);
    console.log('═══════════════════════════════════════');
    console.log('✅ Ingestion complete!\n');
    await client.close();
}
ingest().catch(err => {
    console.error('❌ Ingestion failed:', err);
    process.exit(1);
});
//# sourceMappingURL=ingest-csv-to-mongo.js.map