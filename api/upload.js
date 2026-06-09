import request from '@/utils/request'

/**
 * 通用文件上传接口
 * @param {string} type - 文件类型（如 'image', 'file', 'avatar', 'course-cover' 等）
 * @param {File} file - 要上传的文件对象
 * @returns {Promise} - 返回上传结果，成功时 data 为文件URL
 */
export const uploadFileService = (type, file) => {
  const formData = new FormData()
  formData.append('file', file)
  return request({
    url: `/upload/${type}`,
    method: 'post',
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    data: formData,
  })
}

/**
 * 上传课程章节资源
 * @param {File} file - 要上传的文件
 * @returns {Promise} - 返回上传结果
 */
export const uploadChapterResourceService = (file) => {
  return uploadFileService('chapter-resource', file)
}

/**
 * 上传课程封面
 * @param {File} file - 要上传的图片文件
 * @returns {Promise} - 返回上传结果
 */
export const uploadCourseCoverService = (file) => {
  return uploadFileService('course-cover', file)
}

/**
 * 上传用户头像
 * @param {File} file - 要上传的图片文件
 * @returns {Promise} - 返回上传结果
 */
export const uploadAvatarService = (file) => {
  return uploadFileService('avatar', file)
}
