import { defineStore } from 'pinia'

// 定义一个名为homework的store
export const useHomeworkStore = defineStore('homework', {
  // 定义状态
  state: () => ({
    // 存储作业草稿 - 修改为对象，键为课程ID
    drafts: {},
    // 存储已经发布的作业列表
    publishedHomework: [],
    // 当前正在编辑的作业
    currentHomework: null,
  }),

  // 定义getters
  getters: {
    // 获取特定课程的作业草稿
    getHomeworkDraft: (state) => (courseId) => {
      return state.drafts[courseId] || []
    },

    // 获取已发布作业 - 可以根据课程ID过滤
    getPublishedHomework: (state) => (courseId) => {
      if (courseId) {
        return state.publishedHomework.filter((hw) => hw.courseId === courseId)
      }
      return state.publishedHomework
    },

    // 获取当前正在编辑的作业
    getCurrentHomework: (state) => state.currentHomework,

    // 为了向后兼容，保留原来的favoriteList getter
    favoriteList: (state) => {
      // 这里返回最后一个编辑的草稿，或空数组
      const courseIds = Object.keys(state.drafts)
      if (courseIds.length > 0) {
        const lastCourseId = courseIds[courseIds.length - 1]
        return state.drafts[lastCourseId] || []
      }
      return []
    },
  },

  // 定义actions
  actions: {
    // 保存特定课程的作业草稿
    saveHomeworkDraft(newList, courseId) {
      if (!courseId) {
        console.warn('保存草稿时未指定courseId')
        return
      }

      this.drafts[courseId] = newList
      console.log(`课程${courseId}的作业草稿已保存`, newList)
    },

    // 发布作业
    publishHomework(homework, courseId) {
      // 为作业添加唯一ID和发布时间
      const newHomework = {
        ...homework,
        id: Date.now().toString(),
        publishTime: new Date().toISOString(),
        courseId: courseId,
      }
      this.publishedHomework.push(newHomework)

      // 发布后清空该课程的草稿
      if (courseId) {
        this.drafts[courseId] = []
      }

      return newHomework.id
    },

    // 设置当前正在编辑的作业
    setCurrentHomework(homework) {
      this.currentHomework = homework
    },

    // 删除已发布作业
    deleteHomework(homeworkId) {
      const index = this.publishedHomework.findIndex((hw) => hw.id === homeworkId)
      if (index !== -1) {
        this.publishedHomework.splice(index, 1)
        return true
      }
      return false
    },

    // 更新已发布作业
    updateHomework(homeworkId, updatedData) {
      const index = this.publishedHomework.findIndex((hw) => hw.id === homeworkId)
      if (index !== -1) {
        this.publishedHomework[index] = {
          ...this.publishedHomework[index],
          ...updatedData,
          updateTime: new Date().toISOString(),
        }
        return true
      }
      return false
    },

    // 清理指定课程的草稿
    clearDraftByCourseId(courseId) {
      if (courseId && this.drafts[courseId]) {
        delete this.drafts[courseId]
        console.log(`已清理课程${courseId}的草稿`)
      }
    },

    // 清理所有草稿
    clearAllDrafts() {
      this.drafts = {}
      console.log('已清理所有草稿')
    },

    // 清理过期的已发布作业（超过90天）
    clearExpiredPublishedHomework() {
      const ninetyDaysAgo = new Date()
      ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90)

      this.publishedHomework = this.publishedHomework.filter((hw) => {
        if (!hw.publishTime) return true // 保留没有发布时间的
        return new Date(hw.publishTime) > ninetyDaysAgo
      })

      console.log('已清理过期的已发布作业')
    },

    // 清理指定课程的已发布作业
    clearPublishedHomeworkByCourseId(courseId) {
      this.publishedHomework = this.publishedHomework.filter((hw) => hw.courseId !== courseId)
    },
  },
})
