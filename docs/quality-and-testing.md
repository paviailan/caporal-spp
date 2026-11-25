# Qualité, tests et critères de validation

Version : 0.1

## 1. Règle de développement
Chaque étape dispose de critères d'acceptation explicites. Une étape n'est validée que lorsque les tests pertinents ont été exécutés et leurs résultats vérifiés.

Ne jamais déclarer le logiciel « sans bug ». Rapporter précisément les contrôles exécutés, les résultats et les limites. Un test non exécuté doit être signalé comme tel.

## 2. Pyramide de tests
- Tests unitaires du domaine et du moteur avec Vitest.
- Tests de propriétés et cas limites, notamment avec fast-check si pertinent.
- Tests d'intégration des services et transactions.
- Tests E2E Playwright pour les parcours critiques.
- Contrôles TypeScript, lint et build.
- Contrôles de sécurité : RLS, droits, validation serveur, concurrence et idempotence.

Le moteur central est testable sans réseau, Supabase ou appel IA.

## 3. Invariants du moteur
1. Une tâche terminée n'est jamais modifiée.
2. Refuser une proposition laisse le planning actif strictement inchangé.
3. Une validation partielle n'applique que les changements sélectionnés.
4. Une modification locale ne change pas les tâches sans lien.
5. Aucune tâche ou validation dupliquée.
6. Aucun mélange entre parcours classique et SPV.
7. Aucune surcharge silencieuse des disponibilités.
8. Aucun prérequis pédagogique non satisfait.
9. Une proposition obsolète ne peut écraser une version récente.
10. Même entrée et mêmes versions du moteur/règles produisent le même résultat.

## 4. Scénarios
- Débutant avec six mois de préparation.
- Candidat expérimenté avec trois mois.
- Disponibilités limitées à trois jours par semaine.
- Réalisation irrégulière d'environ 60 % des tâches.
- Progression rapide.
- Échec répété sur un chapitre.
- Maîtrise durable d'un chapitre.
- Deux séances manquées.
- Cinq jours sans activité.
- Deux semaines sans activité.
- Réduction de 50 % des disponibilités.
- Changement de date du concours.
- Changement de parcours avec création contrôlée d'un nouveau programme.
- Refus complet d'une proposition.
- Acceptation partielle.
- Décision répétée ou requête dupliquée.
- Deux décisions concurrentes sur une même version.

## 5. Portes de validation
- 100 % des tâches terminées préservées.
- 100 % des refus sans modification du planning actif.
- 100 % des validations partielles limitées aux changements sélectionnés.
- Zéro dépassement de disponibilité non signalé.
- Zéro prérequis non satisfait.
- Zéro doublon de tâche.
- Zéro mélange de parcours.
- Déterminisme vérifié sur les fixtures.
- Aucun échec bloquant dans les tests requis avant passage à l'étape suivante.

## 6. Procédure par étape
1. Décrire le besoin et les critères d'acceptation.
2. Ajouter ou mettre à jour les tests avant ou avec le code.
3. Implémenter une seule tranche fonctionnelle cohérente.
4. Exécuter les contrôles statiques et tests ciblés.
5. Exécuter la suite de régression pertinente.
6. Corriger les échecs et relancer les tests.
7. Vérifier le diff et les effets de bord.
8. Rapporter les commandes, résultats et limites.
