<script lang="ts" setup>
// import hljs from 'highlight.js'
// import 'highlight.js/styles/default.css';
// import "highlight.js/styles/a11y-dark.css";
// import 'highlight.js/styles/atom-one-dark-reasonable.css'

import { ref, nextTick, computed, watch, onMounted } from 'vue'
import { getDeepSeekReply, getStudentQuestions } from '@/api/deepseek.js'
import { getHistory, setHistory, clearHistory } from '@/stores/modules/deepseek.js'
// import { addMessage } from '../api/deepseekApi'
import { ElMessage } from 'element-plus'
import { useRouter, useRoute } from 'vue-router'

const messages = ref([])
const newMessage = ref('')
const isLoading = ref(false)
const isGenerating = ref(false)
const currentMessageIndex = ref(0)
const messagesContainer = ref(null)

const buton = ref('复制')

const codeList = ref([])

// 学生提问记录相关
const studentQuestions = ref([])
const isLoadingQuestions = ref(false)
const currentPage = ref(1)
const pageSize = ref(10)
const totalQuestions = ref(0)

// 定义组件props
const props = defineProps({
  courseId: {
    type: [String, Number],
    required: true,
  },
})

const router = useRouter()
const route = useRoute()

// 初始化消息
messages.value = getHistory()
if (messages.value.length === 0) {
  messages.value.push({
    content: '欢迎使用 Deep Seek AI智能助手，请在下方输入您想问的！',
    role: 'assistant',
  })
}

// 组件挂载之后
onMounted(() => {
  console.log('🔍 [DeepSeek] onMounted 开始')
  console.log('🔍 当前路由:', window.location.href)
  console.log('🔍 当前历史记录状态:', window.history.state)
  console.log('🔍 [DeepSeek] onMounted 结束')
  // saveConversation()
})

const highlightCode = (content) => {
  // 代码高亮相关正则已移除，避免未使用变量报错
  let result = []

  let newContentList = content.split('```')
  console.log(newContentList, 123)

  newContentList.forEach((item) => {
    if (item !== '') {
      const codeContent = item.trim()

      const highlightedCode = codeContent // 仅做占位，去除高亮

      codeList.value.push({
        code: codeContent,
        index: newContentList.indexOf(item),
      })

      result.push(
        `<pre style="margin-top: 10px;margin-bottom: 10px;position: relative;border-radius:8px;"><button style="position: absolute;top: 10px;right: 10px;cursor: pointer;" id='code${newContentList.indexOf(item)}'>${buton.value}</button><code style="border-radius:8px;" class="hljs">${highlightedCode}</code></pre>`,
      )
    }
  })

  return result.join('')
}

// 添加点击事件
const handleButtonClick = () => {
  codeList.value.forEach((item) => {
    let button = document.getElementById(`code${item.index}`)

    if (button) {
      button.addEventListener('click', () => {
        copyCode(item.code)
      })
    }
  })
}

// 点击复制代码
const copyCode = (codeContent) => {
  navigator.clipboard
    .writeText(codeContent)
    .then(() => {
      console.log('复制成功')
      // buton.value = '已复制'
      ElMessage.success('复制成功')
    })
    .catch((error) => {
      console.error('复制失败:', error)
    })
}

// 自动滚动函数
const scrollToBottom = () => {
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTo({
        top: messagesContainer.value.scrollHeight,
        behavior: 'smooth',
      })
    }
  })
}

const sendMessage = async () => {
  if (newMessage.value.trim()) {
    // 用户提问时打印
    console.log('用户提问：', newMessage.value)
    messages.value.push({ content: newMessage.value, role: 'user' })
    newMessage.value = ''
    isLoading.value = true
    isGenerating.value = true
    currentMessageIndex.value = messages.value.length - 1

    try {
      // 新建 assistant 消息
      const newMessageObj = { content: '', role: 'assistant' }
      messages.value.push(newMessageObj)
      // 真正流式渲染
      await getDeepSeekReply(messages.value, (delta) => {
        newMessageObj.content += delta
        // 触发响应式更新
        messages.value[messages.value.length - 1] = { ...newMessageObj }
        scrollToBottom()
      })
      // AI回复完成后打印
      console.log('AI回复：', newMessageObj.content)
      // 结束后再滚动到底部
      scrollToBottom()
      nextTick(() => {
        handleButtonClick()
      })
    } catch (error) {
      console.error('获取AI回复时出错:', error)
      messages.value.push({
        content: '无法获取AI回复，后端接口无响应或未实现SSE流式推送，请联系后端检查接口实现。',
        role: 'user',
      })
    } finally {
      isLoading.value = false
    }
  }
}

