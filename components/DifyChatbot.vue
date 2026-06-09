<template>
  <div>
    <!-- 自定义关闭按钮 -->
    <div id="custom-chatbot-close" class="custom-close-button" style="display: none">×</div>
  </div>
</template>

<script setup>
import { onMounted, onUnmounted, watch } from 'vue'
import { useRoute } from 'vue-router'

// 获取当前路由
const route = useRoute()

// 配置 Dify Chatbot
window.difyChatbotConfig = {
  token: 'ePnbLR9oN5xtMsaC',
  baseUrl: 'http://192.168.1.224',
}

// 不需要显示AI助手的路径列表
const hideInPaths = [
  '/', // ShouYe.vue
  '/login', // LoginPage.vue
  '/teacher', // LaoshiDlu.vue
  '/student', // XueshengDlu.vue
  '/house', // 学生端首页
  '/home', // 教师端首页
]

// 用于控制AI助手显示/隐藏的函数
function toggleChatbot(show) {
  console.log('切换AI助手显示状态:', show ? '显示' : '隐藏', '当前路径:', route.path)

  const bubbleButton = document.getElementById('dify-chatbot-bubble-button')
  const bubbleWindow = document.getElementById('dify-chatbot-bubble-window')
  const customCloseButton = document.getElementById('custom-chatbot-close')

  if (bubbleButton) {
    bubbleButton.style.display = show ? 'block' : 'none'
  }

  if (bubbleWindow) {
    bubbleWindow.style.display = 'none' // 总是隐藏窗口，防止页面切换时窗口依然显示
    if (customCloseButton) {
      customCloseButton.style.display = 'none' // 同时隐藏自定义关闭按钮
    }
  }
}

// 检查当前页面是否应该显示AI助手
function shouldShowChatbot() {
  // 精确匹配路径
  if (hideInPaths.includes(route.path)) {
    console.log('路径精确匹配，隐藏AI助手:', route.path)
    return false
  }

  // 检查是否是hideInPaths中任何路径的子路径
  for (const path of hideInPaths) {
    // 如果当前路径以某个隐藏路径开头，则不显示AI助手
    // 例如：如果hideInPaths包含'/home'，那么'/home/kechenguangli'也应该隐藏AI助手
    if (path !== '/' && route.path.startsWith(path + '/')) {
      console.log('路径前缀匹配，隐藏AI助手:', route.path, '匹配前缀:', path)
      return false
    }
  }

  console.log('显示AI助手，当前路径:', route.path)
  return true
}

// 动态加载外部脚本
function loadScript(src) {
  return new Promise((resolve, reject) => {
    // 检查是否已经加载过脚本
    if (document.getElementById('dify-chatbot-script')) {
      resolve()
      return
    }

    const script = document.createElement('script')
    script.src = src
    script.id = 'dify-chatbot-script'
    script.defer = true
    script.onload = () => {
      // 确保脚本加载完成后再解析
      setTimeout(resolve, 100)
    }
    script.onerror = reject
    document.head.appendChild(script)
  })
}

// 监听路由变化
watch(
  () => route.path,
  (newPath) => {
    console.log('路由变化:', newPath)
    toggleChatbot(shouldShowChatbot())
  },
)

// 关闭聊天窗口的函数
function closeChatWindow() {
  const bubbleWindow = document.getElementById('dify-chatbot-bubble-window')
  const customCloseButton = document.getElementById('custom-chatbot-close')

  if (bubbleWindow) {
    // 通过JS设置内联样式，覆盖CSS中的!important
    bubbleWindow.setAttribute('style', 'display: none !important')
    console.log('关闭聊天窗口')
  }

  if (customCloseButton) {
    customCloseButton.style.display = 'none'
  }
}

