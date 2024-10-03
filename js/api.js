export  class API {

    /**
     * Url du serveur pixel
     */
    server;

    /**
     * Constructeur d'une communication avec un serveur passé en parametre
     * @param {string} server 
     */
    constructor(server) {
      this.server = server;
    }
    // All Get Methodes Requests

    /**
     * Cette methode renvoie le tableau de pixel
     * @returns Tableau de pixel
     */
    getTableau = async () => {
        return new Promise((resolve , reject) =>{
            fetch(this.server + '/tableau')
            .then(response => response.json())
            .then(data => {
                
                if(data !== undefined) resolve(data);
                else reject("demande incorrect");
                
            })
            .catch(error => {
                console.error('Erreur lors de la récupération des données :', error);
                reject("demande incorrect " + error);
            });
        });
        
    };

    /**
     * Cette methode renvoie le temps que doit attendre l'utilisateur passés en parametre pour pouvoir reposer un pixel
     * @param {User} user 
     * @returns temps avant prochain pose pixel (ms)
     */
    getTime = async (user) => {
        
        const { uid }= user ;
        return new Promise((resolve , reject) => {
            fetch(this.server + '/temps-attente' +"?uid=" + uid)
            .then(response => response.json())
            .then(data => {
                if(data !== undefined) resolve(data.tempsAttente);
                else reject("demande incorrect");
                
            })
            .catch(error => {
                console.error('Erreur lors de la récupération des données :', error);
                reject("demande incorrect" + error);
            });

        });      
        
    };

    /**
     * Cette Methpde renvoie le numero de l'equipe de l'utilisateur passé en parametre
     * @param {User} user 
     * @returns Numero de l'equipe
     */
    getTeam = async(user) => {
        const {uid:uid} = user;
        return new Promise((resolve , reject) =>{
            fetch(this.server + '/equipe-utilisateur' +"?uid=" + uid)
            .then(response => response.json())
            .then(data => {
                
                if(data !== undefined) resolve(data);
                else reject("demande incorrect");
                
            })
            .catch(error => {
                console.error('Erreur lors de la récupération des données :', error);
                reject("demande incorrect " + error);
            });

        });
        
    }

    /**
     * Cette methode permet de renvoyer la liste des joueurs ayant poser au moins 1 pixel
     * @param {User} user 
     * @returns retourne la liste des joueurs jouant 
     */
    getList = async(user) => {
        const {uid:uid} = user;
        return new Promise((resolve , reject) =>{
            fetch(this.server + '/liste-joueurs' +"?uid=" + uid)
            .then(response => response.json())
            .then(data => {
                
                if(data !== undefined) resolve(data);
                else reject("demande incorrect");
                
            })
            .catch(error => { 
                console.error('Erreur lors de la récupération des données :', error);
                reject("demande incorrect " + error);
            });

        });
        
    }


    // All Put Methodes Requests

    /**
     * Cette methode permet de changer d'equipe l'utilisateur passés en parametre
     * @param {User} user 
     */
    putTeam = async(user) => {
        fetch(this.server + '/choisir-equipe', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            //le données sont associées à la requete
            body: JSON.stringify(user)
        })
        .then(response => {
            //si le serveur a répondu une erreur
            if (!response.ok) {
            return response.json().then(data => {
                throw new Error(`Error` + data.error);
            });
        }
        return response.json();
        })
        .then(data => {
            //si tout s'est bien passé
            console.log('Réponse du serveur:', data.msg);
        })
        .catch(error => {
            console.error('Erreur lors du changement  ', error);
        });
    };

    /**
     * Cette methode permet de poser un pixel.
     * Color passés en parametre comportant la couleur , l'uid du joueur , la ligne et la colonne du pixel
     * @param {Color} color 
     */
    putColor = async(color) => {
        fetch(this.server + '/modifier-case', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            //le données sont associées à la requete
            
            body: JSON.stringify(color)
        })
        .then(response => {
            //si le serveur a répondu une erreur
            if (!response.ok) {
            return response.json().then(data => {
                throw new Error(`Error` + data.error);
            });
        }
        return response.json();
        })
        .then(data => {
            //si tout s'est bien passé
            console.log('Réponse du serveur: ', data.msg);
        })
        .catch(error => {
            console.error('Erreur lors du changement', error);
        });
    };


   // All COOKIES Methodes Requests

    /**
     * Methode permettant de creer un cookie
     * @param {string} name //nom du cookie
     * @param {*} value // sa valeur
     * @param {number} days // son temps de vie
     */
    setCookie = (name , value , days) => {
        const date = new Date();
        date.setDate(date.getDate() + days);
        document.cookie =`${name}=${encodeURIComponent(value)}; expires=${date.toUTCString()};secure; SameSite=Strict`;
    };

    /**
     * Methode ermettant de recuperer un cookie
     * @param {string} name // nom du cookie
     * @returns 
     */
    getCookie = (name)  => {

        const cookies = document.cookie.split("; ");
        const value = cookies.find(c => c.startsWith(name))?.split("=")[1];
        if (value === undefined) return null;
        return decodeURIComponent(value);
    };

    

} 


