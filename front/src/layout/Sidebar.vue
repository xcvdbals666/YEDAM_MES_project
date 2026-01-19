<script setup>
import { useLayout } from '@/layout/composables/layout';
import { onBeforeUnmount, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import SideMenu from './SideMenu.vue';

const { layoutState, isDesktop, hasOpenOverlay } = useLayout();
const route = useRoute();
const sidebarRef = ref(null);
let outsideClickListener = null;

watch(hasOpenOverlay, (newVal) => {
  if (isDesktop()) {
    if (newVal) bindOutsideClickListener();
    else unbindOutsideClickListener();
  }
});

const bindOutsideClickListener = () => {
  if (!outsideClickListener) {
    outsideClickListener = (event) => {
      if (isOutsideClicked(event)) {
        layoutState.overlayMenuActive = false;
      }
    };

    document.addEventListener('click', outsideClickListener);
  }
};

const unbindOutsideClickListener = () => {
  if (outsideClickListener) {
    document.removeEventListener('click', outsideClickListener);
    outsideClickListener = null;
  }
};

const isOutsideClicked = (event) => {
  const topbarButtonEl = document.querySelector('.layout-menu-button');

  return !(sidebarRef.value.isSameNode(event.target) || sidebarRef.value.contains(event.target) || topbarButtonEl?.isSameNode(event.target) || topbarButtonEl?.contains(event.target));
};

onBeforeUnmount(() => {
  unbindOutsideClickListener();
});
</script>

<template>
  <div ref="sidebarRef" class="layout-sidebar">
    <SideMenu />
  </div>
</template>
