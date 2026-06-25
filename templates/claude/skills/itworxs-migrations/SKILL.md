---
name: itworxs-migrations
description: Beheer Postgres-migraties (raw pg, geen ORM): maak/pas migratiebestanden toe en houd het schema in versiebeheer. Gebruik bij een schemawijziging.
---

# ItWorXs DB Migrations

De backend gebruikt `pg` rechtstreeks (geen ORM). Houd schemawijzigingen in
versiebeheer met genummerde SQL-migratiebestanden.

## Conventie

- Map: `backend/migrations/`
- Naam: `NNN_korte_omschrijving.sql` (bv. `001_create_users.sql`), oplopend genummerd.
- Eén logische wijziging per bestand. Voorzie waar zinvol een omgekeerde migratie (`NNN_..._down.sql`).

## Een migratie maken

1. Bepaal het volgende nummer (hoogste bestaande + 1).
2. Schrijf veilige, zo idempotent mogelijke SQL (`CREATE TABLE IF NOT EXISTS`, expliciete types, indexen op foreign keys).
3. Zet geen applicatiedata of secrets in de migratie.

## Migraties toepassen

- Houd een tabel `schema_migrations` bij met de reeds toegepaste versies.
- Pas enkel nog niet-toegepaste bestanden toe, in volgorde, elk binnen een transactie.
- Gebruik de pool uit `backend/src/config/db.ts`, of `psql` met de waarden uit `.env`.

## Tip

Voor een volwaardige tool kan `node-pg-migrate` toegevoegd worden
(`npm i -D node-pg-migrate`); houd dan dezelfde mappenstructuur aan.

Test na elke migratie de `/health`-endpoint en draai de backend-build.
