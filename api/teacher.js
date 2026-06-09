import request from '@/utils/request'

// 分页查询教师列表
export function getTeacherPage(params) {
  return request({
    url: '/admin/teacher/page',
    method: 'get',
    params,
  })
}

// 管理员登录
export function adminLogin({ username, password }) {
  return request({
    url: '/admin/login',
    method: 'post',
    params: { username, password },
  })
}

// 创建教师并上传头像
export function createTeacherWithAvatar({ teacherInfo, file }) {
  const formData = new FormData()
  formData.append('teacherInfo', teacherInfo)
  formData.append('file', file)
  return request({
    url: '/admin/teacher/create',
    method: 'post',
    data: formData,
    headers: { 'Content-Type': 'multipart/form-data' },
  })
}

// 删除教师
export function deleteTeacher(id) {
  return request({
    url: `/admin/teacher/${id}`,
    method: 'delete',
  })
}

// 更新教师信息
export function updateTeacher({ id, teacherInfo, file }) {
  const formData = new FormData()
  if (teacherInfo) formData.append('teacherInfo', teacherInfo)
  if (file) formData.append('file', file)
  return request({
    url: `/admin/teacher/${id}`,
    method: 'put',
    data: formData,
    headers: { 'Content-Type': 'multipart/form-data' },
  })
}

// 获取教师详情
export function getTeacherDetail(id) {
  return request({
    url: `/admin/teacher/${id}/detail`,
    method: 'get',
  })
}
