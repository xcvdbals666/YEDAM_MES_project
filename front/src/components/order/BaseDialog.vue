<template>
  <Dialog v-model:visible="visible" :header="header" modal :style="{ width: width }">
    <slot></slot>

    <template #footer>
      <slot name="footer">
        <Button label="닫기" @click="visible = false" severity="danger" text />
      </slot>
    </template>
  </Dialog>
</template>

<script setup>
const props = defineProps(['header', 'width']);
const visible = defineModel('visible');
</script>
