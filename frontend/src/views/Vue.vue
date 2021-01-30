<template>
    <section>
        <div class="container">
            <!--Affichage des publications-->
            <div class="rounded ma-6">
                <span> {{resultMessage}} <br/> </span> 
                <!-- Itération sur la liste de publications-->
                <div v-for="item in publications" :key="item.idpublication">
                    <!-- Elements de la publication -->
                        <h3 > {{item.title}} </h3>
                        <span>Idpublication {{item.idpublication}} Publié par {{item.username}}</span> <br/>
                        <img :src="item.image"> <br/>
                        <div> {{item.content}} </div>
                    <!-- Bouton de modification de la publication -->
                    <button v-if="item.iduser==iduser || role=='admin'" @click="SupprimerPublication(item.idpublication, item.iduser)"> Supprimer </button>
                    <button v-if="item.iduser==iduser" @click="BoiteModificationPublication = true, IdModificationPublication= item.idpublication, ModificationPublication= item.content, ModificationPublicationTitre=item.title"> Modifier </button>
                    
                    <!-- Espace de modification de la publication -->
                    <div v-if="BoiteModificationPublication == true && IdModificationPublication == item.idpublication">
                        <label>Modifier le titre</label> <br/>
                        <textarea label="Modifier le titre" v-model="ModificationPublicationTitre" required></textarea><br/>
                        <!-- Choix de modification ou non de l'image -->
                        <label>Modifier l'image</label> <br/>
                        <!-- si Oui mais on ne met pas de fichier alors on supprime l'image -->
                        <input type="radio" @click="BoiteModificationImage = true, ModificationPublicationImage = 'Delete'" name="ouinon" value="oui"> <label for="oui"> Oui  </label> <br/>
                        <input type="radio" checked @click="BoiteModificationImage = false, ModificationPublicationImage = ''" name="ouinon" value="non"> <label for="Non"> Non  </label> <br/>
                            <input v-if="BoiteModificationImage == true"
                                ref='file'
                                id="ModificationPublicationImage"
                                name="ModificationPublicationImage"
                                type="file"
                                accept="image/*"><br/>

                        <label>Modifier le texte</label> <br/>
                        <textarea label="Modifier le texte" v-model="ModificationPublication" required></textarea><br/>
                        <div class="card">
                            <!-- On réinitialise les variables après clicker -->
                            <button text @click="OnModifierLaPublication(item.idpublication), BoiteModificationPublication = false, BoiteModificationImage = false, IdModificationPublication = '', ModificationPublication='', ModificationPublicationImage = '', ModificationPublicationTitre=''">Confirmer</button>
                            <button text @click="BoiteModificationPublication = false, BoiteModificationImage = false, IdModificationPublication = '', ModificationPublication='', ModificationPublicationImage = '', ModificationPublicationTitre=''">Annuler</button>
                        </div>
                    </div>  

                    <br/>
                    <!-- Espace pour les commentaires -->
                    <span>commentaires :</span> <br/> <br/>
                    <!-- Itération sur les commentaires dans la publication -->
                    <div v-for="commentaire in item.commentaires" :key="commentaire.idcommentaire"> 
                        <!-- Elements du commentaire -->
                        <span> le {{commentaire.comment_date.substring(0,10)}} à {{commentaire.comment_time}}</span> <br/>
                        <span> {{commentaire.username}}: {{commentaire.text}} </span> <br/>
                        <!-- Bouton pour le commentaire -->
                        <button v-if="commentaire.idusers==iduser || role=='admin'" @click="SupprimerCommentaire(item.idpublication, commentaire.idcommentaire, commentaire.idusers)"> Supprimer </button>
                        <button v-if="commentaire.idusers==iduser" @click="BoiteModificationCommentaire = true, IdModificationCommentaire= commentaire.idcommentaire, ModificationCommentaire= commentaire.text"> Modifier </button>
                        
                        <!-- Espace Modification Commentaire -->
                        <div v-if="BoiteModificationCommentaire == true && IdModificationCommentaire == commentaire.idcommentaire" max-width="600">
                            <textarea label="Ecrivez votre commentaire" v-model="ModificationCommentaire" required></textarea>
                            <div class="card">
                                <button text @click="ModifierLeCommentaire(item.idpublication, commentaire.idcommentaire), BoiteModificationCommentaire = false, IdModificationCommentaire = '', ModificationCommentaire=''">Confirmer</button>
                                <button text @click="BoiteModificationCommentaire = false, IdModificationCommentaire = '', ModificationCommentaire=''">Annuler</button>
                            </div>
                        </div>
                            
                        <br/>
                    </div>
                    
                    <br/>
                    <!--  -->
                    <button
                        @click="BoiteDeCommentaire = true, 
                        IdPublicationCommentée = item.idpublication, 
                        NouveauCommentaire='' "> 
                        Ajouter un commentaire</button>

                    <!-- Espace Commentaire -->
                    <div v-if="BoiteDeCommentaire == true && IdPublicationCommentée == item.idpublication" max-width="600">
                        <div class="card">
                            <div class="card-title headline">Commenter</div>
                            <div class="card-text">
                                <br/>
                                    <textarea label="Ecrivez votre commentaire" v-model="NouveauCommentaire" required></textarea>
                                <br/>
                            </div>
                            <div class="card">
                                <button @click="CommenterLaPublication(item.idpublication)">Confirmer</button>
                                <button @click="BoiteDeCommentaire = false">Annuler</button>
                            </div>
                        </div>
                    </div>
                    <br/> <br/>
                </div>
                {{publicationslength}} <br/>
            </div>
        </div>
    </section>
