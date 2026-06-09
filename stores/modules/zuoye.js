import { defineStore } from 'pinia'
import {
  createHomeworkService,
  getHomeworkClassListService,
  getHomeworkListService,
  extendHomeworkDeadlineService,
  deleteHomeworkService,
  getHomeworkSubmissionsService,
  gradeSingleHomeworkService,
  getUnsubmittedStudentsService,
  batchGradeHomeworkService,
  getHomeworkSubmissionDetailService,
  extendUnsubmittedHomeworkDeadlineService,
  getHomeworkExtensionInfoService,
} from '@/api/zuoye'

export const useZuoyeStore = defineStore('zuoye', {
  state: () => ({
    classList: [], // 班级列表
    homeworkList: [], // 作业列表
    homeworkTotal: 0, // 作业总数
    studentSubmissions: [],
    studentSubmissionsTotal: 0,
    unsubmittedStudents: [],
  }),

  actions: {
    // 创建作业
    async createHomework(courseId, homeworkData) {
      const res = await createHomeworkService(courseId, homeworkData)
      return res.data
    },

    // 获取班级列表 (用于作业发布)
    async getClassList(courseId) {
      console.log('【DEBUG】正在获取课程ID为', courseId, '的班级列表')
      try {
        const res = await getHomeworkClassListService(courseId)
        console.log('【DEBUG】获取班级列表API响应数据:', res.data)
        // 后端返回的数据结构是一个数组，每个元素有id和className字段
        // 我们需要将其映射成el-select option需要的value(id)和label(className)格式
        this.classList = res.data.data.map((item) => ({
          id: item.id,
          name: item.className,
        }))
        console.log('【DEBUG】处理后的班级列表:', this.classList)
        return this.classList // 返回处理后的班级列表
      } catch (error) {
        console.error('【DEBUG】获取班级列表时发生错误:', error)
        throw error
      }
    },

    // 获取作业列表
    async getHomeworkList(courseId, params) {
      console.log('【DEBUG】正在获取课程ID为', courseId, '的作业列表，参数:', params)
      const store = this // 捕获 store 实例的上下文
      try {
        const res = await getHomeworkListService(courseId, params)
        console.log('【DEBUG】获取作业列表API响应数据:', res.data)

        // 使用 store 实例更新状态
        store.homeworkList = res.data.data.records
        store.homeworkTotal = res.data.data.total

        console.log('【DEBUG】store中更新后的作业列表:', store.homeworkList)
        console.log('【DEBUG】store中更新后的作业总数:', store.homeworkTotal)
        return res.data
      } catch (error) {
        console.error('【DEBUG】获取作业列表时发生错误:', error)
        throw error
      }
    },

    // 延长作业截止时间
    async extendHomeworkDeadline(courseId, homeworkId, days) {
      try {
        const res = await extendHomeworkDeadlineService(courseId, homeworkId, days)
        return res.data
      } catch (error) {
        console.error('【DEBUG】延长作业截止时间时发生错误:', error)
        throw error
      }
    },

    // 删除作业
    async deleteHomework(courseId, homeworkId) {
      try {
        const res = await deleteHomeworkService(courseId, homeworkId)
        return res.data
      } catch (error) {
        console.error('【DEBUG】删除作业时发生错误:', error)
        throw error
      }
    },

    // 获取学生作业提交列表
    async getStudentHomeworkSubmissions(params) {
      console.log('【DEBUG】正在获取学生作业提交列表，参数:', params)
      const store = this
      try {
        const res = await getHomeworkSubmissionsService(params)
        console.log('【DEBUG】获取学生作业提交列表API响应数据:', res.data)
        console.log('【DEBUG】原始学生提交记录:', res.data.data.records)
        store.studentSubmissions = res.data.data.records
        store.studentSubmissionsTotal = res.data.data.total
        console.log('【DEBUG】store中更新后的学生作业提交列表:', store.studentSubmissions)
        console.log('【DEBUG】store中更新后的学生作业提交总数:', store.studentSubmissionsTotal)
        return res.data
      } catch (error) {
        console.error('【DEBUG】获取学生作业提交列表时发生错误:', error)
        throw error
      }
    },

    // 评分单个作业提交
    async gradeHomeworkSubmission(submissionId, data) {
      console.log('【DEBUG】正在评分作业提交:', submissionId, '数据:', data)
      try {
        const res = await gradeSingleHomeworkService(submissionId, data)
        console.log('【DEBUG】评分API响应数据:', res.data)
        return res.data
      } catch (error) {
        console.error('【DEBUG】评分作业提交时发生错误:', error)
        throw error
      }
    },

    // 获取作业提交详情
    async getHomeworkSubmissionDetail(submissionId) {
      console.log('【DEBUG】正在获取作业提交详情，提交ID:', submissionId)
      try {
        const res = await getHomeworkSubmissionDetailService(submissionId)
        console.log('【DEBUG】获取作业提交详情API响应数据:', res.data)
        // 你可能需要将详情数据存储到 store 的某个 state 中，这里暂时不处理，直接返回
        return res.data.data
      } catch (error) {
        console.error('【DEBUG】获取作业提交详情时发生错误:', error)
        throw error
      }
    },

    // 批量评分作业
    async batchGradeHomework(params) {
      console.log('【DEBUG】正在批量评分作业，参数:', params)
      try {
        const res = await batchGradeHomeworkService(params)
        console.log('【DEBUG】批量评分API响应数据:', res.data)
        return res.data
      } catch (error) {
        console.error('【DEBUG】批量评分作业时发生错误:', error)
        throw error
      }
    },

    // 获取未提交作业的学生列表
    async getUnsubmittedStudents(params) {
      console.log('【DEBUG】正在获取未提交作业的学生列表，参数:', params)
      const store = this
      try {
        const res = await getUnsubmittedStudentsService(params)
        console.log('【DEBUG】获取未提交作业的学生列表API响应数据:', res.data)
        store.unsubmittedStudents = res.data.data // 直接是数组
        console.log('【DEBUG】store中更新后的未提交学生列表:', store.unsubmittedStudents)
        return res.data
      } catch (error) {
        console.error('【DEBUG】获取未提交作业的学生列表时发生错误:', error)
        throw error
      }
    },

    // 延长未提交作业学生的截止时间
    async extendHomeworkDeadlineForUnsubmitted(data) {
      console.log('【DEBUG】正在延长未提交作业学生的截止时间，参数:', data)
      try {
        const res = await extendUnsubmittedHomeworkDeadlineService(data)
        console.log('【DEBUG】延长截止时间API响应数据:', res.data)
        return res.data
      } catch (error) {
        console.error('【DEBUG】延长截止时间时发生错误:', error)
        throw error
      }
    },

    // 获取作业延长截止时间信息
    async getHomeworkExtensionInfo(homeworkId, studentId) {
      try {
        const res = await getHomeworkExtensionInfoService(homeworkId, studentId)
        return res.data
      } catch (error) {
        console.error('获取作业延长截止时间信息失败:', error)
        throw error
      }
    },

    // 清理指定课程的作业数据
    clearHomeworkDataByCourseId(courseId) {
      this.homeworkList = this.homeworkList.filter((hw) => hw.courseId !== courseId)
      this.homeworkTotal = this.homeworkList.length
      console.log(`已清理课程${courseId}的作业数据`)
    },

    // 清理所有作业数据
    clearAllHomeworkData() {
      this.classList = []
      this.homeworkList = []
      this.homeworkTotal = 0
      this.studentSubmissions = []
      this.studentSubmissionsTotal = 0
      this.unsubmittedStudents = []
      console.log('已清理所有作业数据')
    },

    // 清理过期的作业数据（超过120天）
    clearExpiredHomeworkData() {
      const oneHundredTwentyDaysAgo = new Date()
      oneHundredTwentyDaysAgo.setDate(oneHundredTwentyDaysAgo.getDate() - 120)

      this.homeworkList = this.homeworkList.filter((hw) => {
        if (!hw.createTime) return true // 保留没有创建时间的
        return new Date(hw.createTime) > oneHundredTwentyDaysAgo
      })

      this.homeworkTotal = this.homeworkList.length
      console.log('已清理过期的作业数据')
    },
  },
})
