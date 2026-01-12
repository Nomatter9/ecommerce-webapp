# Auth API Testing Guide
# ======================
# Use these curl commands to test the auth endpoints

# Base URL (change if your server runs on different port)
BASE_URL="http://localhost:3000/api"

# ============================================
# 1. REGISTER A NEW USER
# ============================================
curl -X POST "${BASE_URL}/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "password": "Password123",
    "confirmPassword": "Password123",
    "phone": "0821234567"
  }'

# Expected response:
# {
#   "message": "Registration successful",
#   "user": {
#     "id": 1,
#     "firstName": "John",
#     "lastName": "Doe",
#     "email": "john@example.com",
#     ...
#   },
#   "token": "eyJhbGciOiJIUzI1NiIs..."
# }


# ============================================
# 2. LOGIN
# ============================================
curl -X POST "${BASE_URL}/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "Password123"
  }'

# Expected response:
# {
#   "message": "Login successful",
#   "user": { ... },
#   "token": "eyJhbGciOiJIUzI1NiIs..."
# }


# ============================================
# 3. GET CURRENT USER (Protected Route)
# ============================================
# Replace YOUR_TOKEN with the token from login/register response

TOKEN="YOUR_TOKEN_HERE"

curl -X GET "${BASE_URL}/auth/me" \
  -H "Authorization: Bearer ${TOKEN}"

# Expected response:
# {
#   "user": {
#     "id": 1,
#     "firstName": "John",
#     ...
#   }
# }


# ============================================
# 4. CHANGE PASSWORD (Protected Route)
# ============================================
curl -X PUT "${BASE_URL}/auth/change-password" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${TOKEN}" \
  -d '{
    "currentPassword": "Password123",
    "newPassword": "NewPassword456"
  }'

# Expected response:
# { "message": "Password changed successfully" }


# ============================================
# 5. FORGOT PASSWORD (Request Reset)
# ============================================
curl -X POST "${BASE_URL}/auth/forgot-password" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com"
  }'

# Expected response:
# { "message": "If an account exists with this email, a reset link will be sent" }
# Note: Check server console for the reset token (for development)


# ============================================
# 6. RESET PASSWORD
# ============================================
# Replace RESET_TOKEN with token from forgot-password (check server console)

curl -X POST "${BASE_URL}/auth/reset-password" \
  -H "Content-Type: application/json" \
  -d '{
    "token": "RESET_TOKEN_HERE",
    "newPassword": "AnotherPassword789"
  }'

# Expected response:
# { "message": "Password reset successful" }


# ============================================
# 7. LOGOUT (Protected Route)
# ============================================
curl -X POST "${BASE_URL}/auth/logout" \
  -H "Authorization: Bearer ${TOKEN}"

# Expected response:
# { "message": "Logout successful" }


# ============================================
# ERROR EXAMPLES
# ============================================

# Invalid email format:
curl -X POST "${BASE_URL}/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "John",
    "lastName": "Doe",
    "email": "invalid-email",
    "password": "Password123",
    "confirmPassword": "Password123"
  }'
# Response: { "message": "Validation failed", "errors": [...] }

# Missing token:
curl -X GET "${BASE_URL}/auth/me"
# Response: { "message": "No token provided" }

# Wrong password:
curl -X POST "${BASE_URL}/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "WrongPassword"
  }'
# Response: { "message": "Invalid email or password" }
