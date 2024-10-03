import { User } from './User.js';
import { API } from './api.js';
import { Color } from './Color.js';
import { bot } from './bot.js';

import {server} from '../env.js';
import {uid} from '../env.js';
import {request_model} from '../env.js';

/**
 * Methode d'initialisation de la page
 */
const init = () => {
    document.getElementById("user").value = uid;
    affichageTime.childNodes.forEach((child) => {
        affichageTime.removeChild(child);
    });
    affichageTime.append("0s");
    AfficheDecoration();

}





//Definition des variables HTML
const affichageImage = document.getElementById('image');
const affichageInfoJoueurs = document.getElementById('playersList');
const affichageCommunication = document.getElementById('debug');
const tableau = document.getElementById('tableau');
const affichageTime = document.getElementById('time');

//Creation des objets User et Communication
let user = new User("0",0);
const api = new API(server);

//Creation des variables retournés par le serveurs srvXXX
let actualTeam = 0;

//Creation des variables de controle de temps
let TimeControlPose = 0;
let TimeControlChange = 0;

// Creation de la variable de controle de l'initialisation
let initialised = false;

let botMode = false;

const bots = new bot();



/**
 * Methode D'INITIALISATION DE LA PAGE on load
 */
window.addEventListener("load" , async() => {
    const Last_uid = api.getCookie("Last_uid");
    const Last_team = api.getCookie("Last_team");
    if (Last_uid !== null){
        document.getElementById("user").value = Last_uid;
    }
    if (Last_team !== null){
        document.getElementById(`button_putTeam${Last_team}`).checked = true;
        actualTeam = Last_team;
    }
    reloadUser();
    await createTableau();
    if(userIsCorrect()){
        AfficheJoueurs();
    }
    init();
    initialised = true;
});

// Mehtode permettants d'afficher l'image de decoration dans la zone d'info a partir d'un json 

/**
 * mmethode qui retourne le tableau de pixel de la decoration
 * @returns tableau de pixel
 */
const getDecoration = (async() =>{
    try{
      let model = await getDecorationFromComputer();
      return model;
    } catch {
      console.log("erreur Model non aquis");
    }
  });
  
  
  /**
   * Methode qui recupere le tableau e pixel dans un fichier json local
   * @returns tableau de pixel
   */
  const getDecorationFromComputer = ( async() =>{
    return new Promise((resolve , reject) =>{
      fetch(request_model)
        .then((response) => response.json())
        .then((data) => {
          resolve(data);
        })
        .catch(error => {
          reject(error);
        });
    });
  });
  
  /**
   * Methode affichant la decoration dans la zone d'info
   */
  const AfficheDecoration = (async() =>{
    let model = await getDecoration();
    if(model){
        model.forEach((row)=>{
            const ligne = document.createElement("tr");
            affichageImage.appendChild(ligne);
            row.forEach((col)=>{
                const pixel = document.createElement("td");
                pixel.style.backgroundColor = col;
                ligne.appendChild(pixel);

            });
        });
    }
  });


//Definition des methode modifiant les variables renvoyé par l'api
/**
 * Retourne le tableau de pixel par une demande a l'API
 * @returns tableau de pixel
 */
let getTableauFromAPI = async() =>{
    try{
        let srvTableau = await api.getTableau();
        return srvTableau;
        
    } catch(error){
        printReport(`Impossiblilite d'obtenir le tableau de pixel depuis l'API : ${error}`);
    }
};

/**
 * Retourne le Time qu'il reste avant la pose d'un pixel grace a une demande a l'API
 * @returns temps en ms
 */
let getTimeFromAPI = async() =>{
    try{
        let srvTime = await api.getTime(user);
        return srvTime;
        
    } catch(error){
        printReport(`Impossiblilite d'obtenir le temps avant la prochaine pose depuis l'API : ${error}`);
    }
};

/**
 * Retourne l'equipe de l'utilisateur grace a une demande a l'API
 * @returns numero de l'equipe
 */
let getTeamFromAPI = async() => {
    try{
        let srvTeam = await api.getTeam(user);
        return srvTeam;
    } catch (error){
        printReport(`Impossiblilite d'obtenir le numero de l'equipe depuis l'API : ${error}`);
    }
};

