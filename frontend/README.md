# Adyapan Billing Sample

Small full-stack MVP for Adyapan:
- Admin login
- Dashboard
- Create student bill
- Four fee types: ₹3,500 / ₹5,000 / ₹15,000 online, ₹45,000 offline
- PostgreSQL + Prisma storage
- PDF bill generation
- Email bill PDF using SMTP

## 1. Requirements
- Node.js 20+
- PostgreSQL

## 2. Setup
Copy `.env.example` to `.env` and update the database credentials, auth secret, admin credentials, and SMTP credentials.

Create the PostgreSQL database:
`adyapan_billing`

Then run:

```bash
npm install
npx prisma migrate dev --name init
npm run db:seed
npm run dev
```

Open `http://localhost:3000`.

Use the admin email/password configured in `.env`.

## Gmail email setup
For Gmail SMTP, enable 2-Step Verification and create an App Password. Put the app password in `SMTP_PASS`. Do not use your normal Gmail password.

If SMTP is not configured, the bill is still saved to PostgreSQL, but its status becomes `EMAIL_FAILED`.

## Important
This sample generates a simple course bill, not a finalized statutory GST tax invoice. Before production use, add verified company/GST details, tax rules, sequential accounting numbering requirements, cancellation/credit-note handling, and accountant-approved invoice content.
