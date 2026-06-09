import request from '@/utils/request'

/**
 * 创建实验模板基本信息
 * @param {number|string} courseId - 课程ID
 * @param {Object} data - 模板数据
 * @param {string} data.name - 模板名称
 * @param {Array<number>} data.classIds - 要发布的班级ID列表
 * @returns {Promise} - 返回创建结果，成功时返回模板ID
 */
export const createTemplateBasicService = (courseId, data) => {
  return request({
    url: `/teacher/course/${courseId}/template/basic`,
    method: 'post',
    data,
  })
}

/**
 * 发布模板
 * @param {number|string} courseId - 课程ID
 * @param {number|string} templateId - 模板ID
 * @param {Object} data - 模板组件数据
 * @param {Array<Object>} data.components - 模板组件列表
 * @returns {Promise} - 返回发布结果
 */
export const publishTemplateService = (courseId, templateId, data) => {
  return request({
    url: `/teacher/course/${courseId}/template/${templateId}/publish`,
    method: 'put',
    data,
  })
}

/**
 * 获取模板详情
 * @param {number|string} courseId - 课程ID
 * @param {number|string} templateId - 模板ID
 * @returns {Promise} - 返回模板详情
 */
export const getTemplateDetailService = (courseId, templateId) => {
  return request({
    url: `/teacher/course/${courseId}/template/${templateId}`,
    method: 'get',
  })
}

/**
 * 更新模板
 * @param {number|string} courseId - 课程ID
 * @param {number|string} templateId - 模板ID
 * @param {Object} data - 更新数据
 * @returns {Promise} - 返回更新结果
 */
export const updateTemplateService = (courseId, templateId, data) => {
  return request({
    url: `/teacher/course/${courseId}/template/${templateId}`,
    method: 'put',
    data,
  })
}

/**
 * 保存模板内容
 * @param {number|string} courseId - 课程ID
 * @param {number|string} templateId - 模板ID
 * @param {Object} data - 模板组件数据
 * @param {Array<Object>} data.components - 模板组件列表
 * @returns {Promise} - 返回保存结果
 */
export const saveTemplateContentService = (courseId, templateId, data) => {
  return request({
    url: `/teacher/course/${courseId}/template/${templateId}/save`,
    method: 'put',
    data,
  })
}

/**
 * 删除模板
 * @param {number|string} courseId - 课程ID
 * @param {number|string} templateId - 模板ID
 * @returns {Promise} - 返回删除结果
 */
export const deleteTemplateService = (courseId, templateId) => {
  return request({
    url: `/teacher/course/${courseId}/template/${templateId}`,
    method: 'delete',
  })
}

/**
 * 获取实验模板的学生提交记录
 * @param {object} params - 额外参数，如 { classId }
 * @returns {Promise}
 */
export const getTemplateSubmissionsService = (courseId, experimentId, params = {}) => {
  return request({
    url: `/teacher/course/${courseId}/experiment/${experimentId}/submissions`,
    method: 'get',
    params,
  })
}

/**
 * 获取单个学生提交记录详情
 * @param {number|string} courseId - 课程ID
 * @param {number|string} submissionId - 提交记录ID
 * @returns {Promise}
 */
export const getSubmissionDetailService = (courseId, submissionId) => {
  return request({
    url: `/teacher/course/${courseId}/experiment/submission/${submissionId}`,
    method: 'get',
  })
}

/**
 * 提交评分和评语
 * @param {number|string} courseId - 课程ID
 * @param {number|string} submissionId - 提交记录ID
 * @param {Object} data - { score, comment }
 * @returns {Promise}
 */
export const gradeSubmissionService = (courseId, submissionId, data) => {
  // 这个函数专门用于老的、不带标记的评分逻辑，可能已废弃或用于其他地方
  // 为了安全起见，我们保留它，但在新页面中不再使用
  console.warn('gradeSubmissionService is deprecated for grading with markings. Use gradeExperimentDataSubmissionService instead.');
  return request({
    url: `/teacher/course/${courseId}/experiment-data/submission/${submissionId}/grade`,
    method: 'post',
    data: {
      score: data.score,
      feedback: data.comment, // 保持旧的字段名以兼容
    },
  })
}

