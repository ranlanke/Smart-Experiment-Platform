<template>
  <div class="courses-container">
    <!-- 顶部操作栏 -->
    <div class="header">
      <div class="header-actions">
        <el-button type="primary" @click="openCreateCourseDialog">
          <el-icon><Plus /></el-icon>
          新建课程
        </el-button>

        <el-dropdown @command="handleFilterCommand">
          <el-button> 课程筛选 <i class="el-icon-arrow-down el-icon--right"></i> </el-button>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="all">全部课程</el-dropdown-item>
              <el-dropdown-item command="closed">已结课</el-dropdown-item>
              <el-dropdown-item command="opened">已开课</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>

        <!-- 搜索输入框 -->
        <div class="search-wrapper">
          <el-input
            v-model="searchQuery"
            placeholder="搜索课程名称或教师"
            class="search-input"
            :suffix-icon="Search"
            @input="debouncedSearch"
            @keyup.enter="handleSearch"
          />
        </div>
      </div>
    </div>

    <!-- 课程列表 -->
    <div v-loading="loading" class="courses-grid">
      <div v-for="(course, index) in courseList" :key="course.id || index" class="course-card">
        <el-card :body-style="{ padding: '10px' }">
          <div class="course-image">
            <img :src="course.coverImageUrl || '/src/assets/信号与系统.jpeg'" :alt="course.title" />
          </div>
          <div class="course-info">
            <div class="course-title">{{ course.title }}</div>
            <div class="course-instructor">
              {{
                course.teacherNames && course.teacherNames.length > 0
                  ? course.teacherNames.join('、')
                  : '默认教师'
              }}
            </div>
            <div
              class="course-status"
              :class="{ opened: course.status === 1, closed: course.status === 0 }"
            >
              {{ course.status === 1 ? '开课中' : '已结课' }}
            </div>
          </div>
          <div class="course-action">
            <div class="button-container">
              <el-button
                type="text"
                @click.stop="joinCourse(course)"
                :loading="buttonLoadingMap[`join_${course.id}`]"
              >
                进入课程
              </el-button>
              <el-button type="text" class="edit-button" @click.stop="openEditCourseDialog(course)">
                编辑课程
              </el-button>
              <el-button
                v-if="course.status === 0"
                type="text"
                class="reopen-button"
                @click.stop="reopenCourse(course.id)"
              >
                再次开课
              </el-button>
              <el-button
                type="text"
                class="manage-teachers-button"
                @click.stop="openManageTeachersDialog(course)"
              >
                管理教师
              </el-button>
              <el-button
                type="text"
                class="delete-button"
                @click.stop="confirmDeleteCourse(course)"
              >
                删除课程
              </el-button>
            </div>
          </div>
        </el-card>
      </div>
    </div>

    <!-- 课程列表为空时显示 -->
    <el-empty v-if="!loading && courseList.length === 0" description="暂无课程数据"></el-empty>

    <!-- 分页器 -->
    <div class="pagination-container" v-if="total > 0">
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :page-sizes="[10, 20, 30, 50]"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>

    <!-- 新建课程对话框 -->
    <el-dialog
      v-model="createCourseDialogVisible"
      title="新建课程"
      width="500px"
      :close-on-click-modal="false"
    >
      <el-form :model="courseForm" ref="courseFormRef" :rules="courseRules" label-width="100px">
        <el-form-item label="课程名称" prop="title">
          <el-input v-model="courseForm.title" placeholder="请输入课程名称"></el-input>
        </el-form-item>
        <el-form-item label="所属单位" prop="organizationName">
          <el-select
            v-model="courseForm.organizationName"
            placeholder="请选择所属单位"
            style="width: 100%"
            :loading="organizationLoading"
            filterable
            allow-create
            default-first-option
          >
            <el-option v-for="org in organizationList" :key="org" :label="org" :value="org" />
          </el-select>
        </el-form-item>
        <!-- 去掉持续时间 -->
        <!-- 学期改为开始时间和结束时间 -->
        <el-form-item label="开始时间" prop="startTime">
          <el-date-picker
            v-model="courseForm.startTime"
            type="date"
            placeholder="请选择开始时间"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="结束时间" prop="endTime">
          <el-date-picker
            v-model="courseForm.endTime"
            type="date"
            placeholder="请选择结束时间"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="学期" prop="semester">
          <el-input v-model="courseForm.semester" placeholder="请输入学期，如2024-2025第一学期" />
        </el-form-item>
        <el-form-item label="课程封面" prop="file">
          <el-upload
            class="course-cover-upload"
            action="#"
            :auto-upload="false"
            :limit="1"
            :on-change="handleFileChange"
            list-type="picture-card"
          >
            <el-icon><Plus /></el-icon>
          </el-upload>
          <div class="upload-tip">请上传课程封面图片（可选，如不上传将使用默认图片）</div>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="cancelCreateCourse">取消</el-button>
          <el-button type="primary" @click="submitCourseForm" :loading="submitLoading"
            >创建</el-button
          >
        </span>
      </template>
    </el-dialog>

    <!-- 删除确认对话框 -->
    <el-dialog
      v-model="deleteConfirmVisible"
      title="删除课程"
      width="300px"
      :close-on-click-modal="false"
    >
      <div class="dialog-content">
        <p>确定要删除该课程吗？</p>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="cancelDelete">取消</el-button>
          <el-button type="primary" @click="deleteCourse" :loading="deleteLoading">删除</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 编辑课程对话框 -->
    <el-dialog
      v-model="editCourseDialogVisible"
      title="编辑课程"
      width="500px"
      :close-on-click-modal="false"
    >
      <el-form
        :model="editCourseForm"
        ref="editCourseFormRef"
        :rules="editCourseRules"
        label-width="100px"
      >
        <el-form-item label="课程名称" prop="title">
          <el-input v-model="editCourseForm.title" placeholder="请输入课程名称"></el-input>
        </el-form-item>
        <el-form-item label="所属单位" prop="organizationName">
          <el-select
            v-model="editCourseForm.organizationName"
            placeholder="请选择所属单位"
            style="width: 100%"
            :loading="organizationLoading"
            filterable
            allow-create
            default-first-option
          >
            <el-option v-for="org in organizationList" :key="org" :label="org" :value="org" />
          </el-select>
        </el-form-item>
        <!-- 去掉持续时间，改为开始时间和结束时间 -->
        <el-form-item label="开始时间" prop="startTime">
          <el-date-picker
            v-model="editCourseForm.startTime"
            type="date"
            placeholder="请选择开始时间"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="结束时间" prop="endTime">
          <el-date-picker
            v-model="editCourseForm.endTime"
            type="date"
            placeholder="请选择结束时间"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="学期" prop="semester">
          <el-input
            v-model="editCourseForm.semester"
            placeholder="请输入学期，如2024-2025第一学期"
          />
        </el-form-item>
        <el-form-item label="课程封面" prop="file">
          <el-upload
            class="course-cover-upload"
            action="#"
            :auto-upload="false"
            :limit="1"
            :on-change="handleEditFileChange"
            list-type="picture-card"
          >
            <el-icon><Plus /></el-icon>
          </el-upload>
          <div class="upload-tip">请上传课程封面图片（可选，如不上传将保持原图片）</div>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="cancelEditCourse">取消</el-button>
          <el-button type="primary" @click="submitEditCourseForm" :loading="editSubmitLoading"
            >保存</el-button
          >
        </span>
      </template>
    </el-dialog>

    <!-- 管理教师对话框 -->
    <el-dialog
      v-model="manageTeachersDialogVisible"
      title="管理教师"
      width="500px"
      :close-on-click-modal="false"
    >
      <div class="manage-teachers-content">
        <div class="course-info">
          <h4>课程：{{ manageTeachersForm.courseTitle }}</h4>
        </div>

        <div class="teachers-section">
          <div class="section-header">
            <h5>当前教师列表</h5>
            <el-button type="primary" size="small" @click="openAddTeacherFromManage">
              <el-icon><Plus /></el-icon>
              添加教师
            </el-button>
          </div>

          <div class="teachers-list" v-if="manageTeachersForm.teachers.length > 0">
            <div
              v-for="teacher in manageTeachersForm.teachers"
              :key="teacher.id"
              class="teacher-item"
            >
              <span class="teacher-name">{{ teacher.name }}</span>
              <el-button
                type="danger"
                size="small"
                @click="removeTeacher(teacher)"
                :loading="buttonLoadingMap[`remove_${teacher.id}`]"
              >
                移除
              </el-button>
            </div>
          </div>

          <el-empty v-else description="暂无教师" :image-size="60"></el-empty>
        </div>
      </div>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="cancelManageTeachers">关闭</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 添加教师对话框 -->
    <el-dialog
      v-model="addTeacherDialogVisible"
      title="添加教师"
      width="400px"
      :close-on-click-modal="false"
    >
      <el-form
        :model="addTeacherForm"
        ref="addTeacherFormRef"
        :rules="addTeacherRules"
        label-width="100px"
      >
        <el-form-item label="工号" prop="employeeId">
          <el-input
            v-model="addTeacherForm.employeeId"
            placeholder="请输入教师工号"
            maxlength="20"
          ></el-input>
        </el-form-item>
        <el-form-item label="课程名称">
          <el-input v-model="addTeacherForm.courseTitle" disabled placeholder="课程名称"></el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="cancelAddTeacher">取消</el-button>
          <el-button @click="submitAddTeacher" :loading="addTeacherLoading">添加</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { Plus, Search } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import {
  createCourseService,
  getCourseListService,
  deleteCourseService,
  updateCourseService,
  republishCourseService,
  getOrganizationsService,
  addTeacherToCourseService,
  removeTeacherFromCourseService,
} from '@/api/course'
import { useRouter } from 'vue-router'

