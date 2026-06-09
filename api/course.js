import request from '@/utils/request'

// 创建课程 - 使用multipart/form-data格式，按接口文档要求
export const createCourseService = (formData) => {
  return request({
    url: '/teacher/course/create',
    method: 'post',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
}

// 分页查询教师的课程简要信息
export const getCourseListService = (params) => {
  return request({
    url: '/teacher/course/simple/page',
    method: 'get',
    params: {
      page: params.page || 1,
      size: params.size || 10,
      title: params.title,
      teacherName: params.teacherName,
      keywords: params.keywords,
      semester: params.semester,
    },
  })
}

// // 获取课程详情
// export const getCourseDetailService = (courseId) => {
//   return request({
//     url: `/teacher/course/${courseId}`,
//     method: 'get',
//   })
// }

// // 更新课程状态
// export const updateCourseStatusService = (courseId, status) => {
//   return request({
//     url: `/teacher/course/${courseId}/status`,
//     method: 'put',
//     data: { status },
//   })
// }

// 获取组织/学院列表
export const getOrganizationsService = () => {
  return request({
    url: '/teacher/course/organizations',
    method: 'get',
  })
}

// 删除课程
export const deleteCourseService = (courseId) => {
  return request({
    url: `/teacher/course/${courseId}`,
    method: 'delete',
  })
}

// 进入指定课程
export const enterCourseService = (courseId) => {
  return request({
    url: `/teacher/course/${courseId}/enter`,
    method: 'get',
  })
}

// 上传课件
export const uploadCourseMaterialService = (courseId, title, file) => {
  console.log('API调用: 上传课件', { courseId, title, file })

  if (!courseId || !title || !file) {
    console.error('上传课件参数不完整:', { courseId, title, fileExists: !!file })
    return Promise.reject(new Error('上传课件参数不完整'))
  }

  const formData = new FormData()
  formData.append('file', file)

  return request({
    url: `/teacher/course/${courseId}/materials?title=${encodeURIComponent(title)}`,
    method: 'post',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  }).then((response) => {
    console.log('API响应处理:', response)
    // 确保格式一致 - 响应可能直接是数据对象，也可能是包装对象
    return response
  })
}

// 获取课件列表
export const getCourseMaterialsService = (courseId, params) => {
  return request({
    url: `/teacher/course/${courseId}/materials`,
    method: 'get',
    params: {
      page: params?.page || 1,
      size: params?.size || 10,
      fileType: params?.fileType || '',
      title: params?.title || '',
    },
  })
}

// 获取课件详情
export const getCourseMaterialDetailService = (courseId, materialId) => {
  return request({
    url: `/teacher/course/${courseId}/materials/${materialId}`,
    method: 'get',
  })
}

// 删除课件
export const deleteCourseMaterialService = (courseId, materialId) => {
  return request({
    url: `/teacher/course/${courseId}/materials/${materialId}`,
    method: 'delete',
  })
}

// 下载课件
export const downloadCourseMaterialService = (courseId, materialId) => {
  return request({
    url: `/teacher/course/${courseId}/materials/${materialId}/download`,
    method: 'get',
    responseType: 'blob', // 指定响应类型为blob
  })
}

// 更新课程信息
export const updateCourseService = (courseId, formData) => {
  return request({
    url: `/teacher/course/${courseId}`,
    method: 'put',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
}

// 重新发布课程
export const republishCourseService = (courseId) => {
  return request({
    url: `/teacher/course/${courseId}/republish`,
    method: 'put',
  })
}

// 添加教师到课程
export const addTeacherToCourseService = (courseId, employeeId) => {
  return request({
    url: `/teacher/course/${courseId}/add-teacher-by-employee`,
    method: 'post',
    params: {
      employeeId: employeeId,
    },
  })
}

// 移除课程的任课老师
export const removeTeacherFromCourseService = (courseId, teacherId) => {
  return request({
    url: `/teacher/course/${courseId}/remove-teacher`,
    method: 'delete',
    params: {
      teacherId: teacherId,
    },
  })
}
