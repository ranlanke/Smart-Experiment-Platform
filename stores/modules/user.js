// import { defineStore } from 'pinia'
// import { ref } from 'vue'
// export const useUserStore = defineStore(
//   'big-user',
//   () => {
//     // 这个里面去写你的逻辑
//     const token = ref('')
//     const setToken = newToken => {
//       token.value = newToken
//     }
//     const removeToken = () => {
//       token.value = ''
//     }
//     return {
//       token,
//       setToken,
//       removeToken,
//       // 这一步非常重要
//     }
//   },
//   {
//     persist: true,
//   },
// )
// big-user是自己取的名字，唯一标识用来做区分的

import { defineStore } from 'pinia'
import { ref } from 'vue'
import { userGetInfoService } from '@/api/user'

// 用户模块 token setToken removeToken
export const useUserStore = defineStore(
  'big-user',
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
      console.log('getUser called') // Debug: 打印函数调用
      try {
        const res = await userGetInfoService()
        console.log('userGetInfoService response:', res) // Debug: 打印接口响应
        console.log('API返回的原始用户数据:', res.data)

        // 确保返回的数据符合预期
        if (res.data && res.data.data) {
          const newUserData = res.data.data

          // 保留现有头像(如果新数据中头像为空但现有头像存在)
          if (!newUserData.avatar && user.value && user.value.avatar) {
            console.log('保留现有头像:', user.value.avatar)
            newUserData.avatar = user.value.avatar
          }

          // 更新用户数据
          user.value = newUserData
          console.log('更新后的用户数据:', user.value) // Debug: 打印更新后的用户数据
        } else {
          console.log('API返回数据结构异常:', res.data)
        }
      } catch (error) {
        console.error('获取用户数据失败:', error)
      }
    }

    const setUser = (obj) => {
      // 保留现有头像(如果新数据中头像为空但现有头像存在)
      if (!obj.avatar && user.value && user.value.avatar) {
        obj.avatar = user.value.avatar
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
    persist: true, // 开启持久化存储，确保刷新页面时不丢失数据
  },
)