// 在脚本开始处获取router实例
const router = useRouter()

// 课程列表数据
const courseList = ref([])
const loading = ref(false)
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(10)
const searchQuery = ref('')
const searchTimeout = ref(null)

// 添加一个控制每个按钮加载状态的映射
const buttonLoadingMap = ref({})

// 新增：用于筛选状态
const courseStatusFilter = ref(undefined)

// 新增：组织列表相关
const organizationList = ref([])
const organizationLoading = ref(false)

// 获取组织列表
const fetchOrganizationList = async () => {
  try {
    organizationLoading.value = true
    const res = await getOrganizationsService()

    if (res && res.data && res.data.data) {
      organizationList.value = res.data.data
    } else {
      console.warn('组织列表数据结构异常:', res)
      organizationList.value = []
    }
  } catch (error) {
    console.error('获取组织列表失败:', error)
    organizationList.value = []
  } finally {
    organizationLoading.value = false
  }
}

// 获取课程列表
const fetchCourseList = async () => {
  loading.value = true
  try {
    const params = {
      page: currentPage.value,
      size: pageSize.value,
      title: searchQuery.value || undefined,
      semester: undefined,
    }
    // 只有在明确为0或1时才传递status
    if (courseStatusFilter.value === 0 || courseStatusFilter.value === 1) {
      params.status = courseStatusFilter.value
    }

    console.log('获取课程列表参数:', params)
    const res = await getCourseListService(params)
    console.log('获取课程列表响应:', res)

    // 由于request.js中的响应拦截器已经处理了状态码判断
    // 如果请求成功，拦截器会直接返回res，所以这里直接处理数据即可
    if (res && res.data && res.data.data) {
      let records = res.data.data.records || []
      // 前端兜底过滤，确保筛选生效
      if (courseStatusFilter.value === 0 || courseStatusFilter.value === 1) {
        records = records.filter((item) => item.status === courseStatusFilter.value)
      }
      courseList.value = records
      total.value = res.data.data.total || 0 // 修复分页功能，使用后端返回的总数
    } else {
      console.warn('响应数据结构异常:', res)
      ElMessage.warning('课程数据结构异常')
      courseList.value = []
      total.value = 0
    }
  } catch (error) {
    // 这里处理的是网络错误或业务错误(拦截器中已经处理过状态码不为200的情况)
    console.error('获取课程列表错误:', error)
    courseList.value = []
    total.value = 0
  } finally {
    loading.value = false
  }
}

