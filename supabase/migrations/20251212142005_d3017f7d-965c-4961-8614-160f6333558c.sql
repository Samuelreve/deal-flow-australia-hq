-- Drop unused health monitoring tables
-- These tables have 0 records or contain only template data that's not being used

-- Drop orphaned "_new" tables from incomplete migrations
DROP TABLE IF EXISTS custom_health_metrics_new CASCADE;
DROP TABLE IF EXISTS deal_health_predictions_new CASCADE;
DROP TABLE IF EXISTS health_recovery_plans_new CASCADE;
DROP TABLE IF EXISTS health_reports_new CASCADE;
DROP TABLE IF EXISTS health_score_comparisons_new CASCADE;

-- Drop unused feature tables (0 records or fake features)
DROP TABLE IF EXISTS custom_health_metrics CASCADE;
DROP TABLE IF EXISTS health_score_comparisons CASCADE;
DROP TABLE IF EXISTS health_reports CASCADE;