</template>

<!-- SCRIPT -->
<script>
import Modif from '../models/Modif.model';
const axios = require('axios');
export default {
    data () {
        return {
            LocalUser : sessionStorage.getItem("user"),
            username : "",
            email : "",
            iduser : "",
            role: "",
            token : "",
            resultMessage:"",
            publications:"",
            publicationslength:"",

            BoiteDeCommentaire: false,
            IdPublicationCommentée:"",
            NouveauCommentaire:"",

            BoiteModificationCommentaire: false,
            IdModificationCommentaire:"",
            ModificationCommentaire:"",

            BoiteModificationPublication: false,
            IdModificationPublication:"",
            ModificationPublication:"",
            ModificationPublicationTitre:"",

            BoiteModificationImage:false,
            ModificationPublicationImage:""
            
            
        }
    },

    //calculées
    created () {
        this.getUser();
        this.getAllPublications();

    },

    //Methodes
    methods: {
        getUser (){
            const localUser = JSON.parse(this.LocalUser);
            this.username = localUser.username;
            this.email = localUser.email;
            this.iduser = `${localUser.id}`;
            this.role = localUser.role;
            this.token = localUser.token
        },

        getAllPublications () {
            const sendGetRequest = async () => {
                try {
                    const resp = await axios({
                        method: 'get',
                        url:`http://localhost:3000/api/publications/`,
                        headers:{'authorization':`${this.token}`},
                    })
                    if (resp.status == 201) {
                        sessionStorage.removeItem("publications");
                        sessionStorage.setItem("publications",JSON.stringify(resp.data.AllCommentsGET));
                        this.publications= resp.data.AllCommentsGET;
                        this.publicationslength= this.publications.length;
                    }
                    else {
                        this.resultMessage=`Un problème est survenu, merci de réessayer ultérieurement.`;
                    }
                }
                catch (err){
                    this.resultMessage=`Un problème est survenu, merci de réessayer ultérieurement.`;
                    console.log(err);
                }
            }
            sendGetRequest();
        },

//On verra si on veut faire une redirection vers une page dédiée à la publication
    /*    Publication(idpublication) {
            sessionStorage.removeItem("publication");
            sessionStorage.setItem("publication",idpublication);
            document.location.href="/publication"
        }, */

        CommenterLaPublication(idpublication) {
            let date = new Date();
            const sendPostRequest = async () => {
                try {
                    const resp = await axios({
                        method: 'post',
                        url:`http://localhost:3000/api/publications/${idpublication}/comments`,
                        headers:{'authorization':`${this.token}`},
                        data: {
                            "date": `${date.getFullYear()}-${date.getMonth()+1}-${date.getDate()}`,
                            "time": `${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`,
                            "idUsername": this.iduser,
                            "username": this.username,
                            "idComment": this.NouveauCommentaire
                        }
                    })
                    if (resp.status == 201) {
                        this.resultMessage=`Commentaire ajouté avec succès !`;
                        this.BoiteDeCommentaire= false;
                    }else {
                        this.resultMessage="Un problème est survenu, le commentaire n'a pas pu être ajouté.";
                    }
                }
                catch (err){
                    this.resultMessage="Un problème est survenu, le commentaire n'a pas pu être ajouté.";
                    console.log(err);
                }
            }
            sendPostRequest();
            this.getAllPublications();
        },

        SupprimerCommentaire(idpublication, idcommentaire, idusers) {
            const sendDeleteRequest = async () => {
                try {
                    const resp = await axios({
                        method: 'delete',
                        url:`http://localhost:3000/api/publications/${idpublication}/comments/${idcommentaire}`,
                        headers:{'authorization':`${this.token}`},
                        data:{
                            "iduser": `${idusers}`
                        }
                    })
                    if (resp.status == 201) {
                    this.resultMessage=`Commentaire supprimé avec succès !`;
                    }else {
                        this.resultMessage="Un problème est survenu, le commentaire n'a pas pu être supprimé.";
                    }
                }
                catch (err){
                    this.resultMessage="Un problème est survenu, le commentaire n'a pas pu être supprimé.";
                    console.log(err);
                }
            }
            sendDeleteRequest();
            this.getAllPublications();
        },

        ModifierLeCommentaire(idpublication, idcommentaire) {
            const sendPutRequest = async () => {
                try {
                    const resp = await axios({
                        method: 'put',
                        url:`http://localhost:3000/api/publications/${idpublication}/comments/${idcommentaire}`,
                        headers:{'authorization':`${this.token}`},
                        data:{
                            "Nouveautext": this.ModificationCommentaire,
                            "iduser": this.iduser
                        }
                    })
                    if (resp.status == 201) {
                    this.resultMessage=`Commentaire modifié avec succès !`;
                    }else {
                        this.resultMessage="Un problème est survenu, le commentaire n'a pas pu être modifié.";
                    }
                }
                catch (err){
                    this.resultMessage="Un problème est survenu, le commentaire n'a pas pu être modifié.";
                    console.log(err);
                }
            }
            sendPutRequest();
            this.getAllPublications();
        },

        SupprimerPublication(idpublication, iduser) {
            const sendDeleteRequest = async () => {
                try {
                    const resp = await axios({
                        method: 'delete',
                        url:`http://localhost:3000/api/publications/${idpublication}`,
                        headers:{'authorization':`${this.token}`},
                        data:{
                            "iduser": `${iduser}`
                        }
                    })
                    if (resp.status == 201) {
                    this.resultMessage=`Publication supprimée avec succès !`;
                    }else {
                        this.resultMessage="Un problème est survenu, la publication n'a pas pu être supprimée.";
                    }
                }
                catch (err){
                    this.resultMessage="Un problème est survenu, la publication n'a pas pu être supprimée.";
                    console.log(err);
                }
            }
            sendDeleteRequest();
            this.getAllPublications();
        },

        OnModifierLaPublication(idpublication) {
            if(this.ModificationPublication !== "" && this.ModificationPublicationTitre !== "") {
                const modif = new Modif();
                modif.iduser= this.iduser;
                modif.Nouveautitle= this.ModificationPublicationTitre;
                modif.Nouveautext= this.ModificationPublication;
                if (this.BoiteModificationImage) {
                    //modification de l'image
                    var modifFile = document.querySelector('#ModificationPublicationImage').files[0];
                    if (typeof(modifFile) !== 'undefined') {
                        console.log(modifFile)
                    } else {
                        modifFile = 'delete';
                        console.log(modifFile);
                    }
                    this.ModifierAvecImage(idpublication, modif, modifFile);
                    this.BoiteModificationImage = false;
                    this.getAllPublications();
                } else {
                    //modification sans changer l'image
                    this.ModifierSansImage(idpublication, modif);
                    this.getAllPublications();
                }
            } else {
                this.resultMessage="La publication doit contenir un titre et du texte !"
            }
        },

        ModifierAvecImage(idpublication, modif, modifFile) {
            return new Promise((resolve, reject) => {
                const thingData = new FormData();
                thingData.append('modif', JSON.stringify(modif));
                thingData.append('image', modifFile);
                try {
                    axios.put(`http://localhost:3000/api/publications/${idpublication}`, thingData, {headers:{'authorization':`${this.token}`}})
                    resolve(console.log("requête envoyée avec succès"));
                }
                catch (err){
                    reject(console.log("erreur lors du requetage"));
                }
                /*
                return new Promise(resolve => {
                    try {
                    axios.put(`http://localhost:3000/api/publications/${idpublication}`, thingData, {headers:{'authorization':`${this.token}`}}).subscribe(
                        (response) => {
                            resolve(response);
                        },
                        (error) => {
                            reject(error);
                        }
                    );
                }
                catch (err){
                    console.log(err);
                }
                })*/
            });

        },

        ModifierSansImage(idpublication, modif) {
            return new Promise((resolve, reject) => {
                const thingData = new FormData();
                thingData.append('modif', JSON.stringify(modif));
                thingData.append('image', '');
                try {
                    axios.put(`http://localhost:3000/api/publications/${idpublication}`, thingData, {headers:{'authorization':`${this.token}`}});
                    resolve(console.log("requête envoyée avec succès"))
                }
                catch (err){
                    reject(console.log("requête envoyée avec succès"))
                }
                /*
                return new Promise(resolve => {
                    try {
                    axios.put(`http://localhost:3000/api/publications/${idpublication}`, thingData, {headers:{'authorization':`${this.token}`}}).subscribe(
                        (response) => {
                            resolve(response);
                        },
                        (error) => {
                            reject(error);
                        }
                    );
                }
                catch (err){
                    console.log(err);
                }
                })*/
            });
        },
    },
}
</script>


<!-- STYLE -->
<style>

</style>