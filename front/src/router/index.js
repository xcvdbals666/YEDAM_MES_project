import Main from '@/views/Main.vue';
import { createRouter, createWebHistory } from 'vue-router';
import ProductionRoutes from '../router/Productions'


const router = createRouter({
    history: createWebHistory(),
    routes: [
        {
            path: '/material/request',
            name: 'materialRequest',
            component: () => import('@/views/material/MprPurchaseRequest.vue')
          
            path: '/outbound',
            name: 'outbound',
            component: () => import('@/views/order/OutboundList.vue')
            path: '/',
            component: AppLayout,
            children: [

                ...ProductionRoutes,
            ]
        },
    ]
});

export default router;
