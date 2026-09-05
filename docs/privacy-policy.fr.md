# Politique de confidentialité de Tabibe

[English](privacy-policy.md) | [Türkçe](privacy-policy.tr.md) | Français | [Deutsch](privacy-policy.de.md) | [Italiano](privacy-policy.it.md)

**Date d’entrée en vigueur:** 5 septembre 2026

Tabibe est une extension de nouvel onglet pour Chromium conçue pour fonctionner localement dans votre navigateur. Elle n’intègre ni analyse, ni publicité, ni télémétrie, ni compte utilisateur, ni serveur d’application distant.

## Données stockées sur votre appareil

Tabibe stocke les sites et dossiers d’accès rapide, les notes et carnets, les paramètres d’apparence, les images d’arrière-plan importées et les préférences de fonctionnalités dans chrome.storage.local. Ces informations restent dans le profil local de votre navigateur et ne sont pas transmises au développeur.

L’exportation d’une sauvegarde crée un fichier JSON sur votre appareil. L’importation lit uniquement le fichier que vous sélectionnez, le valide localement et écrit les données acceptées dans le stockage local de l’extension.

Les adresses et noms enregistrés, textes des notes, étiquettes, horodatages, identifiants locaux et brouillons de récupération servent uniquement à votre espace de nouvel onglet. Tabibe ne propose pas de synchronisation cloud. La démo utilise localStorage au lieu du stockage de l’extension.

## Autorisations du navigateur

Tabibe applique le principe du moindre privilège :

- storage est obligatoire pour enregistrer les données de l’extension dans le profil local de votre navigateur.
- search est nécessaire pour envoyer votre recherche au moteur par défaut de Chrome via Chrome Search API, sans modifier les paramètres de recherche du navigateur.
- favicon est facultatif. Lorsque vous activez les icônes de sites, Tabibe peut utiliser le fournisseur de favicons intégré de Chrome pour les adresses déjà connues du navigateur. Vous pouvez révoquer cette autorisation dans les Paramètres.
- system.memory est facultatif. Cette autorisation est demandée uniquement lorsque vous activez l’indicateur de mémoire et peut être révoquée en désactivant cet indicateur.

Tabibe lit le nombre d’onglets et de fenêtres pour l’indicateur local, sans autorisation tabs ni accès à leurs adresses, titres ou à l’historique. Les valeurs de mémoire facultatives sont affichées temporairement, sans être stockées ni transmises au développeur. L’extension ne lit pas les autres pages, cookies, mots de passe ou capteurs.

## Activité réseau

Les icônes de marque de Simple Icons sont intégrées localement. Les adresses des sites enregistrés ne sont pas envoyées à un service d’icônes externe et Tabibe n’effectue aucune requête d’analyse ou de télémétrie.

Seules les recherches envoyées et les liens ouverts, y compris dans les notes, vous dirigent hors de Tabibe. La recherche utilise le moteur par défaut du navigateur, sauf si vous en choisissez explicitement un autre dans Tabibe. Tabibe ne conserve pas les requêtes. Les sites destinataires reçoivent les données de connexion habituelles, telles que votre adresse IP, selon leurs politiques. Les services du navigateur relèvent des politiques de son fournisseur.

## Vos moyens de contrôle

Vous pouvez modifier ou supprimer des sites, dossiers, notes et carnets ; modifier ou réinitialiser les préférences d’apparence ; accorder ou révoquer les autorisations facultatives ; et exporter ou restaurer une sauvegarde validée depuis les Paramètres.

## Conservation et suppression

Supprimer un élément le retire de l’espace actif. Les copies d’annulation, brouillons de récupération et instantanés précédant une restauration ou réinitialisation peuvent conserver l’ancien contenu localement. Effacer tout le stockage de Tabibe ou désinstaller l’extension supprime ces données locales. Les fichiers JSON exportés et sauvegardes du navigateur ou de l’appareil restent jusqu’à leur suppression séparée.

## Limites du stockage et du service

Tabibe ne chiffre pas le stockage local ni les fichiers JSON exportés. Ce n’est pas un coffre-fort de mots de passe : évitez les mots de passe, données de paiement et autres informations sensibles. Protégez votre profil, appareil et sauvegardes. Le développeur n’a pas de copie de votre espace local et ne peut pas le récupérer, le supprimer ou le restaurer à distance.

Aucune garantie de fonctionnement ininterrompu, de conservation sans perte, de récupération ou de support continu n’est donnée. Dans les limites permises par la loi, le logiciel est fourni en l’état, sans garantie supplémentaire. Les droits impératifs des consommateurs et responsabilités légalement non excluables restent applicables. Ces limites ne réduisent pas les engagements d’utilisation des données.

## Utilisation limitée (Limited Use)

L’utilisation des données par Tabibe, y compris celles provenant des API Chrome, respecte la politique de données utilisateur du Chrome Web Store et ses exigences Limited Use. Les données servent uniquement aux fonctions de nouvel onglet décrites. Elles ne sont ni vendues ni utilisées pour la publicité, le profilage, le crédit ou des finalités sans rapport. Le développeur n’accède au contenu local que si vous choisissez de le partager pour l’assistance.

## Modifications de cette politique

Toute modification importante de cette politique sera documentée avec la version correspondante de Tabibe. La date d’entrée en vigueur sera actualisée lorsque la politique changera.

## Contact

Développeur : Tercan Keskin. Utilisez le suivi des problèmes pour les questions de confidentialité. Les tickets GitHub sont publics : ne joignez pas de notes privées, sauvegardes ou identifiants. Les informations envoyées volontairement sont traitées par GitHub selon ses politiques et peuvent être lues par le développeur pour répondre. Le site public est hébergé par GitHub Pages, dont les politiques s’appliquent également.

[Ouvrir le gestionnaire de problèmes de Tabibe](https://github.com/tercan/tabibe/issues)

[Français](https://tercan.github.io/tabibe/privacy/?lang=fr)