// 保存消息到数据库
// const saveMessageToDatabase = async (messages, status) => {
//   if (!status) {
//     alert('没有会话id')
//     // 结束程序
//     return
//   }
//   try {
//     // const response = await addMessage({ messages, model: 'deepseek', status })
//     console.log('消息保存成功:')
//   } catch (error) {
//     console.error('消息保存失败:', error)
//   }
// }

// 使用 requestAnimationFrame 实现更平滑的逐字输出效果
const typeMessage = (text, message, index = 0) => {
  if (index < text.length && isGenerating.value) {
    message.content += text[index]
    messages.value[messages.value.length - 1] = { ...message }
    requestAnimationFrame(() => {
      typeMessage(text, message, index + 1)
    })
    setTimeout(() => {
      scrollToBottom() // 确保逐字输入后滚动到底部
    }, 1000)
  } else {
    scrollToBottom() // 完成逐字输入后滚动到底部
  }
}

// 监听消息变化自动保存
watch(
  messages,
  (val) => {
    setHistory(val)
  },
  { deep: true },
)

const clearMessages = () => {
  messages.value = []
  clearHistory()
  messages.value.push({
    content: '欢迎使用 Deep Seek AI智能助手，请在下方输入您想问的！',
    role: 'assistant',
  })
}

const dis = computed(() => {
  return !newMessage.value.trim()
})

const diss = computed(() => {
  return !(messages.value.length > 1)
})

defineExpose({ dis, diss })

// 跳转到学生提问记录页面
const goToStudentQuestions = () => {
  // 使用父组件传递的课程ID
  const courseId = props.courseId || route.params.id
  console.log('[DEBUG] 跳转到学生提问记录，课程ID:', courseId)
  router.push(`/student-questions/${courseId}`)
}

// 获取学生提问记录
const fetchStudentQuestions = async () => {
  try {
    isLoadingQuestions.value = true
    // 使用父组件传递的课程ID
    const courseId = props.courseId || route.params.id
    console.log('[DEBUG] 获取学生提问记录，课程ID:', courseId)
    const response = await getStudentQuestions(courseId, currentPage.value, pageSize.value)

    if (response.code === 0 && response.data) {
      studentQuestions.value = response.data.records || []
      totalQuestions.value = response.data.total || 0
      ElMessage.success(`成功获取 ${studentQuestions.value.length} 条学生提问记录`)
    } else {
      ElMessage.error(response.message || '获取学生提问记录失败')
    }
  } catch (error) {
    console.error('获取学生提问记录失败:', error)
    ElMessage.error('获取学生提问记录失败')
  } finally {
    isLoadingQuestions.value = false
  }
}

