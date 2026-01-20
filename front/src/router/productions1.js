// src / router / production1.js
import WorkOrderList from '../views/productions/WorkOrderList.vue';
import WorkOrderMgt from '../views/productions/WorkOrderMgt.vue';

const ProductionRoutes1 = [
  {
    path: '/workorderList',
    name: 'WorkOrderList',
    component: WorkOrderList
  },
  {
    path: '/workorderMgt',
    name: 'WorkOrderMgt',
    component: WorkOrderMgt
  }
];

export default ProductionRoutes1;
