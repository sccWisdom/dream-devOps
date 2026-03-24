<template>
  <div class="smart-assistant-container">
    <!-- 机器人图标 -->
    <div 
      class="assistant-icon" 
      :class="{ active: isOpen }"
      @click="toggleDialog"
    >
      <img src="/机器人.svg" class="robot-icon" alt="智能助手" />
      <div class="badge" v-if="unreadCount > 0">{{ unreadCount }}</div>
    </div>

    <!-- 对话对话框 -->
    <div 
      class="assistant-dialog" 
      :class="{ open: isOpen }"
      v-show="isOpen"
    >
      <!-- 对话框头部 -->
      <div class="dialog-header">
        <div class="header-left">
          <img src="/机器人.svg" class="header-icon" alt="智能助手" />
          <div class="header-title">
            <div class="title-main">智能运维助手</div>
            <div class="title-sub">有什么可以帮您的？</div>
          </div>
        </div>
        <el-button 
          class="close-btn" 
          text 
          @click="closeDialog"
        >
          <el-icon><Close /></el-icon>
        </el-button>
      </div>

      <!-- 消息展示区域 -->
      <div class="message-container" ref="messageContainer">
        <!-- 欢迎消息 -->
        <div v-if="messages.length === 0" class="welcome-message">
          <div class="welcome-text">欢迎使用智能运维助手！</div>
          <div class="welcome-subtext">您可以咨询以下问题：</div>
          <div class="welcome-topics">
            <div 
              v-for="topic in commonTopics" 
              :key="topic"
              class="topic-item"
              @click="sendMessage(topic)"
            >
              {{ topic }}
            </div>
          </div>
        </div>

        <!-- 对话消息 -->
        <div 
          v-for="(message, index) in messages" 
          :key="index"
          class="message-wrapper"
          :class="{ 'user-message': message.sender === 'user', 'bot-message': message.sender === 'bot' }"
        >
          <div class="message-content">
            <div class="message-bubble" :class="message.sender">
              {{ message.content }}
            </div>
            <div class="message-time">{{ message.timestamp }}</div>
          </div>
        </div>

        <!-- 加载状态 -->
        <div v-if="isLoading" class="loading-message">
          <el-icon class="loading-icon"><Loading /></el-icon>
          <span>正在思考...</span>
        </div>

        <!-- 错误提示 -->
        <div v-if="error" class="error-message">
          <el-icon class="error-icon"><Warning /></el-icon>
          <span>{{ error }}</span>
          <el-button 
            type="text" 
            size="small" 
            class="retry-btn"
            @click="retryLastMessage"
          >
            重试
          </el-button>
        </div>
      </div>

      <!-- 输入区域 -->
      <div class="input-container">
        <el-input
          v-model="inputMessage"
          class="message-input"
          placeholder="请输入您的问题..."
          @keyup.enter="handleSend"
        >
          <template #append>
            <el-button 
              type="primary" 
              class="send-btn" 
              @click="handleSend"
              :disabled="!inputMessage.trim()"
            >
              <el-icon><ArrowRight /></el-icon>
            </el-button>
          </template>
        </el-input>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import { 
  Close, 
  Loading, 
  ArrowRight, 
  Warning 
} from '@element-plus/icons-vue'

// 状态管理
const isOpen = ref(false)
const messages = ref([])
const inputMessage = ref('')
const isLoading = ref(false)
const error = ref('')
const messageContainer = ref(null)

// 常见问题推荐
const commonTopics = [
  '如何提交事件工单',
  '变更管理流程是什么',
  '如何查看我的值班安排',
  'SLA服务协议如何配置'
]

// 未读消息计数
const unreadCount = ref(0)

// 切换对话框显示/隐藏
const toggleDialog = () => {
  isOpen.value = !isOpen.value
  if (isOpen.value) {
    unreadCount.value = 0
    // 滚动到底部
    nextTick(() => {
      scrollToBottom()
    })
  }
}

// 关闭对话框
const closeDialog = () => {
  isOpen.value = false
}

// 发送消息
const sendMessage = (content) => {
  // 清空错误信息
  error.value = ''
  
  // 添加用户消息
  const userMessage = {
    sender: 'user',
    content: content,
    timestamp: getCurrentTime()
  }
  messages.value.push(userMessage)
  inputMessage.value = ''
  
  // 滚动到底部
  nextTick(() => {
    scrollToBottom()
  })
  
  // 模拟机器人回复
  getBotResponse(content)
}

// 处理发送按钮点击
const handleSend = () => {
  if (inputMessage.value.trim()) {
    sendMessage(inputMessage.value.trim())
  }
}

