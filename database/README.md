# Database Setup

## PostgreSQL Database Setup

### 1. Create Database
```bash
psql -U postgres
CREATE DATABASE food_store_calculator;
\c food_store_calculator
```

### 2. Run Schema
```bash
psql -U postgres -d food_store_calculator -f database/schema.sql
```

### 3. Seed Data
```bash
psql -U postgres -d food_store_calculator -f database/seed.sql
```

### Connection String
```
DATABASE_URL="postgresql://username:password@localhost:5432/food_store_calculator"
```

## Database Schema

### Products Table
- Stores all 7 menu items with prices
- `has_pair_discount`: Tracks which products (Orange, Pink, Green) get 5% pair discount

### Orders Table
- Stores order information with discount calculations
- Tracks member card usage

### Order Items Table
- Line items for each order

### Red Set Orders Table
- Tracks Red set orders with timestamps
- Used to enforce 1-hour restriction
