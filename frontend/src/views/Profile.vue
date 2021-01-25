<template>
    <div>
        <div class="container" align="center" justify="center">
            <div cols="10" md="6" class="elevation-10 rounded">

                <!--Profil-->
                <span>Vous êtes connectés sous le nom de {{username}} et l'email {{email}}</span>
                <br/>
                <div cols="8" md="10">
                <!-- Suppression du compte-->
                    <input
                        type="button"
                        value="Supprimer le compte"
                        class="mr-4"
                        @click="BoiteSuppression= true">
                </div>

                <!--Message en cas de suppression-->
                <div v-if="BoiteSuppression == true" max-width="350">
                    <div>
                        <div>Suppression du compte</div>
                        <div>Voulez-vous définitivement supprimer votre compte ?</div>
                        <div>
                            <input type="button" value="Oui" @click="SuppressionUtilisateur()">
                            <input type="button" Value="Non" @click="BoiteSuppression = false">
                        </div>
                    </div>
                </div>


                <!-- Formulaire -->
                <form ref="form">
                    <label for="Email">Email:</label>
                    <input
                        type="email"
                        id="Email"
                        name="Email"
                        v-model="emailNew">
                    <br>
                    <label for="NomUtilisateur">Nom d'utilisateur:</label>
                    <input
                        type="text"
                        id="NomUtilisateur"
                        name="NomUtilisateur"
                        v-model="usernameNew">
                    <br>
                    <label for="MotDePasseActuel">Mot de passe actuel:</label>
                    <input
                        type="password"
                        id="MotDePasseActuel"
                        name="MotDePasseActuel"
                        v-model="password">
                    <br>
                    <!-- Pour changer le mot de passe -->
                    <label for="CheckboxPassword">Changer le mot de passe:</label>
                    <input
                        type="password"
                        v-if="changePsw ==true"
                        v-model="passwordNew"
                        label="Nouveau mot de passe">
                    <input 
                        type="checkbox"
                        v-model="changePsw">
                </form>
                <!-- Submit -->
                <input
                    type="button"
                    value="Valider"
                    class="mr-4"
                    @click="UpdateUser(),MessageUpdate = true">
                    
               <div v-if="MessageUpdate == true"
                      :timeout="4000"
                    >
                    <template>
                        <span> {{resultMessage}} <br/> </span> 
                        <span v-if="PseudoModifie == true">Nom d'utilisateur mis à jour<br/></span>
                        <span v-if="EmailModifie == true">Email mis à jour<br/></span>
                        <span v-if="PasswordModifie == true">Mot de passe mis à jour</span>
                    </template>

                </div>
            </div>
        </div>
    </div>
</template>



