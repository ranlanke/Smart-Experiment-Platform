import request from '@/utils/request'
import { useStudentStore } from '@/stores/modules/xueshenguser' // 导入学生 store
// 获取可访问的实验模板列表
export function getStudentExperimentTemplates() {
  return request({
    url: '/student/experiment/templates',
    method: 'get',
  })
}
// 获取老师所有实验模板详情
export function getStudentExperimentTemplateDetail(templateId, studentId) {
  return request({
    url: `/student/experiment/template/${templateId}`,
    method: 'get',
    params: studentId ? { studentId } : undefined,
  })
}

// 获取学生实验模板详情接口
export function getStudentExperimentStudentTemplateDetail(studentTemplateId) {
  const studentStore = useStudentStore() // 获取 store 实例
  const token = studentStore.token // 从 store 中获取 token

  // 检查 token 是否存在
  if (!token) {
    // 如果 token 不存在，可以根据需要处理，例如抛出错误或返回一个 rejected Promise
    console.error('认证 token 不存在，无法获取学生实验模板详情。')
    // 例如，抛出一个错误
    throw new Error('Authentication token not available.')
    // 或者返回一个 Promise.reject
    // return Promise.reject(new Error('Authentication token not available.'));
  }

  return request({
    url: `/student/experiment/student-template/${studentTemplateId}`,
    method: 'get',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
}

// 暂时注释saveStudentExperimentTemplate方法，后续补充
// export function saveStudentExperimentTemplate(studentTemplateId, studentId) {
//   return request({
//     url: `/student/experiment/student-template/${studentTemplateId}/submit`,
//     method: 'post',
//     params: studentId ? { studentId } : undefined,
//   })
// }

// 提交学生实验模板
// export function saveOrUpdateStudentExperimentTemplate(templateId, studentId, body) {
//   const req = {
//     url: `/student/experiment/template/${templateId}`,
//     method: 'put',
//     params: studentId ? { studentId } : undefined,
//     data: body,
//   }
//   console.log('【API调试】保存/更新学生实验模板请求：', req)
//   return request(req)
// }

// 创建学生实验模板（从教师模板复制）
export function createStudentExperimentTemplate(templateId, studentId) {
  const studentStore = useStudentStore()
  const token = studentStore.token
  if (!token) {
    throw new Error('Authentication token not available.')
  }
  return request({
    url: `/student/experiment/template/${templateId}/create`,
    method: 'post',
    params: studentId ? { studentId } : undefined,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
}

// 更新学生实验模板及其组件
export function updateStudentExperimentStudentTemplate(studentTemplateId, components) {
  const studentStore = useStudentStore()
  const token = studentStore.token
  if (!token) {
    throw new Error('Authentication token not available.')
  }
  return request({
    url: `/student/experiment/student-template/${studentTemplateId}`,
    method: 'put',
    data: components,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
}

// 提交学生实验模板
export function submitStudentExperimentStudentTemplate(studentTemplateId, studentId) {
  const studentStore = useStudentStore()
  const token = studentStore.token
  if (!token) {
    throw new Error('Authentication token not available.')
  }
  return request({
    url: `/student/experiment/student-template/${studentTemplateId}/submit`,
    method: 'post',
    params: studentId ? { studentId } : undefined,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
}

// 查找属于某个教师模板的学生自己的实验模板
export async function findStudentTemplateByTeacherId(teacherTemplateId) {
  try {
    const res = await getStudentExperimentTemplates()
    if (res && res.data && Array.isArray(res.data.data)) {
      // 类型统一为字符串比较，避免类型不一致导致查找失败
      return res.data.data.find(
        (tpl) => String(tpl.original_template_id) === String(teacherTemplateId),
      )
    }
  } catch (e) {
    console.error('查找学生实验模板失败', e)
  }
  return null
}

// 保存或更新学生实验模板（学生端专用）
export function saveOrUpdateStudentExperimentStudentTemplate(studentTemplateId, body, studentId) {
  const studentStore = useStudentStore()
  const token = studentStore.token
  if (!token) {
    throw new Error('Authentication token not available.')
  }
  return request({
    url: `/student/experiment/student-template/${studentTemplateId}`,
    method: 'put',
    data: body,
    params: studentId ? { studentId } : undefined,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
}

// 获取学生的实验模板列表
export function getStudentExperimentStudentTemplates() {
  const studentStore = useStudentStore()
  const token = studentStore.token
  if (!token) {
    throw new Error('Authentication token not available.')
  }
  return request({
    url: '/student/experiment/student-templates',
    method: 'get',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
}

// 获取指定课程的所有提交记录
export function getStudentExperimentSubmissionsByCourse(courseId) {
  const studentStore = useStudentStore()
  const token = studentStore.token
  if (!token) {
    throw new Error('Authentication token not available.')
  }
  return request({
    url: `/student/experiment/course/${courseId}/submissions`,
    method: 'get',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
}

// 获取某课程下的实验模板列表
export function getStudentExperimentTemplatesByCourse(courseId) {
  return request({
    url: `/student/experiment/course/${courseId}/templates`,
    method: 'get',
  })
}

// 获取指定课程下可供学生开始的实验列表（已发布的教师模板）
export function getAvailableTemplatesByCourse(courseId, studentId) {
  const studentStore = useStudentStore()
  const token = studentStore.token
  if (!token) {
    throw new Error('Authentication token not available.')
  }
  return request({
    url: `/student/experiment-data/course/${courseId}/available-templates`,
    method: 'get',
    params: studentId ? { studentId } : undefined,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
}

// 创建学生实验数据（从教师模板复制）
export function createStudentExperimentData(templateId, studentId) {
  const studentStore = useStudentStore()
  const token = studentStore.token
  if (!token) {
    throw new Error('Authentication token not available.')
  }
  return request({
    url: `/student/experiment-data/template/${templateId}/create`,
    method: 'post',
    params: studentId ? { studentId } : undefined,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
}

// 获取学生在指定课程下已创建的实验数据列表
export function getMyExperimentDataListByCourse(courseId, studentId) {
  const studentStore = useStudentStore()
  const token = studentStore.token
  if (!token) {
    throw new Error('Authentication token not available.')
  }
  return request({
    url: `/student/experiment-data/course/${courseId}/my-data`,
    method: 'get',
    params: studentId ? { studentId } : undefined,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
}

// 获取学生实验数据详情
export function getStudentExperimentDataDetail(experimentDataId) {
  const studentStore = useStudentStore()
  const token = studentStore.token
  if (!token) {
    throw new Error('Authentication token not available.')
  }
  return request({
    url: `/student/experiment-data/${experimentDataId}`,
    method: 'get',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
}

// 更新学生实验数据
export function updateStudentExperimentData(experimentDataId, components) {
  const studentStore = useStudentStore()
  const token = studentStore.token
  if (!token) {
    throw new Error('Authentication token not available.')
  }
  return request({
    url: `/student/experiment-data/${experimentDataId}`,
    method: 'put',
    data: components,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
}

// 提交学生实验数据
export function submitStudentExperimentData(experimentDataId) {
  const studentStore = useStudentStore()
  const token = studentStore.token
  if (!token) {
    throw new Error('Authentication token not available.')
  }
  return request({
    url: `/student/experiment-data/${experimentDataId}/submit`,
    method: 'post',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
}

// 获取指定课程下学生实验数据提交记录列表
export function getStudentExperimentDataSubmissionsByCourse(courseId) {
  const studentStore = useStudentStore()
  const token = studentStore.token
  if (!token) {
    throw new Error('Authentication token not available.')
  }
  return request({
    url: '/student/experiment-data/submissions',
    method: 'get',
    params: { courseId },
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
}

// 获取单个实验数据提交记录的详细信息
export function getStudentExperimentDataSubmissionDetail(submissionId, studentId) {
  const studentStore = useStudentStore()
  const token = studentStore.token
  if (!token) {
    throw new Error('Authentication token not available.')
  }
  return request({
    url: `/student/experiment-data/submission/${submissionId}/detail`,
    method: 'get',
    params: studentId ? { studentId } : undefined,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
}

// 获取单个实验报告提交记录的详细信息
export function getStudentExperimentSubmissionDetail(submissionId, studentId) {
  const studentStore = useStudentStore()
  const token = studentStore.token
  if (!token) {
    throw new Error('Authentication token not available.')
  }
  return request({
    url: `/student/experiment/submission/${submissionId}/detail`,
    method: 'get',
    params: studentId ? { studentId } : undefined,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
}
