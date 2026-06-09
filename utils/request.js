import axios from 'axios'
import { useUserStore } from '@/stores'
import { useStudentStore } from '@/stores/modules/xueshenguser'
// 有了统一管理可以直接这样导入你想要的
import { ElMessage } from 'element-plus'
// 这里是带入一个包可以直接使用element的样式
import router from '@/router'
const baseURL = 'http://192.168.1.177:8080/api'
// target: 'http://47.97.159.46',
// const baseURL = 'http://xxds.online/api'

// const baseURL = '/api'

const instance = axios.create({
  // TODO 1. 基础地址，超时时间
  baseURL,
  timeout: 60000, // 上传大文件时延长超时时间为60秒
})

// 请求拦截器
instance.interceptors.request.use(
  (config) => {
    console.log('【请求拦截器】发起请求，URL:', config.url, 'Full Config:', config)
    // 优先管理员token（userStore），再学生token（studentStore）
    const userStore = useUserStore()
    const studentStore = useStudentStore()
    if (userStore.token) {
      config.headers.Authorization = 'Bearer ' + userStore.token
    } else if (studentStore.token) {
      config.headers.Authorization = 'Bearer ' + studentStore.token
    }
    return config
  },
  (err) => {
    // console.error('【调试】请求拦截器异常:', err)
    return Promise.reject(err)
  },
)

// 响应拦截器
instance.interceptors.response.use(
  (res) => {
    // console.log('【调试】响应数据:', res)
    // TODO 4. 摘取核心响应数据
    if (res.data.code === 200) {
      // API返回code为200表示成功
      console.log('【响应拦截器】请求成功，返回数据:', res.data)
      return res
    }
    // TODO 3. 处理业务失败
    // 处理业务失败, 给错误提示，抛出错误
    console.warn('【响应拦截器】业务失败，消息:', res.data.message, '完整响应:', res)
    ElMessage.error(res.data.message || '服务异常')
    return Promise.reject(res.data)
  },
  (err) => {
    console.error('【响应拦截器】请求失败，错误对象:', err)
    if (err.response) {
      console.error('【响应拦截器】请求失败，HTTP状态码:', err.response.status)
      console.error('【响应拦截器】请求失败，后端返回数据:', err.response.data)
    }
    // TODO 5. 处理401错误
    // 错误的特殊情况 => 401 权限不足 或 token 过期 => 拦截到登录
    if (err.response?.status === 401) {
      router.push('/login')
    }

    // 错误的默认情况 => 只要给提示
    ElMessage.error(err.response?.data?.message || '服务异常')
    return Promise.reject(err)
  },
)

export default instance
export { baseURL }
