# charge.ma

Trouvez les bornes de recharge VE sur votre itinéraire au Maroc — application React client-side, sans backend.

## Lancer le projet

```bash
npm install && npm run dev
```

## Fonctionnement du filtrage par corridor

Quand un itinéraire est calculé via l'API OSRM, la géométrie encodée (polyline) est décodée en liste de points GPS. Pour chaque borne du dataset, on calcule la **distance minimale à n'importe quel segment de la polyline** (formule point-to-segment Haversine). Si cette distance est ≤ 5 km, la borne est considérée "sur le corridor" et apparaît en pleine couleur ; sinon elle est grisée (opacité 0.25) ou masquée. Les bornes sur le corridor sont triées par ordre d'apparition sur la route, avec la distance parcourue depuis le départ.

## Source des données

Les 25 bornes de `src/data/stations.json` sont basées sur des emplacements réalistes le long des corridors A7 (Casablanca–Marrakech) et A1 (Rabat–Tanger), ainsi que dans les grandes villes marocaines. Les coordonnées s'appuient sur des données OpenChargeMap et des localisations manuelles.

## Limitations connues

- L'API OSRM démo peut être lente ou indisponible (serveur public, pas de SLA).
- Les données de bornes sont statiques et semi-fictives — à remplacer par un export OpenChargeMap réel.
- Pas de géolocalisation utilisateur (position actuelle).
- Pas de recalcul en temps réel du statut des bornes.