// 防抖搜索
const debouncedSearch = () => {
  if (searchTimeout.value) {
    clearTimeout(searchTimeout.value)
  }
  searchTimeout.value = setTimeout(() => {
    currentPage.value = 1
    fetchCourseList()
  }, 300)
}

// 立即搜索处理函数
const handleSearch = () => {
  if (searchTimeout.value) {
    clearTimeout(searchTimeout.value)
  }
  currentPage.value = 1 // 重置到第一页
  fetchCourseList()
}

// 分页处理
const handleSizeChange = (size) => {
  pageSize.value = size
  fetchCourseList()
}

const handleCurrentChange = (page) => {
  currentPage.value = page
  fetchCourseList()
}

// 筛选课程
const handleFilterCommand = (command) => {
  if (command === 'all') {
    courseStatusFilter.value = undefined // 显示全部
    fetchCourseList()
  } else if (command === 'closed') {
    courseStatusFilter.value = 0 // 只显示已结课
    fetchCourseList()
  } else if (command === 'opened') {
    courseStatusFilter.value = 1 // 只显示已开课
    fetchCourseList()
  }
}

// 修改进入课程函数，明确指定为查看模式
const joinCourse = async (course) => {
  try {
    buttonLoadingMap.value[`join_${course.id}`] = true
    // 使用push保持历史记录，确保可以正确返回
    router.push({
      path: `/home/course/${course.id}`,
      query: { mode: 'edit' },
    })
    ElMessage.success(`正在编辑课程: ${course.title}`)
  } catch (error) {
    console.error('进入课程失败:', error)
    ElMessage.error('进入课程失败，请重试')
  } finally {
    buttonLoadingMap.value[`join_${course.id}`] = false
  }
}