<!--SCRIPT-->
<script>
const axios = require('axios');
export default {
    name: "Profile",
    data () {
        return {
            LocalUser : sessionStorage.getItem("user"),
            username : "",
            usernameNew: "",
            email : "",
            emailNew: "",
            iduser : "",
            token : "",
            resultMessage:"",
            password:"",
            passwordNew:"",
            changePsw:false,
            MessageUpdate:false,
            resStatus:"",

            PseudoModifie:false,
            EmailModifie:false,
            PasswordModifie:false,

            BoiteSuppression: false,
        }
    },

    created () {
        this.getUser();
    },

    methods: {
        getUser (){
            const localUser = JSON.parse(this.LocalUser);
            this.username = localUser.username;
            this.email = localUser.email;
            this.iduser = `${localUser.id}`;
            this.token = localUser.token
        },

        SuppressionUtilisateur () {
            const sendPostRequest = async () => {
            try {
                const resp = await axios({
                    method: 'delete',
                    url:`http://localhost:3000/api/users/${this.iduser}`,
                    headers:{'authorization':`${this.token}`},
                    data: {
                        password: this.password,
                    }
                })
                if (resp.status == 201) {
                    this.resultMessage=`Utilisateur supprimé avec succès !`;
                    this.BoiteSuppression= false; 
                    setTimeout(function(){
                    document.location.href="/deconnexion"
                }, 3000);
                }else {
                    this.resultMessage="Un problème est survenu, merci de réessayer ultérieurement.";
                }
            }
            catch (err){
                this.resultMessage="Un problème est survenu, merci de réessayer ultérieurement.";
                console.log(err);
            }
        }
        sendPostRequest ();
        this.snackbar = true;
        },

        UpdateUser () {
            let awaitGetUserInfo;
            let awaitUpdateUserInfo;

            const GetUserInfo = async () => {
                return new Promise(resolve => {
                    try {
                        axios({
                          method: 'get',
                          url:`http://localhost:3000/api/users/${this.iduser}`,
                          params:{
                            id: this.iduser,
                          }
                        }).then(function(resp){
                            resolve(resp.data)
                        })
                    }
                    catch (err){
                        console.log(err)
                    }
                })
            }

            const UpdateUserInfo = async ()=> {
                return new Promise(resolve => {
                    try{
                        axios({
                            method: 'put',
                            url:`http://localhost:3000/api/users/${this.iduser}`,
                            headers:{
                                'authorization':`${this.token}`
                            },
                            data:{
                                username: this.username,
                                usernameNew: this.usernameNew,
                                email: this.email,
                                emailNew: this.emailNew,
                                password: this.password,
                                passwordNew: this.passwordNew,
                              }
                            })
                        .then (function(response) {
                            if (response.status==201){
                                sessionStorage.setItem("resStatus","201")
                                sessionStorage.setItem("resultMessage","Données mises à jours avec succès !")
                                resolve({message:"Utilisateur mis à jour"}) 
                            }
                            else if (response.status == 202){
                                sessionStorage.setItem("resStatus","201")
                                sessionStorage.setItem("resultMessage","Mot de passe érroné, impossible de modifier les données ")
                                resolve({message:"Mot de passe érroné, impossible de modifier les données"}) 
                            }
                            else{
                                sessionStorage.setItem("resStatus","202")
                                sessionStorage.setItem("resultMessage",`Les données utilisateurs n'ont pas pu être mise à jours. ${response.data.message}`)
                                resolve({message:`Les données utilisateurs n'ont pas pu être mise à jours. ${response.data.message}`}) 
                            }
                        })
                        .catch(function(error) {
                        console.log(error);
                        })
                    }
                    catch (err){
                            console.log(err)
                        }
                    })
            };

            const PreparationUpdateUser = async function(){
                awaitGetUserInfo = await GetUserInfo ();
                console.log(awaitGetUserInfo);
                awaitUpdateUserInfo = await UpdateUserInfo (); 
                return awaitUpdateUserInfo;
            }

            //Verification que quelque chose a bien été modifié 
            if (this.username !== this.usernameNew ||this.email !== this.emailNew || ( this.passwordNew !== "" && this.passwordNew !== this.password)){
                PreparationUpdateUser().then(()=> {
                    this.resStatus=sessionStorage.getItem("resStatus")
                    this.resultMessage=sessionStorage.getItem("resultMessage");
                    if (this.resStatus == 201){
                        if(this.username !== this.usernameNew){
                            this.PseudoModifie = true;
                            console.log("Nom d'utilisateur modifié avec succès");
                            this.username = this.usernameNew;
                        }
                        if(this.email !== this.emailNew){
                            this.EmailModifie = true;
                            console.log("Email modifié avec succès");
                            this.email = this.emailNew;
                        }
                        if( this.passwordNew !== "" && this.passwordNew !== this.password){
                            this.PasswordModifie = true;
                            console.log("Mot de passe modifié avec succès");
                            this.password = this.passwordNew;
                            this.passwordNew = "";
                        }
                        let user= {
                            username : this.username,
                            id : this.iduser,
                            email : this.email,
                            token : this.token
                        }
                        let user_string = JSON.stringify(user);
                        sessionStorage.setItem("user", user_string);
                        this.PreparationConnexion();
                    } else {
                        console.log("Une erreur est survenue lors de la demande de modification des données");
                    }
                })
            }else{
                console.log("Les données n'ont pas pu être modifiées")
            }
        },

        PreparationConnexion () {
        const sendPostRequest = async () => {
            try {
                const resp = await axios ({
                    method: 'post',
                    url:'http://localhost:3000/api/connection/login', 
                    data:{
                        "username":`${this.username}`,
                        "email":`${this.email}`,
                        "password":`${this.password}`,
                    }
                });
                if (resp.status == 201) {
                    console.log(`Vous êtes connecté sous le nom de ${this.username} et l'email ${this.email}`);
                    let user= {
                        username : resp.data.username,
                        id : resp.data.id,
                        email : resp.data.email,
                        token : resp.data.token
                    }
                    let user_string = JSON.stringify(user);
                    sessionStorage.setItem("user", user_string);
                }
                if (resp.status ==200) {
                this.resultMessage= resp.data.err;
                }
            }
            catch (err){
                console.log(err);
            }
        }
        sendPostRequest ();
        this.getUser ();
        setTimeout(function(){
            document.location.href="/profile"
            }, 3000);
        }
    }
};

</script>
<style>
</style>