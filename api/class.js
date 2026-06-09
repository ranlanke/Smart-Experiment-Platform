import request from '@/utils/request'
import axios from 'axios'

/**
 * 创建班级服务
 * @param {string} className - 班级名称
 * @param {File} classImage - 班级封面图片文件
 * @param {string|number} courseId - 课程ID
 * @returns {Promise} - 返回创建结果
 */
export function createClassService(className, classImage, courseId) {
  // 检查课程ID是否存在
  if (!courseId) {
    console.error('创建班级失败：未指定课程ID')
    return Promise.reject(new Error('未指定课程ID'))
  }

  // 尝试将courseId转换为数字类型
  const numericCourseId = Number(courseId)

  // 构建表单数据
  const formData = new FormData()
  formData.append('className', className)

  // 如果有图片，添加到表单
  if (classImage) {
    formData.append('classImage', classImage)
  }

  // 使用多种可能的参数名称添加课程ID
  formData.append('courseId', courseId)
  formData.append('course_id', courseId)
  formData.append('courseid', courseId)
  formData.append('id', courseId)

  // 如果可以转换为数字，也以数字形式添加
  if (!isNaN(numericCourseId)) {
    formData.append('numericCourseId', numericCourseId)
  }

  // 记录表单内容用于调试
  console.log(`API请求中添加了课程ID: ${courseId}`)
  console.log(`课程ID类型: ${typeof courseId}`)
  console.log(`课程ID数字转换: ${numericCourseId}`)

  // 记录formData的内容（FormData不能直接打印，需要遍历）
  console.log('表单数据内容:')
  for (const pair of formData.entries()) {
    console.log(`${pair[0]}: ${pair[1]}`)
  }

  // 使用URL路径参数传递课程ID
  return request({
    url: `/teacher/course/${courseId}/class`,
    method: 'post',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
}

/**
 * 获取班级列表服务
 * @param {string|number} courseId - 课程ID
 * @param {Object} params - 查询参数
 * @returns {Promise} - 返回班级列表
 */
export function getClassListService(courseId, params = {}) {
  if (!courseId) {
    console.error('获取班级列表失败：未指定课程ID')
    return Promise.reject(new Error('未指定课程ID'))
  }
  return request({
    url: `/teacher/course/${courseId}/class`,
    method: 'get',
    params: {
      page: params.page || 1,
      size: params.size || 10,
      className: params.className || '', // 支持班级名模糊查询
    },
  })
}

/**
 * 获取班级详情，包括学生列表
 * @param {string|number} courseId - 课程ID
 * @param {string|number} classId - 班级ID
 * @returns {Promise} - 返回班级详情数据
 */
export function getClassDetailService(courseId, classId) {
  // 检查必要参数
  if (!courseId) {
    console.error('获取班级详情失败：未指定课程ID')
    return Promise.reject(new Error('未指定课程ID'))
  }

  if (!classId) {
    console.error('获取班级详情失败：未指定班级ID')
    return Promise.reject(new Error('未指定班级ID'))
  }

  return request({
    url: `/teacher/course/${courseId}/class/${classId}`,
    method: 'get',
  })
}

/**
 * 通过Excel批量导入学生到班级
 * @param {string|number} courseId - 课程ID
 * @param {string|number} classId - 班级ID
 * @param {File} file - Excel文件
 * @returns {Promise} - 返回导入结果
 */
export function importStudentsFromExcel(courseId, classId, file) {
  // 检查必要参数
  if (!courseId) {
    console.error('导入学生失败：未指定课程ID')
    return Promise.reject(new Error('未指定课程ID'))
  }

  if (!classId) {
    console.error('导入学生失败：未指定班级ID')
    return Promise.reject(new Error('未指定班级ID'))
  }

  if (!file) {
    console.error('导入学生失败：未提供Excel文件')
    return Promise.reject(new Error('未提供Excel文件'))
  }

  // 构建表单数据
  const formData = new FormData()
  formData.append('file', file)

  // 发送请求
  return request({
    url: `/teacher/course/${courseId}/class/${classId}/students/import-excel`,
    method: 'post',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
}

/**
 * 删除班级服务
 * @param {string|number} courseId - 课程ID
 * @param {string|number} classId - 班级ID
 * @returns {Promise} - 返回删除结果
 */
export function deleteClassService(courseId, classId) {
  // 检查必要参数
  if (!courseId) {
    console.error('删除班级失败：未指定课程ID')
    return Promise.reject(new Error('未指定课程ID'))
  }

  if (!classId) {
    console.error('删除班级失败：未指定班级ID')
    return Promise.reject(new Error('未指定班级ID'))
  }

  return request({
    url: `/teacher/course/${courseId}/class/${classId}`,
    method: 'delete',
  })
}

/**
 * 从班级中移除学生（用学号）
 * @param {string|number} courseId - 课程ID
 * @param {string|number} classId - 班级ID
 * @param {string|number} studentNumber - 学号
 * @returns {Promise}
 */
export function deleteStudentFromClass(courseId, classId, studentNumber) {
  if (!courseId) {
    console.error('删除学生失败：未指定课程ID')
    return Promise.reject(new Error('未指定课程ID'))
  }
  if (!classId) {
    console.error('删除学生失败：未指定班级ID')
    return Promise.reject(new Error('未指定班级ID'))
  }
  if (!studentNumber) {
    console.error('删除学生失败：未指定学号')
    return Promise.reject(new Error('未指定学号'))
  }
  // 使用后端最新接口
  const url = `/teacher/course/${courseId}/class/${classId}/students/${studentNumber}/delete`
  return request({
    url,
    method: 'delete',
  })
}

/**
 * 批量删除学生
 * @param {string|number} courseId - 课程ID
 * @param {string|number} classId - 班级ID
 * @param {Array<string|number>} studentIds - 学生ID或学号列表
 * @returns {Promise} - 返回删除结果
 */
export function batchDeleteStudents(courseId, classId, studentIds) {
  // 检查必要参数
  if (!courseId) {
    console.error('批量删除学生失败：未指定课程ID')
    return Promise.reject(new Error('未指定课程ID'))
  }

  if (!classId) {
    console.error('批量删除学生失败：未指定班级ID')
    return Promise.reject(new Error('未指定班级ID'))
  }

  if (!studentIds || !Array.isArray(studentIds) || studentIds.length === 0) {
    console.error('批量删除学生失败：未提供有效的学生ID列表')
    return Promise.reject(new Error('未提供有效的学生ID列表'))
  }

  return request({
    url: `/teacher/course/${courseId}/class/${classId}/students/batch-delete`,
    method: 'delete',
    data: studentIds,
  })
}

/**
 * 单个导入学生到班级
 * @param {string|number} courseId - 课程ID
 * @param {string|number} classId - 班级ID
 * @param {Object} studentData - 学生数据
 * @param {string} studentData.studentNumber - 学号
 * @param {string} studentData.name - 姓名
 * @param {string} studentData.gender - 性别
 * @param {string} studentData.major - 专业
 * @param {string} [studentData.password] - 密码(可选)
 * @returns {Promise} - 返回导入结果
 */
export function importSingleStudent(courseId, classId, studentData) {
  // 检查必要参数
  if (!courseId) {
    console.error('导入学生失败：未指定课程ID')
    return Promise.reject(new Error('未指定课程ID'))
  }

  if (!classId) {
    console.error('导入学生失败：未指定班级ID')
    return Promise.reject(new Error('未指定班级ID'))
  }

  if (!studentData || !studentData.studentNumber || !studentData.name) {
    console.error('导入学生失败：学生信息不完整')
    return Promise.reject(new Error('学生信息不完整，学号和姓名为必填项'))
  }

  return request({
    url: `/teacher/course/${courseId}/class/${classId}/students/import-single`,
    method: 'post',
    data: studentData,
  })
}

/**
 * 重置学生密码
 * @param {string|number} courseId - 课程ID
 * @param {string|number} classId - 班级ID
 * @param {string|number} studentNumber - 学号
 * @returns {Promise}
 */
export function resetStudentPassword(courseId, classId, studentNumber) {
  if (!courseId) {
    console.error('重置密码失败：未指定课程ID')
    return Promise.reject(new Error('未指定课程ID'))
  }
  if (!classId) {
    console.error('重置密码失败：未指定班级ID')
    return Promise.reject(new Error('未指定班级ID'))
  }
  if (!studentNumber) {
    console.error('重置密码失败：未指定学号')
    return Promise.reject(new Error('未指定学号'))
  }
  const url = `/teacher/course/${courseId}/class/${classId}/students/${studentNumber}/reset-password`
  return request({
    url,
    method: 'post',
  })
}

/**
 * 更新班级信息
 * @param {string|number} courseId - 课程ID
 * @param {string|number} classId - 班级ID
 * @param {string} className - 班级名称
 * @param {File} classImage - 班级封面图片文件
 * @returns {Promise}
 */
export function updateClassService(courseId, classId, className, classImage) {
  if (!courseId) {
    return Promise.reject(new Error('未指定课程ID'))
  }
  if (!classId) {
    return Promise.reject(new Error('未指定班级ID'))
  }
  const formData = new FormData()
  if (className) formData.append('className', className)
  if (classImage !== undefined) formData.append('classImage', classImage)
  for (const pair of formData.entries()) {
    console.log('updateClassService formData:', pair[0], pair[1])
  }
  return request({
    url: `/teacher/course/${courseId}/class/${classId}`,
    method: 'put',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
}

/**
 * 获取未分组学生列表
 * @param {string|number} courseId - 课程ID
 * @param {string|number} classId - 班级ID
 * @returns {Promise} - 返回未分组学生列表
 */
export function getUngroupedStudents(courseId, classId) {
  return request({
    url: `/teacher/course/${courseId}/class/${classId}/ungrouped-students`,
    method: 'get',
  })
}

/**
 * 创建小组
 * @param {string|number} courseId
 * @param {string|number} classId
 * @param {string} name 小组名称
 * @param {Array<number>} studentIds 学生ID数组
 */
export function createGroup(courseId, classId, name, studentIds) {
  return request({
    url: `/teacher/course/${courseId}/class/${classId}/groups`,
    method: 'post',
    data: {
      name,
      studentIds,
    },
  })
}

/**
 * 获取班级小组列表（仅ID和名称）
 */
export function getClassGroupsSimple(courseId, classId) {
  return request({
    url: `/teacher/course/${courseId}/class/${classId}/groups/simple`,
    method: 'get',
  })
}

// 添加成员到小组
export function addMemberToGroup(courseId, classId, groupId, studentId) {
  return request({
    url: `/teacher/course/${courseId}/class/${classId}/groups/${groupId}/members/${studentId}`,
    method: 'post',
  })
}

// 从小组移除成员
export function removeMemberFromGroup(courseId, classId, groupId, studentId) {
  return request({
    url: `/teacher/course/${courseId}/class/${classId}/groups/${groupId}/members/${studentId}`,
    method: 'delete',
  })
}

/**
 * 获取小组详情（含成员列表）
 * @param {string|number} courseId - 课程ID
 * @param {string|number} classId - 班级ID
 * @param {string|number} groupId - 小组ID
 * @returns {Promise}
 */
export function getGroupDetail(courseId, classId, groupId) {
  return request({
    url: `/teacher/course/${courseId}/class/${classId}/groups/${groupId}`,
    method: 'get',
  })
}
