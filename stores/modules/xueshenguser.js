import { defineStore } from 'pinia'
import { ref } from 'vue'
import { studentGetInfoService } from '@/api/xueshenguser'

export const useStudentStore = defineStore(
  'student-user',
  () => {
    const token = ref('')
    const setToken = (newToken) => {
      token.value = newToken
    }
    const removeToken = () => {
      token.value = ''
    }

    const user = ref({})
    const getUser = async () => {
      try {
        const res = await studentGetInfoService()
        console.log('API返回的原始学生数据:', res.data)

        if (res.data && res.data.data) {
          const newUserData = res.data.data

          if (!newUserData.studentImage && user.value && user.value.studentImage) {
            console.log('保留现有头像:', user.value.studentImage)
            newUserData.studentImage = user.value.studentImage
          }

          user.value = newUserData
          console.log('更新后的学生数据:', user.value)
        } else {
          console.log('API返回数据结构异常:', res.data)
        }
      } catch (error) {
        console.error('获取学生数据失败:', error)
        throw error
      }
    }

    const setUser = (obj) => {
      if (!obj.studentImage && user.value && user.value.studentImage) {
        obj.studentImage = user.value.studentImage
      }
      user.value = obj
    }

    return {
      token,
      setToken,
      removeToken,
      user,
      getUser,
      setUser,
    }
  },
  {
    persist: true,
  },
)
