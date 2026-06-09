import { defineStore } from 'pinia'
import { createTemplateBasicService, publishTemplateService } from '@/api/template'
import { ElMessage } from 'element-plus'

export const useTemplateStore = defineStore('template', {
  state: () => ({
    // 存储模板列表
    templates: [],
    // 当前正在编辑的模板
    currentTemplate: null,
    // 创建模板的加载状态
    isCreating: false,
    // 发布模板的加载状态
    isPublishing: false,
  }),

  getters: {
    // 获取全部模板
    getAllTemplates: (state) => state.templates,

    // 根据课程ID获取模板
    getTemplatesByCourse: (state) => (courseId) => {
      return state.templates.filter((template) => template.courseId == courseId)
    },

    // 获取特定模板
    getTemplateById: (state) => (templateId) => {
      return state.templates.find((template) => template.id == templateId)
    },

    // 获取当前编辑的模板
    getCurrentTemplate: (state) => state.currentTemplate,
  },

  actions: {
    // 创建模板基本信息
    async createTemplateBasic(courseId, templateData) {
      if (!courseId) {
        ElMessage.error('创建模板失败：课程ID不能为空')
        return null
      }

      this.isCreating = true

      try {
        const response = await createTemplateBasicService(courseId, templateData)
        // 修正响应结构
        if (response.data.code === 0 || response.data.code === 200) {
          const templateId = response.data.data

          // 添加到模板列表
          const newTemplate = {
            id: templateId,
            courseId: courseId,
            name: templateData.name,
            classIds: templateData.classIds || [],
            createTime: new Date().toISOString(),
          }

          this.templates.push(newTemplate)
          // ElMessage.success('模板基本信息创建成功')
          return templateId
        } else {
          ElMessage.error(`创建失败：${response.data.message || '未知错误'}`)
          return null
        }
      } catch (error) {
        console.error('创建模板出错:', error)
        ElMessage.error(`创建模板失败：${error.message || '网络错误'}`)
        return null
      } finally {
        this.isCreating = false
      }
    },

    // 发布模板
    async publishTemplate(courseId, templateId, components) {
      if (!courseId || !templateId) {
        ElMessage.error('发布模板失败：参数不完整')
        return false
      }

      this.isPublishing = true

      try {
        // 按接口文档严格组装数据
        const publishData = {
          components: components.map((item, index) => {
            // 统一字段名和类型
            const componentType = item.componentType || item.type

            const positionX = item.positionX || 0
            const positionY = item.positionY || 0
            const width = item.width || 600
            const height = item.height || 300
            const sortOrder = index + 1
            let content = ''

            console.log('处理组件数据:', item)

            switch (componentType) {
              case 'static_text':
                content =
                  typeof item.content === 'string'
                    ? item.content
                    : JSON.stringify(item.content || '')
                break
              case 'dynamic_text': {
                let text = typeof item.content === 'object' ? item.content.text : item.content
                // 如果 text 是字符串化的 JSON，再解一次
                if (typeof text === 'string' && text.trim().startsWith('{')) {
                  try {
                    const parsed = JSON.parse(text)
                    if (typeof parsed === 'object' && parsed.text) {
                      text = parsed.text
                    }
                  } catch {
                    /* 忽略解析错误 */
                  }
                }

                // 处理blanks，确保它是数组
                let blanks = []
                if (Array.isArray(item.content?.blanks)) {
                  blanks = item.content.blanks
                } else if (Array.isArray(item.blanks)) {
                  blanks = item.blanks
                }

                // 即使blanks为空，也保留text中的[blank-xxx]格式，不做清理
                content = JSON.stringify({
                  text,
                  blanks,
                })
                break
              }
              case 'table':
                content =
                  typeof item.content === 'string'
                    ? item.content
                    : JSON.stringify(item.content || item.cells || [])
                break
              case 'image':
                content =
                  typeof item.content === 'string'
                    ? item.content
                    : JSON.stringify(item.content || { url: '' })
                break
              case 'file':
                // 直接使用原始content对象
                content =
                  typeof item.content === 'string'
                    ? item.content
                    : JSON.stringify(item.content || { url: '', name: '', size: 0, type: 'file' })
                break
              default:
                content =
                  typeof item.content === 'string'
                    ? item.content
                    : JSON.stringify(item.content || '')
            }

            const componentData = {
              templateId: templateId,
              componentType,
              positionX,
              positionY,
              width,
              height,
              content,
              sortOrder,
            }

            console.log('处理后的组件数据:', componentData)
            return componentData
          }),
        }

        console.log('发布请求体:', publishData)

        // 调用发布API
        const response = await publishTemplateService(courseId, templateId, publishData)
        console.log('发布模板接口返回：', response)
        const code = response.code ?? response.data?.code
        const message = response.message ?? response.data?.message
        if (code === 0 || code === 200) {
          // ElMessage.success('模板发布成功')
          return true
        } else {
          ElMessage.error(`发布失败：${message || '未知错误'}`)
          return false
        }
      } catch (error) {
        console.error('发布模板出错:', error)
        ElMessage.error(`发布模板失败：${error.message || '网络错误'}`)
        return false
      } finally {
        this.isPublishing = false
      }
    },

    // 序列化组件内容为字符串
    serializeComponentContent(item) {
      try {
        switch (item.type) {
          case 'static-text':
            return JSON.stringify({ content: item.content || '' })
          case 'table':
            return JSON.stringify(item.cells || [])
          case 'dynamic_text':
            return JSON.stringify({
              content: item.content || '',
              blanks: item.blanks || [],
            })
          case 'image':
            return JSON.stringify({ src: item.src || '', width: item.width, height: item.height })
          case 'file':
            return JSON.stringify({ name: item.file ? item.file.name : '', url: item.url || '' })
          default:
            return JSON.stringify(item)
        }
      } catch (error) {
        console.error('序列化组件内容出错:', error)
        return '""'
      }
    },

    // 设置当前模板
    setCurrentTemplate(template) {
      this.currentTemplate = template
    },

    // 更新模板
    updateTemplate(templateId, updateData) {
      const index = this.templates.findIndex((t) => t.id == templateId)
      if (index !== -1) {
        this.templates[index] = {
          ...this.templates[index],
          ...updateData,
          updateTime: new Date().toISOString(),
        }
        return true
      }
      return false
    },

    // 删除模板
    deleteTemplate(templateId) {
      const index = this.templates.findIndex((t) => t.id == templateId)
      if (index !== -1) {
        this.templates.splice(index, 1)
        return true
      }
      return false
    },

    // 清理指定课程的模板
    clearTemplatesByCourseId(courseId) {
      this.templates = this.templates.filter((t) => t.courseId !== courseId)
      console.log(`已清理课程${courseId}的模板`)
    },

    // 清理所有模板
    clearAllTemplates() {
      this.templates = []
      this.currentTemplate = null
      console.log('已清理所有模板')
    },

    // 清理过期的模板（超过60天未更新的）
    clearExpiredTemplates() {
      const sixtyDaysAgo = new Date()
      sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60)

      this.templates = this.templates.filter((t) => {
        if (!t.updateTime && !t.createTime) return true // 保留没有时间信息的
        const timeToCheck = t.updateTime || t.createTime
        return new Date(timeToCheck) > sixtyDaysAgo
      })

      console.log('已清理过期的模板')
    },
  },
})
