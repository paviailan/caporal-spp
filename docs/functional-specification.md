# Spécification fonctionnelle — Caporal SPP

Version : 0.2  
Statut : décisions produit consolidées, spécification à détailler avant implémentation complète.

## 1. Vision produit
Construire un coach numérique qui aide le candidat à savoir quoi travailler, quand, pourquoi et comment mesurer sa progression. L'application dépasse une simple banque de QCM en articulant apprentissage, entraînement, suivi et planification adaptative.

## 2. Périmètre des parcours
### Concours externe – voie classique
- Compréhension de texte.
- Mathématiques.
- Examens blancs propres à cette voie.

### Concours externe – voie réservée aux sapeurs-pompiers volontaires
- Compréhension de texte.
- Connaissances relatives à l'activité de sapeur-pompier volontaire.
- Examens blancs propres à cette voie.

Les parcours et épreuves doivent être paramétrés à partir des textes officiels consolidés et des avis d'ouverture applicables. Les subdivisions pédagogiques ne doivent jamais être présentées comme des intitulés réglementaires officiels.

### Hors périmètre initial
Le concours interne et l'examen professionnel constituent des voies distinctes et ne doivent pas être mélangés aux parcours externes de la V1.

## 3. Piliers fonctionnels
1. Apprendre : cours structurés, QCM, explications et sources.
2. S'entraîner : entraînements chronométrés et examens blancs conformes à la voie choisie.
3. Progresser : mesure de la maîtrise par compétence.
4. Planifier : programme initial complet, vue hebdomadaire et tâches quotidiennes.
5. Se préparer physiquement : module facultatif et activable séparément.
6. Préparer l'oral : entraînement guidé et retours structurés, avec IA ciblée.

## 4. Décisions validées pour le moteur de planification

| Paramètre | Choix |
|---|---|
| Type de programme | Programme complet initial + adaptations |
| Autonomie du coach | Équilibrée (balanced) |
| Réévaluation planifiée | Hebdomadaire (weekly) |
| Déclencheurs exceptionnels | Événement important (event) |
| Niveau d'explication | Détaillé (detailed) |
| Application des changements | Validation explicite du candidat |
| IA dans le moteur central | Non ; moteur de règles déterministe |

### 4.1 Autonomie équilibrée
Le coach est proactif sans devenir interventionniste. Il détecte difficultés, retards, baisses de régularité et changements de disponibilité. Il propose des ajustements pertinents, sans modifier silencieusement le planning actif.

Selon les priorités, il peut proposer de conserver, déplacer, raccourcir, supprimer ou fusionner une tâche, ajouter un renforcement, différer un nouveau chapitre ou préserver une simulation importante. Il ne doit pas réduire systématiquement la durée de toutes les séances.

### 4.2 Réévaluation hebdomadaire
Une revue globale est effectuée chaque semaine à partir :
- des tâches prévues, terminées, partielles ou manquées ;
- des résultats aux QCM et examens blancs ;
- de la maîtrise estimée par compétence ;
- du temps réellement disponible et des disponibilités actualisées ;
- des révisions à échéance ;
- de la date du concours.

Le moteur peut conclure qu'aucun changement n'est nécessaire.

Une réévaluation ponctuelle peut être déclenchée entre deux bilans hebdomadaires lorsqu'un événement important survient : changement de date du concours, réduction majeure des disponibilités, changement de parcours ou indisponibilité exceptionnelle. Les petites variations ne doivent pas provoquer systématiquement une nouvelle proposition.

### 4.3 Explications détaillées
Chaque proposition explique l'état initial et l'état proposé, chaque tâche conservée, ajoutée, déplacée, raccourcie, fusionnée ou supprimée, la raison propre à chaque changement, les données et règles utilisées, l'effet attendu et les compromis éventuels.

Les explications sont générées à partir des décisions réelles du moteur, et non inventées a posteriori par un modèle de langage.

## 5. Cycle de vie du programme
1. Évaluation initiale du candidat.
2. Définition du parcours, de la date cible et des disponibilités.
3. Évaluation diagnostique des connaissances.
4. Génération d'un programme initial complet.
5. Présentation du programme et de ses priorités.
6. Exécution et suivi des tâches.
7. Réévaluation hebdomadaire ou déclenchement exceptionnel.
8. Création d'une proposition versionnée.
9. Décision : tout accepter, tout refuser, accepter une sélection ou demander une nouvelle proposition.
10. Application atomique des seuls changements acceptés.

## 6. Règles d'intégrité
- Une tâche terminée est immuable.
- Une proposition refusée ne change pas le planning actif.
- Une acceptation partielle n'applique que les changements sélectionnés.
- Une modification isolée ne doit pas altérer les tâches sans rapport.
- Les tâches manquées ne sont pas empilées automatiquement.
- Les disponibilités sont respectées ou font l'objet d'une alerte explicite.
- Les prérequis pédagogiques sont respectés.
- Les parcours classique et SPV restent strictement séparés.
- Toute proposition référence la version du planning utilisée pour son calcul.
- Une proposition calculée sur une ancienne version ne peut pas écraser une version plus récente.
- Le candidat peut modifier manuellement son planning ; les conflits sont explicités.

## 7. Progression et maîtrise
La maîtrise ne dépend pas d'un seul QCM réussi. Elle est estimée à partir de résultats répétés, de la difficulté, de la récence, de la stabilité des performances et, lorsque pertinent, de la capacité à répondre dans un temps contraint.

Le système entretient les acquis avec des révisions espacées, même lorsque le candidat maîtrise déjà un chapitre. Les seuils et pondérations restent à calibrer et à tester avant d'être figés.

## 8. Tableau de bord
Présenter la progression par domaine et chapitre, les compétences solides et fragiles, les tâches réalisées, la régularité, les résultats aux examens blancs, les prochaines priorités et la trajectoire de préparation. Toute projection est une estimation pédagogique, jamais une probabilité garantie de réussite.

## 9. Modules complémentaires
- Préparation physique facultative, séparée des épreuves écrites.
- Préparation orale avec simulations et retours structurés.
- IA ciblée pour le tutorat, les explications et la simulation orale ; elle ne décide pas seule du planning.

## 10. Administration et qualité éditoriale
Workflow : brouillon → relecture → validation experte si nécessaire → publication → mise à jour requise ou archivage.

Chaque question et cours possède un identifiant stable, une voie, un domaine, un niveau, une explication, des sources, une date de vérification et un statut éditorial. Les contenus réglementaires et opérationnels sont vérifiés à partir de sources officielles à jour. Les contenus SUAP et opérationnels nécessitent une validation qualifiée. Les droits de reproduction et licences sont contrôlés.
