<template>
  <div class="container">
    <div class="page-title">CMDB 配置管理</div>
    <el-tabs v-model="tab">
      <el-tab-pane label="资源模型" name="model">
        <ModelManager />
      </el-tab-pane>
      <el-tab-pane label="配置项" name="ci">
        <CiManager />
      </el-tab-pane>
      <el-tab-pane label="关系拓扑" name="topo">
        <TopologyView />
      </el-tab-pane>
      <el-tab-pane label="生命周期" name="lifecycle">
        <LifecycleTools />
      </el-tab-pane>
      <el-tab-pane label="变更联动" name="link">
        <ChangeLinkAndAudit />
      </el-tab-pane>
    </el-tabs>
  </div>
</template>
<script setup>
import ModelManager from './cmdb/ModelManager.vue'
import CiManager from './cmdb/CiManager.vue'
import LifecycleTools from './cmdb/LifecycleTools.vue'
import TopologyView from './cmdb/TopologyView.vue'
import ChangeLinkAndAudit from './cmdb/ChangeLinkAndAudit.vue'

import { ref } from 'vue'
const tab = ref('model')
</script>
<style scoped>
</style>
