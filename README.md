# JS-PixelWar IUT
Labbé Clément  
JS-PixelWar est un projet consistant à refaire en HTML CSS JS le concept de Reddit https://www.iim.fr/pixel-war-france-guerre-pixels-reddit/      toutes les informations sont sur http://js-but1.codenestedu.fr/projet

## Partie Manuelle   

### Configuration  
Avant toute chose, il faut savoir que le projet comporte un fichier `env` (si celui-ci n'existe pas, créez en un à la racine du projet) comportant les informations utiles au système tel que l'adresse du serveur.     
Veuillez donc dans ce fichier y mettre : 

`export const server = 'https://pixel-api.codenestedu.fr'`  
Si l'addresse n'est pas celle mise dans l'exemple remplacez-la par la votre.

Aussi le site intègre des cookies et sauvegarde votre UID. Néanmoins, chaque semaine celui-ci est supprimé.    
  
Si vous ne voulez pas avoir à la remettre, vous pouvez dans `env` ajouter la ligne :    

`export const uid = '0X0X0X0X'`
en remplaçant bien 0X par votre UID.

### Utilisation

![Exemple page de base](/img/mdUtilisation1.png)
Voici à quoi ressemble l'interface de base. À **droite**, on y retrouve tous les outils nécessaires à la pose d'un pixel :  
 - l'**uid** de connexion 
 - la **couleurs** du pixel  
 - l'**equipe** 
 - le **temps** restant avant la prochaine pose 
 - les **messages** renvoyés par le serveur 
  
  
Au centre, on retouve le tableau de pixel sur lequel on peut directement **cliquer** pour poser un pixel.

À gauche, on retrouve une **image** de décoration qui servira dans la `seconde partie`.  
On y trouve également le tableau des **joueurs courant** avec leurs informations :
- nom  
- équipe 
- leurs date de dernière pose de pixel 
- si ils sont bannis 
- nombre de pixels posés

   
En haut de la page, on retrouve un bouton afin de passer à un **thème** plus sombre et un switch permettant d'accéder à la `seconde partie`.

### Partie technique
Le projet est divisé en deux grandes **class** `API` et `Script`.
API gère toutes les communications avec le serveur distant tandis que `Script` gère tous les calculs, l'affichage, et fait appel à l'API régulièrement. 

À l'initialisation du projet, `Script` crée un tableau `HTML` et utilise les couleurs renvoyées par `API` pour faire le **tableau de pixels**.   
Par la suite, une méthode sera appellée toutes les 200ms afin de vérifier si la couleur de chaque case correspond à ceux renvoyés par l'`API`.
  

Par la suite, le `Script` attend d'avoir un `UID` et une Equipe "Correct", acceptés par l'`API` pour pouvoir 
afficher toutes les secondes les joueurs courants et
donner accès aux fonctionnalités de pose.  
 `Script` vérifie, de part une gestion interne, que le temps entre 2 poses est bien de 15s afin d'éviter tout bannissement et des requêtes trop récurrentes à l'`API`.

L'équipe du joueur se remettant automatiquement à 0 au bout d'un certain temps, `Script` renvoie une requête de changement d'équipe toutes les 15 secondes afin d'éviter tout problème.

### À l'avenir 
Il y a plusieurs choses que j'aimerais rajouter au projet : 
- La possibilité de créer des palettes de couleurs et ne pas avoir qu'une seule `input color`
- La Possibilité d'avoir un tableau de joueurs **personnalisable** avec des cases à cocher pour avoir seulement les informations souhaitées
- la possibilité de **zoomer** sur la grille de pixel
- Un **easter egg** avec un nyan cat en fond d'écran 

Il y a aussi plusieurs choses pour moi qui sont à revoir dans mon projet telles que :  
- Les messages renvoyés par l'`API` qui sont souvent **incomplets**. Je ne les exploite pas assez. 
- le **design** du site est à revoir avec un tableau un peu simpliste, des contours de couleur unie, et des écritures assez souvent illisibles.
- au niveau du code certaines méthodes mériteraient d'être refaites et/ou re decoupées. 
Je fais une utilisation un peu trop récurrente de variables globales qui pourraient être plus situationelles. 



## Partie Automatique ( Bot )

### Introduction 

Cette partie du projet consiste en la réalisation d'un `BOT`. Il suivra toutes les règles de pose et, via une image donnée, va la dessiner sur la fresque grâce à de multiples comptes (`UID` , équipe).

### Configuration

Avant toutes choses, il faut configurer dans la class `BOT` tous les comptes qui seront utilisés afin de dessiner. Dans un second temps, il faut définir dans la constante `Request` de la class `BOT` le lien vers l'image dessinée. Celle-ci sera un tableau **100x100** de couleurs en hexadecimal au format `Json`

Afin de convertir une image en jpg en json il faut :
- Depuis une image de taille 100*100 la convertir en hexadécimal grace a ce site  : https://onlinejpgtools.com/convert-jpg-to-hex  
- mettre le resultat dans un fichier texte de reference dans `js-pixelwar/jsonize`  
- utiliser le script `jsonize.sh` dans le répertoire **jsonize** et taper la commande suivante :   
  `./jsonize (acces au fichier texte) 100`
- recuperer l'output dans (nomfichier).json
- mettre l'acces au json dans le `env.js`, si celui-ci n'existe pas ajoutez la ligne :  
`export const request_model = new Request("rep/nom.json")`

Le script `jsonize` à été conçu dans le bien de la guerre des pixels par **Loan Collomb** étudiant en **S2B** celui-ci n'est donc présent dans ce depot uniquement dans le bon fonctionnement du reste et n'est donc pas évaluable 



### Utilisation 
Après avoir activé le `switch bot` en haut à gauche de l'interface, la page se "freeze" quelques secondes le temps d'initialiser chacun des bots.  
Par la suite, les comptes présents dans la variable `users` de la class `Bot` dessinent le **model** qui se trouve être en réalité l'**image de décoration** à gauche de l'interface.  
Aussi la partie outils de la page disparait pour laisser place aux bots afin d'éviter tout conflit entre la partie **Manuelle** et **Automatique**.

### Partie Technique 

La partie `Bot` du projet utilise le tableau d'`User` créé au préalable et défini donc le nombre de **bot**. Chacun des bots est **initilisé** à des intervalles de 700ms afin d'éviter que 2 bots posent sur le **même pixel**, ou qu'il y ait **conflit** entre 2 requêtes envoyées au même moment.   
Dans ce même principe, quand un bot est en train de comparer et de poser, chacun des **autres** s'arrête pour lui laisser la place grâce à la variable `wait`.
Une fois initialisé, chacun des bots dans le tableau d'user est associé à une **date de dernière pose** et une **date de dernière initialisation d'équipe**.
De part ces **2 données**, dès que cela est possible, chaque bot **compare** le tableau donné par l'`API` et celui en local défini par l'image `Json`. Il remplace le **premier** pixel différent rencontré.

### Problèmes rencontrés
Lors de l'initalisation des bots , une boucle `while` est utilisée pour les **initialiser** à des intervalles différents.  
 Malheureusement cette même boucle engendre un "freeze" de la page Web et ce, durant tout le processus.  
J'aimerais trouver un moyen de régler cela.  
Ce même **intervalle** que je créé s'annule au cours du temps. Par exemple après une dixaine de poses, les bots synchronisent.   
Un problème qui s'est avéré un avantage car elle permet de faire une attaque par vague et celui-ci n'engendre aucun bug de requête et de pose sur un même pixel grâce à la variable `wait`.  
Donc, supprimer cette variable pourait être une solution au problème.

### À l'avenir 
Cette partie du projet comporte énormement de défauts car elle ne devait pas être rendue.  
Celle-ci était sur un site à part, sans vraiment d'**interface**.   
Il faudrait donc réaliser une vraie **interface** avec : 


-  une barre d'**outils** adaptée au contexte, avec un bouton marche arrêt.
- un **compteur** de bots à utiliser .
- l'activation de bots **spécifiques** disponibles avec un **nom**, car de nombreuses fois, j'ai dû commenter l'une des lignes de users afin de laisser travailler l'un de mes camarades.
- l'intégration du dispositif de **conversion** d'image avec un `input` d'un fichier jpg directement sur la page.
- le **paramètrage** des intervalles de temps directement sur la page par des `input` de nombre.

Aussi le code actuel a quelques soucis d'**intégration** au projet comme : 
- les `UID` **visibles** en clair.
- le code non prévu pour une **instanciation** (que j'ai donc rajouté à l'arrache)

## Conclusion
Dans l'ensemble je suis plutôt **satisfait** de mon projet. J'ai tenté de faire le code le plus **qualitatif** possible en contre partie j'ai peut être un peut trop négligé la partie **utilisateur**. 
Si le projet était à refaire, je redécouperais `Script` en plusieurs autres fichiers tel que `tableau` , `affichage graphique`.
Petite mention spéciale pour la partie `Bot` que je referais sans doute de zero afin de faire quelque chose de plus **manipulable**.  
En conclusion j'ai aimé apprendre le `JavaScript` grâce à ce projet. Il était vraiment passionant, la compétition de celui qui mettra son image m'a vraiment donné envie de toujours faire plus, au point de faire des bonus non demandés. Il m'a vraiment appris à coder en `JavaScript`, à débugger mes erreurs, à trouver des manières toujours plus simples de faire telle ou telle chose.

# Labbé Clément S2D'