/**
 * methode retournant les liste des joueurs actif grace a une demande a l'API
 * @returns objet contenant les informations des joueurs (nom , equipe , lastModificationPixel , banned , nbPixelsModifies)
 */
let getListFromAPI = async() =>{
    try{
        let srvList = await api.getList(user);
        return srvList;
    } catch(error){
        printReport(`Impossiblilite d'obtenir la liste des joueurs depuis l'API : ${error}`);
    }
};


/**
 * Methode changeant l'equipe de l'utilisateur en fonction de l'input HTML
 */
document.querySelectorAll("input[type=radio]").forEach((radio) => {
    radio.addEventListener('click', async() => {
        actualTeam = radio.value;
        reloadUser(true);
        const {uid:uid , nouvelleEquipe:team} = user;
        api.setCookie("Last_uid", uid , 7);
        api.setCookie("Last_team", team , 7);
    });
});

document.getElementById("darkmode").addEventListener('click', async() => {
    document.body.classList.toggle("dark-mode");
    if(document.body.classList.contains("dark-mode")){
        document.getElementById("darkmode").src = "../img/sun.png";
    } else {
        document.getElementById("darkmode").src = "../img/moon.png";
    }
});

document.getElementById("BOT").addEventListener("change", function() {
    if(this.checked){
        botMode = true;
        document.getElementById("tools").style.display = "none";
        bots.InitialiseBots();


    } else {
        botMode = false;
        document.getElementById("tools").style.display = "flex";
        bots.StopBots();
    }
    
});




//Creation d'un tableau d'affichage HTML a partir de la variable srvTableau
/**
 * Methode creant un tableau HTML a partir de la variable srvTableau
 */
const createTableau = async() =>{
    let srvTableau = await getTableauFromAPI();
    if(srvTableau === undefined) return;
    srvTableau.forEach((row, y) => {
        const ligne = document.createElement("tr");
        ligne.id = `L${y}`;
        tableau.appendChild(ligne);
        row.forEach((col, x) => {
            const pixel = document.createElement("td");
            pixel.id =  `P${y}_${x}`;
            pixel.style.backgroundColor = col;
            ligne.appendChild(pixel);
            AddCliquablePixel(pixel , x , y);
        });
    });
};



/**
 * Methode relocorant le tableau HTML
 */
const ColorTable = async() =>{
    if(initialised) {
        let srvTableau = await getTableauFromAPI();
        srvTableau.forEach((row, y) => {
            row.forEach((col, x) => {
                const pixel = document.getElementById(`P${y}_${x}`);
                if(pixel && pixel.style.backgroundColor !== col){
                    pixel.style.backgroundColor = col;
                }
                
            });
        });
    }
    
};
    

/**
 * Methode redefinissant l'equipe et l'uid de l'user si cela est necessaire
 * @param {boolean} report // si vrai affiche un message de confirmation
 */
const reloadUser = async(report = false) =>{
    let switchT = false;
    const { uid:uid , nouvelleEquipe:team  }= user;
    const newUid = document.getElementById("user").value;
    const newTeam = actualTeam;
    if(actualTeam !== 0){
        if(newTeam !== team) user.nouvelleEquipe = newTeam, switchT = true;
        if(newUid !== uid)user.uid = newUid, switchT = true;
        if(!switchT){
            const actualTeam = await getTeamFromAPI()
            if (actualTeam && newTeam!== actualTeam) user.nouvelleEquipe = newTeam, switchT = true;
        }

        if(switchT){
            putTeam(report);
        }
    }
    
    
};

/**
 * Methode affichange dans la zone de dubbug report un message
 * @param {string} msg  // messsage a afficher
 */
const printReport = (msg) =>{
    affichageCommunication.childNodes.forEach((child) => {
        affichageCommunication.removeChild(child);
    });
    affichageCommunication.append(msg);
    
};

/**
 * Methode rendant cliquable les cases du tableau a sa creation
 * @param {node} pixel case d'un tableau html
 * @param {number} x position en x du tableau
 * @param {number} y position en y du tyableau
 */
const AddCliquablePixel = async(pixel , x , y) =>{
    pixel.addEventListener('click', () => {
        if(!userIsCorrect()) return;
        setTimeout(()=>{
            changeColor(x , y);
        },100)

    });
    
};


