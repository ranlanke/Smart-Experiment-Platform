import request from '@/utils/request'
// 导入方法

// 注册接口
export const userRegisterService = ({ username, password, repassword }) =>
  request.post('/api/reg', { username, password, repassword })

// 登录接口
export const userLoginService = ({ employeeId, password }) =>
  request({
    url: 'teacher/auth/login',
    method: 'post',
    params: {
      employeeId,
      password,
    },
  })

// 获取用户基本信息
export const userGetInfoService = () => request.get('/teacher/info')

// 更新用户基本信息
export const userUpdateInfoService = (data) => request.put('my/userinfo', data)

// 更新教师信息（新接口）
export const updateTeacherInfoService = (data) => {
  return request({
    url: '/teacher/info',
    method: 'put',
    data: data,
  })
}

// 更新用户密码
export const userUpdatePasswordService = (data) => {
  return request({
    url: '/teacher/info/change-password',
    method: 'post',
    params: {
      oldPassword: data.oldPassword,
      newPassword: data.newPassword,
    },
  })
}

// 更新教师头像
export const userUpdateAvatarService = (file) => {
  const formData = new FormData()
  formData.append('file', file)

  return request({
    url: '/teacher/info/avatar',
    method: 'post',
    headers: {
      // 'Content-Type': 'multipart/form-data',
    },
    data: formData,
  })
}
