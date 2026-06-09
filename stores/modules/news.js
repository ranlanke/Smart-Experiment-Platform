import { defineStore } from 'pinia'
import axios from 'axios'

export const useNewsStore = defineStore('news', {
  state: () => ({
    newsList: [], // 用于存储新闻列表
    loading: false, // 加载状态
    error: null, // 错误信息
  }),
  actions: {
    // 发布新闻
    async publishNews(newsData) {
      this.loading = true
      this.error = null
      try {
        // 假设您的后端发布内容的API地址是 /api/news/publish
        const response = await axios.post('/api/news/publish', newsData)
        // 发布成功后，如果需要，可以更新newsList
        // this.newsList.push(response.data)
        return response.data
      } catch (err) {
        this.error = '发布新闻失败: ' + err.message
        console.error('发布新闻失败:', err)
        throw err // 抛出错误以便组件处理
      } finally {
        this.loading = false
      }
    },

    // 获取新闻列表 (暂时不使用，但保留在store中)
    async fetchNews() {
      this.loading = true
      this.error = null
      try {
        const response = await axios.get('/api/news') // 假设获取新闻列表的API地址是 /api/news
        this.newsList = response.data
      } catch (err) {
        this.error = '获取新闻列表失败: ' + err.message
        console.error('获取新闻列表失败:', err)
        throw err // 抛出错误以便组件处理
      } finally {
        this.loading = false
      }
    },
  },
})
