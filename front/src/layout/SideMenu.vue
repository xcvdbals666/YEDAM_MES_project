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
        label: '테스트화면(후에 대시보드 메인화면으로 교체)',
        icon: 'pi pi-fw pi-user',
        path: '/test'
      },
      {
        label: '기준정보',
        icon: 'pi pi-fw pi-user',
        path: '/info',
        items: [
          {
            label: '예시 메뉴',
            icon: 'pi pi-fw pi-sign-in',
            to: ''
          }
        ]
      },
      {
        label: '주문',
        icon: 'pi pi-fw pi-user',
        path: '/order',
        items: [
          {
            label: '주문서 관리',
            icon: 'pi pi-fw pi-sign-in',
            to: '/ordManager'
          },
          {
            label: '출고 조회',
            icon: 'pi pi-fw pi-sign-in',
            to: '/outbound'
          },
          {
            label: '출고 요청',
            icon: 'pi pi-fw pi-sign-in',
            to: '/outbound/request'
          }
        ]
      },
      {
        label: '생산',
        icon: 'pi pi-fw pi-user',
        path: '/produce',
        items: [
          {
            label: '생산계획관리',
            icon: 'pi pi-fw pi-sign-in',
            to: '/production/plan'
          },
          {
            label: '생산계획조회',
            icon: 'pi pi-fw pi-times-circle',
            to: '/production/planList'
          },
          {
            label: 'MRP관리',
            icon: 'pi pi-fw pi-lock',
            to: '/production/mrp'
          },
          {
            label: 'MRP조회',
            icon: 'pi pi-fw pi-lock',
            to: '/production/mrpList'
          },
          {
            label: '작업지시서 관리',
            icon: 'pi pi-fw pi-lock',
            to: '/workorderMgt'
          },
          {
            label: '작업지시서 조회',
            icon: 'pi pi-fw pi-lock',
            to: '/workorderList'
          },
          {
            label: '작업진행 목록',
            icon: 'pi pi-fw pi-lock',
            to: ''
          },
          {
            label: '생산실적조회',
            icon: 'pi pi-fw pi-lock',
            to: '/production/result'
          }
        ]
      },
      {
        label: '품질',
        icon: 'pi pi-fw pi-user',
        path: '/quality',
        items: [
          {
            label: '품질검사 지시관리',
            icon: 'pi pi-fw pi-sign-in',
            to: '/qiorder'
          },
          {
            label: '품질검사 목록조회',
            icon: 'pi pi-fw pi-sign-in',
            to: '/qiorderlist'
          },
          {
            label: '품질검사 결과관리',
            icon: 'pi pi-fw pi-sign-in',
            to: '/qiresult'
          }
        ]
      },
      {
        label: '자재',
        icon: 'pi pi-fw pi-user',
        path: '/material',
        items: [
          {
            label: '자재구매요청',
            icon: 'pi pi-fw pi-sign-in',
            to: '/mprRequest'
          },
          {
            label: '자재구매요청 목록',
            icon: 'pi pi-fw pi-sign-in',
            to: '/mprList'
          },
          {
            label: '발주서관리',
            icon: 'pi pi-fw pi-sign-in',
            to: '/mpotable'
          },
          {
            label: '발주서목록',
            icon: 'pi pi-fw pi-sign-in',
            to: '/mpolist'
          }
        ]
      },
      {
        label: '설비',
        icon: 'pi pi-fw pi-user',
        path: '/facility',
        items: [
          {
            label: '예시 메뉴',
            icon: 'pi pi-fw pi-sign-in',
            to: ''
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