// 再次开课
const reopenCourse = async (courseId) => {
  try {
    // 添加按钮加载状态
    buttonLoadingMap.value[`reopen_${courseId}`] = true

    // 调用重新发布课程的API
    const result = await republishCourseService(courseId)
    console.log('重新发布课程响应:', result)

    // 根据接口文档，如果成功，会返回 code 200 (或类似的成功状态码，依赖request.js的封装)
    // 假设 request.js 成功时直接返回 data 或整个响应对象
    if (result && result.data && result.data.code === 200) {
      ElMessage.success(result.data.message || '课程已重新开课')
      // 重新加载课程列表以更新状态
      fetchCourseList()
    } else if (result && result.code === 200) {
      // 处理 request.js 成功但业务 code 不为 200 的情况
      const errorMsg = result.message || '重新开课失败'
      console.error('重新开课业务错误:', result)
      ElMessage.error(errorMsg)
    } else {
      const errorMsg = result?.data?.message || result?.message || '重新开课失败，请重试'
      console.error('重新开课API错误:', result)
      ElMessage.error(errorMsg)
    }
  } catch (error) {
    console.error('重新开课操作失败:', error)
    ElMessage.error('重新开课操作失败，请稍后重试')
  } finally {
    // 移除按钮加载状态
    buttonLoadingMap.value[`reopen_${courseId}`] = false
  }
}

// 新建课程功能
const createCourseDialogVisible = ref(false)
const submitLoading = ref(false)
const courseFormRef = ref(null)
const courseForm = reactive({
  title: '',
  organizationName: '',
  startTime: '',
  endTime: '',
  semester: '', // 新增
  file: null,
  status: 1,
})

// 表单验证规则
const courseRules = reactive({
  title: [{ required: true, message: '请输入课程名称', trigger: 'blur' }],
  organizationName: [{ required: true, message: '请选择所属单位', trigger: 'change' }],
  startTime: [{ required: true, message: '请选择开始时间', trigger: 'change' }],
  endTime: [{ required: true, message: '请选择结束时间', trigger: 'change' }],
  semester: [{ required: true, message: '请选择学期', trigger: 'change' }], // 新增
})

// 打开创建课程对话框
const openCreateCourseDialog = async () => {
  // 确保组织列表已加载
  if (organizationList.value.length === 0) {
    await fetchOrganizationList()
  }
  createCourseDialogVisible.value = true
}

// 处理文件上传
const handleFileChange = (file) => {
  courseForm.file = file.raw
}

// 获取默认图片
const getDefaultImage = () => {
  // 创建一个1x1的透明PNG
  const canvas = document.createElement('canvas')
  canvas.width = 1
  canvas.height = 1
  const ctx = canvas.getContext('2d')
  ctx.fillStyle = 'transparent'
  ctx.fillRect(0, 0, 1, 1)

  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      const file = new File([blob], 'default.png', { type: 'image/png' })
      resolve(file)
    }, 'image/png')
  })
}

// 提交表单
const submitCourseForm = () => {
  if (!courseFormRef.value) {
    console.error('表单引用不存在')
    return
  }

  courseFormRef.value.validate(async (valid) => {
    if (!valid) {
      console.log('表单验证失败')
      return
    }

    try {
      submitLoading.value = true
      console.log('【DEBUG】开始提交课程表单')
      console.log('【DEBUG】表单原始数据:', JSON.stringify(courseForm))

      // 创建课程对象，只包含必要的字段
      const courseData = {
        title: courseForm.title,
        organizationName: courseForm.organizationName,
        startTime: courseForm.startTime ? new Date(courseForm.startTime).getTime() : '',
        endTime: courseForm.endTime ? new Date(courseForm.endTime).getTime() : '',
        status: 1,
        semester: courseForm.semester, // 新增
      }

      console.log('【DEBUG】提交的课程数据:', courseData)
      console.log('【DEBUG】提交的文件:', courseForm.file)

      // 构造FormData
      const formData = new FormData()
      formData.append('courseInfo', JSON.stringify(courseData))

      // 处理文件上传

      if (courseForm.file) {
        formData.append('file', courseForm.file)
      } else {
        // 使用默认图片
        const defaultImage = await getDefaultImage()
        formData.append('file', defaultImage)
      }

      // 打印 FormData 内容用于调试
      for (const pair of formData.entries()) {
        if (pair[1] instanceof File) {
          console.log('【DEBUG】FormData内容:', pair[0], pair[1].name, pair[1].type, pair[1].size)
        } else {
          console.log('【DEBUG】FormData内容:', pair[0], pair[1])
        }
      }

      // 发送创建课程请求前
      console.log('【DEBUG】即将发送创建课程请求', formData)
      const result = await createCourseService(formData)
      console.log('【DEBUG】创建课程响应:', result)
      // 新增调试信息
      if (result && result.data && result.data.data) {
        console.log('【DEBUG】后端返回课程数据:', result.data.data)
      }

      ElMessage.success(result.data.message || '课程创建成功')
      createCourseDialogVisible.value = false
      setTimeout(() => {
        if (courseFormRef.value) {
          courseFormRef.value.resetFields()
          courseForm.file = null
          courseForm.organizationName = '' // 重置组织名称
          courseForm.semester = '' // 重置学期
          console.log('【DEBUG】表单已重置')
        }
      }, 100)
      setTimeout(() => {
        console.log('【DEBUG】开始刷新课程列表')
        fetchCourseList()
      }, 300)
    } catch (error) {
      console.error('【DEBUG】创建课程失败:', error)
      if (error && error.response) {
        console.error('【DEBUG】后端响应:', error.response)
      }
      ElMessage.error(error.message || '创建课程失败')
    } finally {
      submitLoading.value = false
      console.log('【DEBUG】创建课程流程结束，loading关闭')
    }
  })
}

