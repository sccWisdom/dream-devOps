<template>
  <div class="query-bar">
    <slot />
    <div class="ops">
      <slot name="ops" />
    </div>
  </div>
</template>
<script setup>
</script>
<style scoped>
.query-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 10px 12px;
  border: 1px solid var(--border);
  background: var(--surface-2);
  border-radius: var(--radius);
  box-shadow: var(--shadow);
  margin-bottom: 12px;
}
.ops {
  display: flex;
  gap: 8px;
}
</style>
