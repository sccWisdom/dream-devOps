<template>
  <div class="container">
    <div class="page-title">系统设置</div>
    <el-form label-width="120px" style="max-width:560px">
      <el-form-item label="站内通知">
        <el-switch v-model="cfg.notify"/>
      </el-form-item>
      <el-form-item label="深色模式默认">
        <el-switch v-model="cfg.dark"/>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="save">保存</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>
<script setup>
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
const cfg = ref({ notify: true, dark: false })
const save = () => {
  ElMessage.success('设置已保存')
}
</script>
<style scoped>
</style>
