# Architecture technique — Caporal SPP

Version : 0.1  
Statut : proposition d'architecture à valider par étapes.

## 1. Stack cible
- Next.js + React + TypeScript.
- Tailwind CSS.
- Supabase : PostgreSQL, Auth et Storage.
- Vercel : hébergement et déploiement.
- Zod : validation des entrées/sorties.
- Vitest : tests unitaires et d'intégration.
- Playwright : tests navigateur.
- Sentry : suivi des erreurs.
- Stripe : abonnements, après mise en place des droits côté serveur.

Aucun service externe ni projet Supabase existant ne doit être réutilisé sans décision explicite.

## 2. Principes
- Séparer domaine métier, interface, accès aux données et intégrations.
- Le moteur de planification fonctionne sans réseau, Supabase ou modèle IA.
- Les règles métier sont déterministes et versionnées.
- Valider les données entrantes côté serveur.
- Appliquer les changements dans une transaction.
- Utiliser des clés d'idempotence.
- Vérifier la version active du planning avant toute application.
- Appliquer le moindre privilège et des politiques RLS.
- Minimiser les données personnelles et de santé.

## 3. Modules
- identity : compte, profil, rôles.
- exam-tracks : voies et référentiels d'épreuves.
- content : cours, questions, sources et workflow éditorial.
- assessment : diagnostics et tentatives.
- learning-mastery : maîtrise et révisions.
- planning-engine : génération et adaptation déterministes.
- planning-workflow : propositions, décisions et historique.
- physical-preparation : module facultatif.
- oral-preparation : simulations et retours.
- billing : abonnements et droits.
- admin : administration et validation éditoriale.

## 4. Modèle de données cible

### Utilisateurs et parcours
profiles, user_roles, exam_tracks, exam_events, candidate_assessments, availability_slots.

### Référentiel pédagogique
pedagogical_domains, pedagogical_chapters, learning_objectives, courses, questions, question_options, question_sources, editorial_reviews, candidate_attempts, candidate_mastery, mock_exams, mock_exam_questions.

### Planification
study_programs, program_phases, planning_tasks, planning_versions, planning_proposals, proposal_changes, candidate_decisions, task_completions, scheduling_rules, schedule_audit_logs.

### Modules complémentaires
physical_tests, oral_simulations, subscriptions, entitlements.

Le schéma relationnel détaillé, les contraintes, index, politiques RLS et migrations seront définis avant connexion à une base de données.

## 5. Contrat du moteur de planification
Entrées versionnées : profil et parcours, date cible, disponibilités, version active du programme, tâches et états d'exécution, résultats et maîtrise par compétence, version des règles.

Sortie : proposition immuable, changements structurés, justification détaillée par changement, contraintes et alertes, identifiant de version source, version du moteur et des règles.

Le moteur ne persiste pas directement les changements. Un service distinct vérifie la décision du candidat et applique atomiquement les changements autorisés.

## 6. Intégrité et concurrence
- Vérification optimiste de la version du planning.
- Transaction atomique lors de l'application.
- Idempotence des décisions.
- Refus des propositions obsolètes.
- Interdiction de modifier les tâches terminées.
- Journalisation de l'auteur, de la date, de la version source et de la décision.
- Contraintes SQL empêchant les états incohérents lorsque possible.

## 7. Sécurité et conformité
Authentification sécurisée, RLS sur les données personnelles, contrôle des rôles côté serveur, secrets uniquement en variables d'environnement, webhooks Stripe vérifiés côté serveur, politique de conservation et suppression des données, consentement et durée de conservation définie pour les enregistrements audio.

Prévoir mentions légales, CGU, CGV et politique de confidentialité avant commercialisation. Aucun élément institutionnel ne doit laisser supposer un agrément ou soutien officiel sans autorisation.

## 8. Déploiement
Aucun déploiement en production dans cette phase. Les environnements local, preview et production seront séparés. Les migrations seront versionnées et réversibles lorsque possible.
