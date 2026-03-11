# Frontend Architecture - Feature-Based DDD

## 📐 Architecture Overview

This frontend follows **Feature-Based Domain-Driven Design (DDD)** principles with clear separation of concerns across four distinct layers:


```
┌─────────────────────────────────────────────────────────────┐
│                    UI Layer (Presentation)                  │
│              React Components, Pages, Layouts               │
└──────────────────────┬──────────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────────┐
│                  Application Layer                          │
│         Hooks, State Management, Business Logic             │
└──────────────────────┬──────────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────────┐
│                   Domain Layer                              │
│          Types, Entities, Business Rules                    │
└──────────────────────┬──────────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────────┐
│               Infrastructure Layer                          │
│              API Services, External Systems                 │
└─────────────────────────────────────────────────────────────┘
```

---

## 📁 Directory Structure

```
src/
├── modules/                    # Feature Modules (Bounded Contexts)
│   ├── product/               # Product Feature Module
│   │   ├── components/        # UI Layer - React Components
│   │   │   ├── ProductCard.tsx
│   │   │   └── ProductList.tsx
│   │   ├── hooks/            # Application Layer - Business Logic
│   │   │   └── useProducts.ts
│   │   ├── store/            # Application Layer - State Management
│   │   │   └── productStore.ts
│   │   ├── services/         # Infrastructure Layer - API Calls
│   │   │   └── productApi.ts
│   │   ├── types/            # Domain Layer - Business Types
│   │   │   └── product.ts
│   │   └── index.ts          # Public API (Barrel Export)
│   │
│   ├── cart/                 # Cart Feature Module
│   │   ├── components/
│   │   │   └── MemberCardInput.tsx
│   │   ├── hooks/
│   │   │   └── useCart.ts
│   │   ├── store/
│   │   │   └── cartStore.ts
│   │   ├── types/
│   │   │   └── cart.ts
│   │   └── index.ts
│   │
│   └── order/                # Order Feature Module
│       ├── components/
│       │   └── OrderSummary.tsx
│       ├── hooks/
│       │   └── useOrder.ts
│       ├── services/
│       │   └── orderApi.ts
│       ├── types/
│       │   └── order.ts
│       └── index.ts
│
├── shared/                    # Shared Resources (Cross-Cutting)
│   ├── components/           # Reusable UI Components
│   │   ├── ActionButtons.tsx
│   │   └── index.ts
│   ├── hooks/                # Reusable Hooks
│   ├── utils/                # Utility Functions
│   └── types/                # Shared Types
│
└── app/                      # Next.js App Router
    ├── page.tsx              # Main Page (Orchestrator)
    ├── layout.tsx            # Root Layout
    ├── globals.css           # Global Styles
    └── providers/            # Global Providers
```

---

## 🎯 Layer Responsibilities

### 1. **UI Layer (Components)**
**Location:** `modules/*/components/`

**Purpose:** Pure presentation logic

**Responsibilities:**
- Render UI elements
- Handle user interactions
- Display data received via props
- No direct state management or API calls

**Example:**
```tsx
// ProductCard.tsx - Pure UI Component
export const ProductCard: React.FC<ProductCardProps> = ({ 
  product, 
  quantity, 
  onAdd, 
  onRemove 
}) => {
  return (
    <Card>
      <h3>{product.name}</h3>
      <Button onClick={onAdd}>Add</Button>
    </Card>
  );
};
```

---

### 2. **Application Layer (Hooks & Store)**
**Location:** `modules/*/hooks/`, `modules/*/store/`

**Purpose:** Business logic and state management

**Responsibilities:**
- Orchestrate domain operations
- Manage application state (Zustand)
- Handle side effects
- Coordinate between UI and Infrastructure layers

**Example:**
```tsx
// useProducts.ts - Application Logic
export const useProducts = () => {
  const { products, setProducts, setLoading } = useProductStore();

  const fetchProducts = async () => {
    setLoading(true);
    const data = await productApi.getAll(); // Infrastructure
    setProducts(data); // Domain transformation
  };

  return { products, fetchProducts };
};
```

---

### 3. **Domain Layer (Types)**
**Location:** `modules/*/types/`

**Purpose:** Core business entities and rules

**Responsibilities:**
- Define business entities
- Define value objects
- Business validation rules
- Domain constants

**Example:**
```tsx
// product.ts - Domain Types
export interface Product {
  id: number;
  name: string;
  price: number;
  hasPairDiscount: boolean; // Business rule
}

export const PRODUCT_COLORS: Record<string, string> = {
  red: '#ff4d4f',
  // Domain constants
};
```

---

### 4. **Infrastructure Layer (Services)**
**Location:** `modules/*/services/`

**Purpose:** External system communication

**Responsibilities:**
- HTTP API calls
- WebSocket connections
- Local storage
- External service integration

**Example:**
```tsx
// productApi.ts - Infrastructure
export const productApi = {
  async getAll(): Promise<Product[]> {
    const response = await axios.get('/products');
    return response.data;
  },
};
```

---

## 🔄 Data Flow

### Example: Loading Products

