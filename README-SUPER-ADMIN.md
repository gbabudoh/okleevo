# Creating Super Admin User

This guide explains how to create a super admin user for the Okleevo platform.

## Quick Fix: Verify and Fix Super Admin

If you're getting "Invalid email or password" error:

1. **Verify the super admin exists and fix any issues:**
   ```bash
   # Open in browser or use curl
   http://localhost:3000/api/admin/verify-super-admin
   ```

   This will:
   - Check if the super admin user exists
   - Verify the password is correct
   - Fix the role if needed
   - Set/update the password if missing or incorrect

2. **Then try logging in again at:** `http://localhost:3000/admin/access`

## Method 1: Using the API Endpoint (Recommended for Quick Setup)

1. Make sure your server is running:
   ```bash
   npm run dev
   ```

2. Create the super admin by making a POST request:
   ```bash
   curl -X POST http://localhost:3000/api/admin/create-super-admin \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer CHANGE_THIS_IN_PRODUCTION" \
     -d '{
       "email": "admin@okleevo.com",
       "password": "Admin123!@#",
       "firstName": "Super",
       "lastName": "Admin"
     }'
   ```

   Or using PowerShell (Windows):
   ```powershell
   Invoke-RestMethod -Uri "http://localhost:3000/api/admin/create-super-admin" `
     -Method POST `
     -Headers @{
       "Content-Type" = "application/json"
       "Authorization" = "Bearer CHANGE_THIS_IN_PRODUCTION"
     } `
     -Body '{
       "email": "admin@okleevo.com",
       "password": "Admin123!@#",
       "firstName": "Super",
       "lastName": "Admin"
     }'
   ```

   **Default Credentials:**
   - Email: `admin@okleevo.com`
   - Password: `Admin123!@#`

3. **Important Security Steps:**
   - Change the default password after first login
   - Set `SUPER_ADMIN_SECRET_KEY` in your `.env` file
   - Consider removing or securing this endpoint after initial setup

## Method 2: Using the Script

1. Set environment variables (optional):
   ```bash
   export SUPER_ADMIN_EMAIL=admin@okleevo.com
   export SUPER_ADMIN_PASSWORD=Admin123!@#
   export SUPER_ADMIN_FIRST_NAME=Super
   export SUPER_ADMIN_LAST_NAME=Admin
   ```

2. Run the script:
   ```bash
   npm run create-super-admin
   ```

## Method 3: Using Prisma Studio

1. Open Prisma Studio:
   ```bash
   npm run prisma:studio
   ```

2. Create a "Platform Administration" business:
   - Go to Business model
   - Click "Add record"
   - Fill in:
     - name: `Platform Administration`
     - industry: `Platform`
     - size: `1-5`
     - country: `UK`
     - seatCount: `1`
     - maxSeats: `1`

3. Create the super admin user:
   - Go to User model
   - Click "Add record"
   - Fill in:
     - email: `admin@okleevo.com`
     - password: (hashed with bcrypt - use online tool or script)
     - firstName: `Super`
     - lastName: `Admin`
     - role: `SUPER_ADMIN`
     - status: `ACTIVE`
     - businessId: (select the Platform Administration business)
     - emailVerified: (current date)
     - timezone: `Europe/London`

## Login

After creating the super admin:

1. Navigate to: `http://localhost:3000/admin/access`
2. Enter your credentials
3. You'll be redirected to the admin panel at `/admin`

## Security Notes

- ⚠️ **Change the default password immediately after first login**
- ⚠️ **Set a strong `SUPER_ADMIN_SECRET_KEY` in production**
- ⚠️ **Consider disabling the create-super-admin endpoint after initial setup**
- ⚠️ **Only create super admin users through secure channels**

## Troubleshooting

If you get "Unauthorized" error:
- Check that the `Authorization` header matches the `SUPER_ADMIN_SECRET_KEY` in your `.env` file
- Default key is `CHANGE_THIS_IN_PRODUCTION` (change this in production!)

If user already exists:
- The endpoint will update the existing user to SUPER_ADMIN role
- Or use Prisma Studio to manually update the role

