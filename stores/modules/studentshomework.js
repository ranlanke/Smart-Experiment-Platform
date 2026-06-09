import { defineStore } from 'pinia'
import { getStudentHomeworkList } from '@/api/studenthomework'

export const useStudentsHomeworkStore = defineStore('studentsHomework', {
  state: () => ({
    homeworkList: [],
    total: 0,
    loading: false,
    page: 1,
    pageSize: 10,
  }),
  actions: {
    async fetchHomeworkList({ studentId, status, page = 1, pageSize = 10 } = {}) {
      this.loading = true
      try {
        const res = await getStudentHomeworkList({
          studentId,
          status,
          current: page,
          size: pageSize,
        })
        const data = res.data?.data || {}
        this.homeworkList = data.records || []
        this.total = data.total || 0
        this.page = data.current || page
        this.pageSize = data.size || pageSize
      } catch {
        this.homeworkList = []
        this.total = 0
      } finally {
        this.loading = false
      }
    },
  },
})
