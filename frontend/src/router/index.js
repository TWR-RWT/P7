//
import Vue from 'vue'
import VueRouter from 'vue-router'
import Inscription from '../views/Inscription.vue'
import Connexion from '../views/Connexion.vue'
import vue from '../views/Vue.vue'
import Publier from '../views/Publier.vue'
import Profile from '../views/Profile.vue'
import Deconnexion from '../views/Deconnexion.vue'
import Publication from '../views/Publication.vue'

Vue.use(VueRouter)

const routes = [
  {
    path: '/Inscription', //chemin = adresse URL
    name: 'Inscription', //Nom
    component: Inscription //Composant rendu lorsqu'un utilisateur visite la route
  },
  {
    path: '/',
    name: 'Connexion',
    component: Connexion
  },
  {
    path: '/vue',
    name: 'Vue',
    component: vue
  },
  {
    path: '/publier',
    name: 'Publier',
    component: Publier
  },
  {
      path: '/profile',
      name: 'Profile',
      component: Profile

  },
  {
      path: '/deconnexion',
      name: 'Deconnexion',
      component: Deconnexion

  },
  {
      path: '/publication',
      name: 'Publication',
      component: Publication
  }
]

const router = new VueRouter({
  mode: 'history',
  routes
})

export default router
