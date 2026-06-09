// 获取学生作业列表
import request from '@/utils/request'

export function getStudentHomeworkList(params = {}) {
  return request({
    url: '/student/homework/list',
    method: 'get',
    params,
  })
}

// 获取作业详情
export function getStudentHomeworkDetail(homeworkId, params = {}) {
  return request({
    url: `/student/homework/${homeworkId}`,
    method: 'get',
    params,
  })
}

// 保存作业草稿
export function saveHomeworkDraft(homeworkId, formData) {
  console.log('[调试][API] 保存作业草稿参数:', homeworkId, formData)
  return request({
    url: `/student/homework/${homeworkId}/draft`,
    method: 'post',
    data: formData,
    headers: { 'Content-Type': 'multipart/form-data' },
  }).then((res) => {
    console.log('[调试][API] 保存作业草稿返回:', res)
    return res
  })
}

// 提交作业
export function submitHomework(homeworkId, formData) {
  console.log('[调试][API] 提交作业参数:', homeworkId, formData)
  return request({
    url: `/student/homework/${homeworkId}/submit`,
    method: 'post',
    data: formData,
    headers: { 'Content-Type': 'multipart/form-data' },
  }).then((res) => {
    console.log('[调试][API] 提交作业返回:', res)
    return res
  })
}

// 获取学生的作业提交记录
export function getHomeworkSubmission(homeworkId) {
  console.log('[调试][API] 获取作业提交记录参数:', homeworkId)
  return request({
    url: `/student/homework/${homeworkId}/submission`,
    method: 'get',
  }).then((res) => {
    console.log('[调试][API] 获取作业提交记录返回:', res)
    return res
  })
}
