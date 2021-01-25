<!-- Template -->
<template >
  <section>
    <div class="col-md-8 rounded">
          
      <!--Main message-->
        <img alt="logo groupomania" src="../assets/icon-above-font.png" class="logo">
        <h1>Bienvenue sur Groupomania</h1>
        <h2>Créer un compte si ce n'es pas déjà fait !</h2>
        
        <!--Formulaire-->
        <form  class="signup__form col-md-4" id="signup__form"
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
            <input type="button" value="inscription"
              color="success"
              class="mr-4"
              @click="validate_signup()">

          </div>
        </form>
    </div>
  </section>
</template>

<!-- Script -->
<script>
const axios = require('axios');
export default {
    name:"Inscription",
    //Data
    data() {
      return {
      user: {
        username: '',
        email:'',
        password:''},

      valid: false,
      resultMessage:"",
      text: "",
      lazy:false,
      emailRules: [
        v => !!v || 'E-mail is required',
        v => /.+@.+\..+/.test(v) || 'E-mail must be valid',
      ],
      usernameRules: [
        v => !!v || 'Name is required',
        v => (v && v.length <= 10) || 'Name must be less than 10 characters',
      ],
      passwordRules: [
        v => !!v || 'Password is required',
        v => (v && v.length <= 10) || 'Password must be less than 10 characters',
      ],
    }
    },

    // Methodes 
    methods: {

      validate_signup () { //creation d'un nouveau compte utilisateur
        const newUser = {
            username: this.user.username,
            email: this.user.email,
            password: this.user.password,
        }
        const sendPostRequest = async () => {//envoi de la requête
          try {
            const resp = await axios.post('http://localhost:3000/api/connection/signup', newUser);
            this.resultMessage=resp.data.message
            if (resp.status == 201) {
              this.login_delay()
            }
            if (resp.status ==200) {
              console.log("error");
            }
          }
          catch (err){
            console.log(err);
          }
        }
        sendPostRequest ();
      }, 

      login_delay () { //Fonction de connexion
        const newUser = {
          username: this.user.username,
          email: this.user.email,
          password: this.user.password,
        }
        const sendPostRequest = async () => {//Envoi de la requête
          try {
            const resp = await axios.post('http://localhost:3000/api/connection/login', newUser);
            this.resultMessage=`Vous êtes connecté sous le nom de ${resp.data.username}`
            if (resp.status == 201) {
              console.log(`Vous êtes connecté sous le nom de ${resp.data.username}`);
            let user= {
                username : resp.data.username,
                id : resp.data.id,
                email : resp.data.email,
                token : resp.data.token,
                role : resp.data.role
            }
            console.log(resp);
            let user_string = JSON.stringify(user);
            sessionStorage.setItem("user", user_string);
            console.log(sessionStorage.getItem("user"));
            return {message:`Vous êtes connecté sous le nom de ${resp.data.username}`}
            }
            if (resp.status ==200) {
              this.resultMessage= resp.data.err;
            }
          }
          catch (err){
            console.log(err);
          }
        }
        setTimeout(function(){
                    sendPostRequest ();
                }, 1000);
                setTimeout(function(){
                    document.location.href="/vue";
                }, 4000);
      }
    }
}
</script>

<!-- SCSS -->
<style lang="scss">
.logo{
  width: 100%;
  max-width: 200px;
}
.signup__form{
    margin:auto;
    &__group{
        display:flex;
        flex-direction:column;
        justify-content:center;
        margin: 10px;
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
