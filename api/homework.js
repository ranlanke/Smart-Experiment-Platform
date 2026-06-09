import request from '@/utils/request'

// 发布作业
export const publishHomeworkService = (homeworkData) => {
  return request({
    url: '/teacher/homework/publish',
    method: 'post',
    data: homeworkData,
  })
}

// 保存作业草稿
export const saveHomeworkDraftService = (homeworkData) => {
  return request({
    url: '/teacher/homework/draft',
    method: 'post',
    data: homeworkData,
  })
}

// 获取作业详情
export const getHomeworkDetailService = (homeworkId) => {
  return request({
    url: `/teacher/homework/${homeworkId}`,
    method: 'get',
  })
}
