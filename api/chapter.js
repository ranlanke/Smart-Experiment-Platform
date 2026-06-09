import request from '@/utils/request'

/**
 * 获取课程所有章节（新版，带节）
 * @param {string|number} courseId - 课程ID
 * @returns {Promise}
 */
export const getChapterListService = (courseId) => {
  return request({
    url: `/teacher/course/${courseId}/chapter`,
    method: 'get',
  })
}

/**
 * 添加章节
 * @param {string|number} courseId - 课程ID
 * @param {Object} chapterData - 章节数据
 * @param {string} chapterData.title - 章节标题
 * @param {string} chapterData.description - 章节描述
 * @param {number} chapterData.level - 章节级别（1: 一级章节, 2: 二级章节）
 * @param {number} [chapterData.parentId] - 父章节ID（二级章节必填）
 * @returns {Promise} - 返回创建结果
 */
export const addChapterService = (courseId, chapterData) => {
  return request({
    url: `/teacher/course/${courseId}/chapters`,
    method: 'post',
    data: chapterData,
  })
}

/**
 * 更新章节
 * @param {string|number} courseId - 课程ID
 * @param {string|number} chapterId - 章节ID
 * @param {Object} chapterData - 章节数据
 * @returns {Promise} - 返回更新结果
 */
export const updateChapterService = (courseId, chapterId, chapterData) => {
  return request({
    url: `/teacher/course/${courseId}/chapters/${chapterId}`,
    method: 'put',
    data: chapterData,
  })
}

/**
 * 删除章节
 * @param {string|number} courseId - 课程ID
 * @param {string|number} chapterId - 章节ID
 * @returns {Promise} - 返回删除结果
 */
export const deleteChapterService = (courseId, chapterId) => {
  return request({
    url: `/teacher/course/${courseId}/chapters/${chapterId}`,
    method: 'delete',
  })
}

/**
 * 上传章节资源
 * @param {string|number} courseId - 课程ID
 * @param {string|number} chapterId - 章节ID
 * @param {File} file - 要上传的文件
 * @returns {Promise} - 返回上传结果
 */
export const uploadChapterResourceService = (courseId, chapterId, file) => {
  const formData = new FormData()
  formData.append('file', file)

  return request({
    url: `/teacher/course/${courseId}/chapters/${chapterId}/resources`,
    method: 'post',
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    data: formData,
  })
}

/**
 * 删除章节资源
 * @param {string|number} courseId - 课程ID
 * @param {string|number} chapterId - 章节ID
 * @param {string|number} resourceId - 资源ID
 * @returns {Promise} - 返回删除结果
 */
export const deleteChapterResourceService = (courseId, chapterId, resourceId) => {
  return request({
    url: `/teacher/course/${courseId}/chapters/${chapterId}/resources/${resourceId}`,
    method: 'delete',
  })
}

/**
 * 创建课程章
 * @param {string|number} courseId - 课程ID
 * @param {Object} data - 章数据 { title, sortOrder }
 * @returns {Promise}
 */
export const createChapterService = (courseId, data) => {
  return request({
    url: `/teacher/course/${courseId}/chapter`,
    method: 'post',
    data,
  })
}

/**
 * 创建课程节（支持多文件）
 * @param {string|number} courseId - 课程ID
 * @param {string|number} chapterId - 章ID
 * @param {Object} sectionDTO - 节信息 { title, content, sortOrder }
 * @param {File[]} files - 附件文件数组
 * @returns {Promise}
 */
export const createSectionService = (courseId, chapterId, sectionDTO, files) => {
  const formData = new FormData()
  formData.append('sectionDTO', JSON.stringify(sectionDTO))
  if (Array.isArray(files)) {
    files.forEach((file) => formData.append('files', file))
  }
  return request({
    url: `/teacher/course/${courseId}/chapter/${chapterId}/section`,
    method: 'post',
    headers: { 'Content-Type': 'multipart/form-data' },
    data: formData,
  })
}

/**
 * 删除课程章
 * @param {string|number} courseId
 * @param {string|number} chapterId
 * @returns {Promise}
 */
export const deleteChapterApi = (courseId, chapterId) => {
  return request({
    url: `/teacher/course/${courseId}/chapter/${chapterId}`,
    method: 'delete',
  })
}

/**
 * 删除课程节
 * @param {string|number} courseId
 * @param {string|number} sectionId
 * @returns {Promise}
 */
export const deleteSectionApi = (courseId, sectionId) => {
  return request({
    url: `/teacher/course/${courseId}/chapter/section/${sectionId}`,
    method: 'delete',
  })
}

/**
 * 发布课程节
 * @param {string|number} courseId - 课程ID
 * @param {string|number} sectionId - 节ID
 * @returns {Promise}
 */
export const publishSectionApi = (courseId, sectionId) => {
  return request({
    url: `/teacher/course/${courseId}/chapter/section/${sectionId}/publish`,
    method: 'put',
  })
}

/**
 * 更新课程节（支持多文件）
 * @param {string|number} courseId - 课程ID
 * @param {string|number} sectionId - 节ID
 * @param {Object} sectionDTO - 节信息 { title, content, sortOrder }
 * @param {File[]} files - 附件文件数组
 * @returns {Promise}
 */
export const updateSectionService = (courseId, sectionId, sectionDTO, files) => {
  const formData = new FormData()
  formData.append('sectionDTO', JSON.stringify(sectionDTO))
  if (Array.isArray(files)) {
    files.forEach((file) => formData.append('files', file))
  }
  return request({
    url: `/teacher/course/${courseId}/chapter/section/${sectionId}`,
    method: 'put',
    headers: { 'Content-Type': 'multipart/form-data' },
    data: formData,
  })
}
