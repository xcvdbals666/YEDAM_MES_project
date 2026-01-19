import { createRouter, createWebHistory } from 'vue-router';

const router = createRouter({
    history: createWebHistory(),
    routes: [
        {
            path: '/outbound',
            name: 'outbound',
            component: () => import('@/views/order/OutboundList.vue')
        }
    ]
});

export default router;
