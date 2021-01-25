<template>
  <body id="app">
      <img src="./assets/logo.png" id="groupomania_head" alt="logo de groupomania">
    <!--Menu-->
    <div id="nav" class="mx-auto my-5 center col-md-4 col-sm-6 center">
      <router-link v-if="(isConnected()==false)" to="/"> Connexion </router-link> <!-- router-link se charge de la navigation dans l'application -->
      <span v-if="(isConnected()==false)"> | </span>
      <router-link v-if="(isConnected()==false)" to="/Inscription"> Inscription</router-link>
      <router-link v-if="(isConnected()==true)" to="/vue"> Fil d'actualités</router-link>
      <span v-if="(isConnected()==true)"> | </span>
      <router-link v-if="(isConnected()==true)" to="/publier"> Publier</router-link>
      <span v-if="(isConnected()==true)"> | </span>
      <router-link v-if="(isConnected()==true)" to="/profile"> Mon profil</router-link>
      <span v-if="(isConnected()==true)"> | </span>
      <router-link v-if="(isConnected()==true)" to="/deconnexion"> Déconnexion </router-link> 
    </div>

    <!-- Affichage -->
    <router-view/> <!-- router-view indique où afficher le composant auquel est associé la route quand on visite une url via router-link -->

    <!--Footer-->
    <footer padless class="my-4">
      <col class="text-center py-4" cols="12"> Groupomania - {{ new Date().getFullYear() }}
    </footer>
  </body>
  
</template>
<script>
export default {
  // Data
  data:()=>({
  }),
  // Methodes
  methods: {
    isConnected (){ //pour savoir quel router-link affiché on regarde si un utilisateur est connecté = si un utilisateur est enregistré dans la session storage
      if (sessionStorage.getItem("user")) {
              return true
      }else {
        return false
      }
    }
  }
}
</script>

<style lang="scss">
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}
#nav {
  padding-right: 1rem;
  padding-left: 1rem;
}
#groupomania_head{
  max-width: 600px;
  width:70%;
  margin-top: -18%;
  margin-bottom: -15%;
}
</style>