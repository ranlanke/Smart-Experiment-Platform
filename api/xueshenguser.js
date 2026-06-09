import request from '@/utils/request'

// 学生登录接口
export const studentLoginService = ({ studentNumber, password }) =>
  request({
    url: '/student/auth/login',
    method: 'post',
    params: {
      studentNumber,
      password,
    },
  })

// 获取学生基本信息
export const studentGetInfoService = () => request.get('/student/info')

// 更新学生基本信息
export const studentUpdateInfoService = (data) => request.put('/student/info', data)

// 更新学生密码
export const studentUpdatePasswordService = (data) => {
  return request({
    url: '/student/info/change-password',
    method: 'post',
    params: {
      oldPassword: data.oldPassword,
      newPassword: data.newPassword,
    },
  })
}

// 更新学生头像
export const studentUpdateAvatarService = (file) => {
  const formData = new FormData()
  formData.append('file', file)

  return request({
    url: '/student/info/avatar',
    method: 'post',
    data: formData,
  })
}
