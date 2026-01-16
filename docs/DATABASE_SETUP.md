# Database Setup Guide - Okleevo

This guide will help you set up PostgreSQL with Prisma for the Okleevo platform.

## Prerequisites

- Node.js 18+ installed
- PostgreSQL 14+ installed and running
- npm or yarn package manager

## Step 1: Install PostgreSQL

### Windows
1. Download PostgreSQL from https://www.postgresql.org/download/windows/
2. Run the installer and follow the setup wizard
3. Remember the password you set for the `postgres` user
4. Default port is `5432`

### macOS
```bash
brew install postgresql@14
brew services start postgresql@14
```

### Linux (Ubuntu/Debian)
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
```

## Step 2: Create Database

Open PostgreSQL command line (psql):

```bash
# Windows: Use pgAdmin or psql from Start Menu
# macOS/Linux:
psql postgres

# In psql, run:
CREATE DATABASE okleevo_db;
CREATE USER okleevo_user WITH ENCRYPTED PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE okleevo_db TO okleevo_user;
\q
```

## Step 3: Configure Environment Variables

Update your `.env.local` file with your database credentials:

```env
DATABASE_URL="postgresql://okleevo_user:your_secure_password@localhost:5432/okleevo_db"
```

### Connection String Format:
```
postgresql://[USER]:[PASSWORD]@[HOST]:[PORT]/[DATABASE]
```

Example:
```
DATABASE_URL="postgresql://okleevo_user:mypassword123@localhost:5432/okleevo_db"
```

## Step 4: Install Dependencies

```bash
npm install
# or
yarn install
```

## Step 5: Generate Prisma Client

```bash
npm run prisma:generate
```

This generates the Prisma Client based on your schema.

## Step 6: Push Schema to Database

```bash
npm run prisma:push
```

This creates all tables in your PostgreSQL database.

## Step 7: Seed Database (Optional)

Populate your database with demo data:

```bash
npm run prisma:seed
```

This creates:
- Demo business
- Demo user (email: demo@okleevo.com, password: demo123)
- Sample contacts, invoices, tasks, expenses, and inventory items

## Step 8: Verify Setup

Open Prisma Studio to view your data:

```bash
npm run prisma:studio
```

This opens a browser interface at http://localhost:5555

## Quick Setup (All-in-One)

Run all setup steps at once:

```bash
npm run db:setup
```

## Available Prisma Commands

```bash
# Generate Prisma Client
npm run prisma:generate

# Create and apply migrations
npm run prisma:migrate

# Push schema without migrations (development)
npm run prisma:push

# Open Prisma Studio (database GUI)
npm run prisma:studio

# Seed database with demo data
npm run prisma:seed

# Complete setup (generate + push + seed)
npm run db:setup
```

## Database Schema Overview

The Okleevo database includes tables for:

### Core
- **User** - User accounts and authentication
- **Business** - Business/company information
- **Subscription** - Billing and subscription management

### Modules (20 total)
1. **Invoice** - Invoicing system
2. **Contact** - CRM contacts
3. **Task** - Task management
4. **Note** - AI-powered notes
5. **Expense** - Expense tracking
6. **InventoryItem** - Inventory management
7. **Employee** - HR records
8. **Supplier** - Supplier tracking
9. **Campaign** - Email campaigns
10. **Ticket** - Helpdesk tickets
11. **Appointment** - Booking/appointments
12. **ComplianceItem** - Compliance reminders

## Troubleshooting

### Connection Refused
- Ensure PostgreSQL is running: `sudo systemctl status postgresql` (Linux)
- Check if port 5432 is open
- Verify credentials in DATABASE_URL

### Permission Denied
```sql
-- Grant permissions in psql:
GRANT ALL PRIVILEGES ON DATABASE okleevo_db TO okleevo_user;
GRANT ALL ON SCHEMA public TO okleevo_user;
```

### Migration Errors
```bash
# Reset database (WARNING: deletes all data)
npx prisma migrate reset

# Then run setup again
npm run db:setup
```

### Prisma Client Not Found
```bash
# Regenerate Prisma Client
npm run prisma:generate
```

## Production Deployment

For production, use migrations instead of push:

```bash
# Create migration
npx prisma migrate dev --name init

# Apply migrations in production
npx prisma migrate deploy
```

## Backup Database

```bash
# Backup
pg_dump -U okleevo_user okleevo_db > backup.sql

# Restore
psql -U okleevo_user okleevo_db < backup.sql
```

## Support

For issues, check:
- Prisma Docs: https://www.prisma.io/docs
- PostgreSQL Docs: https://www.postgresql.org/docs/

---

**Demo Credentials:**
- Email: demo@okleevo.com
- Password: demo123

**Database GUI:** http://localhost:5555 (Prisma Studio)
