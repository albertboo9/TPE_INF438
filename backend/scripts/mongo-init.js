// MongoDB initialization script
// Creates indexes for the retail_mock database

db = db.getSiblingDB('retail_mock');

// Create collections WITHOUT strict validation (CSV data is heterogeneous)
db.createCollection('daily_sales');
db.createCollection('stores');
db.createCollection('items');
db.createCollection('transactions');
db.createCollection('holidays_events');
db.createCollection('daily_oil');

// Create indexes for fast queries
db.daily_sales.createIndex({ date: 1, store_nbr: 1, family: 1 });
db.daily_sales.createIndex({ family: 1 });
db.daily_sales.createIndex({ store_nbr: 1 });
db.daily_sales.createIndex({ date: 1 });

// Pre-computed aggregations
db.createCollection('monthly_aggregates');
db.monthly_aggregates.createIndex({ year: 1, month: 1, family: 1 });
db.monthly_aggregates.createIndex({ family: 1 });

db.createCollection('category_stats');
db.createCollection('store_stats');
db.createCollection('temporal_stats');

print('✅ MongoDB initialized: collections and indexes created');