// 监听聊天窗口的变化
function watchChatWindow() {
  const customCloseButton = document.getElementById('custom-chatbot-close')
  const bubbleButton = document.getElementById('dify-chatbot-bubble-button')

  // 给气泡按钮添加点击事件，显示自定义关闭按钮
  if (bubbleButton && !bubbleButton._hasClickListener) {
    bubbleButton._hasClickListener = true
    bubbleButton._clickHandler = () => {
      // 等待聊天窗口打开
      setTimeout(() => {
        const bubbleWindow = document.getElementById('dify-chatbot-bubble-window')
        if (bubbleWindow && getComputedStyle(bubbleWindow).display !== 'none') {
          // 显示自定义关闭按钮
          if (customCloseButton) {
            customCloseButton.style.display = 'flex'

            // 调整自定义关闭按钮的位置与聊天窗口对齐
            const rect = bubbleWindow.getBoundingClientRect()
            customCloseButton.style.top = `${rect.top + 15}px`
            customCloseButton.style.left = `${rect.left + 15}px`
          }
        }
      }, 300)
    }
    bubbleButton.addEventListener('click', bubbleButton._clickHandler)
  }

  // 使用 requestAnimationFrame 替代 setInterval
  let animationFrameId
  function checkChatWindow() {
    const bubbleWindow = document.getElementById('dify-chatbot-bubble-window')
    if (bubbleWindow && customCloseButton) {
      if (getComputedStyle(bubbleWindow).display !== 'none') {
        // 聊天窗口打开时，显示自定义关闭按钮
        customCloseButton.style.display = 'flex'

        // 调整自定义关闭按钮的位置与聊天窗口对齐
        const rect = bubbleWindow.getBoundingClientRect()
        customCloseButton.style.top = `${rect.top + 15}px`
        customCloseButton.style.left = `${rect.left + 15}px`
      } else {
        // 聊天窗口关闭时，隐藏自定义关闭按钮
        customCloseButton.style.display = 'none'
      }
    }
    animationFrameId = requestAnimationFrame(checkChatWindow)
  }

  animationFrameId = requestAnimationFrame(checkChatWindow)

  // 返回清理函数
  return () => {
    if (animationFrameId) {
      cancelAnimationFrame(animationFrameId)
    }
  }
}

// 在组件挂载时加载脚本
onMounted(() => {
  console.log('DifyChatbot组件已挂载，当前路径:', route.path)
  console.log('AI助手初始显示状态:', shouldShowChatbot() ? '显示' : '隐藏')

  // 设置自定义关闭按钮的点击事件
  const customCloseButton = document.getElementById('custom-chatbot-close')
  if (customCloseButton) {
    customCloseButton.addEventListener('click', closeChatWindow)
  }

  loadScript('http://192.168.1.224/embed.min.js')
    .then(() => {
      console.log('Dify Chatbot loaded successfully')
      // 注入自定义样式
      const style = document.createElement('style')
      style.setAttribute('data-dify-chatbot-style', '')
      style.innerHTML = `
        #dify-chatbot-bubble-button {
          background-color: #1c64f2 !important;
          z-index: 100000 !important;
          position: fixed !important;
          bottom: 20px !important;
          right: 20px !important;
          display: block !important;
        }
        #dify-chatbot-bubble-window {
          width: 24rem !important;
          height: 40rem !important;
          z-index: 99999 !important;
          position: fixed !important;
          bottom: 90px !important;
          right: 20px !important;
        }

        /* 自定义关闭按钮样式 */
        .custom-close-button {
          position: fixed;
          width: 28px;
          height: 28px;
          background-color: #f56c6c;
          color: white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 22px;
          cursor: pointer;
          z-index: 1000000;
          box-shadow: 0 2px 8px rgba(0,0,0,0.2);
          transition: all 0.2s;
          user-select: none;
        }

        .custom-close-button:hover {
          background-color: #e64242;
          transform: scale(1.1);
        }
      `
      document.head.appendChild(style)

      // 根据当前路由决定是否显示AI助手
      // 增加延迟确保DOM已经完全加载
      setTimeout(() => {
        try {
          const shouldShow = shouldShowChatbot()
          console.log('设置AI助手初始状态:', shouldShow ? '显示' : '隐藏')
          toggleChatbot(shouldShow)

          // 启动聊天窗口监听
          const cleanup = watchChatWindow()

          // 在组件卸载时清理
          onUnmounted(() => {
            if (cleanup) cleanup()
          })
        } catch (err) {
          console.error('设置AI助手状态失败:', err)
        }
      }, 1000)
    })
    .catch((err) => console.error('Failed to load Dify Chatbot:', err))
})

// 组件卸载时隐藏AI助手
onUnmounted(() => {
  console.log('DifyChatbot组件卸载')

  // 清理所有事件监听器
  const bubbleButton = document.getElementById('dify-chatbot-bubble-button')
  const customCloseButton = document.getElementById('custom-chatbot-close')

  if (bubbleButton) {
    bubbleButton.removeEventListener('click', bubbleButton._clickHandler)
    delete bubbleButton._clickHandler
    delete bubbleButton._hasClickListener
  }

  if (customCloseButton) {
    customCloseButton.removeEventListener('click', closeChatWindow)
  }

  // 移除脚本
  const script = document.getElementById('dify-chatbot-script')
  if (script) {
    script.remove()
  }

  // 移除样式
  const style = document.querySelector('style[data-dify-chatbot-style]')
  if (style) {
    style.remove()
  }

  // 移除聊天窗口和按钮
  const bubbleWindow = document.getElementById('dify-chatbot-bubble-window')
  if (bubbleWindow) {
    bubbleWindow.remove()
  }

  if (bubbleButton) {
    bubbleButton.remove()
  }

  if (customCloseButton) {
    customCloseButton.remove()
  }
})
</script>

<style scoped>
.custom-close-button {
  display: none !important;
}
</style>
