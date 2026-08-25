# Lokaal werken en veilig uploaden

Korte checklist zodat je lokaal kunt werken en niets kapotmaakt bij uploaden.

## Eerste keer lokaal

1. **Dependencies**
   ```bash
   npm install
   ```

2. **Environment**
   - Kopieer `.env.example` naar `.env.local`
   - Vul alleen de waarden in die je nodig hebt (minimaal `GEMINI_API_KEY` voor de chat)
   - **Commit nooit** `.env.local`, `.env` of `.env.vercel` — die staan in `.gitignore`

3. **Dev server**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000).

## Voor je pusht (uploaden)

Draai even de checks zodat type-check, lint en build goed gaan:

```bash
npm run check
```

Dat doet: `type-check` → `lint` → `build`. Als alles groen is, kun je committen en pushen.

## Git workflow

- **Origin:** `https://github.com/blablabuildteam/blablabuild.git` — hier pushen we naartoe
- **Vercel:** bestaand project **blablabuild** blijft staan; alleen de gekoppelde GitHub-repo wijzigen

### Dagelijkse flow

```bash
git add -A
git status   # controleer dat er GEEN .env of .env.vercel tussen staat
git commit -m "Beschrijving van je wijzigingen"
git push origin main
```

### GitHub in Vercel omhangen (eenmalig)

Vercel → project **blablabuild** → **Settings → Git** → disconnect oude repo (`danieldevos90/blablabuild`) → connect `blablabuildteam/blablabuild` → branch `main`.

Repo niet zichtbaar? [Vercel GitHub App](https://github.com/apps/vercel) → toegang geven tot `blablabuildteam`.

## Wat we niet meenemen (staat in .gitignore)

- `node_modules/`
- `.env`, `.env.local`, `.env.vercel`, `.env.vercel.*`
- `.next/`, `build/`, `out/`
- `coverage/`
- `.env.example` **wordt wel** gecommit (geen secrets, alleen variabelnamen)

Als je twijfelt: `git status` laat zien wat wordt gecommit. Geen env-bestanden met echte keys in de lijst.
