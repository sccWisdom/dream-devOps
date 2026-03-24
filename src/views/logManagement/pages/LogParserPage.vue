<template>
  <div class="container">
    <div class="page-title">日志格式解析</div>
    <el-card shadow="never">
      <div class="parser-container">
        <div class="parser-info">
          请在下方粘贴原始日志文本示例，选择或输入正则表达式或日志解析器，并在下方查看解析结果。
        </div>
        <div class="parser-content">
          <div class="left-panel">
            <div class="form-item">
              <label>待解析日志</label>
              <el-input
                v-model="logText"
                type="textarea"
                rows="10"
                placeholder="请粘贴原始日志文本"
                class="log-textarea"
              />
            </div>
            <div class="form-item">
              <label>正则表达式：</label>
              <el-select v-model="regexType" style="width: 120px; margin-right: 10px">
                <el-option label="自定义" value="custom"/>
              </el-select>
              <el-button type="primary" @click="testParse">调试</el-button>
              <el-button @click="reset" style="margin-left: 0px">重置</el-button>
            </div>
            <div class="form-item">
              <el-input
                v-model="regexPattern"
                type="textarea"
                rows="4"
                placeholder="请输入正则表达式"
                class="regex-textarea"
              />
            </div>
          </div>
          <div class="right-panel">
            <div class="result-header">
              解析结果【JSON】
            </div>
            <div class="result-content">
              <pre v-if="parseResult">{{ formattedResult }}</pre>
              <div v-else class="empty-result">请输入日志文本和正则表达式，点击调试按钮查看解析结果</div>
            </div>
          </div>
        </div>
      </div>
    </el-card>
  </div>
</template>
<script setup>
import { ref, computed } from 'vue'

const logText = ref(`2026-03-19 16:58:36.7498980 [ERROR] scraphelper@v0.138.1-0.20251028185454-50764f8b2dc/obs_metrics.go:61 Error scraping metrics host.arch=arm64 host.name=host-174-c`)
const regexType = ref('custom')
const regexPattern = ref(`(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}\.\d+) \[(\w+)\] ([\w@\-./:]+) (.+) ((?:\w+\.\w+=\w+\s*)+)`)
const parseResult = ref(null)

const formattedResult = computed(() => {
  if (!parseResult.value) return ''
  return JSON.stringify(parseResult.value, null, 2)
})

const testParse = () => {
  if (!logText.value || !regexPattern.value) {
    return
  }
  
  // 模拟解析结果
  parseResult.value = {
    level: 'error',
    ts: '2026-03-19T16:58:36.7498980',
    caller: 'scraphelper@v0.138.1-0.20251028185454-50764f8b2dc/obs_metrics.go:61',
    msg: 'Error scraping metrics',
    resource: {
      'host.arch': 'arm64',
      'host.name': 'host-174-c'
    }
  }
}

const reset = () => {
  logText.value = ''
  regexPattern.value = ''
  parseResult.value = null
}
</script>
<style scoped>
.container {
  padding: 20px;
}

.page-title {
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 20px;
  color: #333;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.parser-container {
  padding: 10px;
}

.parser-info {
  margin-bottom: 20px;
  padding: 10px;
  background-color: #f5f7fa;
  border-radius: 4px;
  font-size: 14px;
  color: #606266;
}

.parser-content {
  display: flex;
  gap: 20px;
  height: 500px;
}

.left-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.right-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.form-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-item label {
  font-size: 14px;
  font-weight: 500;
  color: #303133;
}

.log-textarea,
.regex-textarea {
  width: 100%;
  resize: none;
  font-family: 'Courier New', Courier, monospace;
  font-size: 13px;
}

.result-header {
  font-size: 14px;
  font-weight: 500;
  color: #303133;
  margin-bottom: 10px;
  padding-bottom: 8px;
  border-bottom: 1px solid #ebeef5;
}

.result-content {
  flex: 1;
  background-color: #f5f7fa;
  border-radius: 4px;
  padding: 15px;
  overflow: auto;
}

.result-content pre {
  margin: 0;
  font-family: 'Courier New', Courier, monospace;
  font-size: 13px;
  line-height: 1.5;
  color: #303133;
  white-space: pre-wrap;
  word-break: break-all;
}

.empty-result {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #909399;
  font-size: 14px;
}

@media (max-width: 768px) {
  .parser-content {
    flex-direction: column;
    height: auto;
  }
  
  .left-panel,
  .right-panel {
    height: 400px;
  }
}
</style>