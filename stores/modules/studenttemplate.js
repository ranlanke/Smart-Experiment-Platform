import { defineStore } from 'pinia'
import {
  getStudentExperimentTemplateDetail,
  createStudentExperimentTemplate,
  submitStudentExperimentStudentTemplate,
  saveOrUpdateStudentExperimentStudentTemplate,
} from '@/api/studenttemplate'
import { ElMessage } from 'element-plus'

export const useStudentTemplateStore = defineStore('studenttemplate', {
  state: () => ({
    reportTitle: '',
    reportContent: [], // 组件内容
    lastSaved: null, // 上次保存时间
  }),

  actions: {
    // 获取实验报告详情
    async fetchReportDetail(studentTemplateId, studentId) {
      try {
        const res = await getStudentExperimentTemplateDetail(studentTemplateId, studentId)
        if (res && res.data && res.data.data) {
          const data = res.data.data
          this.reportTitle = data.name || data.reportTitle || ''
          this.reportContent = (data.components || data.reportContent || []).map((comp) => {
            // 保存原始 content 字符串到 _originContent
            if (comp.id !== undefined && comp.content !== undefined) {
              comp._originContent =
                typeof comp.content === 'string' ? comp.content : JSON.stringify(comp.content)
            }
            return comp
          })
          this.lastSaved = new Date().toISOString()
          ElMessage({ message: '实验报告加载成功', type: 'success', center: true, offset: 200 })
        } else {
          ElMessage.error('实验报告数据为空')
        }
      } catch (error) {
        console.error('获取实验报告详情失败:', error)
        ElMessage.error('获取实验报告详情失败')
      }
    },

    // 保存实验报告（保存/更新）
    async saveReport(studentTemplateId) {
      try {
        // 打印所有组件的关键字段用于调试
        this.reportContent.forEach((item) => {
          console.log(
            `[过滤调试] id:${item.id}, type:${item.type}, readonly:${item.readonly}, isEditable:${item.isEditable}, originalComponentId:${item.originalComponentId}`,
          )
        })
        // 检查老师组件内容是否被污染
        this.reportContent.forEach((item) => {
          const isTeacher =
            item.readonly === true || item.isEditable === false || item.originalComponentId
          if (isTeacher && item._originContent !== undefined) {
            if (item.content !== item._originContent) {
              console.warn(
                '[老师组件内容不一致] id:',
                item.id,
                '\n当前content:',
                item.content,
                '\n原始_originContent:',
                item._originContent,
              )
            }
          }
        })
        // 保留所有老师组件（原样带上），学生组件可增删改
        const body = this.reportContent.map((item, idx) => {
          let componentType = item.type || item.componentType
          if (componentType === 'static-text') componentType = 'static_text'
          if (componentType === 'dynamic-text') componentType = 'dynamic_text'
          const obj = {
            componentType,
            positionX: item.positionX ?? 100,
            positionY: item.positionY ?? 100,
            width: parseInt(item.width) || 500,
            height: parseInt(item.height) || 200,
            sortOrder: idx + 1,
          }
          // 所有有 id 且 _originContent 存在的组件，强制用 _originContent 覆盖 content
          if (item.id !== undefined && item._originContent !== undefined) {
            obj.content = item._originContent
          } else {
            // 针对不同类型分别处理 content 字段
            if (componentType === 'static_text' || componentType === 'dynamic_text') {
              obj.content =
                typeof item.content === 'string' ? item.content : JSON.stringify(item.content)
            } else if (componentType === 'file' || componentType === 'image') {
              obj.content = JSON.stringify({
                url: item.url || '',
                type: item.isImage ? 'image' : 'file',
                name: item.file ? item.file.name : '',
                size: item.file ? item.file.size : 0,
                imageName: item.isImage ? item.imageName || '' : undefined,
              })
            } else if (componentType === 'table') {
              obj.content = JSON.stringify({
                tableName: item.tableName || '',
                cells: item.cells || [],
              })
            } else if (componentType === 'chart') {
              obj.content = JSON.stringify({
                chartOption: item.chartOption || null,
                chartData: item.chartData || null,
                chartType: item.chartType || 'line',
                chartName: item.chartName || '',
                tableId: item.tableId || null,
              })
            }
          }
          if (item.readonly === true) {
            if (item.id !== undefined && item.id !== null) obj.id = item.id
            obj.originalComponentId =
              item.originalComponentId !== undefined && item.originalComponentId !== null
                ? item.originalComponentId
                : item.id
          } else {
            if (item.id !== undefined && item.id !== null) obj.id = item.id
          }
          return obj
        })
        console.log('【调试】saveReport 提交 body:', JSON.stringify(body, null, 2))
        const res = await saveOrUpdateStudentExperimentStudentTemplate(studentTemplateId, body)
        // 新增更详细的打印
        console.log('【调试】saveReport API返回完整res:', res)
        if (res && res.data) {
          console.log('【调试】saveReport res.data:', res.data)
          console.log('【调试】后端返回 code:', res.data.code, 'msg:', res.data.message)
        }
        if (res && res.data && (res.data.code === 0 || res.data.code === 200)) {
          this.lastSaved = new Date().toISOString()
          ElMessage({ message: '保存成功', type: 'success', center: true, offset: 20 })
          return true
        } else {
          ElMessage.error(res.data.message || '保存失败')
          return false
        }
      } catch (error) {
        console.error('保存实验报告失败:', error)
        if (error && error.response) {
          console.error('后端响应:', error.response)
        }
        ElMessage.error('保存实验报告失败')
        return false
      }
    },

    // 本地保存
    localSave() {
      try {
        localStorage.setItem('student_report_title', this.reportTitle)
        localStorage.setItem('student_report_content', JSON.stringify(this.reportContent))
        this.lastSaved = new Date().toISOString()
      } catch (error) {
        console.error('本地保存失败:', error)
        ElMessage.error('本地保存失败')
      }
    },

    // 本地恢复
    localRestore() {
      try {
        const title = localStorage.getItem('student_report_title')
        const content = localStorage.getItem('student_report_content')
        if (title) this.reportTitle = title
        if (content) this.reportContent = JSON.parse(content)
        ElMessage({ message: '本地恢复成功', type: 'success', center: true, offset: 200 })
      } catch (error) {
        console.error('本地恢复失败:', error)
        ElMessage.error('本地恢复失败')
      }
    },

    // 清空本地保存
    clearLocal() {
      try {
        localStorage.removeItem('student_report_title')
        localStorage.removeItem('student_report_content')
        ElMessage({ message: '本地内容已清除', type: 'success', center: true, offset: 200 })
      } catch (error) {
        console.error('清除本地内容失败:', error)
        ElMessage.error('清除本地内容失败')
      }
    },

    // 创建学生实验模板
    async createStudentTemplate(teacherTemplateId, studentId) {
      try {
        const res = await createStudentExperimentTemplate(teacherTemplateId, studentId)
        console.log('【调试】/student/experiment/template/{templateId}/create 返回:', res)
        if (res && res.data && (res.data.code === 0 || res.data.code === 200)) {
          ElMessage({ message: '学生实验模板创建成功', type: 'success', center: true, offset: 200 })
          // 兼容 data.id 或 data
          if (typeof res.data.data === 'object' && res.data.data.id) {
            return res.data.data.id
          } else {
            return res.data.data
          }
        } else {
          ElMessage.error(res.data.message || '创建学生实验模板失败')
          return null
        }
      } catch (error) {
        console.error('创建学生实验模板失败:', error)
        ElMessage.error('创建学生实验模板失败')
        return null
      }
    },

    // 提交实验报告
    async submitReport(studentTemplateId, studentId) {
      try {
        const res = await submitStudentExperimentStudentTemplate(studentTemplateId, studentId)
        if (res && res.data && (res.data.code === 0 || res.data.code === 200)) {
          ElMessage({ message: '提交成功', type: 'success', center: true, offset: 20 })
          return true
        } else {
          ElMessage.error(res.data.message || '提交失败')
          return false
        }
      } catch (error) {
        console.error('提交实验报告失败:', error)
        if (error && error.response) {
          console.error('后端响应:', error.response)
        }
        ElMessage.error('提交实验报告失败')
        return false
      }
    },

    // 清理实验报告数据
    clearReportData() {
      this.reportTitle = ''
      this.reportContent = []
      this.lastSaved = null
      // 清理本地存储
      try {
        localStorage.removeItem('student_report_title')
        localStorage.removeItem('student_report_content')
        console.log('实验报告数据已清理')
      } catch (error) {
        console.error('清理本地存储失败:', error)
      }
    },

    // 清理过大的报告内容（防止内存占用过多）
    optimizeReportContent() {
      if (this.reportContent.length > 100) {
        console.warn('报告内容过多，进行优化清理')
        // 保留最新的50个组件
        this.reportContent = this.reportContent.slice(-50)
      }

      // 清理组件中的大对象
      this.reportContent = this.reportContent.map((item) => {
        const optimized = { ...item }

        // 清理过大的content
        if (
          optimized.content &&
          typeof optimized.content === 'string' &&
          optimized.content.length > 10000
        ) {
          optimized.content = optimized.content.substring(0, 10000) + '...'
        }

        // 清理过大的文件对象
        if (optimized.file && optimized.file.size > 1024 * 1024) {
          optimized.file = {
            name: optimized.file.name,
            size: optimized.file.size,
            type: optimized.file.type,
          }
        }

        return optimized
      })
    },
  },
})
