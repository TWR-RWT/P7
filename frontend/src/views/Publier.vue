<template>
    <section>
        <!-- Formulaire -->
        <form ref="form" id="form">
            <label for="TitreNouvellePublication">Titre</label><br>
            <input 
            type="text" 
            id="TitreNouvellePublication" 
            name="TitreNouvellePublication" 
            v-model="TitrePublication"
            required>

            <br>

            <label for="ImageNouvellePublication">Image</label><br>
            <input 
                ref='file'
                id="ImageNouvellePublication"
                name="ImageNouvellePublication"
                type="file"
                accept="image/*"
                @change="VerifierImage()">
            <p> {{resultImage}} </p>
            <!-- Previsualisation de l'image -->
            <div class="preview">
                <div></div>
            </div>

            <br>

            <label for="ContentNouvellePublication">Contenu</label><br>
            <textarea 
            id="ContentNouvellePublication"
            name="ContentNouvellePublication"
            form="form"
            required
            v-model="ContentPublication">Que voulez vous dire?</textarea>

            <br>

            <input type="button" value="Publier"
            @click="onSubmit()">

            <br>

            <div>  {{resultMessage}}  </div>

        </form>
    </section>
</template>

<script>
import Thing from '../models/Thing.model';
const axios = require('axios');
export default {

    data () {
        return {
            LocalUser : sessionStorage.getItem("user"),
            username : "",
            email : "",
            iduser : "",
            token : "",
            resultMessage:"",

            TitrePublication :"",
            ContentPublication :"",

            ImageInput:'',
            resultImage:'',
            fileTypes:['image/jpeg','image/pjpeg','image/png','image/gif'],
        }
    },
    

    created () {
        this.getUser();
        //this.VerifierImage();
    },

    methods: {
        getUser (){
            const localUser = JSON.parse(this.LocalUser);
            this.username = localUser.username;
            this.email = localUser.email;
            this.iduser = `${localUser.id}`;
            this.token = localUser.token
        },

        VerifierImage() {
            this.ImageInput=document.querySelector('#ImageNouvellePublication');
            //console.log(this.ImageInput);
            if (this.ImageInput !== 'null') {
            if (typeof(this.ImageInput.files[0]) !== 'undefined') {
                this.resultImage= 'File name ' + this.ImageInput.files[0].name + ', file type '+ this.ImageInput.files[0].type +', file size ' + this.ImageInput.files[0].size + '.';
                if ( this.fileTypes.includes(this.ImageInput.files[0].type)) {
                    //this.resultImage='bon type de fichier'                    
                    var preview = document.querySelector('.preview');

                    const reader = new FileReader();
                    reader.onload = function(){
                        const img = new Image()
                        img.onload=function(){
                            
                            const canvas = document.createElement(`canvas`)
                            canvas.setAttribute('width', 578)
                            canvas.setAttribute('height', 150)
                            canvas.setAttribute('height', 150)
                            const context = canvas.getContext('2d')
                            context.drawImage(img, 0, 0)
                        }
                        img.src= reader.result;
                        preview.removeChild(preview.lastChild);
                        preview.appendChild(img);
                    }
                    reader.readAsDataURL(this.ImageInput.files[0]);
                } else {
                    this.resultImage= `mauvais type de fichier`;
                }
            } else {
                this.resultImage= `aucune image n'apparaitra dans votre publication`;
            }}
        },    

        onSubmit() {
            if (this.TitrePublication !== "" && this.ContentPublication !== ""){
                let date = new Date();
                const thing = new Thing();
                thing.date= `${date.getFullYear()}-${date.getMonth()+1}-${date.getDate()}`;
                thing.time= `${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`;
                thing.iduser= this.iduser;
                thing.username= this.username;
                thing.title= this.TitrePublication;
                thing.content= this.ContentPublication;
                const thingfile = document.querySelector('#ImageNouvellePublication').files[0];
                if (typeof(thingfile) !== 'undefined') {
                    this.PublierAvecImage(thing, thingfile)
                } else {
                    this.PublierSansImage(thing)
                }
                setTimeout(function(){ //Redirection vers le fil de publication 
                    document.location.href="/vue"
                }, 1000);
            } else {
                this.resultMessage="Remplissez votre publication avant de la publier !"
            }
        },

        PublierAvecImage(thingthing, thingimage) {
            return new Promise((resolve, reject) => {
                const thingData = new FormData();
                thingData.append('thing', JSON.stringify(thingthing));
                thingData.append('image', thingimage, thingthing.title);
                try {
                    axios.post('http://localhost:3000/api/publications', thingData, {headers:{'authorization':`${this.token}`}});
                    resolve(console.log("requête bien envoyée"));
                }
                catch (err){
                    reject(console.log("requêtage échoué"));
                }
                
                /*
                return new Promise(resolve => {
                    try {
                    axios.post('http://localhost:3000/api/publications', thingData, {headers:{'authorization':`${this.token}`}}).subscribe(
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

        PublierSansImage(thingthing) {
            return new Promise((resolve, reject) => {
                const thingData = new FormData();
                thingData.append('thing', JSON.stringify(thingthing));
                thingData.append('image', '');    
                try {
                    axios.post('http://localhost:3000/api/publications', thingData, {headers:{'authorization':`${this.token}`}});
                    resolve(console.log("requête bien envoyée"));
                }
                catch (err){
                    reject(console.log("requêtage échoué"));
                }
                
                /*
                return new Promise(resolve => {
                    try {
                    axios.post('http://localhost:3000/api/publications', thingData, {headers:{'authorization':`${this.token}`}}).subscribe(
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
    }
}

</script>


<!-- STYLE -->
<style>

</style>