/**
 * Methode modifiant la couleur d'une case du tableau en prenant la couleur select par l'user
 * @param {number} x position en x du tableau
 * @param {number} y position en y du tableau
 */
const changeColor = async(x , y) =>{
    if(Date.now() - 15025 > TimeControlPose){
        let couleur = document.getElementById("couleur").value;
        const color = new Color(couleur , user.uid , x , y);
        try {api.putColor(color);}
        catch{ printReport("Erreur Change Color : Couleur Inchangé");}
        TimeControlPose = Date.now();
        AfficheTime();
    } else {
        let remain = (TimeControlPose-(Date.now()-15000))/1000;
        printReport(`Attendez Svp : ${remain} s` );
    }
    
};

/**
 * Methode changeant l'uid et la team de l'utilisateurr selon les input HTML
 * @param {boolean} report // si vrai affiche un message de confirmation
 */
const putTeam = async(report = false) =>{
    if(Date.now() - 10000 > TimeControlChange){
        api.putTeam(user);
        TimeControlChange = Date.now();
        if(report){
            printReport("Changement d'equipe Effectué avec succes");
        }
        
    } else {
        if(report){
            printReport("Erreur : Attendez 10s avant changement d'equipe");
        }
        
    }
    
};

/**
 * Methode verifiant si l'utilisateur est correct et tente de le reload
 * @returns boolean vrai si l'utilisateur est correct faux sinon
 */
const userIsCorrect = (()=> {
    const {uid:uid , nouvelleEquipe:team} = user;
    if(Date.now() - 15000 > TimeControlChange && !botMode ) reloadUser();
    if(uid.length !== 8) return false;
    if(team >4 || team <1) return false;
    return true;
});

/**
 * Methode affichant le temps restant avant le prochain changement de couleur
 */
const AfficheTime = ( async() => {
    const gauge = document.getElementById("gauge");
    gauge.style.display = "block";
    while(TimeControlPose-(Date.now()-15000) > -5){
        if(userIsCorrect()){
            let srvTime = await getTimeFromAPI();
            const t = document.createElement("p");
            t.append(srvTime/1000 + "s");
            affichageTime.childNodes.forEach((child) => {
                affichageTime.removeChild(child);
            });
            affichageTime.append(t);
            gauge.style.width = `${(srvTime/15000)*100}%`;
        }
    } 
    gauge.style.display = "none";
    affichageTime.childNodes.forEach((child) => {
        affichageTime.removeChild(child);
    });
    affichageTime.append("0s");
    
    
});

/**
 * Methode affichange les Joueurs entain de jouer et leur statistiques
 */
const AfficheJoueurs = ( async() => {
    if(!userIsCorrect()) return;
    let srvList = await getListFromAPI();
    let stop = false;
    while (affichageInfoJoueurs.lastChild && !stop) {
        if(affichageInfoJoueurs.lastChild && affichageInfoJoueurs.lastChild.tagName !== "TBODY"){
            affichageInfoJoueurs.removeChild(affichageInfoJoueurs.lastChild);
        } else {
            stop = true;
        }
    }
    srvList.forEach((joueur) => {
        const Ligne = document.createElement("tr");
        const Nom = document.createElement("td");
        const Equipe = document.createElement("td");
        const LastModif = document.createElement("td");
        const Banned = document.createElement("td");
        const nbPixel = document.createElement("td");

        Nom.append(joueur.nom);
        Equipe.append(joueur.equipe);

        let dateAndTime = joueur.lastModificationPixel.split("T")[1].split(".")[0].split(":");
        const time = dateAndTime[0] + ":" + dateAndTime[1];


        LastModif.append(`${time}`);

        if(joueur.banned){
            Banned.style.backgroundColor = "red";
        } else {
            Banned.style.backgroundColor = "green";
        }
        nbPixel.append(joueur.nbPixelsModifies);
        Ligne.appendChild(Nom);
        Ligne.appendChild(Equipe);
        Ligne.appendChild(LastModif);
        Ligne.appendChild(Banned);
        Ligne.appendChild(nbPixel);
        affichageInfoJoueurs.appendChild(Ligne);

    });
      
    
});


// Parties Boucles 


setInterval(ColorTable,200);
setInterval(AfficheJoueurs,1000);

//Boucle de pose des pixels
setInterval(bot.Bots,50);




