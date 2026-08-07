# Analiza handlowa — Aktywności CRM

Warstwa managersko-analityczna nad aktywnościami handlowców (demo na mock data).

**Nie jest to CRM** — odpowiada na pytania:

1. Czy handlowcy wykonują zaplanowaną pracę?
2. Czy leady są regularnie obsługiwane?
3. Gdzie występują zaniedbania wymagające interwencji?

## Stack

- Next.js 15 (App Router) + TypeScript
- Tailwind CSS
- Recharts
- TanStack Table

## Uruchomienie lokalne

```bash
npm install
npm run dev
```

Aplikacja: [http://localhost:3000](http://localhost:3000)

## Źródło danych (API-ready)

```ts
// src/config/dataSource.ts
export const DATA_SOURCE: "mock" | "api" = "mock";
```

Widoki korzystają wyłącznie z `services/*`. Przełączenie na API = implementacja `services/api/repository.ts` + zmiana flagi.

## Mock data

Deterministyczny generator (`src/data/mock/generate.ts`, seed `20260807`):

- 8 handlowców (archetypy: top dyscyplina, high-volume/low-result, overdue, reschedule…)
- 260+ leadów
- 1500+ aktywności
- okres ~6 miesięcy

```bash
npm run generate-mock
```

## Vercel

Połącz repozytorium z Vercel (Framework Preset: Next.js). Build:

- Install: `npm install`
- Build: `npm run build`
- Output: domyślny Next.js

## Dwie osie oceny handlowca

- **Aktywność** — wolumen działań
- **Dyscyplina procesu** — Sales Activity Discipline Score 0–100 (terminowość, kolejny krok, zaległości, wyniki, 1. reakcja)
