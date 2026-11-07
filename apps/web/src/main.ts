import { createApp } from 'vue';
import PrimeVue from 'primevue/config';
import Aura from '@primeuix/themes/aura';
import { router } from './router.js';
import App from './App.vue';
import './style.css';

createApp(App)
  .use(router)
  .use(PrimeVue, { theme: { preset: Aura } })
  .mount('#app');
