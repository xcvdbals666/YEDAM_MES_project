import AppLayout from '@/layout/AppLayout.vue';
import Test from '@/views/test.vue';
import { createRouter, createWebHistory } from 'vue-router';

const router = createRouter({
    history: createWebHistory(),
    routes: [
        {
            path: '/test',
            name: 'test',
            component: Test,
            children: []
        }
        // {
        //     path: '/',
        //     component: AppLayout,
        //     children: [
        //         {
        //             path: '/',
        //             name: 'dashboard',
        //             component: () => import('@/views/Dashboard.vue')
        //         },
        //     ]
        // },
        // {
        //     path: '/landing',
        //     name: 'landing',
        //     component: () => import('@/views/pages/Landing.vue')
        // },
    ]
});

export default router;