// 模拟机器人回复
const getBotResponse = (userInput) => {
  isLoading.value = true
  
  // 模拟网络延迟
  setTimeout(() => {
    isLoading.value = false
    
    // 基于关键词生成回复
    const response = generateResponse(userInput)
    
    // 添加机器人消息
    const botMessage = {
      sender: 'bot',
      content: response,
      timestamp: getCurrentTime()
    }
    messages.value.push(botMessage)
    
    // 滚动到底部
    nextTick(() => {
      scrollToBottom()
    })
    
    // 保存对话历史
    saveConversation()
  }, 800)
}

// 基于关键词生成回复
const generateResponse = (input) => {
  input = input.toLowerCase()
  
  if (input.includes('事件') || input.includes('工单')) {
    return '您可以通过服务门户提交事件工单，选择事件管理类别，填写相关信息后提交。系统会根据优先级和规则自动分配给相应的运维人员。'
  } else if (input.includes('变更') || input.includes('流程')) {
    return '变更管理流程包括：变更申请、风险评估、审批决策、实施跟踪、验证确认和归档追溯。您需要填写变更内容、原因、影响范围、实施计划和回滚方案。'
  } else if (input.includes('值班') || input.includes('安排')) {
    return '您可以在值班管理模块查看您的值班安排，支持月历和列表视图。如果需要请假或调班，可以提交申请流程。'
  } else if (input.includes('sla') || input.includes('服务协议')) {
    return 'SLA服务协议可以在SLA管理模块配置，支持自定义模板、优先级联动和多渠道通知。不同优先级对应不同的响应、接单、处置和解决时长。'
  } else if (input.includes('监控') || input.includes('告警')) {
    return '监控告警模块支持多源告警接入、规则配置、全生命周期处置和多渠道通知。系统会自动对告警进行归一化、去重和降噪处理。'
  } else if (input.includes('知识库') || input.includes('文档')) {
    return '运维知识库包含运维通用知识、数据交维、平台交维、操作手册、SOP和案例库等分类。您可以通过智能检索快速找到相关知识。'
  } else {
    return '感谢您的咨询。作为智能运维助手，我可以回答关于事件管理、问题管理、变更管理、发布管理、值班管理、SLA管理、运维知识库等方面的问题。请问您有什么具体需求？'
  }
}

// 获取当前时间
const getCurrentTime = () => {
  const now = new Date()
  const hours = now.getHours().toString().padStart(2, '0')
  const minutes = now.getMinutes().toString().padStart(2, '0')
  return `${hours}:${minutes}`
}

// 滚动到底部
const scrollToBottom = () => {
  if (messageContainer.value) {
    messageContainer.value.scrollTop = messageContainer.value.scrollHeight
  }
}

// 保存对话历史到本地存储
const saveConversation = () => {
  try {
    localStorage.setItem('assistantConversation', JSON.stringify(messages.value))
  } catch (error) {
    console.error('保存对话历史失败:', error)
  }
}

// 从本地存储加载对话历史
const loadConversation = () => {
  try {
    const saved = localStorage.getItem('assistantConversation')
    if (saved) {
      messages.value = JSON.parse(saved)
    }
  } catch (error) {
    console.error('加载对话历史失败:', error)
  }
}

// 重试上一条消息
const retryLastMessage = () => {
  error.value = ''
  const lastUserMessage = messages.value.filter(m => m.sender === 'user').pop()
  if (lastUserMessage) {
    getBotResponse(lastUserMessage.content)
  }
}

// 监听消息变化，自动滚动到底部
watch(messages, () => {
  nextTick(() => {
    scrollToBottom()
  })
}, { deep: true })

// 组件挂载时加载对话历史
onMounted(() => {
  loadConversation()
})
</script>

<style scoped>
.smart-assistant-container {
  position: fixed;
  bottom: 30px;
  right: 30px;
  z-index: 1000;
}

