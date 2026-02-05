# API Documentation

E-commerce Backend API - Complete Endpoint Reference

**Base URL:** `http://localhost:5000/api`

## Table of Contents

- [Authentication](#authentication)
- [User Profile Management](#user-profile-management)
- [Address Management](#address-management)
- [Admin User Management](#admin-user-management)
- [Categories](#categories)
- [Products](#products)
- [Cart](#cart)
- [Wishlist](#wishlist)
- [Orders](#orders)
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
// 422 Unprocessable Entity - Validation failed
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
// 422 Unprocessable Entity - Validation failed
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

## User Profile Management

### 8. Update Profile

**Endpoint:** `PUT /auth/update-profile`
**Access:** Protected (Requires Authentication)
**Description:** Update user profile details with optional profile picture upload

#### Request Headers

```
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

#### Request Body (multipart/form-data)

All fields are optional:

| Field | Type | Description |
|-------|------|-------------|
| `firstName` | string | First name (2-100 chars) |
| `lastName` | string | Last name (2-100 chars) |
| `email` | string | Email address (valid email, must be unique) |
| `phone` | string | Phone number (valid format or empty string to clear) |
| `profilePicture` | file | Profile picture image (max 2MB, jpg/jpeg/png/gif) |

#### Success Response (200 OK)

```json
{
  "message": "Profile updated successfully",
  "user": {
    "id": 1,
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@example.com",
    "phone": "+27123456789",
    "profilePicture": "/uploads/profiles/user-1-1738742856789-123456789.jpg",
    "role": "customer",
    "isVerified": true,
    "createdAt": "2026-01-18T10:00:00.000Z"
  }
}
```

#### Error Responses

```json
// 422 Unprocessable Entity - Validation failed
{
  "message": "Validation failed",
  "errors": [
    {
      "msg": "First name cannot be empty",
      "param": "firstName",
      "location": "body"
    }
  ]
}

// 400 Bad Request - File too large
{
  "message": "File size exceeds the 2MB limit"
}

// 400 Bad Request - Invalid file type
{
  "message": "Only image files (jpg, jpeg, png, gif) are allowed"
}

// 401 Unauthorized - Not authenticated
{
  "message": "Access token is required"
}

// 404 Not Found - User not found
{
  "message": "User not found"
}

// 409 Conflict - Email already in use
{
  "message": "Email is already in use"
}

// 500 Internal Server Error
{
  "message": "Failed to update profile"
}
```

**Note:** When uploading a new profile picture, the old profile picture is automatically deleted. Old profile picture path must exist on the server filesystem.

---

## Address Management

### 1. Get All User Addresses

**Endpoint:** `GET /addresses`
**Access:** Protected (Requires Authentication)
**Description:** Get all addresses for the authenticated user, ordered by default status and creation date

#### Request Headers

```
Authorization: Bearer <token>
```

#### Success Response (200 OK)

```json
{
  "addresses": [
    {
      "id": 1,
      "userId": 1,
      "label": "Home",
      "recipientName": "John Doe",
      "phone": "+27123456789",
      "streetAddress": "123 Main Street",
      "addressLine2": "Apartment 4B",
      "suburb": "Gardens",
      "city": "Cape Town",
      "province": "Western Cape",
      "postalCode": "8001",
      "country": "South Africa",
      "isDefault": true,
      "type": "both",
      "createdAt": "2026-01-18T10:00:00.000Z",
      "updatedAt": "2026-01-18T10:00:00.000Z"
    },
    {
      "id": 2,
      "userId": 1,
      "label": "Work",
      "recipientName": "John Doe",
      "phone": "+27987654321",
      "streetAddress": "456 Business Ave",
      "addressLine2": null,
      "suburb": "CBD",
      "city": "Johannesburg",
      "province": "Gauteng",
      "postalCode": "2001",
      "country": "South Africa",
      "isDefault": false,
      "type": "shipping",
      "createdAt": "2026-01-19T10:00:00.000Z",
      "updatedAt": "2026-01-19T10:00:00.000Z"
    }
  ],
  "count": 2
}
```

#### Error Responses

```json
// 401 Unauthorized
{
  "message": "Access token is required"
}

// 500 Internal Server Error
{
  "message": "Failed to retrieve addresses"
}
```

---

### 2. Get Address by ID

**Endpoint:** `GET /addresses/:id`
**Access:** Protected (Requires Authentication)
**Description:** Get a specific address by ID (user can only access own addresses)

#### Request Headers

```
Authorization: Bearer <token>
```

#### URL Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | integer | Yes | Address ID |

#### Success Response (200 OK)

```json
{
  "address": {
    "id": 1,
    "userId": 1,
    "label": "Home",
    "recipientName": "John Doe",
    "phone": "+27123456789",
    "streetAddress": "123 Main Street",
    "addressLine2": "Apartment 4B",
    "suburb": "Gardens",
    "city": "Cape Town",
    "province": "Western Cape",
    "postalCode": "8001",
    "country": "South Africa",
    "isDefault": true,
    "type": "both",
    "createdAt": "2026-01-18T10:00:00.000Z",
    "updatedAt": "2026-01-18T10:00:00.000Z"
  }
}
```

#### Error Responses

```json
// 422 Unprocessable Entity - Validation failed
{
  "message": "Validation failed",
  "errors": [
    {
      "msg": "Address ID must be a valid integer",
      "param": "id",
      "location": "params"
    }
  ]
}

// 401 Unauthorized
{
  "message": "Access token is required"
}

// 404 Not Found
{
  "message": "Address not found"
}

// 500 Internal Server Error
{
  "message": "Failed to retrieve address"
}
```

---

### 3. Create Address

**Endpoint:** `POST /addresses`
**Access:** Protected (Requires Authentication)
**Description:** Create a new address for the authenticated user

#### Request Headers

```
Authorization: Bearer <token>
```

#### Request Body

```json
{
  "label": "string (optional, max 50 chars)",
  "recipientName": "string (required, 2-200 chars)",
  "phone": "string (required, valid phone format)",
  "streetAddress": "string (required, 5-255 chars)",
  "addressLine2": "string (optional, max 255 chars)",
  "suburb": "string (optional, max 100 chars)",
  "city": "string (required, 2-100 chars)",
  "province": "string (required, 2-100 chars)",
  "postalCode": "string (required, 3-20 chars)",
  "country": "string (optional, 2-100 chars, default: 'South Africa')",
  "isDefault": "boolean (optional, default: false)",
  "type": "string (optional, one of: 'shipping', 'billing', 'both', default: 'both')"
}
```

#### Success Response (201 Created)

```json
{
  "message": "Address created successfully",
  "address": {
    "id": 1,
    "userId": 1,
    "label": "Home",
    "recipientName": "John Doe",
    "phone": "+27123456789",
    "streetAddress": "123 Main Street",
    "addressLine2": "Apartment 4B",
    "suburb": "Gardens",
    "city": "Cape Town",
    "province": "Western Cape",
    "postalCode": "8001",
    "country": "South Africa",
    "isDefault": true,
    "type": "both",
    "createdAt": "2026-01-18T10:00:00.000Z",
    "updatedAt": "2026-01-18T10:00:00.000Z"
  }
}
```

**Note:** If this is the first address for the user, it will automatically be set as default regardless of the `isDefault` value. If `isDefault` is set to `true`, all other addresses for the user will be set to `isDefault: false`.

#### Error Responses

```json
// 422 Unprocessable Entity - Validation failed
{
  "message": "Validation failed",
  "errors": [
    {
      "msg": "Recipient name is required",
      "param": "recipientName",
      "location": "body"
    },
    {
      "msg": "Street address must be between 5 and 255 characters",
      "param": "streetAddress",
      "location": "body"
    }
  ]
}

// 401 Unauthorized
{
  "message": "Access token is required"
}

// 500 Internal Server Error
{
  "message": "Failed to create address"
}
```

---

### 4. Update Address

**Endpoint:** `PUT /addresses/:id`
**Access:** Protected (Requires Authentication)
**Description:** Update an existing address (user can only update own addresses)

#### Request Headers

```
Authorization: Bearer <token>
```

#### URL Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | integer | Yes | Address ID to update |

#### Request Body

All fields are optional (same fields as Create Address):

```json
{
  "label": "string (optional, max 50 chars)",
  "recipientName": "string (optional, 2-200 chars)",
  "phone": "string (optional, valid phone format)",
  "streetAddress": "string (optional, 5-255 chars)",
  "addressLine2": "string (optional, max 255 chars)",
  "suburb": "string (optional, max 100 chars)",
  "city": "string (optional, 2-100 chars)",
  "province": "string (optional, 2-100 chars)",
  "postalCode": "string (optional, 3-20 chars)",
  "country": "string (optional, 2-100 chars)",
  "isDefault": "boolean (optional)",
  "type": "string (optional, one of: 'shipping', 'billing', 'both')"
}
```

#### Success Response (200 OK)

```json
{
  "message": "Address updated successfully",
  "address": {
    "id": 1,
    "userId": 1,
    "label": "Home (Updated)",
    "recipientName": "John Doe",
    "phone": "+27123456789",
    "streetAddress": "123 Main Street",
    "addressLine2": "Apartment 4B",
    "suburb": "Gardens",
    "city": "Cape Town",
    "province": "Western Cape",
    "postalCode": "8001",
    "country": "South Africa",
    "isDefault": true,
    "type": "both",
    "createdAt": "2026-01-18T10:00:00.000Z",
    "updatedAt": "2026-01-20T15:30:00.000Z"
  }
}
```

**Note:** If `isDefault` is changed to `true`, all other addresses for the user will be set to `isDefault: false`.

#### Error Responses

```json
// 422 Unprocessable Entity - Validation failed
{
  "message": "Validation failed",
  "errors": [
    {
      "msg": "Address ID must be a valid integer",
      "param": "id",
      "location": "params"
    }
  ]
}

// 401 Unauthorized
{
  "message": "Access token is required"
}

// 404 Not Found
{
  "message": "Address not found"
}

// 500 Internal Server Error
{
  "message": "Failed to update address"
}
```

---

### 5. Set Default Address

**Endpoint:** `PUT /addresses/:id/set-default`
**Access:** Protected (Requires Authentication)
**Description:** Set a specific address as the default address

#### Request Headers

```
Authorization: Bearer <token>
```

#### URL Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | integer | Yes | Address ID to set as default |

#### Success Response (200 OK)

```json
{
  "message": "Default address updated successfully",
  "address": {
    "id": 2,
    "userId": 1,
    "label": "Work",
    "recipientName": "John Doe",
    "phone": "+27987654321",
    "streetAddress": "456 Business Ave",
    "addressLine2": null,
    "suburb": "CBD",
    "city": "Johannesburg",
    "province": "Gauteng",
    "postalCode": "2001",
    "country": "South Africa",
    "isDefault": true,
    "type": "shipping",
    "createdAt": "2026-01-19T10:00:00.000Z",
    "updatedAt": "2026-01-20T16:00:00.000Z"
  }
}
```

**Note:** All other addresses for the user will automatically be set to `isDefault: false`.

#### Error Responses

```json
// 422 Unprocessable Entity - Validation failed
{
  "message": "Validation failed",
  "errors": [
    {
      "msg": "Address ID must be a valid integer",
      "param": "id",
      "location": "params"
    }
  ]
}

// 401 Unauthorized
{
  "message": "Access token is required"
}

// 404 Not Found
{
  "message": "Address not found"
}

// 500 Internal Server Error
{
  "message": "Failed to set default address"
}
```

---

### 6. Delete Address

**Endpoint:** `DELETE /addresses/:id`
**Access:** Protected (Requires Authentication)
**Description:** Delete an address (user can only delete own addresses)

#### Request Headers

```
Authorization: Bearer <token>
```

#### URL Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | integer | Yes | Address ID to delete |

#### Success Response (200 OK)

```json
{
  "message": "Address deleted successfully",
  "deletedAddressId": "1"
}
```

**Note:** If the deleted address was the default address, the most recently created address will automatically be set as the new default.

#### Error Responses

```json
// 422 Unprocessable Entity - Validation failed
{
  "message": "Validation failed",
  "errors": [
    {
      "msg": "Address ID must be a valid integer",
      "param": "id",
      "location": "params"
    }
  ]
}

// 401 Unauthorized
{
  "message": "Access token is required"
}

// 404 Not Found
{
  "message": "Address not found"
}

// 500 Internal Server Error
{
  "message": "Failed to delete address"
}
```

---

## Admin User Management

### 1. Get All Users

**Endpoint:** `GET /admin/users`
**Access:** Protected (Admin Only)
**Description:** Get all users with pagination and filtering

#### Request Headers

```
Authorization: Bearer <admin_token>
```

#### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `page` | integer | No | Page number (default: 1, min: 1) |
| `limit` | integer | No | Items per page (default: 10, min: 1, max: 100) |
| `role` | string | No | Filter by role: `customer`, `admin`, `seller` |
| `isVerified` | boolean | No | Filter by verification status (`true` or `false`) |
| `search` | string | No | Search in firstName, lastName, email (min: 1 char) |

#### Success Response (200 OK)

```json
{
  "message": "Users retrieved successfully",
  "users": [
    {
      "id": 1,
      "firstName": "John",
      "lastName": "Doe",
      "email": "john@example.com",
      "phone": "+27123456789",
      "profilePicture": "/uploads/profiles/user-1-1738742856789.jpg",
      "role": "customer",
      "isVerified": true,
      "createdAt": "2026-01-18T10:00:00.000Z",
      "updatedAt": "2026-01-20T15:30:00.000Z"
    },
    {
      "id": 2,
      "firstName": "Jane",
      "lastName": "Smith",
      "email": "jane@example.com",
      "phone": "+27987654321",
      "profilePicture": null,
      "role": "seller",
      "isVerified": true,
      "createdAt": "2026-01-19T10:00:00.000Z",
      "updatedAt": "2026-01-19T10:00:00.000Z"
    }
  ],
  "pagination": {
    "total": 150,
    "page": 1,
    "limit": 10,
    "totalPages": 15
  }
}
```

#### Error Responses

```json
// 422 Unprocessable Entity - Validation failed
{
  "message": "Validation failed",
  "errors": [
    {
      "msg": "Page must be a positive integer",
      "param": "page",
      "location": "query"
    }
  ]
}

// 401 Unauthorized
{
  "message": "Access token is required"
}

// 403 Forbidden - Not admin
{
  "message": "Access denied. Admin privileges required."
}

// 500 Internal Server Error
{
  "message": "Failed to retrieve users"
}
```

---

### 2. Get User by ID

**Endpoint:** `GET /admin/users/:id`
**Access:** Protected (Admin Only)
**Description:** Get detailed user information including statistics

#### Request Headers

```
Authorization: Bearer <admin_token>
```

#### URL Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | integer | Yes | User ID |

#### Success Response (200 OK)

```json
{
  "message": "User retrieved successfully",
  "user": {
    "id": 1,
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "phone": "+27123456789",
    "profilePicture": "/uploads/profiles/user-1-1738742856789.jpg",
    "role": "customer",
    "isVerified": true,
    "createdAt": "2026-01-18T10:00:00.000Z",
    "updatedAt": "2026-01-20T15:30:00.000Z"
  },
  "stats": {
    "totalOrders": 15,
    "totalSpent": "12450.00",
    "addressCount": 3
  }
}
```

#### Error Responses

```json
// 422 Unprocessable Entity - Validation failed
{
  "message": "Validation failed",
  "errors": [
    {
      "msg": "User ID must be a valid integer",
      "param": "id",
      "location": "params"
    }
  ]
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
  "message": "User not found"
}

// 500 Internal Server Error
{
  "message": "Failed to retrieve user"
}
```

---

### 3. Update User Role

**Endpoint:** `PUT /admin/users/:id/role`
**Access:** Protected (Admin Only)
**Description:** Update a user's role

#### Request Headers

```
Authorization: Bearer <admin_token>
```

#### URL Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | integer | Yes | User ID |

#### Request Body

```json
{
  "role": "string (required, one of: 'customer', 'admin', 'seller')"
}
```

#### Success Response (200 OK)

```json
{
  "message": "User role updated successfully",
  "user": {
    "id": 2,
    "firstName": "Jane",
    "lastName": "Smith",
    "email": "jane@example.com",
    "phone": "+27987654321",
    "role": "seller",
    "isVerified": true,
    "createdAt": "2026-01-19T10:00:00.000Z",
    "updatedAt": "2026-01-20T16:00:00.000Z"
  }
}
```

#### Error Responses

```json
// 422 Unprocessable Entity - Validation failed
{
  "message": "Validation failed",
  "errors": [
    {
      "msg": "Role must be one of: customer, admin, seller",
      "param": "role",
      "location": "body"
    }
  ]
}

// 400 Bad Request - Cannot modify own role
{
  "message": "You cannot modify your own role"
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
  "message": "User not found"
}

// 500 Internal Server Error
{
  "message": "Failed to update user role"
}
```

---

### 4. Update User Status

**Endpoint:** `PUT /admin/users/:id/status`
**Access:** Protected (Admin Only)
**Description:** Update a user's verification status

#### Request Headers

```
Authorization: Bearer <admin_token>
```

#### URL Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | integer | Yes | User ID |

#### Request Body

```json
{
  "isVerified": "boolean (required)"
}
```

#### Success Response (200 OK)

```json
{
  "message": "User status updated successfully",
  "user": {
    "id": 2,
    "firstName": "Jane",
    "lastName": "Smith",
    "email": "jane@example.com",
    "phone": "+27987654321",
    "role": "seller",
    "isVerified": true,
    "createdAt": "2026-01-19T10:00:00.000Z",
    "updatedAt": "2026-01-20T16:00:00.000Z"
  }
}
```

#### Error Responses

```json
// 422 Unprocessable Entity - Validation failed
{
  "message": "Validation failed",
  "errors": [
    {
      "msg": "isVerified must be a boolean value",
      "param": "isVerified",
      "location": "body"
    }
  ]
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
  "message": "User not found"
}

// 500 Internal Server Error
{
  "message": "Failed to update user status"
}
```

---

### 5. Delete User

**Endpoint:** `DELETE /admin/users/:id`
**Access:** Protected (Admin Only)
**Description:** Delete a user account (cannot delete users with existing orders or self)

#### Request Headers

```
Authorization: Bearer <admin_token>
```

#### URL Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | integer | Yes | User ID to delete |

#### Success Response (200 OK)

```json
{
  "message": "User deleted successfully"
}
```

#### Error Responses

```json
// 422 Unprocessable Entity - Validation failed
{
  "message": "Validation failed",
  "errors": [
    {
      "msg": "User ID must be a valid integer",
      "param": "id",
      "location": "params"
    }
  ]
}

// 400 Bad Request - Cannot delete self
{
  "message": "You cannot delete your own account"
}

// 400 Bad Request - User has orders
{
  "message": "Cannot delete user with 5 existing order(s). Consider deactivating instead."
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
  "message": "User not found"
}

// 500 Internal Server Error
{
  "message": "Failed to delete user"
}
```

---

### 6. Get Dashboard Statistics

**Endpoint:** `GET /admin/stats`
**Access:** Protected (Admin Only)
**Description:** Get system-wide user statistics

#### Request Headers

```
Authorization: Bearer <admin_token>
```

#### Success Response (200 OK)

```json
{
  "message": "Statistics retrieved successfully",
  "stats": {
    "totalUsers": 1250,
    "totalCustomers": 1100,
    "totalSellers": 140,
    "totalAdmins": 10,
    "verifiedUsers": 980,
    "unverifiedUsers": 270,
    "newUsersThisMonth": 45,
    "newUsersToday": 3
  }
}
```

#### Error Responses

```json
// 401 Unauthorized
{
  "message": "Access token is required"
}

// 403 Forbidden
{
  "message": "Access denied. Admin privileges required."
}

// 500 Internal Server Error
{
  "message": "Failed to retrieve statistics"
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

## Products

### 1. Get All Products

**Endpoint:** `GET /products`
**Access:** Public
**Description:** Get all products with filtering, search, pagination, and sorting

#### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `page` | integer | No | Page number (default: 1, min: 1) |
| `limit` | integer | No | Items per page (default: 20, min: 1, max: 100) |
| `categoryId` | integer | No | Filter by category ID |
| `minPrice` | float | No | Minimum price filter |
| `maxPrice` | float | No | Maximum price filter (must be >= minPrice) |
| `brand` | string | No | Filter by brand name (1-100 chars) |
| `isActive` | boolean | No | Filter by active status (`true` or `false`) |
| `isFeatured` | boolean | No | Filter by featured status (`true` or `false`) |
| `search` | string | No | Search in name, description, shortDescription, SKU (1-255 chars) |
| `sortBy` | string | No | Sort field: `createdAt`, `price`, `name`, `averageRating`, `stockQuantity` (default: `createdAt`) |
| `order` | string | No | Sort order: `ASC` or `DESC` (default: `DESC`) |

#### Success Response (200 OK)

```json
{
  "products": [
    {
      "id": 1,
      "name": "iPhone 15 Pro",
      "slug": "iphone-15-pro",
      "description": "Latest Apple smartphone with advanced features...",
      "shortDescription": "Latest Apple smartphone",
      "price": 999.99,
      "compareAtPrice": 1099.99,
      "costPrice": 750.00,
      "sku": "IPH15PRO-256-BLK",
      "brand": "Apple",
      "stockQuantity": 50,
      "lowStockThreshold": 10,
      "weight": 0.187,
      "dimensions": {
        "length": 14.67,
        "width": 7.15,
        "height": 0.83
      },
      "isActive": true,
      "isFeatured": true,
      "metaTitle": "iPhone 15 Pro - Buy Now",
      "metaDescription": "Get the latest iPhone 15 Pro...",
      "categoryId": 2,
      "createdAt": "2026-01-18T10:00:00.000Z",
      "updatedAt": "2026-01-18T10:00:00.000Z",
      "images": [
        {
          "id": 1,
          "url": "/uploads/products/iphone-15-pro-1.jpg",
          "altText": "iPhone 15 Pro - Image 1",
          "isPrimary": true,
          "sortOrder": 0
        }
      ],
      "category": {
        "id": 2,
        "name": "Smartphones",
        "slug": "smartphones"
      }
    }
  ],
  "pagination": {
    "total": 150,
    "page": 1,
    "limit": 20,
    "totalPages": 8
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
      "msg": "Page must be a positive integer",
      "param": "page",
      "location": "query"
    }
  ]
}

// 500 Internal Server Error
{
  "message": "Failed to fetch products"
}
```

---

### 2. Get Product by ID or Slug

**Endpoint:** `GET /products/:id`
**Access:** Public
**Description:** Get single product details by ID or slug, including images, category, and recent reviews

#### URL Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | integer/string | Yes | Product ID (numeric) or slug (string) |

#### Success Response (200 OK)

```json
{
  "product": {
    "id": 1,
    "name": "iPhone 15 Pro",
    "slug": "iphone-15-pro",
    "description": "Latest Apple smartphone with advanced features...",
    "shortDescription": "Latest Apple smartphone",
    "price": 999.99,
    "compareAtPrice": 1099.99,
    "costPrice": 750.00,
    "sku": "IPH15PRO-256-BLK",
    "brand": "Apple",
    "stockQuantity": 50,
    "lowStockThreshold": 10,
    "weight": 0.187,
    "dimensions": {
      "length": 14.67,
      "width": 7.15,
      "height": 0.83
    },
    "isActive": true,
    "isFeatured": true,
    "metaTitle": "iPhone 15 Pro - Buy Now",
    "metaDescription": "Get the latest iPhone 15 Pro...",
    "categoryId": 2,
    "createdAt": "2026-01-18T10:00:00.000Z",
    "updatedAt": "2026-01-18T10:00:00.000Z",
    "images": [
      {
        "id": 1,
        "url": "/uploads/products/iphone-15-pro-1.jpg",
        "altText": "iPhone 15 Pro - Image 1",
        "isPrimary": true,
        "sortOrder": 0
      }
    ],
    "category": {
      "id": 2,
      "name": "Smartphones",
      "slug": "smartphones",
      "parentId": 1
    },
    "reviews": [
      {
        "id": 1,
        "rating": 5,
        "comment": "Excellent product!",
        "createdAt": "2026-01-20T10:00:00.000Z",
        "user": {
          "id": 1,
          "firstName": "John",
          "lastName": "Doe"
        }
      }
    ]
  }
}
```

#### Error Responses

```json
// 404 Not Found
{
  "message": "Product not found"
}

// 500 Internal Server Error
{
  "message": "Failed to fetch product"
}
```

---

### 3. Create Product

**Endpoint:** `POST /products`
**Access:** Protected (Seller/Admin Only)
**Description:** Create a new product with optional image uploads

#### Request Headers

```
Authorization: Bearer <seller_or_admin_token>
Content-Type: multipart/form-data
```

#### Request Body (multipart/form-data)

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | Yes | Product name (3-255 chars) |
| `description` | string | No | Detailed description (max 10000 chars) |
| `shortDescription` | string | No | Brief description (max 500 chars) |
| `sku` | string | Yes | Unique SKU (1-100 chars, alphanumeric, hyphens, underscores) |
| `price` | float | Yes | Product price (min: 0, max 2 decimals) |
| `compareAtPrice` | float | No | Original price for discounts (must be >= price) |
| `costPrice` | float | No | Internal cost price (min: 0) |
| `categoryId` | integer | Yes | Valid category ID |
| `brand` | string | No | Brand name (max 100 chars) |
| `stockQuantity` | integer | No | Stock quantity (default: 0, min: 0) |
| `lowStockThreshold` | integer | No | Low stock alert threshold (default: 10, min: 0) |
| `weight` | float | No | Product weight in kg (min: 0) |
| `dimensions` | JSON string | No | Dimensions object: `{"length": 10, "width": 5, "height": 2}` (all >= 0) |
| `isActive` | boolean | No | Active status (default: true) |
| `isFeatured` | boolean | No | Featured status (default: false) |
| `metaTitle` | string | No | SEO meta title (max 255 chars, defaults to name) |
| `metaDescription` | string | No | SEO meta description (max 500 chars, defaults to shortDescription) |
| `images` | file[] | No | Product images (multiple files supported) |

**Note:** Slug is auto-generated from the product name

#### Success Response (201 Created)

```json
{
  "message": "Product created successfully",
  "product": {
    "id": 1,
    "name": "iPhone 15 Pro",
    "slug": "iphone-15-pro",
    "description": "Latest Apple smartphone...",
    "shortDescription": "Latest Apple smartphone",
    "price": 999.99,
    "compareAtPrice": 1099.99,
    "costPrice": 750.00,
    "sku": "IPH15PRO-256-BLK",
    "brand": "Apple",
    "stockQuantity": 50,
    "lowStockThreshold": 10,
    "weight": 0.187,
    "dimensions": {
      "length": 14.67,
      "width": 7.15,
      "height": 0.83
    },
    "isActive": true,
    "isFeatured": true,
    "metaTitle": "iPhone 15 Pro - Buy Now",
    "metaDescription": "Get the latest iPhone 15 Pro",
    "categoryId": 2,
    "createdAt": "2026-01-18T10:00:00.000Z",
    "updatedAt": "2026-01-18T10:00:00.000Z",
    "images": [
      {
        "id": 1,
        "url": "/uploads/products/iphone-15-pro-1.jpg",
        "altText": "iPhone 15 Pro - Image 1",
        "isPrimary": true,
        "sortOrder": 0
      }
    ],
    "category": {
      "id": 2,
      "name": "Smartphones",
      "slug": "smartphones"
    }
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
      "msg": "Product name is required",
      "param": "name",
      "location": "body"
    }
  ]
}

// 401 Unauthorized
{
  "message": "Access token is required"
}

// 403 Forbidden - Not seller/admin
{
  "message": "Access denied. Seller privileges required."
}

// 404 Not Found - Category not found
{
  "message": "Category not found"
}

// 409 Conflict - SKU already exists
{
  "message": "SKU already exists"
}

// 500 Internal Server Error
{
  "message": "Failed to create product"
}
```

---

### 4. Update Product

**Endpoint:** `PUT /products/:id`
**Access:** Protected (Seller/Admin Only)
**Description:** Update existing product details and optionally add new images

#### Request Headers

```
Authorization: Bearer <seller_or_admin_token>
Content-Type: multipart/form-data
```

#### URL Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | integer | Yes | Product ID to update |

#### Request Body (multipart/form-data)

All fields are optional (same fields as Create Product):

| Field | Type | Description |
|-------|------|-------------|
| `name` | string | Product name (3-255 chars) |
| `description` | string | Detailed description (max 10000 chars) |
| `shortDescription` | string | Brief description (max 500 chars) |
| `sku` | string | Unique SKU (1-100 chars) |
| `price` | float | Product price (min: 0) |
| `compareAtPrice` | float | Original price |
| `costPrice` | float | Internal cost price |
| `categoryId` | integer | Valid category ID |
| `brand` | string | Brand name (max 100 chars) |
| `stockQuantity` | integer | Stock quantity (min: 0) |
| `lowStockThreshold` | integer | Low stock threshold (min: 0) |
| `weight` | float | Product weight (min: 0) |
| `dimensions` | JSON string | Dimensions object |
| `isActive` | boolean | Active status |
| `isFeatured` | boolean | Featured status |
| `metaTitle` | string | SEO meta title (max 255 chars) |
| `metaDescription` | string | SEO meta description (max 500 chars) |
| `images` | file[] | Additional product images (appended to existing) |

**Note:** If name is updated, slug will be auto-regenerated. New images are appended to existing images.

#### Success Response (200 OK)

```json
{
  "message": "Product updated successfully",
  "product": {
    "id": 1,
    "name": "iPhone 15 Pro Max",
    "slug": "iphone-15-pro-max",
    "description": "Updated description...",
    "price": 1099.99,
    // ... (same structure as create response)
  }
}
```

#### Error Responses

```json
// 422 Unprocessable Entity - Validation failed
{
  "message": "Validation failed",
  "errors": [...]
}

// 401 Unauthorized
{
  "message": "Access token is required"
}

// 403 Forbidden
{
  "message": "Access denied. Seller privileges required."
}

// 404 Not Found - Product not found
{
  "message": "Product not found"
}

// 404 Not Found - Category not found
{
  "message": "Category not found"
}

// 409 Conflict - SKU already exists
{
  "message": "SKU already exists"
}

// 500 Internal Server Error
{
  "message": "Failed to update product"
}
```

---

### 5. Delete Product

**Endpoint:** `DELETE /products/:id`
**Access:** Protected (Seller/Admin Only)
**Description:** Delete a product and all associated images

#### Request Headers

```
Authorization: Bearer <seller_or_admin_token>
```

#### URL Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | integer | Yes | Product ID to delete |

#### Success Response (200 OK)

```json
{
  "message": "Product deleted successfully"
}
```

#### Error Responses

```json
// 400 Bad Request - Invalid ID
{
  "message": "Validation failed",
  "errors": [
    {
      "msg": "Product ID must be a valid integer",
      "param": "id",
      "location": "params"
    }
  ]
}

// 401 Unauthorized
{
  "message": "Access token is required"
}

// 403 Forbidden
{
  "message": "Access denied. Seller privileges required."
}

// 404 Not Found
{
  "message": "Product not found"
}

// 500 Internal Server Error
{
  "message": "Failed to delete product"
}
```

---

### 6. Delete Product Image

**Endpoint:** `DELETE /products/:id/images/:imageId`
**Access:** Protected (Seller/Admin Only)
**Description:** Delete a specific image from a product

#### Request Headers

```
Authorization: Bearer <seller_or_admin_token>
```

#### URL Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | integer | Yes | Product ID |
| `imageId` | integer | Yes | Image ID to delete |

#### Success Response (200 OK)

```json
{
  "message": "Image deleted successfully"
}
```

#### Error Responses

```json
// 400 Bad Request - Invalid parameters
{
  "message": "Validation failed",
  "errors": [
    {
      "msg": "Product ID must be a valid integer",
      "param": "id",
      "location": "params"
    }
  ]
}

// 401 Unauthorized
{
  "message": "Access token is required"
}

// 403 Forbidden
{
  "message": "Access denied. Seller privileges required."
}

// 404 Not Found - Product not found
{
  "message": "Product not found"
}

// 404 Not Found - Image not found
{
  "message": "Image not found"
}

// 500 Internal Server Error
{
  "message": "Failed to delete image"
}
```

---

### 7. Set Primary Product Image

**Endpoint:** `PUT /products/:id/images/:imageId/primary`
**Access:** Protected (Seller/Admin Only)
**Description:** Set a specific image as the primary/featured image for a product

#### Request Headers

```
Authorization: Bearer <seller_or_admin_token>
```

#### URL Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | integer | Yes | Product ID |
| `imageId` | integer | Yes | Image ID to set as primary |

#### Success Response (200 OK)

```json
{
  "message": "Primary image updated successfully"
}
```

#### Error Responses

```json
// 400 Bad Request - Invalid parameters
{
  "message": "Validation failed",
  "errors": [...]
}

// 401 Unauthorized
{
  "message": "Access token is required"
}

// 403 Forbidden
{
  "message": "Access denied. Seller privileges required."
}

// 404 Not Found - Product not found
{
  "message": "Product not found"
}

// 404 Not Found - Image not found
{
  "message": "Image not found"
}

// 500 Internal Server Error
{
  "message": "Failed to set primary image"
}
```

---

## Cart

### 1. Get Cart

**Endpoint:** `GET /cart`
**Access:** Protected (Requires Authentication)
**Description:** Get user's shopping cart with all items

#### Request Headers

```
Authorization: Bearer <token>
```

#### Success Response (200 OK)

```json
{
  "message": "Cart retrieved successfully",
  "cart": {
    "id": 1,
    "userId": 1,
    "totalItems": 3,
    "subtotal": "2499.97",
    "createdAt": "2026-01-18T10:00:00.000Z",
    "updatedAt": "2026-01-20T15:30:00.000Z",
    "items": [
      {
        "id": 1,
        "cartId": 1,
        "productId": 1,
        "quantity": 2,
        "priceAtAdd": "999.99",
        "createdAt": "2026-01-20T15:30:00.000Z",
        "updatedAt": "2026-01-20T15:30:00.000Z",
        "product": {
          "id": 1,
          "name": "iPhone 15 Pro",
          "slug": "iphone-15-pro",
          "price": "999.99",
          "stockQuantity": 50,
          "isActive": true,
          "images": [
            {
              "id": 1,
              "url": "/uploads/products/iphone-15-pro-1.jpg",
              "altText": "iPhone 15 Pro - Image 1"
            }
          ]
        }
      }
    ]
  }
}
```

#### Error Responses

```json
// 401 Unauthorized
{
  "message": "Access token is required"
}

// 500 Internal Server Error
{
  "message": "Failed to retrieve cart"
}
```

---

### 2. Add Item to Cart

**Endpoint:** `POST /cart/items`
**Access:** Protected (Requires Authentication)
**Description:** Add a product to the cart or update quantity if already exists

#### Request Headers

```
Authorization: Bearer <token>
```

#### Request Body

```json
{
  "productId": "integer (required, min: 1)",
  "quantity": "integer (optional, default: 1, min: 1)"
}
```

#### Success Response (201 Created)

```json
{
  "message": "Item added to cart successfully",
  "cart": {
    "id": 1,
    "userId": 1,
    "totalItems": 3,
    "subtotal": "2499.97",
    "items": [...]
  }
}
```

#### Error Responses

```json
// 422 Unprocessable Entity - Validation failed
{
  "message": "Validation failed",
  "errors": [
    {
      "msg": "Product ID is required",
      "param": "productId",
      "location": "body"
    }
  ]
}

// 400 Bad Request - Product not available
{
  "message": "Product is not available"
}

// 400 Bad Request - Insufficient stock
{
  "message": "Only 5 items available in stock"
}

// 404 Not Found - Product not found
{
  "message": "Product not found"
}

// 500 Internal Server Error
{
  "message": "Failed to add item to cart"
}
```

---

### 3. Update Cart Item Quantity

**Endpoint:** `PUT /cart/items/:itemId`
**Access:** Protected (Requires Authentication)
**Description:** Update quantity of a specific cart item

#### Request Headers

```
Authorization: Bearer <token>
```

#### URL Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `itemId` | integer | Yes | Cart item ID |

#### Request Body

```json
{
  "quantity": "integer (required, min: 1)"
}
```

#### Success Response (200 OK)

```json
{
  "message": "Cart item updated successfully",
  "cart": {
    "id": 1,
    "userId": 1,
    "totalItems": 5,
    "subtotal": "3499.95",
    "items": [...]
  }
}
```

#### Error Responses

```json
// 422 Unprocessable Entity - Validation failed
{
  "message": "Validation failed",
  "errors": [...]
}

// 400 Bad Request - Product no longer available
{
  "message": "Product is no longer available"
}

// 400 Bad Request - Insufficient stock
{
  "message": "Only 10 items available in stock"
}

// 404 Not Found - Cart not found
{
  "message": "Cart not found"
}

// 404 Not Found - Cart item not found
{
  "message": "Cart item not found"
}

// 500 Internal Server Error
{
  "message": "Failed to update cart item"
}
```

---

### 4. Remove Item from Cart

**Endpoint:** `DELETE /cart/items/:itemId`
**Access:** Protected (Requires Authentication)
**Description:** Remove a specific item from cart

#### Request Headers

```
Authorization: Bearer <token>
```

#### URL Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `itemId` | integer | Yes | Cart item ID |

#### Success Response (200 OK)

```json
{
  "message": "Item removed from cart successfully",
  "cart": {
    "id": 1,
    "userId": 1,
    "totalItems": 2,
    "subtotal": "1499.98",
    "items": [...]
  }
}
```

#### Error Responses

```json
// 422 Unprocessable Entity - Validation failed
{
  "message": "Validation failed",
  "errors": [...]
}

// 404 Not Found - Cart not found
{
  "message": "Cart not found"
}

// 404 Not Found - Cart item not found
{
  "message": "Cart item not found"
}

// 500 Internal Server Error
{
  "message": "Failed to remove item from cart"
}
```

---

### 5. Clear Cart

**Endpoint:** `DELETE /cart`
**Access:** Protected (Requires Authentication)
**Description:** Remove all items from cart

#### Request Headers

```
Authorization: Bearer <token>
```

#### Success Response (200 OK)

```json
{
  "message": "Cart cleared successfully",
  "cart": {
    "id": 1,
    "userId": 1,
    "totalItems": 0,
    "subtotal": "0.00",
    "createdAt": "2026-01-18T10:00:00.000Z",
    "updatedAt": "2026-01-20T16:00:00.000Z"
  }
}
```

#### Error Responses

```json
// 404 Not Found
{
  "message": "Cart not found"
}

// 500 Internal Server Error
{
  "message": "Failed to clear cart"
}
```

---

## Wishlist

### 1. Get Wishlist

**Endpoint:** `GET /wishlist`
**Access:** Protected (Requires Authentication)
**Description:** Get user's wishlist with all saved products

#### Request Headers

```
Authorization: Bearer <token>
```

#### Success Response (200 OK)

```json
{
  "message": "Wishlist retrieved successfully",
  "count": 2,
  "wishlist": [
    {
      "id": 1,
      "userId": 1,
      "productId": 1,
      "createdAt": "2026-01-20T10:00:00.000Z",
      "updatedAt": "2026-01-20T10:00:00.000Z",
      "product": {
        "id": 1,
        "name": "iPhone 15 Pro",
        "slug": "iphone-15-pro",
        "price": "999.99",
        "compareAtPrice": "1099.99",
        "stockQuantity": 50,
        "isActive": true,
        "images": [
          {
            "id": 1,
            "url": "/uploads/products/iphone-15-pro-1.jpg",
            "altText": "iPhone 15 Pro"
          }
        ],
        "category": {
          "id": 2,
          "name": "Smartphones",
          "slug": "smartphones"
        }
      }
    }
  ]
}
```

#### Error Responses

```json
// 401 Unauthorized
{
  "message": "Access token is required"
}

// 500 Internal Server Error
{
  "message": "Failed to retrieve wishlist"
}
```

---

### 2. Add to Wishlist

**Endpoint:** `POST /wishlist`
**Access:** Protected (Requires Authentication)
**Description:** Add a product to the wishlist

#### Request Headers

```
Authorization: Bearer <token>
```

#### Request Body

```json
{
  "productId": "integer (required, min: 1)"
}
```

#### Success Response (201 Created)

```json
{
  "message": "Product added to wishlist successfully",
  "wishlistItem": {
    "id": 1,
    "userId": 1,
    "productId": 1,
    "createdAt": "2026-01-20T10:00:00.000Z",
    "updatedAt": "2026-01-20T10:00:00.000Z",
    "product": {
      "id": 1,
      "name": "iPhone 15 Pro",
      "slug": "iphone-15-pro",
      "price": "999.99",
      "compareAtPrice": "1099.99",
      "stockQuantity": 50,
      "isActive": true,
      "images": [...],
      "category": {...}
    }
  }
}
```

#### Error Responses

```json
// 422 Unprocessable Entity - Validation failed
{
  "message": "Validation failed",
  "errors": [
    {
      "msg": "Product ID is required",
      "param": "productId",
      "location": "body"
    }
  ]
}

// 404 Not Found - Product not found
{
  "message": "Product not found"
}

// 409 Conflict - Already in wishlist
{
  "message": "Product already in wishlist"
}

// 500 Internal Server Error
{
  "message": "Failed to add item to wishlist"
}
```

---

### 3. Remove from Wishlist

**Endpoint:** `DELETE /wishlist/:id`
**Access:** Protected (Requires Authentication)
**Description:** Remove a specific item from wishlist

#### Request Headers

```
Authorization: Bearer <token>
```

#### URL Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | integer | Yes | Wishlist item ID |

#### Success Response (200 OK)

```json
{
  "message": "Item removed from wishlist successfully"
}
```

#### Error Responses

```json
// 422 Unprocessable Entity - Validation failed
{
  "message": "Validation failed",
  "errors": [...]
}

// 404 Not Found
{
  "message": "Wishlist item not found"
}

// 500 Internal Server Error
{
  "message": "Failed to remove item from wishlist"
}
```

---

### 4. Clear Wishlist

**Endpoint:** `DELETE /wishlist`
**Access:** Protected (Requires Authentication)
**Description:** Remove all items from wishlist

#### Request Headers

```
Authorization: Bearer <token>
```

#### Success Response (200 OK)

```json
{
  "message": "Wishlist cleared successfully"
}
```

#### Error Responses

```json
// 500 Internal Server Error
{
  "message": "Failed to clear wishlist"
}
```

---

### 5. Check if Product in Wishlist

**Endpoint:** `GET /wishlist/check/:productId`
**Access:** Protected (Requires Authentication)
**Description:** Check if a product is in user's wishlist

#### Request Headers

```
Authorization: Bearer <token>
```

#### URL Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `productId` | integer | Yes | Product ID to check |

#### Success Response (200 OK)

```json
{
  "inWishlist": true,
  "wishlistItemId": 1
}
```

#### Error Responses

```json
// 500 Internal Server Error
{
  "message": "Failed to check wishlist status"
}
```

---

## Orders

### 1. Create Order from Cart

**Endpoint:** `POST /orders`
**Access:** Protected (Requires Authentication)
**Description:** Create a new order from cart items

#### Request Headers

```
Authorization: Bearer <token>
```

#### Request Body

```json
{
  "shippingAddressId": "integer (required, min: 1)",
  "paymentMethod": "string (optional, max: 50 chars)",
  "notes": "string (optional, max: 1000 chars)",
  "couponCode": "string (optional, max: 50 chars)"
}
```

#### Success Response (201 Created)

```json
{
  "message": "Order created successfully",
  "order": {
    "id": 1,
    "orderNumber": "ORD-20260120-00001",
    "userId": 1,
    "status": "pending",
    "subtotal": "2499.97",
    "shippingCost": "0.00",
    "discount": "0.00",
    "tax": "0.00",
    "total": "2499.97",
    "shippingAddressId": 1,
    "shippingAddressSnapshot": {
      "recipientName": "John Doe",
      "phone": "+1234567890",
      "streetAddress": "123 Main St",
      "city": "Cape Town",
      "province": "Western Cape",
      "postalCode": "8001",
      "country": "South Africa"
    },
    "paymentMethod": "Credit Card",
    "paymentStatus": "pending",
    "notes": "Leave at front door",
    "createdAt": "2026-01-20T10:00:00.000Z",
    "updatedAt": "2026-01-20T10:00:00.000Z",
    "items": [
      {
        "id": 1,
        "orderId": 1,
        "productId": 1,
        "productSnapshot": {
          "name": "iPhone 15 Pro",
          "sku": "IPH15PRO-256-BLK",
          "description": "Latest Apple smartphone",
          "brand": "Apple"
        },
        "quantity": 2,
        "unitPrice": "999.99",
        "totalPrice": "1999.98",
        "status": "pending",
        "product": {
          "id": 1,
          "name": "iPhone 15 Pro",
          "slug": "iphone-15-pro",
          "sku": "IPH15PRO-256-BLK",
          "images": [...]
        }
      }
    ],
    "shippingAddress": {
      "id": 1,
      "recipientName": "John Doe",
      "phone": "+1234567890",
      "streetAddress": "123 Main St",
      "city": "Cape Town",
      "province": "Western Cape",
      "postalCode": "8001",
      "country": "South Africa"
    }
  }
}
```

#### Error Responses

```json
// 422 Unprocessable Entity - Validation failed
{
  "message": "Validation failed",
  "errors": [
    {
      "msg": "Shipping address ID is required",
      "param": "shippingAddressId",
      "location": "body"
    }
  ]
}

// 400 Bad Request - Cart is empty
{
  "message": "Cart is empty"
}

// 400 Bad Request - Stock validation failed
{
  "message": "Stock validation failed",
  "errors": [
    "iPhone 15 Pro: only 5 items available (requested 10)",
    "Samsung Galaxy S24 is no longer available"
  ]
}

// 404 Not Found - Shipping address not found
{
  "message": "Shipping address not found"
}

// 500 Internal Server Error
{
  "message": "Failed to create order"
}
```

---

### 2. Get All Orders

**Endpoint:** `GET /orders`
**Access:** Protected (Role-based)
**Description:** Get orders based on user role (customers see own, sellers see orders with their products, admins see all)

#### Request Headers

```
Authorization: Bearer <token>
```

#### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `status` | string | No | Filter by order status |
| `paymentStatus` | string | No | Filter by payment status |
| `page` | integer | No | Page number (default: 1) |
| `limit` | integer | No | Items per page (default: 20) |

**Valid Status Values:**
- Order Status: `pending`, `confirmed`, `processing`, `shipped`, `out_for_delivery`, `delivered`, `cancelled`, `refunded`
- Payment Status: `pending`, `paid`, `failed`, `refunded`

#### Success Response (200 OK)

```json
{
  "orders": [
    {
      "id": 1,
      "orderNumber": "ORD-20260120-00001",
      "userId": 1,
      "status": "pending",
      "subtotal": "2499.97",
      "shippingCost": "0.00",
      "discount": "0.00",
      "tax": "0.00",
      "total": "2499.97",
      "paymentStatus": "pending",
      "createdAt": "2026-01-20T10:00:00.000Z",
      "items": [...],
      "user": {
        "id": 1,
        "firstName": "John",
        "lastName": "Doe",
        "email": "john@example.com"
      }
    }
  ],
  "pagination": {
    "total": 50,
    "page": 1,
    "limit": 20,
    "totalPages": 3
  }
}
```

#### Error Responses

```json
// 500 Internal Server Error
{
  "message": "Failed to retrieve orders"
}
```

---

### 3. Get Order by ID

**Endpoint:** `GET /orders/:id`
**Access:** Protected (Role-based)
**Description:** Get detailed order information

#### Request Headers

```
Authorization: Bearer <token>
```

#### URL Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | integer | Yes | Order ID |

#### Success Response (200 OK)

```json
{
  "message": "Order retrieved successfully",
  "order": {
    "id": 1,
    "orderNumber": "ORD-20260120-00001",
    "userId": 1,
    "status": "shipped",
    "subtotal": "2499.97",
    "shippingCost": "0.00",
    "discount": "0.00",
    "tax": "0.00",
    "total": "2499.97",
    "shippingAddressId": 1,
    "shippingAddressSnapshot": {...},
    "paymentMethod": "Credit Card",
    "paymentStatus": "paid",
    "trackingNumber": "TRK123456789",
    "shippingCarrier": "DHL",
    "estimatedDelivery": "2026-01-25T00:00:00.000Z",
    "notes": "Leave at front door",
    "createdAt": "2026-01-20T10:00:00.000Z",
    "updatedAt": "2026-01-21T14:00:00.000Z",
    "items": [...],
    "shippingAddress": {...},
    "user": {
      "id": 1,
      "firstName": "John",
      "lastName": "Doe",
      "email": "john@example.com",
      "phone": "+1234567890"
    }
  }
}
```

#### Error Responses

```json
// 422 Unprocessable Entity - Validation failed
{
  "message": "Validation failed",
  "errors": [...]
}

// 403 Forbidden - Access denied
{
  "message": "Access denied"
}

// 404 Not Found
{
  "message": "Order not found"
}

// 500 Internal Server Error
{
  "message": "Failed to retrieve order"
}
```

---

### 4. Update Order Status

**Endpoint:** `PUT /orders/:id/status`
**Access:** Protected (Admin/Seller Only)
**Description:** Update order status

#### Request Headers

```
Authorization: Bearer <admin_or_seller_token>
```

#### URL Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | integer | Yes | Order ID |

#### Request Body

```json
{
  "status": "string (required, valid order status)"
}
```

**Valid Status Values:** `pending`, `confirmed`, `processing`, `shipped`, `out_for_delivery`, `delivered`, `cancelled`, `refunded`

#### Success Response (200 OK)

```json
{
  "message": "Order status updated successfully",
  "order": {
    "id": 1,
    "orderNumber": "ORD-20260120-00001",
    "status": "shipped",
    "deliveredAt": null,
    "updatedAt": "2026-01-21T14:00:00.000Z"
  }
}
```

**Note:** When status is set to `delivered`, the `deliveredAt` timestamp is automatically set.

#### Error Responses

```json
// 422 Unprocessable Entity - Validation failed
{
  "message": "Validation failed",
  "errors": [
    {
      "msg": "Invalid order status",
      "param": "status",
      "location": "body"
    }
  ]
}

// 403 Forbidden - Not authorized
{
  "message": "Access denied"
}

// 404 Not Found
{
  "message": "Order not found"
}

// 500 Internal Server Error
{
  "message": "Failed to update order status"
}
```

---

### 5. Update Shipping Information

**Endpoint:** `PUT /orders/:id/shipping`
**Access:** Protected (Admin/Seller Only)
**Description:** Update order shipping details

#### Request Headers

```
Authorization: Bearer <admin_or_seller_token>
```

#### URL Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | integer | Yes | Order ID |

#### Request Body

All fields are optional:

```json
{
  "trackingNumber": "string (optional, max: 100 chars)",
  "shippingCarrier": "string (optional, max: 100 chars)",
  "estimatedDelivery": "string (optional, ISO 8601 date)"
}
```

#### Success Response (200 OK)

```json
{
  "message": "Shipping information updated successfully",
  "order": {
    "id": 1,
    "orderNumber": "ORD-20260120-00001",
    "trackingNumber": "TRK123456789",
    "shippingCarrier": "DHL",
    "estimatedDelivery": "2026-01-25T00:00:00.000Z",
    "updatedAt": "2026-01-21T14:00:00.000Z"
  }
}
```

#### Error Responses

```json
// 422 Unprocessable Entity - Validation failed
{
  "message": "Validation failed",
  "errors": [...]
}

// 403 Forbidden
{
  "message": "Access denied"
}

// 404 Not Found
{
  "message": "Order not found"
}

// 500 Internal Server Error
{
  "message": "Failed to update shipping information"
}
```

---

### 6. Cancel Order

**Endpoint:** `POST /orders/:id/cancel`
**Access:** Protected (Customers: pending/confirmed only, Admin: any status)
**Description:** Cancel an order and restore product stock

#### Request Headers

```
Authorization: Bearer <token>
```

#### URL Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | integer | Yes | Order ID |

#### Success Response (200 OK)

```json
{
  "message": "Order cancelled successfully",
  "order": {
    "id": 1,
    "orderNumber": "ORD-20260120-00001",
    "status": "cancelled",
    "updatedAt": "2026-01-21T14:00:00.000Z"
  }
}
```

**Note:** Product stock quantities are automatically restored when an order is cancelled.

#### Error Responses

```json
// 422 Unprocessable Entity - Validation failed
{
  "message": "Validation failed",
  "errors": [...]
}

// 400 Bad Request - Cannot cancel
{
  "message": "Order cannot be cancelled. Please contact support."
}

// 403 Forbidden
{
  "message": "Access denied"
}

// 404 Not Found
{
  "message": "Order not found"
}

// 500 Internal Server Error
{
  "message": "Failed to cancel order"
}
```

---

### 7. Get Order Statistics

**Endpoint:** `GET /orders/stats`
**Access:** Protected (Admin Only)
**Description:** Get order statistics and metrics

#### Request Headers

```
Authorization: Bearer <admin_token>
```

#### Success Response (200 OK)

```json
{
  "message": "Order statistics retrieved successfully",
  "stats": {
    "totalOrders": 150,
    "pendingOrders": 12,
    "processingOrders": 8,
    "deliveredOrders": 120,
    "cancelledOrders": 10,
    "totalRevenue": 125000.00
  }
}
```

#### Error Responses

```json
// 403 Forbidden - Not admin
{
  "message": "Access denied"
}

// 500 Internal Server Error
{
  "message": "Failed to retrieve order statistics"
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
| 400 | Bad Request (malformed request) |
| 401 | Unauthorized (authentication required) |
| 403 | Forbidden (insufficient permissions) |
| 404 | Resource not found |
| 409 | Conflict (duplicate resource) |
| 422 | Unprocessable Entity (validation failed) |
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
7. **Product Images:** Supports multiple image uploads via multipart/form-data; first uploaded image becomes primary
8. **Product Access Control:** Only sellers and admins can create, update, or delete products
9. **SKU Uniqueness:** Product SKU must be unique across all products
10. **Price Validation:** Prices must have maximum 2 decimal places; compareAtPrice must be >= price if provided

---

**Last Updated:** February 4, 2026
**API Version:** 1.0.0
