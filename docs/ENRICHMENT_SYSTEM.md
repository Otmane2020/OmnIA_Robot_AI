# Automated Product Data Enrichment System

## Overview

This system provides automated product data enrichment using DeepSeek AI whenever changes occur in the product catalog database. The system is designed to be robust, scalable, and production-ready.

## Architecture

### Database Tables

1. **`product_catalog`** - Source table containing basic product information
2. **`enriched_products`** - Target table with AI-enhanced product details
3. **`enrichment_logs`** - Audit trail for all enrichment operations
4. **`enrichment_queue`** - Queue for asynchronous processing

### Key Components

1. **Database Triggers** - Automatically detect changes and queue enrichment
2. **DeepSeek API Integration** - AI-powered product attribute extraction
3. **Async Processing Queue** - Handle enrichment operations efficiently
4. **Error Handling & Retry Logic** - Robust error recovery mechanisms
5. **Performance Monitoring** - Track enrichment success rates and performance

## How It Works

### 1. Trigger Activation

When a product is inserted, updated, or deleted in `product_catalog`:

```sql
-- Trigger automatically fires
INSERT INTO product_catalog (name, description, price, category, retailer_id, ...)
VALUES ('Canapé ALYANA', 'Canapé convertible...', 799.00, 'Canapé', 'retailer-123', ...);
```

### 2. Automatic Enrichment Process

1. **Change Detection**: Trigger detects the operation type (INSERT/UPDATE/DELETE)
2. **Queue Addition**: Product is added to `enrichment_queue` for processing
3. **AI Processing**: DeepSeek API analyzes product data and extracts attributes
4. **Data Storage**: Enriched data is stored in `enriched_products` table
5. **UI Update**: Frontend automatically displays enriched data

### 3. DeepSeek AI Enrichment

The system extracts these attributes automatically:

- **Product Classification**: Category, subcategory, product type
- **Physical Attributes**: Material, color, dimensions, weight
- **Style Information**: Design style, suitable room, capacity
- **SEO Optimization**: Optimized title and meta description
- **Product Identifiers**: GTIN, MPN when available
- **Confidence Score**: AI confidence level (0-100%)

## API Endpoints

### 1. Manual Enrichment Trigger

```bash
POST /functions/v1/trigger-enrichment
{
  "retailer_id": "retailer-123",
  "batch_size": 50,
  "priority": 8
}
```

### 2. Process Enrichment Queue

```bash
POST /functions/v1/enrichment-processor
{
  "batch_size": 10,
  "retailer_id": "retailer-123"
}
```

### 3. Get Enrichment Statistics

```bash
POST /functions/v1/enrichment-stats
{
  "retailer_id": "retailer-123",
  "days_back": 7
}
```

## Usage Examples

### 1. Adding a New Product (Automatic Enrichment)

```sql
-- This will automatically trigger enrichment
INSERT INTO product_catalog (
    retailer_id, external_id, name, description, price, category, vendor
) VALUES (
    'demo-retailer-id',
    'product-001',
    'Canapé ALYANA convertible - Beige',
    'Canapé d''angle convertible 4 places en velours côtelé beige avec coffre de rangement',
    799.00,
    'Canapé',
    'Decora Home'
);

-- Enriched data will automatically appear in enriched_products table
```

### 2. Manual Batch Enrichment

```sql
-- Trigger enrichment for all products of a retailer
SELECT trigger_manual_enrichment('demo-retailer-id', 100);
```

### 3. Monitoring Enrichment Status

```sql
-- View enrichment monitoring dashboard
SELECT * FROM enrichment_monitoring 
WHERE retailer_id = 'demo-retailer-id'
ORDER BY last_enriched_at DESC;
```

## Error Handling

### 1. API Failures
- Automatic retry mechanism (up to 3 attempts)
- Exponential backoff for rate limiting
- Fallback to basic enrichment if AI fails

### 2. Data Consistency
- Transactional operations ensure data integrity
- Rollback on critical failures
- Audit logging for all operations

### 3. Performance Optimization
- Async processing queue prevents blocking
- Batch processing for efficiency
- Smart change detection (only enrich when needed)

## Configuration

### Environment Variables Required

```bash
# DeepSeek AI Configuration
DEEPSEEK_API_KEY=your_deepseek_api_key

# Supabase Configuration
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### Database Settings

```sql
-- Set DeepSeek API key in database settings
ALTER DATABASE postgres SET app.deepseek_api_key = 'your_api_key';
```

## Monitoring and Maintenance

### 1. Performance Metrics

- **Enrichment Rate**: Percentage of products successfully enriched
- **Processing Time**: Average time per enrichment operation
- **Confidence Score**: AI confidence in extracted attributes
- **Error Rate**: Percentage of failed enrichment attempts

### 2. Queue Management

```sql
-- Check queue status
SELECT status, COUNT(*) FROM enrichment_queue GROUP BY status;

-- Clear failed items older than 7 days
DELETE FROM enrichment_queue 
WHERE status = 'failed' AND created_at < now() - interval '7 days';
```

### 3. Log Cleanup

```sql
-- Clean old logs (keep last 30 days)
SELECT cleanup_enrichment_logs(30);
```

## Integration with Frontend

The enriched data automatically appears in the admin interface:

1. **Real-time Updates**: UI polls for enriched data changes
2. **Progress Indicators**: Show enrichment status and progress
3. **Error Notifications**: Display enrichment failures with retry options
4. **Statistics Dashboard**: Monitor enrichment performance and coverage

## Security Considerations

1. **Row Level Security (RLS)**: Enabled on all tables
2. **API Key Protection**: Stored securely in database settings
3. **Access Control**: Retailers can only access their own data
4. **Audit Trail**: Complete logging of all operations

## Troubleshooting

### Common Issues

1. **DeepSeek API Key Missing**
   ```sql
   -- Check if API key is configured
   SELECT current_setting('app.deepseek_api_key', true);
   ```

2. **Queue Items Stuck**
   ```sql
   -- Reset stuck processing items
   UPDATE enrichment_queue 
   SET status = 'pending', retry_count = 0 
   WHERE status = 'processing' AND created_at < now() - interval '1 hour';
   ```

3. **Low Confidence Scores**
   ```sql
   -- Find products with low confidence for manual review
   SELECT * FROM enriched_products 
   WHERE ai_confidence < 0.5 
   ORDER BY ai_confidence ASC;
   ```

## Performance Optimization

1. **Batch Processing**: Process multiple products simultaneously
2. **Smart Queuing**: Priority-based processing queue
3. **Change Detection**: Only enrich when significant changes occur
4. **Caching**: Cache API responses for similar products
5. **Rate Limiting**: Respect DeepSeek API limits

## Future Enhancements

1. **Multi-language Support**: Enrich products in multiple languages
2. **Image Analysis**: Add visual product analysis capabilities
3. **Competitive Analysis**: Compare with competitor products
4. **Trend Detection**: Identify trending product attributes
5. **A/B Testing**: Test different enrichment strategies