/* 机器人图标 */
.assistant-icon {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: linear-gradient(135deg, #e8ecf1 0%, #2563eb 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 8px 24px rgba(59, 130, 246, 0.4);
  transition: all 0.3s ease;
  position: relative;
}

.assistant-icon:hover {
  transform: scale(1.1);
  box-shadow: 0 12px 32px rgba(59, 130, 246, 0.6);
}

.assistant-icon.active {
  transform: scale(1.1);
  background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
}

.robot-icon {
  width: 32px;
  height: 32px;
  object-fit: contain;
}

.badge {
  position: absolute;
  top: -5px;
  right: -5px;
  background: #ef4444;
  color: white;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  font-size: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
}

/* 对话对话框 */
.assistant-dialog {
  position: absolute;
  bottom: 80px;
  right: 0;
  width: 380px;
  max-height: 500px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
  overflow: hidden;
  transform: translateX(100%);
  transition: transform 0.3s ease;
  border: 1px solid rgba(226, 232, 240, 0.8);
}

.assistant-dialog.open {
  transform: translateX(0);
}

/* 对话框头部 */
.dialog-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  border-bottom: 1px solid rgba(226, 232, 240, 0.8);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.header-icon {
  width: 24px;
  height: 24px;
  object-fit: contain;
}

.header-title {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.title-main {
  font-size: 16px;
  font-weight: 600;
  color: rgba(15, 23, 42, 0.9);
}

.title-sub {
  font-size: 12px;
  color: rgba(100, 116, 139, 0.8);
}

.close-btn {
  color: rgba(100, 116, 139, 0.8);
  padding: 0;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 消息展示区域 */
.message-container {
  height: 360px;
  overflow-y: auto;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* 欢迎消息 */
.welcome-message {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 16px;
  background: rgba(248, 250, 252, 0.8);
  border-radius: 10px;
  border: 1px solid rgba(226, 232, 240, 0.6);
}

.welcome-text {
  font-size: 16px;
  font-weight: 600;
  color: rgba(15, 23, 42, 0.9);
}

.welcome-subtext {
  font-size: 14px;
  color: rgba(100, 116, 139, 0.8);
}

.welcome-topics {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.topic-item {
  padding: 10px 12px;
  background: white;
  border-radius: 8px;
  border: 1px solid rgba(226, 232, 240, 0.8);
  font-size: 14px;
  color: rgba(71, 85, 105, 0.9);
  cursor: pointer;
  transition: all 0.2s ease;
}

.topic-item:hover {
  background: rgba(59, 130, 246, 0.05);
  border-color: rgba(59, 130, 246, 0.2);
  color: rgba(37, 99, 235, 0.9);
}

/* 消息样式 */
.message-wrapper {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.message-wrapper.user-message {
  align-items: flex-end;
}

.message-wrapper.bot-message {
  align-items: flex-start;
}

.message-content {
  display: flex;
  flex-direction: column;
  gap: 4px;
  max-width: 80%;
}

.message-bubble {
  padding: 10px 14px;
  border-radius: 12px;
  font-size: 14px;
  line-height: 1.4;
  word-wrap: break-word;
}

.message-bubble.user {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: white;
  border-bottom-right-radius: 4px;
}

.message-bubble.bot {
  background: rgba(241, 245, 249, 0.8);
  color: rgba(15, 23, 42, 0.9);
  border: 1px solid rgba(226, 232, 240, 0.6);
  border-bottom-left-radius: 4px;
}

.message-time {
  font-size: 11px;
  color: rgba(100, 116, 139, 0.6);
}

/* 加载状态 */
.loading-message {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  background: rgba(241, 245, 249, 0.8);
  border-radius: 12px;
  border: 1px solid rgba(226, 232, 240, 0.6);
  align-self: flex-start;
  font-size: 14px;
  color: rgba(100, 116, 139, 0.8);
}

.loading-icon {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* 错误提示 */
.error-message {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  background: rgba(254, 226, 226, 0.8);
  border-radius: 12px;
  border: 1px solid rgba(252, 165, 165, 0.6);
  align-self: flex-start;
  font-size: 14px;
  color: rgba(185, 28, 28, 0.9);
}

.error-icon {
  color: #ef4444;
}

.retry-btn {
  margin-left: 8px;
  color: rgba(59, 130, 246, 0.9);
  padding: 0;
  font-size: 12px;
}

/* 输入区域 */
.input-container {
  padding: 16px 20px;
  border-top: 1px solid rgba(226, 232, 240, 0.8);
  background: rgba(255, 255, 255, 0.95);
}

.message-input :global(.el-input__wrapper) {
  border-radius: 20px;
  border: 1px solid rgba(226, 232, 240, 0.8);
  transition: all 0.2s ease;
}

.message-input :global(.el-input__wrapper):hover {
  border-color: rgba(59, 130, 246, 0.3);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.05);
}

.send-btn {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  margin-left: 8px;
}

.send-btn :global(.el-icon) {
  font-size: 16px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .smart-assistant-container {
    bottom: 20px;
    right: 20px;
  }

  .assistant-icon {
    width: 50px;
    height: 50px;
  }

  .robot-icon {
    font-size: 24px;
  }

  .assistant-dialog {
    width: 320px;
    max-height: 400px;
  }

  .message-container {
    height: 280px;
    padding: 16px;
  }

  .message-bubble {
    font-size: 13px;
    padding: 8px 12px;
  }
}

@media (max-width: 480px) {
  .assistant-dialog {
    width: 280px;
  }
}
</style>