// 重置表单并关闭对话框
const cancelCreateCourse = () => {
  if (courseFormRef.value) {
    courseFormRef.value.resetFields()
  }
  courseForm.file = null
  courseForm.organizationName = '' // 重置组织名称
  courseForm.semester = '' // 重置学期
  createCourseDialogVisible.value = false
  console.log('取消创建课程，对话框已关闭')
}

// 删除课程相关状态
const courseToDelete = ref(null)
const deleteConfirmVisible = ref(false)
const deleteLoading = ref(false)

// 打开删除确认对话框
const confirmDeleteCourse = (course) => {
  console.log('确认删除课程:', course.title, course.id)
  courseToDelete.value = course
  deleteConfirmVisible.value = true
}

// 执行删除课程
const deleteCourse = async () => {
  if (!courseToDelete.value) {
    console.error('没有要删除的课程')
    return
  }

  deleteLoading.value = true
  try {
    const courseId = courseToDelete.value.id
    console.log(`开始删除课程ID: ${courseId}`)

    const result = await deleteCourseService(courseId)
    console.log('删除课程响应:', result)

    if (result && result.data && result.data.code === 200) {
      ElMessage.success(result.data.message || '课程删除成功')
      // 刷新课程列表
      fetchCourseList()
    } else if (result && result.code === 200) {
      ElMessage.success(result.message || '课程删除成功')
      // 刷新课程列表
      fetchCourseList()
    } else {
      const errorMsg = result?.data?.message || result?.message || '删除失败，请重试'
      console.error('删除课程失败:', errorMsg)
      ElMessage.error(errorMsg)
    }
  } catch (error) {
    console.error('删除课程失败:', error)
    ElMessage.error('删除失败，请重试')
  } finally {
    deleteLoading.value = false
    deleteConfirmVisible.value = false
    courseToDelete.value = null
    console.log('删除操作完成')
  }
}

// 取消删除课程
const cancelDelete = () => {
  deleteConfirmVisible.value = false
  courseToDelete.value = null
}

// 在组件挂载时获取课程列表
onMounted(async () => {
  console.log('组件挂载，初始化数据')
  // 先获取组织列表，再获取课程列表
  await fetchOrganizationList()
  fetchCourseList()
})

// 在 script setup 中添加编辑课程相关的状态
const editCourseDialogVisible = ref(false)
const editCourseFormRef = ref(null)
const editCourseForm = reactive({
  id: null,
  title: '',
  organizationName: '',
  startTime: '',
  endTime: '',
  semester: '', // 新增
  file: null,
  status: 1,
})
const editSubmitLoading = ref(false)

// 编辑课程表单验证规则
const editCourseRules = reactive({
  title: [{ required: true, message: '请输入课程名称', trigger: 'blur' }],
  organizationName: [{ required: true, message: '请选择所属单位', trigger: 'change' }],
  startTime: [{ required: true, message: '请选择开始时间', trigger: 'change' }],
  endTime: [{ required: true, message: '请选择结束时间', trigger: 'change' }],
  semester: [{ required: true, message: '请选择学期', trigger: 'change' }], // 新增
})

