<template>
  <div class="card">
    <div class="label">{{ label }}</div>
    <div class="value">{{ value }}</div>
  </div>
</template>
<script setup>
defineProps({
  label: { type: String, default: '' },
  value: { type: [String, Number], default: '' }
})
</script>
<style scoped>
.card {
  background: linear-gradient(180deg, rgba(255,255,255,0.08), rgba(255,255,255,0.02));
  border: 1px solid rgba(255,255,255,0.12);
  border-radius: 8px;
  padding: 12px;
}
.label {
  font-size: 12px;
  color: #cbd5e1;
}
.value {
  font-size: 24px;
  font-weight: 700;
  margin-top: 6px;
}
</style>
