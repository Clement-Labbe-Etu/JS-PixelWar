export  class User {
    "uid";
    "nouvelleEquipe";
    constructor(uid, nouvelleEquipe) {
      this.uid = uid;
      this.nouvelleEquipe = nouvelleEquipe;
    }

    switchUid(uid){
      this.uid = uid;
    };

    switchTeam(team){
      this.nouvelleEquipe = team;
    };

    getTeam(){
      return this.nouvelleEquipe;
    };
    getUid(){
      return this.uid;
    };
} 