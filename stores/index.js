import { createPinia } from 'pinia'
import persist from 'pinia-plugin-persistedstate'
// app.use(createPinia().use(persist))
// 等价于下面的内容
const pinia = createPinia()
pinia.use(persist)
export default pinia
export * from './modules/count'
export * from './modules/user'
export * from './modules/homework'

// 全局清理工具函数
export const clearAllStoreData = () => {
  try {
    // 清理 localStorage 中的持久化数据
    const keysToRemove = [
      'class-list',
      'student_report_title',
      'student_report_content',
      'big-user',
      'student-user',
      'homework',
      'template',
      'zuoye',
      'news',
      'studentsHomework',
      'studenttemplate',
    ]

    keysToRemove.forEach((key) => {
      localStorage.removeItem(key)
    })

    console.log('已清理所有store的持久化数据')
  } catch (error) {
    console.error('清理store数据失败:', error)
  }
}

// 清理指定课程的所有相关数据
export const clearCourseData = (courseId) => {
  if (!courseId) {
    console.warn('清理课程数据时未指定courseId')
    return
  }

  try {
    // 这里可以调用各个store的清理方法
    // 注意：需要在组件中手动调用各个store的清理方法
    console.log(`准备清理课程${courseId}的所有相关数据`)
  } catch (error) {
    console.error('清理课程数据失败:', error)
  }
}

// 定期清理过期数据（建议在应用启动时调用）
export const scheduleDataCleanup = () => {
  // 每24小时清理一次过期数据
  setInterval(
    () => {
      try {
        // 这里可以调用各个store的过期数据清理方法
        console.log('执行定期数据清理...')
      } catch (error) {
        console.error('定期数据清理失败:', error)
      }
    },
    24 * 60 * 60 * 1000,
  ) // 24小时
}
