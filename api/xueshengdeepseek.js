import request from '@/utils/request'
import { useUserStore } from '@/stores'
import { useStudentStore } from '@/stores/modules/xueshenguser'

/**
 * 学生AI问答接口（流式）
 * @param {number} courseId - 课程ID
 * @param {string} prompt - 用户输入的内容
 * @param {function} onData - 数据回调函数，用于处理流式数据
 * @returns {Promise} 返回Promise对象
 */
export const getStudentAIAsk = (courseId, prompt, onData) => {
  return new Promise((resolve, reject) => {
    // 创建EventSource风格的流式请求
    const xhr = new XMLHttpRequest()

    // 构建请求URL
    const url = `${request.defaults.baseURL}/student/course/${courseId}/ai/ask`

    xhr.open('POST', url, true)
    xhr.setRequestHeader('Content-Type', 'application/json')

    // 设置Authorization头
    const userStore = useUserStore()
    const studentStore = useStudentStore()
    if (userStore.token) {
      xhr.setRequestHeader('Authorization', 'Bearer ' + userStore.token)
    } else if (studentStore.token) {
      xhr.setRequestHeader('Authorization', 'Bearer ' + studentStore.token)
    }

    // 设置响应类型为text
    xhr.responseType = 'text'

    // 监听数据接收
    let buffer = ''
    xhr.onreadystatechange = function () {
      console.log('XHR状态变化:', xhr.readyState, '状态:', xhr.status)

      if (xhr.readyState === 3 || xhr.readyState === 4) {
        const newData = xhr.responseText.substring(buffer.length)
        buffer = xhr.responseText

        console.log('收到新数据长度:', newData.length, '总数据长度:', xhr.responseText.length)

        if (newData) {
          console.log('原始新数据:', newData)
          // 处理流式数据
          const lines = newData.split('\n')
          console.log('分割后的行数:', lines.length)

          for (const line of lines) {
            console.log('处理行:', line)
            let dataToParse = line.trim() // Trim the line first

            // Skip empty lines
            if (!dataToParse) {
              console.log('跳过空行')
              continue
            }

            // Use regex replace to remove 'data: ' prefix, handling potential extra spaces
            dataToParse = dataToParse.replace(/^data:\s*/, '')
            console.log('尝试解析的JSON字符串:', dataToParse)

            if (dataToParse && dataToParse !== '[DONE]') {
              try {
                const jsonData = JSON.parse(dataToParse)
                console.log('解析的JSON:', jsonData)
                if (
                  jsonData.choices &&
                  jsonData.choices[0] &&
                  jsonData.choices[0].delta &&
                  jsonData.choices[0].delta.content !== undefined
                ) {
                  const content = jsonData.choices[0].delta.content
                  console.log('提取的content:', content)
                  onData(content)
                } else {
                  console.log('没有找到content字段或content为undefined:', jsonData)
                }
              } catch (error) {
                console.error('处理流式数据时出错:', error, '原始字符串:', dataToParse)
              }
            }
          }
        }
      }
    }

    // 监听请求完成
    xhr.onload = function () {
      console.log('请求完成，状态码:', xhr.status, '完整响应:', xhr.responseText)
      if (xhr.status === 200) {
        resolve()
      } else {
        console.error('请求失败，状态码:', xhr.status, '响应:', xhr.responseText)
        reject(new Error(`请求失败，状态码: ${xhr.status}`))
      }
    }

    // 监听请求错误
    xhr.onerror = function () {
      console.error('网络请求失败')
      reject(new Error('网络请求失败'))
    }

    // 监听请求超时
    xhr.ontimeout = function () {
      console.error('请求超时')
      reject(new Error('请求超时'))
    }

    // 设置超时时间
    xhr.timeout = 30000 // 30秒

    // 发送请求
    const requestBody = JSON.stringify({ prompt })
    console.log('发送AI请求:', { url, prompt, requestBody })
    xhr.send(requestBody)
  })
}
