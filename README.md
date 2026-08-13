# Analiza handlowa — ngCRM Insights

Warstwa managersko-analityczna nad modułem CRM **nxp_aktualnosci** (Aktywności handlowe).

Docelowo moduł trafi do ngCRM (obok Marketing). Na razie sandbox: **https://analiza-handlowa.vercel.app**

## Źródło danych

| `DATA_SOURCE` | Opis |
|---------------|------|
| `mock` | Dane demo (domyślnie) |
| `api` | SuiteCRM REST API v8 — moduł `nxp_aktualnosci` |

## Vercel — zmienne środowiskowe

W **Settings → Environment Variables** (Production + Preview):

| Klucz | Wartość |
|-------|---------|
| `DATA_SOURCE` | `api` |
| `CRM_BASE_URL` | `https://crm.netxp.pl` |
| `CRM_API_CLIENT_ID` | *(OAuth2 client credentials z SuiteCRM)* |
| `CRM_API_CLIENT_SECRET` | *(secret)* |
| `CRM_SSL_VERIFY` | `false` |
| `CRM_ACTIVITIES_SINCE` | opcjonalnie `2025-02-01` |

Te same credentials co `NGCRM_CRM_API_CLIENT_*` w ngCRM.

## Linki do CRM

- Lista wszystkich aktywności:  
  `https://crm.netxp.pl/index.php?module=nxp_aktualnosci&action=index&parentTab=Wszystko`
- Pojedyncza aktywność:  
  `...&module=nxp_aktualnosci&action=DetailView&record={uuid}`
- Powiązany lead/kontakt: DetailView odpowiedniego modułu

W panelu analizy: **Otwórz w CRM** przy aktywnościach i klientach.

## Probe API (diagnostyka)

Po deployu z credentials: `GET /api/crm/probe` — zwraca klucze pól z próbki rekordu (do dopracowania mapowania).

## Lokalnie

```bash
cp .env.example .env.local
# uzupełnij CRM_* i DATA_SOURCE=api
npm install
npm run dev
```

## Mapowanie pól CRM

Plik `src/lib/crm/mapping.ts` — mapuje słowniki (Działanie, Status, Wynik, Powód) z wielu możliwych nazw pól `_c`.  
Po pierwszym probe doprecyzujemy nazwy pól w CRM.
