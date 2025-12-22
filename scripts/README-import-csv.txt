Run the CSV import and simulation locally (reads data/match_results.csv):

1) Start dev server (already running on npm run dev) or run once via API:
   curl http://localhost:3000/api/import-csv > /tmp/import.json

2) In the app, call importCsvMatches() from context (add a temporary button or trigger in console):
   const { importCsvMatches } = useApp(); await importCsvMatches();

The API will create missing players at rating 1100, simulate all matches in order, and return final players/matches.