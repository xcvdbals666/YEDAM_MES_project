// src / router / Productions.js
import WorkOrderList from '../views/Productions/WorkOrderList.vue'
import WorkOrderMgt from '../views/Productions/WorkOrderMgt.vue'

const ProductionRoutes = [
  {
    path: '/workorderList',
    name: 'WorkOrderList',
    component: WorkOrderList
  },
  {
    path: '/workorderMgt',
    name: 'WorkOrderMgt',
    component: WorkOrderMgt
  },
]

export default ProductionRoutes