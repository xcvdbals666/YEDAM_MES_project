// import Main from '@/views/Main.vue';
import { createRouter, createWebHistory } from 'vue-router';

const router = createRouter({
    history: createWebHistory(),
    routes: [
        {
            path: '/material/request',
            name: 'materialRequest',
            component: () => import('@/views/material/MprPurchaseRequest.vue')
        }
    ]
});

export default router;
