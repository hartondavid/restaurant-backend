# Troubleshooting Migrations - Restaurant Backend

## Problema identificată
Proiectul nu rulează migrările corect și creează doar 2 tabele goale (`knex_migrations` și `knex_migrations_lock`).

## Cauze posibile și soluții

### 1. Verifică configurația de mediu
```bash
npm run check:env
```

Această comandă va verifica:
- Dacă fișierul `.env.local` există
- Dacă `DATABASE_URL` este configurat corect
- Dacă `JWT_SECRET` este setat

### 2. Verifică conexiunea la baza de date
```bash
npm run migrate:run
```

Această comandă va:
- Testa conexiunea la baza de date
- Rula migrările cu informații detaliate de debug
- Rula seed-urile
- Verifica datele după migrare

### 3. Probleme comune și soluții

#### A. Fișierul .env.local nu există
Creează fișierul `.env.local` în directorul rădăcină:
```env
DATABASE_URL=postgresql://username:password@host:port/database
JWT_SECRET=your_jwt_secret_here
```

#### B. DATABASE_URL incorect
Verifică că URL-ul de conexiune este corect pentru PostgreSQL:
- Format: `postgresql://username:password@host:port/database`
- Pentru Neon: `postgresql://username:password@ep-xxx-xxx-xxx.region.aws.neon.tech/database?sslmode=require`

#### C. Permisiuni insuficiente
Asigură-te că utilizatorul din DATABASE_URL are permisiuni pentru:
- Crearea tabelelor
- Scrierea în baza de date

#### D. Migrările sunt deja rulate
Verifică statusul migrărilor:
```bash
npx knex migrate:status --knexfile knexfile.cjs
```

### 4. Comenzi utile pentru debug

```bash
# Verifică statusul migrărilor
npx knex migrate:status --knexfile knexfile.cjs

# Rulează migrările manual
npx knex migrate:latest --knexfile knexfile.cjs

# Rulează seed-urile manual
npx knex seed:run --knexfile knexfile.cjs

# Resetează migrările (ATENȚIE: șterge toate datele!)
npx knex migrate:rollback --all --knexfile knexfile.cjs
```

### 5. Verificări suplimentare

#### A. Verifică că toate migrările există
```bash
ls migrations/
```

Ar trebui să vezi:
- `20250605083634_create_users_table.cjs`
- `20250605083703_create_rights_table.cjs`
- `20250605083714_create_user_rights_table.cjs`
- `20250616064018_create_boards_table.cjs`
- `20250616064137_create_products_table.cjs`
- `20250616064211_create_orders_table.cjs`
- `20250616065601_create_order_items_table.cjs`
- `20250616105232_create_board_items_table.cjs`

#### B. Verifică că knexfile.cjs este corect
Asigură-te că fișierul `knexfile.cjs` conține configurația corectă pentru PostgreSQL.

#### C. Verifică log-urile
Când rulezi serverul, caută în log-uri:
- `✅ Database connected successfully`
- `✅ Migrations completed successfully`
- `✅ Seeds completed successfully`

### 6. Soluții pentru probleme specifice

#### Problema: "SHOW TABLES" nu funcționează
**Soluție:** Am corectat codul să folosească `SELECT tablename FROM pg_tables WHERE schemaname = 'public'` pentru PostgreSQL.

#### Problema: Migrările nu se rulează automat
**Soluție:** Verifică că `runMigrations()` este apelat în `index.mjs` înainte de încărcarea rutelor API.

#### Problema: Erori de conexiune SSL
**Soluție:** Asigură-te că configurația pentru production include:
```javascript
ssl: { rejectUnauthorized: false }
```

### 7. Testare finală

După ce ai rezolvat problemele, testează:

1. Rulează `npm run check:env`
2. Rulează `npm run migrate:run`
3. Pornește serverul cu `npm start`
4. Accesează `http://localhost:8080/test-db` pentru a verifica datele

### 8. Contact

Dacă problemele persistă, verifică:
- Log-urile complete din consolă
- Configurația bazei de date
- Permisiunile utilizatorului din DATABASE_URL 