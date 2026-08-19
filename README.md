# RepairFlow

Boekingssite + admin dashboard voor een reparatiebedrijf, gebouwd met Next.js, Prisma en Tailwind.

## 1. Lokaal starten

```bash
npm install
cp .env.example .env
# open .env en vul AUTH_SECRET in (zie instructie in dat bestand)

npx prisma db push      # maakt de database-tabellen aan
npm run db:seed         # vult voorbeelddiensten + jouw admin-account
npm run dev
```

Site: http://localhost:3000
Admin: http://localhost:3000/admin/login (inloggegevens = ADMIN_EMAIL / ADMIN_PASSWORD uit je .env)

## 2. Deployen — zie het bericht in de chat voor de volledige stap-voor-stap uitleg