// 打开编辑课程对话框
const openEditCourseDialog = async (course) => {
  // 调试信息：打印传入的 course 对象及其 semester 字段
  console.log('【DEBUG】openEditCourseDialog 传入的 course:', course)
  console.log('【DEBUG】course.semester:', course.semester)
  // 确保组织列表已加载
  if (organizationList.value.length === 0) {
    await fetchOrganizationList()
  }

  // 重置表单
  if (editCourseFormRef.value) {
    editCourseFormRef.value.resetFields()
  }

  // 设置表单数据
  editCourseForm.id = course.id
  editCourseForm.title = course.title || course.courseTitle || ''
  editCourseForm.organizationName = course.organizationName || ''

  // 处理时间字段 - 将时间戳转换为日期对象
  if (course.startTime) {
    // 如果是时间戳（数字），转换为日期对象
    if (typeof course.startTime === 'number') {
      editCourseForm.startTime = new Date(course.startTime)
    } else if (typeof course.startTime === 'string') {
      // 如果是字符串，直接创建日期对象
      editCourseForm.startTime = new Date(course.startTime)
    } else {
      editCourseForm.startTime = ''
    }
  } else {
    editCourseForm.startTime = ''
  }

  if (course.endTime) {
    // 如果是时间戳（数字），转换为日期对象
    if (typeof course.endTime === 'number') {
      editCourseForm.endTime = new Date(course.endTime)
    } else if (typeof course.endTime === 'string') {
      // 如果是字符串，直接创建日期对象
      editCourseForm.endTime = new Date(course.endTime)
    } else {
      editCourseForm.endTime = ''
    }
  } else {
    editCourseForm.endTime = ''
  }

  editCourseForm.status = course.status || 1
  editCourseForm.file = null
  editCourseForm.semester = course.semester || '' // 在 openEditCourseDialog 里设置 editCourseForm.semester

  // 调试信息：打印赋值后的 editCourseForm.semester
  console.log('【DEBUG】editCourseForm.semester 赋值后:', editCourseForm.semester)

  editCourseDialogVisible.value = true
}

// 处理编辑表单的文件上传
const handleEditFileChange = (file) => {
  editCourseForm.file = file.raw
}

// 提交编辑表单
const submitEditCourseForm = () => {
  if (!editCourseFormRef.value) {
    console.error('表单引用不存在')
    return
  }

  editCourseFormRef.value.validate(async (valid) => {
    if (!valid) {
      console.log('表单验证失败')
      return
    }

    try {
      editSubmitLoading.value = true
      // 创建课程对象，只包含必要的字段
      const courseData = {
        title: editCourseForm.title,
        organizationName: editCourseForm.organizationName,
        startTime: editCourseForm.startTime ? new Date(editCourseForm.startTime).getTime() : '',
        endTime: editCourseForm.endTime ? new Date(editCourseForm.endTime).getTime() : '',
        status: editCourseForm.status,
        semester: editCourseForm.semester, // 新增
      }

      // 构造FormData
      const formData = new FormData()
      formData.append('courseInfo', JSON.stringify(courseData))

      // 处理文件上传
      if (editCourseForm.file) {
        formData.append('file', editCourseForm.file)
      }

      // 发送更新课程请求
      const result = await updateCourseService(editCourseForm.id, formData)

      ElMessage.success(result.data.message || '课程更新成功')

      // 关闭对话框
      editCourseDialogVisible.value = false

      // 重置表单
      setTimeout(() => {
        if (editCourseFormRef.value) {
          editCourseFormRef.value.resetFields()
          editCourseForm.file = null
          editCourseForm.organizationName = '' // 重置组织名称
          editCourseForm.startTime = '' // 重置开始时间
          editCourseForm.endTime = '' // 重置结束时间
          editCourseForm.semester = '' // 重置学期
        }
      }, 100)

      // 刷新课程列表
      setTimeout(() => {
        fetchCourseList()
      }, 300)
    } catch (error) {
      console.error('更新课程失败:', error)
      ElMessage.error(error.message || '更新课程失败')
    } finally {
      editSubmitLoading.value = false
    }
  })
}

// 取消编辑课程
const cancelEditCourse = () => {
  if (editCourseFormRef.value) {
    editCourseFormRef.value.resetFields()
  }
  editCourseForm.file = null
  editCourseForm.organizationName = '' // 重置组织名称
  editCourseForm.startTime = '' // 重置开始时间
  editCourseForm.endTime = '' // 重置结束时间
  editCourseForm.semester = '' // 重置学期
  editCourseDialogVisible.value = false
}

// 添加教师相关状态
const addTeacherDialogVisible = ref(false)
const addTeacherFormRef = ref(null)
const addTeacherLoading = ref(false)
const addTeacherForm = reactive({
  courseId: null,
  courseTitle: '',
  employeeId: '',
})

// 添加教师表单验证规则
const addTeacherRules = reactive({
  employeeId: [
    { required: true, message: '请输入教师工号', trigger: 'blur' },
    { min: 1, max: 20, message: '工号长度在1到20个字符', trigger: 'blur' },
  ],
})

// 打开添加教师对话框
const openAddTeacherDialog = (course) => {
  addTeacherForm.courseId = course.id
  addTeacherForm.courseTitle = course.title || course.courseTitle || ''
  addTeacherForm.employeeId = ''
  addTeacherDialogVisible.value = true
}

