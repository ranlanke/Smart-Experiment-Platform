import { defineStore } from 'pinia'

// 定义班级管理相关的store
export const useClassStore = defineStore('class-store', {
  // 定义状态
  state: () => {
    // 尝试从localStorage读取持久化数据
    const storedClasses = localStorage.getItem('class-list')

    return {
      // 班级列表，如果localStorage中有数据则使用，否则使用空数组
      classList: storedClasses ? JSON.parse(storedClasses) : [],
      // 当前选中的班级
      currentClass: null,
    }
  },

  // 定义getters
  getters: {
    // 获取所有班级列表
    getClassList: (state) => state.classList,

    // 获取特定课程的班级列表
    getClassesByCourseId: (state) => (courseId) => {
      // 强制转字符串比较，避免类型不一致导致无法过滤
      return state.classList.filter((cls) => String(cls.courseId) === String(courseId))
    },

    // 获取当前选中的班级
    getCurrentClass: (state) => state.currentClass,
  },

  // 定义actions
  actions: {
    // 添加新班级
    addClass(classData) {
      // 确保有courseId
      if (!classData.courseId) {
        console.error('添加班级失败：未指定课程ID')
        return false
      }

      // 添加到班级列表
      this.classList.push(classData)

      // 保存到localStorage
      this.persistClassList()

      return true
    },

    // 更新班级信息
    updateClass(classIdOrObj, classDataMaybe) {
      let classId, classData
      if (typeof classIdOrObj === 'object' && classIdOrObj !== null) {
        classId = classIdOrObj.id
        classData = classIdOrObj
      } else {
        classId = classIdOrObj
        classData = classDataMaybe
      }
      const index = this.classList.findIndex((cls) => cls.id === classId)
      if (index !== -1) {
        this.classList[index] = {
          ...this.classList[index],
          ...classData,
          updateTime: new Date().toISOString(),
        }
        this.persistClassList()
        // 关键：强制替换引用，确保响应式
        this.classList = [...this.classList]
        console.log('store updateClass后最新classList:', this.classList)
        return true
      }
      return false
    },

    // 删除班级
    deleteClass(classId) {
      const index = this.classList.findIndex((cls) => cls.id === classId)
      if (index !== -1) {
        this.classList.splice(index, 1)

        // 保存到localStorage
        this.persistClassList()

        return true
      }
      return false
    },

    // 设置当前选中的班级
    setCurrentClass(classData) {
      this.currentClass = classData
    },

    // 将班级列表持久化到localStorage
    persistClassList() {
      localStorage.setItem('class-list', JSON.stringify(this.classList))
    },

    // 从后端API加载班级列表并更新store
    async loadClassesFromAPI(courseId, apiFunction) {
      try {
        const response = await apiFunction(courseId)
        if (response && response.data && response.data.data) {
          // 获取新的班级列表
          const newClasses = response.data.data

          // 将新班级添加到store，并保留与当前课程无关的班级
          const otherClasses = this.classList.filter((cls) => cls.courseId !== courseId)

          // 为新班级添加courseId
          const classesWithCourseId = newClasses.map((cls) => ({
            ...cls,
            courseId: courseId,
          }))

          // 合并其他课程的班级和当前课程的班级
          this.classList = [...otherClasses, ...classesWithCourseId]

          // 保存到localStorage
          this.persistClassList()

          return true
        }
        return false
      } catch (error) {
        console.error('从API加载班级列表失败:', error)
        return false
      }
    },

    // 清理指定课程ID的班级数据
    clearClassesByCourseId(courseId) {
      this.classList = this.classList.filter((cls) => cls.courseId !== courseId)
      this.persistClassList()
    },

    // 清理所有班级数据
    clearAllClasses() {
      this.classList = []
      this.currentClass = null
      localStorage.removeItem('class-list')
    },

    // 清理过期的班级数据（超过30天未更新的）
    clearExpiredClasses() {
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

      this.classList = this.classList.filter((cls) => {
        if (!cls.updateTime) return true // 保留没有更新时间的
        return new Date(cls.updateTime) > thirtyDaysAgo
      })

      this.persistClassList()
    },
  },
})
