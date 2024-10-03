import { User } from './User.js';
import { API } from './api.js';
import { Color } from './Color.js';
import {server} from '../env.js';
import {request_model} from '../env.js';

const Comm = new API(server);

// Listes des utilisateurs et de leurs uid (je sais c'est en clair c'est pas cool)
let users = [
  {user:new User("9b6a7c5d",2),date:Date.now(),lastReload:0}, // MOI
  {user:new User("9b5f1e7a",2),date:0,lastReload:0}, // Hugoat
  {user:new User("7e3c9f1b",2),date:0,lastReload:0}, //
  {user:new User("8d4c2a6b",2),date:0,lastReload:0}, //
  {user:new User("f2b9e6d1",2),date:0,lastReload:0}, //
  {user:new User("6d7c9a4b",2),date:0,lastReload:0}, //
  {user:new User("2b7f6d9c",2),date:0,lastReload:0}, //
  {user:new User("f9e3a7d5",2),date:0,lastReload:0}, //
  {user:new User("7f8b2a6c",2),date:0,lastReload:0}, // Loan
  {user:new User("9c8b4a6d",2),date:0,lastReload:0}, // maxence
  {user:new User("d3e9f7a5",2),date:0,lastReload:0}, //
  {user:new User("7e3f1b6d",2),date:0,lastReload:0}, // Faustin
  {user:new User("1f5c8d9e",2),date:0,lastReload:0}, // ??
  {user:new User("f9e3a7d5",2),date:0,lastReload:0}, // 4h29mld
  {user:new User("8f22o1rp",2),date:0,lastReload:0}, // test2
  {user:new User("9d4c6f1a",2),date:0,lastReload:0}, //
  {user:new User("6c4d9e8f",2),date:0,lastReload:0}, // francisco
  {user:new User("4b1e6f9c",2),date:0,lastReload:0}, // Yohan
  {user:new User("3f9a7d4c",2),date:0,lastReload:0}, // mathis
  {user:new User("d8c3a6f4",2),date:0,lastReload:0} // Nathan richoux
];

  // Defini l'intervalle de temps (ms) entre chaque pose de pixel pour chaque bots
  const InetrvallePose = 15050;
  // Defini l'intervalle de temps (ms) entre chaque initialisation de bots et donc entre leurs poses
  const IntervalleBots = 700;

  // Variable qui permet de savoir si les bots sont initialisés
  let initialised = false;

  // Variable qui permet de savoir si un bot est en attente de pose
  let wait = false;

// rajouté uniquement pour pouvoir etre lancé depuis le script c'est pas tres beau je sais
export class bot{ 

   InitialiseBots = (() =>{
    let i = 0;
    while(i< users.length){
      let bot = users[i];
      if(bot.date === 0){
        if(Date.now() - IntervalleBots > users[i-1].date){
          bot.date = Date.now();
          users[i] = bot;
          console.log(bot.user.uid + "Initialised");
          reloadBot(bot);
        }
      } else {
        i += 1;
      }
      
    }
    if(users[users.length-1].date !== 0){
      console.log("Initalised is ok");
      initialised = true;;
    } 
    
  });

  StopBots = (() =>{
    initialised = false;
  });
  
}


/////////////////////////////////////////////////////////////////////
//                          TABLEAU                                //
/////////////////////////////////////////////////////////////////////



//Creation des variables retournés par le serveurs srvXXX

/**
 * Recupere le tableau de pixel depuis l'api
 * @returns tableau de pixel
 */
const getTableau = ( async() =>{
  try{
    let tableau = await Comm.getTableau();
    return tableau;
  } catch (error){
    console.log("erreur : Tableau non aquis");
  }
});





/**
 * methode qui retourne le tableau de pixel servant de model aux bots
 * @returns tableau de pixel
 */
const getModel = (async() =>{
  try{
    let model = await getModelFromComputer();
    return model;
  } catch {
    console.log("erreur Model non aquis");
  }
});


/**
 * Methode qui recupere le tableau de pixel model dans un fichier json local
 * @returns tableau de pixel
 */
const getModelFromComputer = ( async() =>{
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



//COMPARE 

/**
 * Methode qui compare le tableau de pixel model et le tableau de pixel actuel et renvoie la couleur et la position du pixel sur le quel poser
 * @returns {Color} couleur et position du pixel sur le quel poser 
 */
const comparerModelTableau = (async() =>{
  let couleur = null;

  let model = await getModel();
  let tableau = await getTableau();
    
  if(model && tableau){
    let pose = false;
    let i = model.length -1;
    let j = 0;
      
    while(!pose && i >=0){
    j=model[i].length-1;
      while(!pose && j >= 0){
        if(model[i][j] !== tableau[i][j]){
            couleur = new Color(model[i][j] , "" , j , i);
            console.log(i + " " + j + " tabl : " + tableau[i][j] + " model : " + model[i][j]);
            pose = true;
        }
          j -= 1;
      }
      i -= 1;
    }
  }
  wait=false;
  return couleur;
});

/////////////////////////////////////////////////////////////////////
//                             BOT                                 //
/////////////////////////////////////////////////////////////////////



/**
 * Methode appellant la pose de pixel pour chaque bots
 */
const Bots = (() =>{
  if(initialised){
    users.forEach(function(bot,i){
      poseBot(bot,i);
    });
  }
  
});

/**
 * Methode qui pose un pixel pour un bot
 * @param {User} bot uid et numeros d'equipe du bot 
 * @param {number} i index du bot dans la liste des bots
 */
const poseBot = (async(bot,i) => {
  const {user:user,date:date,lastReload:lastReload} = bot;
  if(Date.now() - InetrvallePose > date && !wait){ // Verification si le bot est pret a poser un pixel (Intervalle de pose)
    if(botIsCorrect(bot,i)){
      wait=true // Met en attente les autres bots
      let pixel = await comparerModelTableau();
      if(pixel !== null){
        pixel.uid = user.uid ;// Remplace l'uid du pixel renvoyé par la comparaison par celui du bot posant 
        try{
          Comm.putColor(pixel);
          users[i] = {user:user,date:Date.now(),lastReload:lastReload};
          console.log("POSE " + user.uid + " | poseBot");
        } catch { console.log("Erreur Imossible de putColor | poseBot_Error");}
      }
    }
    
  }
});

/**
 * Methode qui verifie que le bot est correctement configuré et le reconfigure si besoin
 * @param {User} bot 
 * @param {number} i 
 * @returns 
 */
const botIsCorrect = (async(bot,i)=>   {
  const {user:user} = bot;
  const {uid:uid , nouvelleEquipe:team} = user;
  if(uid.length !== 8) return false;
  if(team >4 || team <1) return false;
  reloadBot(bot,i);

  return true;
});

/**
 * Recharge l'equipe d'un bot en verifiant si cela fait plus de 15s que le bot a été rechargé
 * @param {User} bot 
 * @param {number} i 
 */
const reloadBot = ((bot,i)=>{
  if(Date.now() - 15000 > bot.lastReload){
    try{
      Comm.putTeam(bot.user);
      bot.lastReload = Date.now();
      users[i] = bot;
    } catch {
      console.log("reload Impossible");
    }
    
  } else {
      console.log("Erreur : Attendez 10s avant changement d'equipe | reloadBot_Error");
  }

});

//Boucle de pose des pixels
setInterval(Bots,50);


    



    
