# SentimentIntel — Real Estate Sentiment Dashboard

NLP sentiment dashboard for **204 Indian properties** (99acres), with **4 aspects** each: Location, Transport, Utilities, Price.

## Data pipeline

| File | Purpose |
|------|---------|
| `src/data/final_dashboard_data.json` | Organized source (204 properties, aspects nested — no 816-row duplication) |
| `src/data/catalog.json` | Lightweight bundle for the dashboard (~215 KB) |
| `public/data/properties-full.json` | Full timelines loaded on demand (~21 MB) |
| `src/data/properties_metadata.json` | Scraped name, price, area, BHK from 99acres |

### Fetch listing metadata from 99acres URLs

```bash
pip install -r scripts/requirements.txt
npm run data:fetch          # all 204 properties (~3–5 min)
npm run data:fetch -- --limit 10   # test run
npm run data:catalog        # rebuild catalog after fetch
```

## Run app

```bash
npm install
npm run dev
```

Open http://localhost:4173

## Verdicts

All aspects use the same 3 verdicts: **Positive** · **Neutral** · **Negative**
