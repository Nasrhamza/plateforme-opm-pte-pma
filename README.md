# PFE — Plateforme unifiée OPM, PTE, PMA et Reporting

Plateforme de gestion et d'aide à la décision qui consolide trois applications métier dans un dashboard analytique unique.

## Accès local

| Service | URL |
|---|---|
| OPM | http://localhost:4200 |
| PTE | http://localhost:4201 |
| PMA | http://localhost:4202 |
| Reporting principal | http://localhost:4203 |
| API Reporting | http://localhost:8000 |
| Documentation API | http://localhost:8000/docs |

## Démarrage pour la soutenance

Double-cliquer sur `start-demo.bat`. Le script :

1. démarre PostgreSQL, les backends et les frontends ;
2. attend leur initialisation ;
3. vérifie les dix composants ;
4. ouvre automatiquement le Reporting Dashboard.

Pour contrôler les services sans les redémarrer, utiliser `check-all.bat`.

## Architecture synthétique

```text
OPM / PTE / PMA
       ↓
FastAPI — ETL sécurisé
       ↓
MongoDB — Bronze / Silver / MDM
       ↓
PostgreSQL — Data Warehouse / Datamarts
       ↓
Reporting Dashboard — KPIs et rapports
```

## Vérification technique

```powershell
cd reporting-fastapi
python -m pytest -q
```

Résultat de référence : **18 tests réussis, 0 échec, 3 tests conditionnels ignorés**.

Les trois frontends peuvent être vérifiés avec :

```powershell
npm run build -- --configuration development
```

## Données et sauvegardes

- Les données locales et les sauvegardes sont dans `.local-data/` et ne sont pas versionnées.
- `restore-mongo.bat` restaure sans supprimer les données existantes.
- Une sauvegarde automatique a été créée avant le dernier restore.
- Ne jamais distribuer un dump contenant des données réelles.

## Sécurité

- Authentification JWT et rôles `admin` / `viewer`.
- Routes analytiques protégées.
- Création de comptes réservée à l'administrateur.
- CORS limité aux interfaces locales autorisées.
- Secrets chargés depuis les fichiers `.env` ignorés par Git.
- Vérification de santé MongoDB + PostgreSQL.

## Documentation de soutenance

Consulter [`docs/SOUTENANCE_PFE.md`](docs/SOUTENANCE_PFE.md) pour la problématique, l'architecture, le scénario de démonstration et les réponses aux questions probables du jury.
