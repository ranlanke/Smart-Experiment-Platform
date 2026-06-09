// AI助手流式聊天接口
// POST /api/ai/stream-chat
// Event-Stream 方式

import request from '@/utils/request'
import { useUserStore } from '@/stores'
import { useStudentStore } from '@/stores/modules/xueshenguser'

// 获取当前用户的认证token
const getAuthToken = () => {
  const userStore = useUserStore()
  const studentStore = useStudentStore()
  if (userStore.token) {
    return 'Bearer ' + userStore.token
  } else if (studentStore.token) {
    return 'Bearer ' + studentStore.token
  }
  return null
}

// 新的流式实现，支持 onDelta 回调
export async function getDeepSeekReply(messages, onDelta) {
  const lastUserMsg = messages
    .slice()
    .reverse()
    .find((m) => m.role === 'user')
  const prompt = lastUserMsg ? lastUserMsg.content : ''
  if (!prompt) throw new Error('没有用户输入内容')

  const authToken = getAuthToken()
  if (!authToken) {
    throw new Error('用户未登录，请先登录')
  }

  const res = await fetch('/api/api/ai/stream-chat', {
    method: 'POST',
    headers: {
      Authorization: authToken,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ prompt }),
  })
  if (!res.ok) throw new Error('接口请求失败')

  const reader = res.body.getReader()
  let content = ''
  let decoder = new TextDecoder('utf-8')
  let buffer = ''
  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    buffer += decoder.decode(value, { stream: true })
    let lines = buffer.split('\n')
    buffer = lines.pop() // 最后一行可能是不完整的，留到下次
    for (const line of lines) {
      if (line.startsWith('data:')) {
        const dataStr = line.replace(/^data:/, '').trim()
        if (dataStr === '[DONE]' || !dataStr) continue
        try {
          const dataObj = JSON.parse(dataStr)
          if (dataObj.choices && dataObj.choices[0] && dataObj.choices[0].delta) {
            const delta = dataObj.choices[0].delta.content || ''
            content += delta
            if (onDelta) onDelta(delta)
          }
        } catch (e) {
          // 忽略解析失败的行
        }
      }
    }
  }
  return { content }
}

/**
 * 获取课程下的学生提问记录
 * @param {number} courseId - 课程ID
 * @param {number} page - 页码
 * @param {number} size - 每页大小
 * @returns {Promise} 返回Promise对象
 */
export async function getStudentQuestions(courseId, page = 1, size = 10) {
  try {
    console.log('调用学生提问记录API，参数:', { courseId, page, size })

    // 使用统一的request实例，它会自动处理认证
    const response = await request({
      url: `/teacher/course/${courseId}/questions`,
      method: 'GET',
      params: {
        page,
        size,
      },
    })

    console.log('API响应数据:', response)
    return response.data
  } catch (error) {
    console.error('获取学生提问记录失败:', error)
    throw new Error('获取学生提问记录失败')
  }
}
