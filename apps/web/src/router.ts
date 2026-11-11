import { createRouter, createWebHistory } from 'vue-router';
import ProductsView from './views/ProductsView.vue';
import DashboardView from './views/DashboardView.vue';
import TransactionsView from './views/TransactionsView.vue';
import JobsView from './views/JobsView.vue';
import ConnectionsView from './views/ConnectionsView.vue';
import BlingCatalogView from './views/BlingCatalogView.vue';
import BlingEndpointView from './views/BlingEndpointView.vue';
import LagomCatalogView from './views/LagomCatalogView.vue';
import LagomOperationView from './views/LagomOperationView.vue';
import LagomCompatView from './views/LagomCompatView.vue';
import LagomDataView from './views/LagomDataView.vue';
import LagomLogView from './views/LagomLogView.vue';

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', name: 'dashboard', component: DashboardView },
    { path: '/products', name: 'products', component: ProductsView },
    { path: '/transactions', name: 'transactions', component: TransactionsView },
    { path: '/jobs', name: 'jobs', component: JobsView },
    { path: '/connections', name: 'connections', component: ConnectionsView },
    { path: '/bling', name: 'bling-catalog', component: BlingCatalogView },
    { path: '/bling/:id', name: 'bling-endpoint', component: BlingEndpointView },
    { path: '/lagom', name: 'lagom-catalog', component: LagomCatalogView },
    { path: '/lagom/op/:id', name: 'lagom-operation', component: LagomOperationView },
    { path: '/lagom/dados', name: 'lagom-data', component: LagomDataView },
    { path: '/lagom/compatibilidade', name: 'lagom-compat', component: LagomCompatView },
    { path: '/lagom/log', name: 'lagom-log', component: LagomLogView },
  ],
});