// 提交添加教师
const submitAddTeacher = () => {
  if (!addTeacherFormRef.value) {
    console.error('表单引用不存在')
    return
  }

  addTeacherFormRef.value.validate(async (valid) => {
    if (!valid) {
      console.log('表单验证失败')
      return
    }

    try {
      addTeacherLoading.value = true
      console.log('开始添加教师:', {
        courseId: addTeacherForm.courseId,
        employeeId: addTeacherForm.employeeId,
      })

      const result = await addTeacherToCourseService(
        addTeacherForm.courseId,
        addTeacherForm.employeeId,
      )
      console.log('添加教师响应:', result)

      if (result && result.data && result.data.code === 200) {
        ElMessage.success(result.data.message || '教师添加成功')
        addTeacherDialogVisible.value = false

        // 如果是从管理教师对话框打开的，也要关闭管理教师对话框
        if (manageTeachersDialogVisible.value) {
          manageTeachersDialogVisible.value = false
          // 重置管理教师表单
          setTimeout(() => {
            manageTeachersForm.courseId = null
            manageTeachersForm.courseTitle = ''
            manageTeachersForm.teachers = []
          }, 100)
        }

        // 重置表单
        setTimeout(() => {
          if (addTeacherFormRef.value) {
            addTeacherFormRef.value.resetFields()
            addTeacherForm.courseId = null
            addTeacherForm.courseTitle = ''
            addTeacherForm.employeeId = ''
          }
        }, 100)
        // 刷新课程列表以获取最新数据
        setTimeout(() => {
          fetchCourseList()
        }, 300)
      } else {
        const errorMsg = result?.data?.message || result?.message || '添加教师失败，请重试'
        console.error('添加教师失败:', errorMsg)
        ElMessage.error(errorMsg)
      }
    } catch (error) {
      console.error('添加教师操作失败:', error)
      ElMessage.error('添加教师失败，请稍后重试')
    } finally {
      addTeacherLoading.value = false
    }
  })
}

// 取消添加教师
const cancelAddTeacher = () => {
  if (addTeacherFormRef.value) {
    addTeacherFormRef.value.resetFields()
  }
  addTeacherForm.courseId = null
  addTeacherForm.courseTitle = ''
  addTeacherForm.employeeId = ''
  addTeacherDialogVisible.value = false
}

// 管理教师相关状态
const manageTeachersDialogVisible = ref(false)
const manageTeachersForm = reactive({
  courseId: null,
  courseTitle: '',
  teachers: [],
})

// 打开管理教师对话框
const openManageTeachersDialog = (course) => {
  manageTeachersForm.courseId = course.id
  manageTeachersForm.courseTitle = course.title || course.courseTitle || ''

  // 将教师名称数组转换为对象数组，用于显示和操作
  if (course.teacherNames && course.teacherNames.length > 0) {
    manageTeachersForm.teachers = course.teacherNames.map((name, index) => ({
      id: index + 1, // 临时ID，实际应该从后端获取教师ID
      name: name,
    }))
  } else {
    manageTeachersForm.teachers = []
  }

  manageTeachersDialogVisible.value = true
}

// 从管理教师对话框中打开添加教师对话框
const openAddTeacherFromManage = () => {
  // 关闭管理教师对话框
  manageTeachersDialogVisible.value = false

  // 打开添加教师对话框
  addTeacherForm.courseId = manageTeachersForm.courseId
  addTeacherForm.courseTitle = manageTeachersForm.courseTitle
  addTeacherForm.employeeId = ''
  addTeacherDialogVisible.value = true
}

// 移除教师
const removeTeacher = async (teacher) => {
  try {
    buttonLoadingMap.value[`remove_${teacher.id}`] = true

    console.log('开始移除教师:', {
      courseId: manageTeachersForm.courseId,
      teacherId: teacher.id,
      teacherName: teacher.name,
    })

    const result = await removeTeacherFromCourseService(manageTeachersForm.courseId, teacher.id)
    console.log('移除教师响应:', result)

    if (result && result.data && result.data.code === 200) {
      ElMessage.success(result.data.message || '教师移除成功')

      // 关闭管理教师对话框
      manageTeachersDialogVisible.value = false

      // 重置管理教师表单
      setTimeout(() => {
        manageTeachersForm.courseId = null
        manageTeachersForm.courseTitle = ''
        manageTeachersForm.teachers = []
      }, 100)

      // 刷新课程列表以获取最新数据
      setTimeout(() => {
        fetchCourseList()
      }, 300)
    } else {
      const errorMsg = result?.data?.message || result?.message || '移除教师失败，请重试'
      console.error('移除教师失败:', errorMsg)
      ElMessage.error(errorMsg)
    }
  } catch (error) {
    console.error('移除教师操作失败:', error)
    ElMessage.error('移除教师失败，请稍后重试')
  } finally {
    buttonLoadingMap.value[`remove_${teacher.id}`] = false
  }
}

