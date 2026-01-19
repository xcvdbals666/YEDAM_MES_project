import Main from '@/views/Main.vue';
import { createRouter, createWebHistory } from 'vue-router';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'main',
      component: Main,
      children: [
        {
          path: '/test',
          name: 'test',
          component: () => import('@/views/test.vue')
        },
        {
          path: '/production/plan',
          name: 'productionPlan',
          component: () => import('@/views/Productions/ProductionPlan.vue')
        },
        {
          path: '/production/planList',
          name: 'productionPlanList',
          component: () => import('@/views/Productions/ProductionPlanList.vue')
        },
        {
          path: '/production/result',
          name: 'productionResult',
          component: () => import('@/views/Productions/ProductionResult.vue')
        }
      ]
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
