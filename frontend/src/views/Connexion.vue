
<!-- Template -->
<template>
  <section>
    <div class="col-md-8 rounded">
      <!--Main message-->
      <img alt="logo groupomania" src="../assets/icon-above-font.png" class="logo">
      <h1>Bienvenue sur Groupomania</h1>
      <h2>Avant toute chose, merci de vous authentifier!</h2>

      <!-- Formulaire -->
      <form  class="login__formulaire col-md-4"
      ref="form"
      model="valid">
        
        <label for="Email">Email: </label><br>
          <input type="email" id="Email" name="Email" required 
            v-model="user.email"
            :rules="emailRules"><br>

        <label for="Nom d'utilisateur">Nom d'utilisateur: </label><br>
          <input type="text" id="Nom d'utilisateur" name="Nom d'utilisateur" required 
            v-model="user.username"
            :rules="usernameRules"><br>

        <label for="Mot de passe">Mot de passe: </label><br>
          <input type="password" id="Mot de passe" name="Mot de passe" required 
            v-model="user.password"
            :rules="passwordRules"><br>

          <!-- -->
          <div class="text-center">
            <input type="button" value="connexion"
              color="success"
              class="mr-4"
              @click="validate_async()">
          </div>

      </form>

    </div>    
  </section>
</template>



<!-- Script -->
<script>
const axios = require('axios');

export default {
    name:"Login",

    data() {
      return {
        user: {
          username: "",
          email:"",
          password: "",
          token: ""
        },

        valid: false,
        multiLine: true,
        ClrSnack:"grey",
        resultMessage:"",
        emailRules: [
          v => !!v || 'E-mail is required',
          v => /.+@.+\..+/.test(v) || 'E-mail must be valid',
        ],
        usernameRules: [
          v => !!v || 'Name is required',
          v => (v && v.length <= 10) || 'Name must be less than 10 characters',
        ],
        passwordRules: [
          v => !!v || 'Name is required',
          v => (v && v.length <= 10) || 'Name must be less than 10 characters',
        ],
      }
    },

    //calculés
  /*  mounted (){
    },*/

    //Methodes
    methods: {

      redirection () {
        setTimeout(function(){
                    document.location.href="/vue"
                }, 3000);
      },

      validate_async () {

        const newUser = {
          username: this.user.username,
          email: this.user.email,
          password: this.user.password
        }

        const sendPostRequest = async () => {
          try {
            const resp = await axios.post('http://localhost:3000/api/connection/login', newUser);
            this.resultMessage=`Vous êtes connecté sous le nom de ${resp.data.username}, ${resp.data.id}, ${resp.data.email}, ${resp.data.role} ${resp.data.token}`
            if (resp.status == 201) { //si connexion réussi
              this.ClrSnack = "success"
            let user= {
                username : resp.data.username,
                id : resp.data.id,
                email : resp.data.email,
                token : resp.data.token,
                role : resp.data.role
            }
            let user_string = JSON.stringify(user);
            sessionStorage.setItem("user", user_string);//on met les données utilisateur en session storage
            setTimeout(function(){ //Time out to go to blackboard
                    document.location.href="/vue"
                }, 3000);
            return {message:`Vous êtes connecté sous le nom de ${resp.data.username}, ${resp.data.id}, ${resp.data.email}, ${resp.data.token}`}
            }
            if (resp.status ==200) {//Requête reussi mais sans connexion
              this.resultMessage= resp.data.err;
            }
            console.log(this.resultMessage);
          }
          catch (err){
            console.log(err);
          }
        }
        sendPostRequest ();

      }
    }
}
</script>



<!-- SCSS -->
<style lang="scss">

.login__formulaire{
    margin: auto;
    &__group{
        display:flex;
        flex-direction:column;
        justify-content:center;
        margin: auto;
        &__label{
            font-weight: 10px;
            margin-bottom: 3px;
        }
        &__input{
            text-align: center;
        }
    }
}


</style>