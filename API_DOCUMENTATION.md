# API Documentation

E-commerce Backend API - Complete Endpoint Reference

**Base URL:** `http://localhost:5000/api`

## Table of Contents

- [Authentication](#authentication)
- [Categories](#categories)
- [Response Format](#response-format)
- [Error Handling](#error-handling)

---

## Authentication

All protected endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

### 1. Register User

**Endpoint:** `POST /auth/register`
**Access:** Public
**Description:** Register a new user account

#### Request Body

```json
{
  "firstName": "string (required, 2-100 chars)",
  "lastName": "string (required, 2-100 chars)",
  "email": "string (required, valid email)",
  "password": "string (required, min 8 chars, must contain letter & number)",
  "phone": "string (optional, valid mobile number)"
}
```

#### Success Response (201 Created)

```json
{
  "message": "Registration successful. Please check your email to verify your account.",
  "user": {
    "id": 1,
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "phone": "+1234567890",
    "role": "customer",
    "isVerified": false,
    "createdAt": "2026-01-18T10:00:00.000Z"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### Error Responses

```json
// 400 Bad Request - Validation failed
{
  "message": "Validation failed",
  "errors": [
    {
      "msg": "Password must be at least 8 characters",
      "param": "password",
      "location": "body"
    }
  ]
}

// 409 Conflict - Email already exists
{
  "message": "Email already registered"
}

// 500 Internal Server Error
{
  "message": "Registration failed"
}
```

---

### 2. Login User

**Endpoint:** `POST /auth/login`
**Access:** Public
**Description:** Authenticate user and receive JWT token

#### Request Body

```json
{
  "email": "string (required, valid email)",
  "password": "string (required)"
}
```

#### Success Response (200 OK)

```json
{
  "message": "Login successful",
  "user": {
    "id": 1,
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "phone": "+1234567890",
    "role": "customer",
    "isVerified": false,
    "createdAt": "2026-01-18T10:00:00.000Z"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### Error Responses

```json
// 400 Bad Request - Validation failed
{
  "message": "Validation failed",
  "errors": [...]
}

// 401 Unauthorized - Invalid credentials
{
  "message": "Invalid email or password"
}

// 500 Internal Server Error
{
  "message": "Login failed"
}
```

---

### 3. Get Current User

**Endpoint:** `GET /auth/me`
**Access:** Protected (Requires Authentication)
**Description:** Get current authenticated user's profile

#### Request Headers

```
Authorization: Bearer <token>
```

#### Success Response (200 OK)

```json
{
  "user": {
    "id": 1,
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "phone": "+1234567890",
    "role": "customer",
    "isVerified": false,
    "createdAt": "2026-01-18T10:00:00.000Z"
  }
}
```

#### Error Responses

```json
// 401 Unauthorized - No token or invalid token
{
  "message": "Access token is required"
}

// 404 Not Found - User not found
{
  "message": "User not found"
}

// 500 Internal Server Error
{
  "message": "Failed to get user profile"
}
```

---

### 4. Logout User

**Endpoint:** `POST /auth/logout`
**Access:** Protected (Requires Authentication)
**Description:** Logout user (client-side token removal)

#### Request Headers

```
Authorization: Bearer <token>
```

#### Success Response (200 OK)

```json
{
  "message": "Logout successful"
}
```

---

### 5. Forgot Password

**Endpoint:** `POST /auth/forgot-password`
**Access:** Public
**Description:** Request password reset link via email

#### Request Body

```json
{
  "email": "string (required, valid email)"
}
```

#### Success Response (200 OK)

```json
{
  "message": "If an account exists with this email, a reset link will be sent"
}
```

**Note:** Always returns success to prevent email enumeration

#### Error Responses

```json
// 400 Bad Request
{
  "message": "Email is required"
}

// 500 Internal Server Error
{
  "message": "Failed to process request"
}
```

---

### 6. Reset Password

**Endpoint:** `POST /auth/reset-password`
**Access:** Public
**Description:** Reset password using token from email

#### Request Body

```json
{
  "token": "string (required, from email)",
  "newPassword": "string (required, min 8 chars, must contain letter & number)"
}
```

#### Success Response (200 OK)

```json
{
  "message": "Password reset successful"
}
```

#### Error Responses

```json
// 400 Bad Request - Validation failed
{
  "message": "Token and new password are required"
}

// 400 Bad Request - Invalid/expired token
{
  "message": "Invalid or expired reset token"
}

// 400 Bad Request - Token expired
{
  "message": "Reset token has expired"
}

// 500 Internal Server Error
{
  "message": "Failed to reset password"
}
```

---

### 7. Change Password

**Endpoint:** `PUT /auth/change-password`
**Access:** Protected (Requires Authentication)
**Description:** Change password for authenticated user

#### Request Headers

```
Authorization: Bearer <token>
```

#### Request Body

```json
{
  "currentPassword": "string (required)",
  "newPassword": "string (required, min 8 chars)"
}
```

#### Success Response (200 OK)

```json
{
  "message": "Password changed successfully"
}
```

#### Error Responses

```json
// 400 Bad Request - Missing fields
{
  "message": "Current password and new password are required"
}

// 400 Bad Request - Password too short
{
  "message": "New password must be at least 8 characters"
}

// 401 Unauthorized - Wrong current password
{
  "message": "Current password is incorrect"
}

// 404 Not Found
{
  "message": "User not found"
}

// 500 Internal Server Error
{
  "message": "Failed to change password"
}
```

---

## Categories

### 1. Get All Categories

**Endpoint:** `GET /categories`
**Access:** Public
**Description:** Get all categories with optional filters

#### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `isActive` | boolean | No | Filter by active status (`true` or `false`) |
| `parentId` | integer/null | No | Filter by parent category ID, use `null` for root categories |
| `includeSubcategories` | boolean | No | Include subcategories (`true` or `false`) |

#### Success Response (200 OK)

```json
{
  "message": "Categories retrieved successfully",
  "count": 2,
  "categories": [
    {
      "id": 1,
      "name": "Electronics",
      "slug": "electronics",
      "description": "Electronic devices and accessories",
      "image": "https://example.com/electronics.jpg",
      "parentId": null,
      "isActive": true,
      "sortOrder": 0,
      "createdAt": "2026-01-18T10:00:00.000Z",
      "updatedAt": "2026-01-18T10:00:00.000Z",
      "subcategories": [
        {
          "id": 2,
          "name": "Smartphones",
          "slug": "smartphones",
          "description": "Mobile phones",
          "image": "https://example.com/phones.jpg",
          "parentId": 1,
          "isActive": true,
          "sortOrder": 0,
          "createdAt": "2026-01-18T10:00:00.000Z",
          "updatedAt": "2026-01-18T10:00:00.000Z"
        }
      ]
    }
  ]
}
```

#### Error Responses

```json
// 500 Internal Server Error
{
  "message": "Failed to retrieve categories"
}
```

---

### 2. Get Category Tree

**Endpoint:** `GET /categories/tree`
**Access:** Public
**Description:** Get hierarchical category tree structure (up to 3 levels deep)

#### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `isActive` | boolean | No | Filter by active status (`true` or `false`) |

#### Success Response (200 OK)

```json
{
  "message": "Category tree retrieved successfully",
  "count": 1,
  "categories": [
    {
      "id": 1,
      "name": "Electronics",
      "slug": "electronics",
      "description": "Electronic devices",
      "image": "https://example.com/electronics.jpg",
      "parentId": null,
      "isActive": true,
      "sortOrder": 0,
      "subcategories": [
        {
          "id": 2,
          "name": "Smartphones",
          "slug": "smartphones",
          "parentId": 1,
          "subcategories": [
            {
              "id": 3,
              "name": "Android",
              "slug": "android",
              "parentId": 2
            }
          ]
        }
      ]
    }
  ]
}
```

#### Error Responses

```json
// 500 Internal Server Error
{
  "message": "Failed to retrieve category tree"
}
```

---

### 3. Get Category by ID

**Endpoint:** `GET /categories/:id`
**Access:** Public
**Description:** Get single category by ID with parent and subcategories

#### URL Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | integer | Yes | Category ID |

#### Success Response (200 OK)

```json
{
  "message": "Category retrieved successfully",
  "category": {
    "id": 1,
    "name": "Electronics",
    "slug": "electronics",
    "description": "Electronic devices and accessories",
    "image": "https://example.com/electronics.jpg",
    "parentId": null,
    "isActive": true,
    "sortOrder": 0,
    "createdAt": "2026-01-18T10:00:00.000Z",
    "updatedAt": "2026-01-18T10:00:00.000Z",
    "subcategories": [...],
    "parent": null
  }
}
```

#### Error Responses

```json
// 400 Bad Request - Invalid ID
{
  "message": "Validation failed",
  "errors": [
    {
      "msg": "Category ID must be a valid integer",
      "param": "id",
      "location": "params"
    }
  ]
}

// 404 Not Found
{
  "message": "Category not found"
}

// 500 Internal Server Error
{
  "message": "Failed to retrieve category"
}
```

---

### 4. Get Category by Slug

**Endpoint:** `GET /categories/slug/:slug`
**Access:** Public
**Description:** Get single category by URL-friendly slug

#### URL Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `slug` | string | Yes | Category slug (lowercase, hyphens only) |

#### Success Response (200 OK)

```json
{
  "message": "Category retrieved successfully",
  "category": {
    "id": 1,
    "name": "Electronics",
    "slug": "electronics",
    "description": "Electronic devices and accessories",
    "image": "https://example.com/electronics.jpg",
    "parentId": null,
    "isActive": true,
    "sortOrder": 0,
    "createdAt": "2026-01-18T10:00:00.000Z",
    "updatedAt": "2026-01-18T10:00:00.000Z",
    "subcategories": [...],
    "parent": null
  }
}
```

#### Error Responses

```json
// 400 Bad Request - Invalid slug format
{
  "message": "Validation failed",
  "errors": [
    {
      "msg": "Slug must contain only lowercase letters, numbers, and hyphens",
      "param": "slug",
      "location": "params"
    }
  ]
}

// 404 Not Found
{
  "message": "Category not found"
}

// 500 Internal Server Error
{
  "message": "Failed to retrieve category"
}
```

---

### 5. Get Category Products

**Endpoint:** `GET /categories/:id/products`
**Access:** Public
**Description:** Get all products in a category

#### URL Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | integer | Yes | Category ID |

#### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `includeSubcategories` | boolean | No | Include products from subcategories (`true` or `false`) |

#### Success Response (200 OK)

```json
{
  "message": "Products retrieved successfully",
  "count": 2,
  "products": [
    {
      "id": 1,
      "name": "iPhone 15 Pro",
      "slug": "iphone-15-pro",
      "description": "Latest Apple smartphone",
      "price": 999.99,
      "compareAtPrice": 1099.99,
      "costPrice": 750.00,
      "sku": "IPH15PRO-256-BLK",
      "stockQuantity": 50,
      "lowStockThreshold": 10,
      "isActive": true,
      "isFeatured": true,
      "categoryId": 2,
      "createdAt": "2026-01-18T10:00:00.000Z",
      "updatedAt": "2026-01-18T10:00:00.000Z",
      "category": {
        "id": 2,
        "name": "Smartphones",
        "slug": "smartphones"
      }
    }
  ]
}
```

#### Error Responses

```json
// 400 Bad Request - Invalid ID
{
  "message": "Validation failed",
  "errors": [...]
}

// 404 Not Found
{
  "message": "Category not found"
}

// 500 Internal Server Error
{
  "message": "Failed to retrieve products"
}
```

---

### 6. Create Category

**Endpoint:** `POST /categories`
**Access:** Protected (Admin Only)
**Description:** Create a new category

#### Request Headers

```
Authorization: Bearer <admin_token>
```

#### Request Body

```json
{
  "name": "string (required, 2-100 chars)",
  "slug": "string (optional, 2-120 chars, lowercase/numbers/hyphens)",
  "description": "string (optional, max 5000 chars)",
  "image": "string (optional, valid URL, max 500 chars)",
  "parentId": "integer (optional, valid category ID)",
  "isActive": "boolean (optional, default: true)",
  "sortOrder": "integer (optional, non-negative, default: 0)"
}
```

**Note:** If `slug` is not provided, it will be auto-generated from the `name`

#### Success Response (201 Created)

```json
{
  "message": "Category created successfully",
  "category": {
    "id": 1,
    "name": "Electronics",
    "slug": "electronics",
    "description": "Electronic devices and accessories",
    "image": "https://example.com/electronics.jpg",
    "parentId": null,
    "isActive": true,
    "sortOrder": 0,
    "createdAt": "2026-01-18T10:00:00.000Z",
    "updatedAt": "2026-01-18T10:00:00.000Z"
  }
}
```

#### Error Responses

```json
// 400 Bad Request - Validation failed
{
  "message": "Validation failed",
  "errors": [
    {
      "msg": "Category name is required",
      "param": "name",
      "location": "body"
    }
  ]
}

// 401 Unauthorized - Not authenticated
{
  "message": "Access token is required"
}

// 403 Forbidden - Not admin
{
  "message": "Access denied. Admin privileges required."
}

// 404 Not Found - Parent category not found
{
  "message": "Parent category not found"
}

// 409 Conflict - Slug already exists
{
  "message": "Category with this slug already exists"
}

// 500 Internal Server Error
{
  "message": "Failed to create category"
}
```

---

### 7. Update Category

**Endpoint:** `PUT /categories/:id`
**Access:** Protected (Admin Only)
**Description:** Update existing category

#### Request Headers

```
Authorization: Bearer <admin_token>
```

#### URL Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | integer | Yes | Category ID to update |

#### Request Body

All fields are optional:

```json
{
  "name": "string (optional, 2-100 chars)",
  "slug": "string (optional, 2-120 chars, lowercase/numbers/hyphens)",
  "description": "string (optional, max 5000 chars)",
  "image": "string (optional, valid URL, max 500 chars)",
  "parentId": "integer or null (optional)",
  "isActive": "boolean (optional)",
  "sortOrder": "integer (optional, non-negative)"
}
```

**Note:** If `name` is updated without providing `slug`, a new slug will be auto-generated

#### Success Response (200 OK)

```json
{
  "message": "Category updated successfully",
  "category": {
    "id": 1,
    "name": "Consumer Electronics",
    "slug": "consumer-electronics",
    "description": "Updated description",
    "image": "https://example.com/new-image.jpg",
    "parentId": null,
    "isActive": true,
    "sortOrder": 0,
    "createdAt": "2026-01-18T10:00:00.000Z",
    "updatedAt": "2026-01-18T11:00:00.000Z"
  }
}
```

#### Error Responses

```json
// 400 Bad Request - Category cannot be its own parent
{
  "message": "Category cannot be its own parent"
}

// 400 Bad Request - Circular relationship
{
  "message": "Cannot set parent: would create circular relationship"
}

// 401 Unauthorized
{
  "message": "Access token is required"
}

// 403 Forbidden
{
  "message": "Access denied. Admin privileges required."
}

// 404 Not Found - Category not found
{
  "message": "Category not found"
}

// 404 Not Found - Parent category not found
{
  "message": "Parent category not found"
}

// 409 Conflict - Slug already exists
{
  "message": "Category with this slug already exists"
}

// 500 Internal Server Error
{
  "message": "Failed to update category"
}
```

---

### 8. Delete Category

**Endpoint:** `DELETE /categories/:id`
**Access:** Protected (Admin Only)
**Description:** Delete a category (only if no subcategories or products)

#### Request Headers

```
Authorization: Bearer <admin_token>
```

#### URL Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | integer | Yes | Category ID to delete |

#### Success Response (200 OK)

```json
{
  "message": "Category deleted successfully"
}
```

#### Error Responses

```json
// 400 Bad Request - Has subcategories
{
  "message": "Cannot delete category with subcategories. Delete or reassign subcategories first."
}

// 400 Bad Request - Has products
{
  "message": "Cannot delete category with 5 associated product(s). Reassign or delete products first."
}

// 401 Unauthorized
{
  "message": "Access token is required"
}

// 403 Forbidden
{
  "message": "Access denied. Admin privileges required."
}

// 404 Not Found
{
  "message": "Category not found"
}

// 500 Internal Server Error
{
  "message": "Failed to delete category"
}
```

---

## Response Format

### Success Response Structure

All successful responses follow this general structure:

```json
{
  "message": "Operation description",
  "data": { /* Response data */ }
}
```

### Error Response Structure

All error responses follow this structure:

```json
{
  "message": "Error description",
  "errors": [ /* Optional validation errors */ ]
}
```

### HTTP Status Codes

| Status Code | Description |
|-------------|-------------|
| 200 | Success (OK) |
| 201 | Resource created successfully |
| 400 | Bad Request (validation failed) |
| 401 | Unauthorized (authentication required) |
| 403 | Forbidden (insufficient permissions) |
| 404 | Resource not found |
| 409 | Conflict (duplicate resource) |
| 500 | Internal Server Error |

---

## Error Handling

### Validation Errors

Validation errors include detailed information about each field:

```json
{
  "message": "Validation failed",
  "errors": [
    {
      "msg": "Email is required",
      "param": "email",
      "location": "body"
    },
    {
      "msg": "Password must be at least 8 characters",
      "param": "password",
      "location": "body"
    }
  ]
}
```

### Authentication Errors

```json
// Missing token
{
  "message": "Access token is required"
}

// Invalid token
{
  "message": "Invalid or expired token"
}

// Insufficient permissions
{
  "message": "Access denied. Admin privileges required."
}
```

---

## User Roles

The API supports three user roles:

| Role | Description | Access Level |
|------|-------------|--------------|
| `customer` | Regular user | Public & own resources |
| `seller` | Vendor user | Seller & public endpoints |
| `admin` | Administrator | All endpoints |

**Note:** Role-based access is enforced using middleware:
- `authenticate` - Requires valid JWT token
- `isAdmin` - Requires admin role
- `isSeller` - Requires seller or admin role

---

## Notes

1. **JWT Token Expiry:** Tokens expire based on `JWT_EXPIRES_IN` environment variable (default: 7 days)
2. **Password Requirements:** Minimum 8 characters, must contain at least one letter and one number
3. **Slug Generation:** Auto-generated from names using lowercase and hyphens, ensured to be unique
4. **Category Hierarchy:** Supports nested categories up to 3 levels deep in tree view
5. **Circular References:** System prevents circular parent-child relationships in categories
6. **Email Enumeration Prevention:** Password reset always returns success, regardless of email existence

---

**Last Updated:** January 18, 2026
**API Version:** 1.0.0