// 取消管理教师
const cancelManageTeachers = () => {
  manageTeachersForm.courseId = null
  manageTeachersForm.courseTitle = ''
  manageTeachersForm.teachers = []
  manageTeachersDialogVisible.value = false
}
</script>

<style lang="scss" scoped>
.courses-grid {
  .course-card {
    position: relative;
    cursor: pointer;
    transition: transform 0.3s ease;

    &:hover {
      transform: translateY(-5px);

      .el-card {
        box-shadow: 0 6px 18px rgba(0, 0, 0, 0.12);
      }
    }

    .hover-card {
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      &:hover {
        &::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.03);
        }
      }
    }

    .el-card {
      height: 100%;
      transition: box-shadow 0.3s;

      .course-image {
        img {
          width: 100%;
          height: 140px; // 稍微增加图片高度
          object-fit: cover;
          transition: transform 0.3s;
        }
      }
    }
  }
}

.courses-container {
  padding: 20px;
  background-color: #f5f5f5;

  .header {
    margin-bottom: 20px;
    padding: 0 10px;

    .header-actions {
      display: flex;
      align-items: center;
      gap: 10px;

      .search-wrapper {
        margin-left: auto;
      }

      .search-input {
        width: 300px; /* 增加搜索框宽度 */
      }

      .el-button {
        display: flex;
        align-items: center;
        gap: 4px;
      }
    }
  }

  .courses-grid {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    gap: 20px;
    min-height: 200px;

    .course-card {
      .el-card {
        height: 100%;
        box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);

        .course-image {
          img {
            width: 100%;
            height: 120px;
            object-fit: cover;
          }
        }

        .course-info {
          padding: 10px;

          .course-title {
            font-weight: bold;
            margin-bottom: 5px;
          }

          .course-instructor {
            color: #666;
            font-size: 14px;
          }

          .course-status {
            margin-top: 5px;
            font-size: 14px;
            &.opened {
              color: #409eff; // 已开课的颜色 (改为蓝色)
            }

            &.closed {
              color: #f56c6c; // 已结课的颜色 (保持红色)
            }
          }

          .course-status.closed {
            color: #f56c6c; // 已结课的颜色
          }
        }

        .course-action {
          text-align: right;
          padding: 10px;

          .button-container {
            display: flex;
            flex-wrap: wrap;
            justify-content: flex-end;
            gap: 10px;
            min-height: 20px; /* 确保按钮容器有固定高度 */
          }

          .el-button {
            color: #409eff;
            margin-left: 0; /* 覆盖el-button默认的margin */
          }

          .edit-button {
            color: #67c23a; /* 使用成功色，表示编辑操作 */
          }

          .reopen-button {
            color: #e6a23c; /* 使用警告色，区分不同按钮 */
          }

          .manage-teachers-button {
            color: #409eff; /* 使用蓝色，表示管理教师操作 */
          }

          .add-teacher-button {
            color: #909399; /* 使用灰色，表示添加教师操作 */
          }

          .delete-button {
            color: #f56c6c; /* 使用红色，表示删除操作 */
          }
        }
      }
    }
  }
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}

.unit-label {
  margin-left: 8px;
  color: #606266;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.course-cover-upload {
  width: 100%;

  :deep(.el-upload--picture-card) {
    width: 148px;
    height: 148px;
    line-height: 148px;
  }

  .upload-tip {
    font-size: 12px;
    color: #909399;
    margin-top: 8px;
  }
}

// 删除确认对话框样式
.dialog-content {
  margin: 20px 0;
  text-align: center;
}

// 组织选择下拉菜单样式
:deep(.el-select) {
  width: 100%;
}

:deep(.el-select-dropdown) {
  max-height: 200px;
}

:deep(.el-select-dropdown__item) {
  padding: 8px 12px;
  font-size: 14px;
}

// 管理教师对话框样式
.manage-teachers-content {
  .course-info {
    margin-bottom: 20px;
    padding-bottom: 15px;
    border-bottom: 1px solid #ebeef5;

    h4 {
      margin: 0;
      color: #303133;
    }
  }

  .teachers-section {
    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 15px;

      h5 {
        margin: 0;
        color: #606266;
      }
    }

    .teachers-list {
      .teacher-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 10px;
        margin-bottom: 8px;
        background-color: #f8f9fa;
        border-radius: 4px;
        border: 1px solid #e9ecef;

        .teacher-name {
          font-weight: 500;
          color: #303133;
        }
      }
    }
  }
}
</style>