/**
 * 获取班级统计信息（实验报告）
 * @param {number|string} courseId - 课程ID
 * @param {number|string} experimentId - 实验ID（实验报告模板ID）
 * @param {number|string} classId - 班级ID
 * @returns {Promise}
 */
export const getClassStatisticsService = (courseId, experimentId, classId) => {
  console.log('[DEBUG][api] getClassStatisticsService 参数:', { courseId, experimentId, classId })
  return request({
    url: `/teacher/course/${courseId}/experiment/${experimentId}/class/${classId}/statistics`,
    method: 'get',
  })
}
/**
 * 获取指定班级在某个实验数据模板上的统计数据
 * @param {number|string} courseId - 课程ID
 * @param {number|string} templateId - 实验数据模板ID
 * @param {number|string} classId - 班级ID
 * @returns {Promise}
 */
export const getExperimentDataStatisticsByClass = (courseId, templateId, classId) => {
  console.log('[DEBUG][api] getExperimentDataStatisticsByClass 参数:', {
    courseId,
    templateId,
    classId,
  })
  return request({
    url: `/teacher/course/${courseId}/experiment-data/template/${templateId}/class/${classId}/statistics`,
    method: 'get',
  })
}
/**
 * 获取指定实验模板的实验数据提交记录列表（可按班级筛选）
 * @param {number|string} templateId - 实验模板ID
 * @param {object} params - 额外参数，如 { classId }
 * @returns {Promise}
 */
export const getExperimentDataSubmissionsByTemplate = (courseId, templateId, params = {}) => {
  return request({
    url: `/teacher/course/${courseId}/experiment-data/template/${templateId}/submissions`,
    method: 'get',
    params,
  })
}

/**
 * 实验报告评分（实验报告提交记录）
 * @param {number|string} courseId - 课程ID
 * @param {number|string} submissionId - 提交记录ID
 * @param {Object} data - { score, comment, componentMarkings }
 * @returns {Promise}
 */
export const gradeReportSubmissionService = (courseId, submissionId, data) => {
  return request({
    url: `/teacher/course/${courseId}/experiment/submission/${submissionId}/grade`,
    method: 'post',
    data,
  })
}

/**
 * 对实验数据提交进行评分 (支持标记)
 * @param {number|string} courseId
 * @param {number|string} submissionId
 * @param {object} data 评分内容，如 { score, feedback, componentMarkings }
 * @returns {Promise}
 */
export function gradeExperimentDataSubmissionService(courseId, submissionId, data = {}) {
  return request({
    url: `/teacher/course/${courseId}/experiment-data/submission/${submissionId}/grade`,
    method: 'post',
    data,
  })
}

/**
 * 获取单个实验数据提交记录详情
 * @param {number|string} courseId - 课程ID
 * @param {number|string} submissionId - 提交记录ID
 * @returns {Promise}
 */
export const getExperimentDataSubmissionDetail = (courseId, submissionId) => {
  return request({
    url: `/teacher/course/${courseId}/experiment-data/submission/${submissionId}/detail`,
    method: 'get',
  })
}

/**
 * 获取未提交实验数据的学生列表
 * @param {number|string} templateId - 实验模板ID
 * @param {number|string} classId - 班级ID
 * @returns {Promise}
 */
export const getUnsubmittedExperimentDataStudents = (courseId, templateId, classId) => {
  return request({
    url: `/teacher/course/${courseId}/experiment-data/template/${templateId}/class/${classId}/unsubmitted`,
    method: 'get',
  })
}

/**
 * 获取未提交实验报告的学生列表
 * @param {number|string} courseId - 课程ID
 * @param {number|string} experimentId - 实验ID
 * @param {object} params - 额外参数，如 { classId }
 * @returns {Promise}
 */
export const getUnsubmittedReportStudents = (courseId, experimentId, params = {}) => {
  return request({
    url: `/teacher/course/${courseId}/experiment/${experimentId}/unsubmitted`,
    method: 'get',
    params,
  })
}
