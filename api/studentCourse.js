import request from '@/utils/request'

// 分页查询学生的课程列表（原getAvailableCoursesService重命名并修正url）
export const getAvailableCoursesService = (params) => {
  return request({
    url: '/student/course/page',
    method: 'get',
    params: {
      page: params?.page || 1,
      size: params?.size || 10,
      status: params?.status,
      semester: params?.semester || '',
    },
  })
}

// 选课
export const selectCourseService = (courseId, studentId) => {
  return request({
    url: `/student/course/${courseId}/select`,
    method: 'post',
    params: studentId ? { studentId } : {},
  })
}

// 退课
export const dropCourseService = (courseId, studentId) => {
  return request({
    url: `/student/course/${courseId}/drop`,
    method: 'post',
    params: studentId ? { studentId } : {},
  })
}

// 分页查询学生的课程列表
export const getStudentCoursePageService = (params) => {
  return request({
    url: '/student/course/page',
    method: 'get',
    params: {
      page: params?.page || 1,
      size: params?.size || 10,
      status: params?.status,
      semester: params?.semester || '',
    },
  })
}

/**
 * 学生端：获取课程所有章节
 */
export const getStudentChaptersService = (courseId) => {
  return request({
    url: `/student/course/content/${courseId}/chapters`,
    method: 'get',
  })
}

/**
 * 学生端：获取课程课件列表
 */
export const getStudentMaterialsService = (courseId, params) => {
  return request({
    url: `/student/course/content/${courseId}/materials`,
    method: 'get',
    params: {
      page: params?.page || 1,
      size: params?.size || 10,
      title: params?.title || '',
    },
  })
}
