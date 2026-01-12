# Takealot Clone - E-commerce Backend

A Takealot-inspired e-commerce backend built with Node.js, Express, and Sequelize ORM with MySQL.

## Database Schema

The application uses the following tables:

| Table | Description |
|-------|-------------|
| `users` | Customer, admin, and seller accounts |
| `categories` | Product categories (supports nested subcategories) |
| `products` | Product listings with pricing, stock, and metadata |
| `product_images` | Multiple images per product |
| `addresses` | User shipping and billing addresses |
| `carts` | User shopping carts |
| `cart_items` | Items in shopping carts |
| `orders` | Customer orders with status tracking |
| `order_items` | Individual items in orders |
| `reviews` | Product reviews and ratings |
| `wishlists` | User wishlists |

## Entity Relationships

```
User
 ├── has many → Addresses
 ├── has one → Cart
 │              └── has many → CartItems → belongs to Product
 ├── has many → Orders
 │              ├── belongs to → Address (shipping)
 │              └── has many → OrderItems → belongs to Product
 ├── has many → Reviews → belongs to Product
 └── has many → Wishlist → belongs to Product

Category (self-referencing for subcategories)
 └── has many → Products
                └── has many → ProductImages
```

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

Copy the example env file and update with your database credentials:

```bash
cp .env.example .env
```

Edit `.env`:
```
DB_HOST=127.0.0.1
DB_PORT=3306
DB_NAME=takealot_clone
DB_USER=root
DB_PASSWORD=your_password
```

### 3. Create Database

Create the MySQL database:

```bash
# Using sequelize-cli
npm run db:create

# Or manually in MySQL
mysql -u root -p -e "CREATE DATABASE takealot_clone;"
```

### 4. Run Migrations

```bash
npm run db:migrate
```

### 5. Seed Demo Data (Optional)

```bash
npm run db:seed
```

### 6. Start the Server

```bash
# Development
npm run dev

# Production
npm start
```

## Sequelize CLI Commands

```bash
# Create database
npm run db:create

# Run all migrations
npm run db:migrate

# Undo last migration
npm run db:migrate:undo

# Undo all migrations
npm run db:migrate:undo:all

# Run all seeders
npm run db:seed

# Undo all seeders
npm run db:seed:undo

# Reset database (undo all, migrate, seed)
npm run db:reset
```

## Creating New Migrations

```bash
# Generate a new migration
npx sequelize-cli migration:generate --name add-column-to-products
```

## Model Associations Quick Reference

```javascript
// Get user with their cart and items
const user = await User.findByPk(userId, {
  include: [{
    model: Cart,
    as: 'cart',
    include: [{
      model: CartItem,
      as: 'items',
      include: [{ model: Product, as: 'product' }]
    }]
  }]
});

// Get product with category and reviews
const product = await Product.findByPk(productId, {
  include: [
    { model: Category, as: 'category' },
    { model: ProductImage, as: 'images' },
    { 
      model: Review, 
      as: 'reviews',
      include: [{ model: User, as: 'user' }]
    }
  ]
});

// Get category with subcategories
const category = await Category.findByPk(categoryId, {
  include: [{ model: Category, as: 'subcategories' }]
});

// Get order with all details
const order = await Order.findByPk(orderId, {
  include: [
    { model: User, as: 'user' },
    { model: Address, as: 'shippingAddress' },
    { 
      model: OrderItem, 
      as: 'items',
      include: [{ model: Product, as: 'product' }]
    }
  ]
});
```

## Project Structure

```
takealot-clone/
├── config/
│   └── database.js       # Sequelize database configuration
├── migrations/           # Database migrations
├── models/
│   ├── index.js          # Model loader and associations
│   ├── User.js
│   ├── Category.js
│   ├── Product.js
│   ├── ProductImage.js
│   ├── Address.js
│   ├── Cart.js
│   ├── CartItem.js
│   ├── Order.js
│   ├── OrderItem.js
│   ├── Review.js
│   └── Wishlist.js
├── seeders/              # Database seeders
├── src/                  # Application source code (to be created)
├── .env.example
├── .sequelizerc
├── package.json
└── README.md
```

## Auth Module (Completed ✓)

The authentication module is ready to use:

### Auth Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/register` | Register new user | No |
| POST | `/api/auth/login` | Login user | No |
| GET | `/api/auth/me` | Get current user | Yes |
| POST | `/api/auth/logout` | Logout user | Yes |
| PUT | `/api/auth/change-password` | Change password | Yes |
| POST | `/api/auth/forgot-password` | Request password reset | No |
| POST | `/api/auth/reset-password` | Reset password with token | No |

### Using Protected Routes

Include the JWT token in the Authorization header:

```javascript
// Frontend example with fetch
const response = await fetch('/api/auth/me', {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  },
});
```

### Auth Middleware Usage

```javascript
const { authenticate, authorize, isAdmin } = require('./middleware/auth.middleware');

// Require authentication
router.get('/profile', authenticate, profileController.get);

// Require specific role
router.get('/admin/users', authenticate, isAdmin, adminController.getUsers);

// Require one of multiple roles
router.post('/products', authenticate, authorize('seller', 'admin'), productController.create);
```

### Testing Auth Endpoints

See `docs/auth-api-testing.sh` for curl commands to test all endpoints.

---

## Next Steps for Your Student

Build the remaining modules in this order:

### Phase 2: User Profile
- [ ] `GET /api/users/profile` - Get profile
- [ ] `PUT /api/users/profile` - Update profile
- [ ] `GET /api/users/addresses` - List addresses
- [ ] `POST /api/users/addresses` - Add address
- [ ] `PUT /api/users/addresses/:id` - Update address
- [ ] `DELETE /api/users/addresses/:id` - Delete address

### Phase 3: Product Discovery
- [ ] `GET /api/categories` - List categories with subcategories
- [ ] `GET /api/categories/:slug` - Get category by slug
- [ ] `GET /api/products` - List products (with pagination, filters)
- [ ] `GET /api/products/:slug` - Get product details
- [ ] `GET /api/products/search` - Search products

### Phase 4: Shopping Flow
- [ ] `GET /api/cart` - Get user's cart
- [ ] `POST /api/cart/items` - Add item to cart
- [ ] `PUT /api/cart/items/:id` - Update cart item quantity
- [ ] `DELETE /api/cart/items/:id` - Remove from cart
- [ ] `GET /api/wishlist` - Get wishlist
- [ ] `POST /api/wishlist` - Add to wishlist
- [ ] `DELETE /api/wishlist/:productId` - Remove from wishlist

### Phase 5: Checkout & Orders
- [ ] `POST /api/orders` - Create order from cart
- [ ] `GET /api/orders` - List user's orders
- [ ] `GET /api/orders/:id` - Get order details

### Phase 6: Reviews
- [ ] `GET /api/products/:id/reviews` - Get product reviews
- [ ] `POST /api/products/:id/reviews` - Add review
- [ ] `PUT /api/reviews/:id` - Update review
- [ ] `DELETE /api/reviews/:id` - Delete review

### Phase 7: Admin Panel (Optional)
- [ ] Product CRUD
- [ ] Category CRUD
- [ ] Order management
- [ ] User management
