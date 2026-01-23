<script setup>
import Footer from '@/layout/Footer.vue';
import Header from '@/layout/Header.vue';
import Sidebar from '@/layout/Sidebar.vue';
import { RouterView } from 'vue-router';
import { useLayout } from '@/layout/composables/layout';
import { computed, onMounted } from 'vue';

const { layoutConfig, layoutState, hideMobileMenu } = useLayout();

const containerClass = computed(() => {
  return {
    'layout-overlay': layoutConfig.menuMode === 'overlay',
    'layout-static': layoutConfig.menuMode === 'static',
    'layout-overlay-active': layoutState.overlayMenuActive,
    'layout-mobile-active': layoutState.mobileMenuActive,
    'layout-static-inactive': layoutState.staticMenuInactive
  };
});

onMounted(() => {
  localStorage.setItem('user', JSON.stringify({ emp_code: 'EMP-10001', emp_name: '김영업' }));
});
</script>

<template>
  <div class="layout-wrapper" :class="containerClass">
    <Header />
    <Sidebar />
    <div class="layout-main-container">
      <div class="layout-main h-200">
        <router-view />
      </div>
      <!-- <Footer /> -->
    </div>
    <div class="layout-mask animate-fadein" @click="hideMobileMenu" />
  </div>
  <Toast />
</template>
