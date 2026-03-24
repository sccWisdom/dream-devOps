<template>
  <div class="container">
    <div class="page-title">自动化运维</div>
    <div class="welcome-card">
      <el-card shadow="never">
        <h3>欢迎使用自动化运维平台</h3>
        <p>自动化运维平台提供以下功能：</p>
        <el-divider />
        <el-row :gutter="20">
          <el-col :span="8">
            <el-card shadow="never" class="feature-card">
              <div class="feature-icon">
                <i class="el-icon-s-grid"></i>
              </div>
              <h4>处置规则库</h4>
              <p>管理自动化处置规则、脚本库和执行历史</p>
              <el-button type="primary" @click="navigateTo('rule-library')">进入</el-button>
            </el-card>
          </el-col>
          <el-col :span="8">
            <el-card shadow="never" class="feature-card">
              <div class="feature-icon">
                <i class="el-icon-lock"></i>
              </div>
              <h4>安全管理</h4>
              <p>管理操作白名单和执行权限</p>
              <el-button type="primary" @click="navigateTo('security')">进入</el-button>
            </el-card>
          </el-col>
          <el-col :span="8">
            <el-card shadow="never" class="feature-card">
              <div class="feature-icon">
                <i class="el-icon-tools"></i>
              </div>
              <h4>工具集成</h4>
              <p>管理和使用运维工具</p>
              <el-button type="primary" @click="navigateTo('tools')">进入</el-button>
            </el-card>
          </el-col>
        </el-row>
      </el-card>
    </div>
  </div>
</template>
<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

const navigateTo = (path) => {
  router.push(`/auto-ops/${path}`)
}
</script>
<style scoped>
.container {
  padding: 20px;
}

.page-title {
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 20px;
  color: #333;
}

.welcome-card {
  margin-top: 20px;
}

.feature-card {
  text-align: center;
  padding: 20px;
  height: 200px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  transition: transform 0.3s ease;
}

.feature-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
}

.feature-icon {
  font-size: 48px;
  color: #409EFF;
  margin-bottom: 16px;
}

.feature-card h4 {
  margin-bottom: 8px;
  color: #333;
}

.feature-card p {
  color: #666;
  margin-bottom: 16px;
  flex-grow: 1;
}
</style>