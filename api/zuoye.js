import request from '@/utils/request'

// 创建作业
export const createHomeworkService = (courseId, homeworkData) => {
  return request({
    url: `/teacher/course/${courseId}/homework`,
    method: 'post',
    data: homeworkData,
  })
}

// 获取课程下所有班级（用于作业发布）
export const getHomeworkClassListService = (courseId) => {
  return request({
    url: `/teacher/course/${courseId}/homework/classes`,
    method: 'get',
  })
}

// 获取作业列表
export const getHomeworkListService = (courseId, params) => {
  return request({
    url: `/teacher/course/${courseId}/homework`,
    method: 'get',
    params: params,
  })
}

// 延长作业截止时间（用于作业管理，非本次延长未提交学生功能）
export const extendHomeworkDeadlineService = (courseId, homeworkId, days) => {
  return request({
    url: `/teacher/course/${courseId}/homework/${homeworkId}/extend`,
    method: 'put',
    params: { days },
  })
}

// 删除作业
export const deleteHomeworkService = (courseId, homeworkId) => {
  return request({
    url: `/teacher/course/${courseId}/homework/${homeworkId}`,
    method: 'delete',
  })
}

// 获取作业提交列表
export const getHomeworkSubmissionsService = (params) => {
  return request({
    url: '/teacher/homework/grade/list',
    method: 'get',
    params,
  })
}

// 评分单个作业
export const gradeSingleHomeworkService = (submissionId, params) => {
  return request({
    url: `/teacher/homework/grade/${submissionId}/grade`,
    method: 'post',
    params,
  })
}

// 获取作业提交详情
export const getHomeworkSubmissionDetailService = (submissionId) => {
  return request({
    url: `/teacher/homework/grade/${submissionId}`,
    method: 'get',
  })
}

// 批量评分
export const batchGradeHomeworkService = (params) => {
  return request({
    url: '/teacher/homework/grade/batch-grade',
    method: 'post',
    params,
  })
}

// 获取未提交作业的学生列表
export const getUnsubmittedStudentsService = (params) => {
  return request({
    url: '/teacher/homework/grade/unsubmitted',
    method: 'get',
    params,
  })
}

// 延长未提交作业学生的截止时间
export const extendUnsubmittedHomeworkDeadlineService = (params) => {
  console.log('【DEBUG】extendUnsubmittedHomeworkDeadlineService: 发送请求，参数:', params)
  return request({
    url: '/teacher/homework/grade/extend',
    method: 'post',
    params: params,
    data: {},
  })
}

// 获取作业延长截止时间信息
export const getHomeworkExtensionInfoService = (homeworkId, studentId) => {
  return request.get(`/teacher/homework/grade/${homeworkId}/deadline/${studentId}`)
}