// 修改消息渲染方式，使用v-html渲染
const renderMessage = (content) => {
  // 如果本身有换行，优先用原有换行
  if (content.includes('\n')) {
    return content.replace(/\n/g, '<br>')
  }
  // 否则每60个字符插入一个<br>
  return content.replace(/(.{60})/g, '$1<br>')
}
</script>
<template>
  <div class="chat-window">
    <div class="chat-content">
      <!-- 顶部导航栏 -->
      <div class="top-nav">
        <!-- <button class="nav-btn active">AI助教</button> -->
        <!-- <button class="nav-btn">资料助手</button> -->
        <!-- <button class="nav-btn">AI学情分析</button> -->
      </div>
      <!-- 欢迎区和功能卡片 -->
      <div class="welcome-section">
        <div class="welcome-header">
          <div class="welcome-content">
            <div class="welcome-title">我是AI助教</div>
            <div class="welcome-desc">
              我可以帮你解答学习疑惑，也能做做伴伴和打鸡血
              <span style="font-size: 18px">😊</span>
            </div>
          </div>
          <!-- 右上角按钮 -->
          <div class="top-right-button">
            <el-button
              type="primary"
              @click="goToStudentQuestions"
              size="default"
              class="fetch-records-btn"
            >
              获取学生记录
            </el-button>
          </div>
        </div>
        <div class="card-row">
          <div class="info-card">
            <div class="info-card-title">学习资料</div>
            <div class="info-card-desc">获取课程内容，高效获取知识</div>
          </div>
          <div class="info-card">
            <div class="info-card-title">资源推荐</div>
            <div class="info-card-desc">海量资源推荐，一键直达</div>
          </div>
        </div>
        <!-- 记录信息显示 -->
        <div v-if="studentQuestions.length > 0" class="records-info">
          共获取到 {{ totalQuestions }} 条记录，当前显示 {{ studentQuestions.length }} 条
        </div>
      </div>
      <!-- 聊天消息区 -->
      <!-- <div class="messages">
        <div
          v-for="(message, index) in messages"
          :key="index"
          class="message"
          :class="{
            'ai-message': message.role === 'user' || message.role === 'system',
            'user-message': message.role === 'assistant',
          }"
        > -->
      <!-- 修改消息渲染 -->
      <div class="messages" ref="messagesContainer">
        <div
          v-for="(message, index) in messages"
          :key="index"
          class="message"
          :class="{
            'ai-message': message.role === 'assistant',
            'user-message': message.role === 'user',
          }"
        >
          <img
            v-if="message.role === 'user' || message.role === 'system'"
            src="@/assets/小狗.jpeg"
            alt="User Avatar"
            class="avatar"
          />
          <!-- <div class="message-content">
            <div v-html="message.content" class="content"></div>
          </div> -->
          <div class="message-content">
            <!-- 使用v-html渲染格式化后的消息 -->
            <div v-html="renderMessage(message.content)" class="content"></div>
          </div>
          <img
            v-if="message.role === 'assistant'"
            src="@/assets/ai.jpg"
            alt="AI Avatar"
            class="avatar"
          />
        </div>
        <div v-if="isLoading" class="loading">正在加载...</div>

        <!-- 学生提问记录展示区域 -->
        <div v-if="studentQuestions.length > 0" class="student-questions-section">
          <h3 class="questions-title">学生提问记录</h3>
          <div class="questions-list">
            <div
              v-for="(question, index) in studentQuestions"
              :key="question.id || index"
              class="question-item"
            >
              <div class="question-header">
                <span class="student-name">{{ question.studentName || '未知学生' }}</span>
                <span class="question-time">{{ question.questionTime || '未知时间' }}</span>
              </div>
              <div class="question-content">
                <strong>问题：</strong>{{ question.questionContent || '无内容' }}
              </div>
              <div v-if="question.aiAnswer" class="ai-answer">
                <strong>AI回答：</strong>{{ question.aiAnswer }}
              </div>
            </div>
          </div>
        </div>
      </div>
      <!-- 输入区 -->
      <div class="input-area">
        <input v-model="newMessage" @keyup.enter="sendMessage" placeholder="请输入你的问题" />
        <el-button type="primary" @click="sendMessage" :disabled="dis" :Loading="isLoading"
          >发送</el-button
        >
        <el-button type="info" @click="clearMessages" :disabled="diss">清空</el-button>
      </div>
    </div>
  </div>
</template>
<style scoped>
/* 整体背景和居中 */
.chat-window {
  width: 100%;
  min-height: 100%;
  background: transparent;
  display: block;
  padding: 0;
}

/* 聊天内容主卡片 */
.chat-content {
  width: 90vw; /* 原60vw，改为90vw更宽 */
  min-height: 600px;
  background: #fff;
  border-radius: 0;
  box-shadow: none;
  padding: 0 0 100px 0;
  margin-top: 0;
  display: flex;
  flex-direction: column;
  position: relative;
  border: none;
  margin-left: auto;
  margin-right: auto;
}

/* 顶部导航栏 */
.top-nav {
  width: 100%;
  background: transparent;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  padding: 32px 40px 0 40px;
  gap: 24px;
}
.top-nav .nav-btn {
  background: #f6faff;
  color: #1677ff;
  border: none;
  border-radius: 18px;
  font-size: 16px;
  font-weight: 500;
  padding: 8px 28px;
  margin-right: 8px;
  cursor: pointer;
  transition: background 0.2s;
}
.top-nav .nav-btn.active {
  background: #1677ff;
  color: #fff;
}

/* 欢迎语和分区卡片 */
.welcome-section {
  padding: 0 40px 0 40px;
  margin-top: 18px;
}

.welcome-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 18px;
  position: relative;
}

.welcome-content {
  flex: 1;
  margin-right: 120px; /* 为按钮预留空间 */
}

.welcome-title {
  font-size: 22px;
  font-weight: 700;
  color: #1677ff;
  margin-bottom: 8px;
}

.welcome-desc {
  font-size: 15px;
  color: #666;
  margin-bottom: 18px;
}

.top-right-button {
  position: absolute;
  top: 4px;
  right: 400px; /* 从最右边往左移动 */
  z-index: 10;
}

.fetch-records-btn {
  border-radius: 8px !important;
  font-size: 20px !important;
  padding: 12px 24px !important;
  min-width: 140px !important;
  height: 40px !important;
  font-weight: 600 !important;
}

