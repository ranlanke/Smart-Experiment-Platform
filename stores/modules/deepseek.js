// 聊天记录本地持久化工具

const STORAGE_KEY = 'deepseek_chat_history'

export function getHistory() {
  const history = localStorage.getItem(STORAGE_KEY)
  if (history) {
    try {
      return JSON.parse(history)
    } catch {
      return []
    }
  }
  return []
}

export function setHistory(messages) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(messages))
}

export function clearHistory() {
  localStorage.removeItem(STORAGE_KEY)
}
