<template>
    <section>
        <div class="container">

            <!--Affichage des publications-->
            <div class="elevation-10 rounded ma-6">
                <span> {{resultMessage}} <br/> </span>  
            </div>

        </div>
    </section>
</template>

<!-- SCRIPT -->
<script>

//const axios = require('axios');
export default {
    data () {
        return {
            LocalUser : sessionStorage.getItem("user"),
            username : "",
            email : "",
            iduser : "",
            token : "",
            resultMessage: sessionStorage.getItem("publication"),
            publications:"",
            publicationslength:""
            
        }
    },

    //calculées
        created () {
            this.getUser();
    },

    //Methodes
    methods: {
        getUser (){
            const localUser = JSON.parse(this.LocalUser);
            this.username = localUser.username;
            this.email = localUser.email;
            this.iduser = `${localUser.id}`;
            this.token = localUser.token
        },
    },
}
</script>

<!-- STYLE -->
<style>
</style>