```
1. UI Layer (ProductList.tsx)
   └─> useProducts() hook

2. Application Layer (useProducts.ts)
   ├─> useProductStore (state)
   └─> productApi.getAll() (infrastructure)

3. Infrastructure Layer (productApi.ts)
   └─> HTTP GET /products

4. Domain Layer (product.ts)
   └─> Product[] type validation

5. Application Layer (productStore.ts)
   └─> setProducts(data)

6. UI Layer (ProductList.tsx)
   └─> Re-render with new data
```

---

## 🎨 Module Design Principles

### 1. **Feature-Based Organization**
Each module represents a **bounded context** in DDD terms:
- `product` - Product catalog management
- `cart` - Shopping cart operations
- `order` - Order creation and calculation

### 2. **Public API Pattern**
Each module exports through `index.ts`:
```tsx
// modules/product/index.ts
export { ProductList, ProductCard } from './components';
export { useProducts } from './hooks';
export type { Product } from './types';
```

### 3. **Single Responsibility**
Each file has one clear purpose:
- `ProductCard.tsx` - Display one product
- `ProductList.tsx` - Display list of products
- `useProducts.ts` - Product business logic
- `productStore.ts` - Product state management

### 4. **Dependency Direction**
Dependencies flow inward:
```
UI Layer → Application Layer → Domain Layer ← Infrastructure Layer
```

---

## 📦 Module Communication

### Import from Public APIs Only
```tsx
// ✅ CORRECT - Import from module's public API
import { ProductList, useProducts } from '@/modules/product';

// ❌ WRONG - Don't import internal implementation
import { ProductList } from '@/modules/product/components/ProductList';
```

### Cross-Module Communication
```tsx
// Cart module uses Product types
import { Product } from '@/modules/product';

export interface CartItem {
  product: Product;  // Reference to Product domain type
  quantity: number;
}
```

---

## 🧪 Testing Strategy

### 1. **Component Tests (UI Layer)**
```tsx
test('ProductCard displays product name', () => {
  render(<ProductCard product={mockProduct} />);
  expect(screen.getByText('Red Set')).toBeInTheDocument();
});
```

### 2. **Hook Tests (Application Layer)**
```tsx
test('useProducts fetches products', async () => {
  const { result } = renderHook(() => useProducts());
  await waitFor(() => {
    expect(result.current.products).toHaveLength(7);
  });
});
```

### 3. **Service Tests (Infrastructure Layer)**
```tsx
test('productApi.getAll returns products', async () => {
  const products = await productApi.getAll();
  expect(products).toBeDefined();
});
```

---

## 🚀 Benefits of This Architecture

### ✅ **Readability**
- Clear separation of concerns
- Easy to find files (feature-based)
- Self-documenting structure

### ✅ **Maintainability**
- Changes isolated to specific layers
- Easy to refactor components
- Clear dependency flow

### ✅ **Extensibility**
- Add new features as modules
- Extend existing modules easily
- Reuse shared components

### ✅ **Testability**
- Each layer can be tested independently
- Mock dependencies easily
- Clear test boundaries

---

## 📝 Adding a New Feature

### Step-by-Step Guide

1. **Create Module Directory**
```bash
mkdir -p src/modules/new-feature/{components,hooks,services,store,types}
```

2. **Define Domain Types**
```tsx
// src/modules/new-feature/types/feature.ts
export interface Feature {
  id: number;
  name: string;
}
```

3. **Create Infrastructure Service**
```tsx
// src/modules/new-feature/services/featureApi.ts
export const featureApi = {
  async getAll(): Promise<Feature[]> {
    // API call
  },
};
```

4. **Create State Management**
```tsx
// src/modules/new-feature/store/featureStore.ts
export const useFeatureStore = create<FeatureState>((set) => ({
  features: [],
  setFeatures: (features) => set({ features }),
}));
```

5. **Create Application Hook**
```tsx
// src/modules/new-feature/hooks/useFeature.ts
export const useFeature = () => {
  // Business logic
};
```

6. **Create UI Components**
```tsx
// src/modules/new-feature/components/FeatureCard.tsx
export const FeatureCard = ({ feature }) => {
  // Render
};
```

7. **Export Public API**
```tsx
// src/modules/new-feature/index.ts
export { FeatureCard } from './components';
export { useFeature } from './hooks';
export type { Feature } from './types';
```

8. **Use in Page**
```tsx
// src/app/page.tsx
import { FeatureCard, useFeature } from '@/modules/new-feature';
```

---

## 🎓 Key Concepts

### Bounded Context
Each module represents a bounded context - a specific area of the domain with clear boundaries.

### Aggregates
Domain types represent aggregates - clusters of related objects treated as a unit.

### Repositories Pattern
Services act as repositories - abstracting data access.

### Use Cases
Hooks encapsulate use cases - specific application operations.

---

## 📚 Further Reading

- [Domain-Driven Design by Eric Evans](https://www.domainlanguage.com/ddd/)
- [Feature-Sliced Design](https://feature-sliced.design/)
- [Zustand State Management](https://zustand-demo.pmnd.rs/)
- [Next.js App Router](https://nextjs.org/docs/app)

---

**Built with:** Next.js 14 • TypeScript • Ant Design • Tailwind CSS • Zustand
