<script setup>
import { ref } from 'vue';
import SideMenuItem from './SideMenuItem.vue';

const model = ref([
  {
    label: 'MES',
    icon: 'pi pi-fw pi-briefcase',
    path: '/pages',
    items: [
      {
        label: '주문',
        icon: 'pi pi-fw pi-receipt',
        path: '/order',
        items: [
          {
            label: '주문서 조회',
            icon: 'pi pi-fw pi-list',
            to: '/ordList'
          },
          {
            label: '주문서 관리',
            icon: 'pi pi-fw pi-pen-to-square',
            to: '/ordManager'
          },
          {
            label: '출고 조회',
            icon: 'pi pi-fw pi-list',
            to: '/outbound'
          },
          {
            label: '출고 요청',
            icon: 'pi pi-fw pi-sign-in',
            to: '/outbound/request'
          },
          {
            label: '출고 관리',
            icon: 'pi pi-fw pi-pen-to-square',
            to: '/outbound/management'
          }
        ]
      },
      {
        label: '생산',
        icon: 'pi pi-fw pi-chart-line',
        path: '/produce',
        items: [
          {
            label: '생산계획관리',
            icon: 'pi pi-fw pi-pen-to-square',
            to: '/production/plan'
          },
          {
            label: '생산계획조회',
            icon: 'pi pi-fw pi-list',
            to: '/production/planList'
          },
          {
            label: 'MRP관리',
            icon: 'pi pi-fw pi-pen-to-square',
            to: '/production/mrp'
          },
          {
            label: 'MRP조회',
            icon: 'pi pi-fw pi-list',
            to: '/production/mrpList'
          },
          {
            label: '작업지시서 관리',
            icon: 'pi pi-fw pi-pen-to-square',
            to: '/workorderMgt'
          },
          {
            label: '작업지시서 조회',
            icon: 'pi pi-fw pi-list',
            to: '/workorderList'
          },
          {
            label: '작업진행 목록',
            icon: 'pi pi-fw pi-list',
            to: '/workInProcessList'
          },
          {
            label: '생산실적조회',
            icon: 'pi pi-fw pi-list',
            to: '/production/result'
          }
        ]
      },
      {
        label: '품질',
        icon: 'pi pi-fw pi-tags',
        path: '/quality',
        items: [
          {
            label: '품질검사기준',
            icon: 'pi pi-fw pi-list',
            to: '/qcrinfo'
          },
          {
            label: '제품별 품질검사항목',
            icon: 'pi pi-fw pi-list',
            to: '/selectqcr'
          },
          {
            label: '품질검사 지시관리',
            icon: 'pi pi-fw pi-pen-to-square',
            to: '/qiorder'
          },
          {
            label: '품질검사 지시 목록조회',
            icon: 'pi pi-fw pi-list',
            to: '/qiorderlist'
          },
          {
            label: '품질검사 결과관리',
            icon: 'pi pi-fw pi-pen-to-square',
            to: '/qiresult'
          },
          {
            label: '품질검사 결과 목록조회',
            icon: 'pi pi-fw pi-list',
            to: '/qioresultlist'
          }
        ]
      },
      {
        label: '자재',
        icon: 'pi pi-fw pi-warehouse',
        path: '/material',
        items: [
          {
            label: '자재구매요청',
            icon: 'pi pi-fw pi-pen-to-square',
            to: '/mprRequest'
          },
          {
            label: '자재구매요청 목록',
            icon: 'pi pi-fw pi-list',
            to: '/mprList'
          },
          {
            label: '발주서관리',
            icon: 'pi pi-fw pi-pen-to-square',
            to: '/mpotable'
          },
          {
            label: '발주서목록',
            icon: 'pi pi-fw pi-list',
            to: '/mpolist'
          },
          {
            label: '입고등록',
            icon: 'pi pi-fw pi-sign-in',
            to: '/inboundregister'
          },
          {
            label: '입출고내역',
            icon: 'pi pi-fw pi-list',
            to: '/matInout'
          },
          {
            label: '자재재고현황',
            icon: 'pi pi-fw pi-list',
            to: '/matStock'
          }
        ]
      }
    ]
  }
]);
</script>

<template>
  <ul class="layout-menu">
    <template v-for="(item, i) in model" :key="item">
      <side-menu-item v-if="!item.separator" :item="item" :index="i"></side-menu-item>
      <li v-if="item.separator" class="menu-separator"></li>
    </template>
  </ul>
</template>

<style lang="scss" scoped></style>