/* 确保按钮文字样式生效 */
.fetch-records-btn .el-button__content {
  font-size: 20px !important;
  font-weight: 600 !important;
}
.card-row {
  display: flex;
  gap: 18px;
  margin-bottom: 18px;
}
.info-card {
  flex: 1;
  background: #f6faff;
  border-radius: 16px;
  box-shadow: 0 2px 8px rgba(22, 119, 255, 0.04);
  padding: 18px 20px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  min-width: 0;
}
.info-card-title {
  font-size: 16px;
  font-weight: 600;
  color: #222;
  margin-bottom: 8px;
}
.info-card-desc {
  font-size: 14px;
  color: #888;
}

/* 聊天消息区 */
.messages {
  flex: 1;
  overflow-y: auto;
  margin: 0 2vw 0 2vw; /* 原40px，改为vw自适应 */
  padding: 0;
  max-height: 60vh; /* 原320px，改为更高 */
  min-height: 120px;
  scrollbar-width: thin;
  scrollbar-color: #e0e0e0 #fff;
  /* overflow-x: hidden; */
}
.messages::-webkit-scrollbar {
  width: 6px;
}
.messages::-webkit-scrollbar-thumb {
  background: #e0e0e0;
  border-radius: 6px;
}

/* 单条消息气泡 */
.message {
  display: flex;
  align-items: flex-end;
  margin-bottom: 18px;
}
.ai-message {
  flex-direction: row;
  justify-content: flex-start;
}
.user-message {
  flex-direction: row-reverse;
  justify-content: flex-end;
}
.avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  margin: 0 10px;
  box-shadow: 0 2px 8px rgba(22, 119, 255, 0.1);
  background: #f0f6ff;
  object-fit: cover;
}
.message-content {
  max-width: 70vw;
  min-width: 80px;
  word-break: break-all;
  overflow-wrap: break-word;
  white-space: pre-line;
  background: #f6f8fa;
  color: #222;
  border-radius: 18px;
  font-size: 16px;
  line-height: 1.7;
  box-shadow: 0 2px 12px rgba(22, 119, 255, 0.06);
  margin: 0 6px;
  padding: 14px 18px;
  overflow-x: auto; /* 防止超长内容撑破气泡 */
}
.ai-message .message-content {
  background: #f6f8fa;
  color: #222;
  border-bottom-left-radius: 6px;
  border-top-left-radius: 6px;
  border-top-right-radius: 18px;
  border-bottom-right-radius: 18px;
}
.user-message .message-content {
  background: linear-gradient(90deg, #1677ff 0%, #69b1ff 100%);
  color: #fff;
  border-bottom-right-radius: 6px;
  border-top-right-radius: 6px;
  border-top-left-radius: 18px;
  border-bottom-left-radius: 18px;
}

.message-content pre,
.message-content code {
  white-space: pre;
  word-break: normal;
  overflow-x: auto;
  max-width: 100%;
  display: block;
}

.message-content pre {
  background: #f6f8fa;
  border-radius: 8px;
  padding: 12px 16px;
  margin: 10px 0;
  font-size: 12px;
}

.message-content code {
  background: #f0f0f0;
  border-radius: 4px;
  padding: 2px 4px;
  font-size: 12px;
}

.message-content button {
  position: absolute;
  top: 10px;
  right: 10px;
  cursor: pointer;
  z-index: 2;
}

/* 输入区悬浮在底部 */
.input-area {
  width: 80vw; /* 原60%，改为80vw更宽 */
  min-width: 360px;
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  gap: 12px;
  align-items: center;
  background: #fff;
  padding: 18px 2vw;
  border-radius: 0 0 24px 24px;
  box-shadow: 0 -2px 12px rgba(22, 119, 255, 0.04);
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  border-top: 1.5px solid #f0f0f0;
}
input {
  flex: 1;
  padding: 12px 16px;
  border: 1.5px solid #e0e0e0;
  border-radius: 14px;
  font-size: 16px;
  outline: none;
  transition: border-color 0.2s;
  background: #f6faff;
  box-shadow: 0 1px 4px rgba(22, 119, 255, 0.03);
}
input:focus {
  border-color: #1677ff;
}
.el-button {
  border-radius: 12px !important;
  font-size: 12px;
  padding: 8px 18px;
  min-width: 64px;
  margin-left: 0;
  box-shadow: 0 1px 4px rgba(22, 119, 255, 0.04);
  border: none;
}
.el-button--primary {
  background: linear-gradient(90deg, #1677ff 0%, #69b1ff 100%);
  color: #fff;
  border: none;
}
.el-button--info {
  background: #f0f6ff;
  color: #1677ff;
  border: none;
}
.loading {
  text-align: center;
  color: #999;
  margin-top: 10px;
  font-size: 12px;
}
.content {
  line-height: 1.8;
  font-size: 16px;
  font-weight: 400;
  color: #333;
  word-break: break-all;
  white-space: pre-wrap;
  margin-bottom: 5px;
}

/* 响应式适配 */
@media (max-width: 900px) {
  .chat-content {
    width: 98vw;
    min-width: 0;
    padding: 0 0 80px 0;
  }
  .input-area {
    padding: 10px 2vw;
    width: 98vw;
  }
  .messages {
    min-height: 120px;
    max-height: 30vh;
    margin: 0 2vw 0 2vw;
  }
  .top-nav,
  .welcome-section {
    padding-left: 2vw;
    padding-right: 2vw;
  }
  .message-content {
    max-width: 98vw !important;
  }
}
/* 确保消息内容自动换行 */
.message-content {
  max-width: 100% !important; /* 确保不超过容器宽度 */
  word-wrap: break-word; /* 允许长单词换行 */
  white-space: pre-wrap; /* 保留空白符但允许换行 */
}

/* 修复代码块样式 */
.message-content pre {
  background: #2d2d2d;
  color: #f8f8f2;
  padding: 10px;
  border-radius: 5px;
  overflow-x: auto; /* 允许横向滚动 */
  max-width: 100%; /* 不超过容器宽度 */
  margin: 10px 0;
}

.message-content code {
  font-family: 'Courier New', monospace;
  font-size: 14px;
  line-height: 1.5;
}

/* 修复用户消息样式 */
.user-message .message-content {
  max-width: 60%; /* 限制最大宽度 */
}

/* 响应式调整 */
@media (max-width: 768px) {
  .message {
    flex-direction: column;
    align-items: flex-start;
  }

  .user-message {
    align-items: flex-end;
  }

  .avatar {
    margin-bottom: 8px;
  }

  .message-content,
  .content {
    max-width: 98vw !important;
  }

  .input-area {
    width: 90%;
    min-width: 0;
    padding: 10px;
  }

  input {
    width: 100%;
  }
}

/* 添加代码块滚动条样式 */
.message-content pre::-webkit-scrollbar {
  height: 6px;
}

.message-content pre::-webkit-scrollbar-thumb {
  background: #555;
  border-radius: 3px;
}

/* 确保内容区域自适应 */
.content {
  line-height: 1.6;
  font-size: 16px;
}
.message-content,
.content {
  max-width: 85vw !important;
  word-break: break-all;
  overflow-wrap: break-word;
  white-space: pre-line;
  font-size: 15px !important;
}

@media (max-width: 768px) {
  .message-content,
  .content {
    max-width: 180vw !important;
    font-size: 10px !important;
  }
}
.message-content,
.content {
  max-width: 85vw !important;
  word-break: break-all !important;
  overflow-wrap: break-word !important;
  white-space: pre-line !important;
  font-size: 15px !important;
}

/* 学生提问记录相关样式 */
.records-info {
  font-size: 14px;
  color: #666;
  margin-top: 8px;
  text-align: center;
  padding: 8px;
  background: #f0f6ff;
  border-radius: 6px;
  border: 1px solid #d6e4ff;
}

.student-questions-section {
  margin: 20px 2vw;
  padding: 20px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border: 1px solid #e9ecef;
}

.questions-title {
  font-size: 18px;
  font-weight: 600;
  color: #1677ff;
  margin-bottom: 16px;
  padding-bottom: 8px;
  border-bottom: 2px solid #e9ecef;
}

.questions-list {
  max-height: 400px;
  overflow-y: auto;
}

.question-item {
  padding: 16px;
  margin-bottom: 12px;
  background: #f8f9fa;
  border-radius: 8px;
  border-left: 4px solid #1677ff;
}

.question-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  font-size: 14px;
}

.student-name {
  font-weight: 600;
  color: #1677ff;
}

.question-time {
  color: #666;
  font-size: 12px;
}

.question-content {
  margin-bottom: 8px;
  line-height: 1.5;
  color: #333;
}

.ai-answer {
  padding: 8px 12px;
  background: #e8f4fd;
  border-radius: 6px;
  margin-top: 8px;
  line-height: 1.5;
  color: #2c5aa0;
  border-left: 3px solid #1677ff;
}
</style>
