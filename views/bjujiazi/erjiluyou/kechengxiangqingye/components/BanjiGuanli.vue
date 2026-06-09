<template>
  <div class="banji-container">
    <h2 class="page-title">班级管理</h2>

    <!-- 调试信息，仅开发时使用 -->
    <div v-if="false" class="debug-info">
      <p>当前图片URL: {{ imageUrl }}</p>
      <p>图片文件: {{ imageFile ? imageFile.name : '无' }}</p>
    </div>

    <!-- 操作按钮区域 -->
    <div class="operation-btns">
      <el-button type="primary" icon="Plus" @click="showCreateClassDialog">创建班级</el-button>
    </div>

    <!-- 搜索区域 -->
    <div class="search-area">
      <el-input v-model="searchText" placeholder="搜索班级" class="search-input" clearable>
        <template #prefix>
          <el-icon><Search /></el-icon>
        </template>
      </el-input>
      <el-button type="primary" @click="handleSearch">搜索</el-button>
    </div>

    <!-- 班级卡片列表 -->
    <div class="class-list">
      <el-empty v-if="classList.length === 0" description="暂无班级数据" />
      <div v-else class="banji-table-list">
        <div class="banji-table-header">
          <span class="banji-col name">班级名称</span>
          <span class="banji-col count">学生数</span>
          <span class="banji-col actions">操作</span>
        </div>
        <template v-for="item in classList" :key="item.id">
          <div
            class="banji-table-row"
            @click="toggleStudentList(item)"
            :style="{ cursor: 'pointer' }"
          >
            <span class="banji-col name">
              <span
                v-if="!item.isEditing"
                class="class-name-text"
                @click.stop="startEditClassName(item)"
                >{{ item.className }}</span
              >
              <el-input
                v-else
                v-model="item.editingName"
                size="small"
                @blur="saveClassName(item)"
                @keyup.enter="saveClassName(item)"
                @keyup.esc="cancelEditClassName(item)"
                ref="classNameInput"
                style="width: 200px"
                @click.stop
              />
            </span>
            <span class="banji-col count">{{ item.studentCount || 0 }}</span>
            <span class="banji-col actions" @click.stop>
              <el-button size="small" type="success" @click="toggleSection(item.id, 'student')"
                >学生管理</el-button
              >
              <el-button size="small" type="info" @click="toggleSection(item.id, 'group')"
                >分组管理</el-button
              >
              <el-button size="small" type="danger" @click="handleDeleteClass(item)"
                >删除</el-button
              >
            </span>
          </div>
          <!-- 学生列表展开 -->
          <div v-if="expandedStudentListIds.includes(item.id)" class="banji-table-row expanded-row">
            <span class="banji-col name" style="padding-left: 0" colspan="3">
              <div class="class-section">
                <h4>学生列表</h4>
                <el-table
                  :data="classStudentMap[item.id] || []"
                  border
                  style="width: 100%"
                  height="350"
                  max-height="350"
                >
                  <el-table-column prop="studentNumber" label="学号" width="110"></el-table-column>
                  <el-table-column prop="name" label="姓名" width="80"></el-table-column>
                  <el-table-column prop="gender" label="性别" width="60"></el-table-column>
                  <el-table-column prop="major" label="专业" min-width="150"></el-table-column>
                </el-table>
              </div>
            </span>
          </div>

          <div v-if="expandedSections[item.id] === 'student'" class="banji-table-row expanded-row">
            <span class="banji-col name" style="padding-left: 0" colspan="3">
              <div class="class-section">
                <h4>学生管理</h4>
                <div class="function-group">
                  <h5>导入学生</h5>
                  <div class="function-btns">
                    <el-button
                      type="primary"
                      @click="
                        () => {
                          currentEditClass = item
                          handleImportExcel()
                        }
                      "
                    >
                      <el-icon><Document /></el-icon>
                      模板导入
                    </el-button>
                    <el-button
                      type="success"
                      @click="
                        () => {
                          currentEditClass = item
                          showSingleImportDialog()
                        }
                      "
                    >
                      <el-icon><Plus /></el-icon>
                      单一录入
                    </el-button>
                    <el-button type="info" @click="downloadExcelTemplate">
                      <el-icon><Download /></el-icon>
                      下载模板
                    </el-button>
                  </div>
                </div>
                <div class="function-group">
                  <h5>学生列表</h5>
                  <el-table
                    v-loading="studentsLoading"
                    :data="classStudentMap[item.id] || []"
                    border
                    style="width: 100%"
                    @selection-change="handleSelectionChange"
                    height="350"
                    max-height="350"
                  >
                    <el-table-column type="selection" width="50"></el-table-column>
                    <el-table-column
                      prop="studentNumber"
                      label="学号"
                      width="110"
                    ></el-table-column>
                    <el-table-column prop="name" label="姓名" width="80"></el-table-column>
                    <el-table-column prop="gender" label="性别" width="60"></el-table-column>
                    <el-table-column prop="major" label="专业" min-width="150"></el-table-column>
                    <el-table-column label="密码" width="100">
                      <template #default="scope">
                        <span>{{
                          passwordVisibility[scope.row.id] ? getStudentPassword(scope.row) : '*****'
                        }}</span>
                        <el-tooltip
                          :content="
                            passwordVisibility[scope.row.id] ? '点击隐藏密码' : '点击显示密码'
                          "
                          placement="top"
                        >
                          <el-icon
                            class="warning-icon"
                            @click="togglePasswordVisibility(scope.row.id)"
                            style="cursor: pointer; margin-left: 5px"
                          >
                            <Lock />
                          </el-icon>
                        </el-tooltip>
                      </template>
                    </el-table-column>
                    <el-table-column label="操作" width="200">
                      <template #default="scope">
                        <div class="operation-buttons">
                          <el-button
                            type="danger"
                            size="small"
                            @click="handleDeleteStudent(scope.row)"
                            >删除</el-button
                          >
                          <el-button
                            type="warning"
                            size="small"
                            @click="handleResetPassword(scope.row)"
                            >重置密码</el-button
                          >
                        </div>
                      </template>
                    </el-table-column>
                  </el-table>
                  <div class="table-actions">
                    <!-- <el-button
                      type="primary"
                      size="small"
                      @click="
                        () => {
                          currentEditClass = item
                          loadStudentList()
                        }
                      "
                    >
                      <el-icon><Refresh /></el-icon>
                      刷新列表
                    </el-button> -->
                    <el-button type="warning" size="small" @click="handleBatchResetPassword">
                      <el-icon><Key /></el-icon>
                      批量重置密码
                    </el-button>
                    <el-button type="danger" size="small" @click="handleBatchDeleteStudents">
                      <el-icon><Delete /></el-icon>
                      批量删除
                    </el-button>
                  </div>
                </div>
              </div>
            </span>
          </div>
          <div v-if="expandedSections[item.id] === 'group'" class="banji-table-row expanded-row">
            <span class="banji-col name" style="padding-left: 0" colspan="3">
              <div class="class-section">
                <h4>分组管理</h4>
                <banjiguanliFenZu :courseId="item.courseId" :classId="item.id" />
              </div>
            </span>
          </div>
        </template>
      </div>
    </div>

    <!-- 分页控件 -->
    <div class="pagination" v-if="total > 0">
      <el-pagination
        background
        layout="total, prev, pager, next, jumper"
        :total="total"
        :page-size="pageSize"
        :current-page="currentPage"
        @current-change="handlePageChange"
      />
    </div>

    <!-- 创建班级对话框 -->
    <el-dialog
      v-model="createClassDialogVisible"
      title="创建班级"
      width="500px"
      :close-on-click-modal="false"
    >
      <el-form
        ref="createClassFormRef"
        :model="createClassForm"
        :rules="createClassRules"
        label-width="100px"
        label-position="right"
      >
        <div class="form-tips">
          <el-alert
            title="提示：除班级名称外，班级封面为可选项"
            type="info"
            :closable="false"
            show-icon
          />
        </div>
        <el-form-item label="班级名称" prop="className">
          <el-input v-model="createClassForm.className" placeholder="请输入班级名称" clearable />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="createClassDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitCreateClass" :loading="createClassLoading">
            创建
          </el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 班级编辑对话框 -->
    <el-dialog
      v-model="editClassDialogVisible"
      :title="`编辑班级: ${currentEditClass?.className || ''}`"
      width="850px"
      :close-on-click-modal="false"
      custom-class="edit-class-dialog"
      :show-close="true"
      top="5vh"
      :fullscreen="false"
      :modal="true"
      @close="closeEditDialog"
    >
      <div class="edit-class-container">
        <!-- 标签页导航 -->
        <el-tabs v-model="activeTab" class="edit-tabs">
          <el-tab-pane label="班级设置" name="settings">
            <!-- 班级信息 -->
            <div class="class-info-preview">
              <h4>班级信息</h4>

              <!-- 表单 -->
              <el-form label-width="100px" label-position="right">
                <el-form-item label="班级名称">
                  <el-input v-model="editClassForm.className" placeholder="请输入班级名称" />
                </el-form-item>

                <el-form-item label="班级代码" class="code-display">
                  <span>{{ currentEditClass?.classCode || '' }}</span>
                  <el-tag size="small" type="info">只读</el-tag>
                </el-form-item>

                <el-form-item label="创建时间" class="time-display">
                  <span>{{ formatDate(currentEditClass?.createTime) }}</span>
                  <el-tag size="small" type="info">只读</el-tag>
                </el-form-item>
              </el-form>
            </div>
          </el-tab-pane>

          <el-tab-pane label="学生管理" name="students">
            <div class="function-group">
              <h4>导入学生</h4>
              <div class="function-btns">
                <el-button type="primary" @click="handleImportExcel">
                  <el-icon><Document /></el-icon>
                  模板导入
                </el-button>
                <el-button type="success" @click="showSingleImportDialog">
                  <el-icon><Plus /></el-icon>
                  单一录入
                </el-button>
                <el-button type="info" @click="downloadExcelTemplate">
                  <el-icon><Download /></el-icon>
                  下载模板
                </el-button>
              </div>
            </div>

            <div class="function-group">
              <h4>学生列表</h4>
              <!-- 替换为实际的学生列表表格 -->
              <div v-if="studentList.length === 0">
                <el-empty description="暂无学生数据" />
                <div class="table-actions">
                  <el-button type="primary" size="small" @click="loadStudentList">
                    <el-icon><Refresh /></el-icon>
                    刷新列表
                  </el-button>
                </div>
              </div>
              <div v-else class="student-table-container">
                <el-table
                  v-loading="studentsLoading"
                  :data="studentList"
                  border
                  style="width: 100%"
                  @selection-change="handleSelectionChange"
                  height="350"
                  max-height="350"
                >
                  <el-table-column type="selection" width="50"></el-table-column>
                  <el-table-column prop="studentNumber" label="学号" width="110"></el-table-column>
                  <el-table-column prop="name" label="姓名" width="80"></el-table-column>
                  <el-table-column prop="gender" label="性别" width="60"></el-table-column>
                  <el-table-column prop="major" label="专业" min-width="150"></el-table-column>
                  <el-table-column label="密码" width="100">
                    <template #default="scope">
                      <span>{{
                        passwordVisibility[scope.row.id] ? getStudentPassword(scope.row) : '*****'
                      }}</span>
                      <el-tooltip
                        :content="
                          passwordVisibility[scope.row.id] ? '点击隐藏密码' : '点击显示密码'
                        "
                        placement="top"
                      >
                        <el-icon
                          class="warning-icon"
                          @click="togglePasswordVisibility(scope.row.id)"
                          style="cursor: pointer; margin-left: 5px"
                        >
                          <Lock />
                        </el-icon>
                      </el-tooltip>
                    </template>
                  </el-table-column>
                  <el-table-column label="操作" width="200">
                    <template #default="scope">
                      <div class="operation-buttons">
                        <el-button
                          type="danger"
                          size="small"
                          @click="handleDeleteStudent(scope.row)"
                          >删除</el-button
                        >
                        <el-button
                          type="warning"
                          size="small"
                          @click="handleResetPassword(scope.row)"
                          >重置密码</el-button
                        >
                      </div>
                    </template>
                  </el-table-column>
                </el-table>

                <div class="table-actions">
                  <el-button type="primary" size="small" @click="loadStudentList">
                    <el-icon><Refresh /></el-icon>
                    刷新列表
                  </el-button>
                  <el-button type="warning" size="small" @click="handleBatchResetPassword">
                    <el-icon><Key /></el-icon>
                    批量重置密码
                  </el-button>
                  <el-button type="danger" size="small" @click="handleBatchDeleteStudents">
                    <el-icon><Delete /></el-icon>
                    批量删除
                  </el-button>
                </div>
              </div>
            </div>
          </el-tab-pane>
          <el-tab-pane label="分组管理" name="group">
            <banjiguanliFenZu
              v-if="currentEditClass"
              :courseId="currentCourseId"
              :classId="currentEditClass.id"
            />
          </el-tab-pane>
        </el-tabs>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="editClassDialogVisible = false">关闭</el-button>
          <el-button type="primary" @click="handleSaveClassEdit">保存更改</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 单一录入学生对话框 -->
    <el-dialog
      v-model="singleImportDialogVisible"
      title="单一录入学生"
      width="520px"
      :close-on-click-modal="false"
    >
      <el-form
        ref="singleImportFormRef"
        :model="singleImportForm"
        :rules="singleImportRules"
        label-width="80px"
      >
        <el-form-item label="学号" prop="studentNumber">
          <el-input v-model="singleImportForm.studentNumber" placeholder="请输入学号"></el-input>
        </el-form-item>
        <el-form-item label="姓名" prop="name">
          <el-input v-model="singleImportForm.name" placeholder="请输入姓名"></el-input>
        </el-form-item>
        <el-form-item label="性别" prop="gender">
          <el-radio-group v-model="singleImportForm.gender">
            <el-radio label="男">男</el-radio>
            <el-radio label="女">女</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="专业" prop="major">
          <el-input v-model="singleImportForm.major" placeholder="请输入专业"></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input
            v-model="singleImportForm.password"
            placeholder="选填，不填则使用学号作为默认密码"
            show-password
          ></el-input>
          <div class="form-item-tip">不填写密码，系统将使用学号作为默认密码</div>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="singleImportDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitSingleImport" :loading="singleImportLoading">
            确认添加
          </el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 新增弹窗展示学生列表 -->
    <el-dialog
      v-model="studentDialogVisible"
      :title="selectedClass ? `【${selectedClass.className}】学生列表` : '学生列表'"
      width="700px"
      :close-on-click-modal="false"
    >
      <el-table
        :data="studentList"
        v-loading="studentsLoading"
        style="width: 100%; margin-bottom: 20px"
      >
        <el-table-column prop="studentNumber" label="学号" width="120" />
        <el-table-column prop="name" label="姓名" width="100" />
        <el-table-column prop="gender" label="性别" width="80" />
        <el-table-column prop="major" label="专业" min-width="150" />
      </el-table>
      <template #footer>
        <el-button @click="studentDialogVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
console.log('setup 作用域已加载')
import { ref, reactive, onMounted, computed, onBeforeUnmount, watch, nextTick } from 'vue'
import {
  Search,
  Plus,
  Document,
  Refresh,
  Key,
  Delete,
  Lock,
  Download,
} from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox, ElLoading } from 'element-plus'
import { useRoute } from 'vue-router'
// 仅导入需要使用的API，避免linter警告
import {
  createClassService,
  getClassListService,
  deleteClassService,
  importStudentsFromExcel,
  getClassDetailService,
  deleteStudentFromClass,
  importSingleStudent,
  resetStudentPassword,
  updateClassService,
} from '@/api/class'
import { useClassStore } from '@/stores/modules/class'
import banjiguanliFenZu from './banjiguanliFenZu.vue'

// 获取班级store
const classStore = useClassStore()

// 获取当前课程ID
const route = useRoute()
// 从路由路径参数中获取课程ID
const currentCourseId = ref(route.params.id || '1')

// 班级列表数据
const classList = computed(() => {
  // 优先使用store中的班级数据
  const storeClasses = classStore.getClassesByCourseId(currentCourseId.value)
  console.log('[computed] currentCourseId:', currentCourseId.value)
  console.log('[computed] storeClasses:', storeClasses)
  if (storeClasses && storeClasses.length > 0) {
    console.log('[computed] 返回storeClasses:', storeClasses)
    return storeClasses
  }
  console.log('[computed] 返回空数组')
  return []
})

// 搜索和分页相关
const searchText = ref('')
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)
const loading = ref(false)

// 创建班级相关
const createClassDialogVisible = ref(false)
const createClassLoading = ref(false)
const createClassFormRef = ref(null)
const imageUrl = ref('')
const imageFile = ref(null)

const createClassForm = reactive({
  className: '',
  classImage: null,
})

const createClassRules = {
  className: [
    { required: true, message: '请输入班级名称', trigger: 'blur' },
    { min: 2, max: 30, message: '班级名称长度需在2到30个字符之间', trigger: 'blur' },
  ],
}

// 封面图片变更处理
const handleImageChange = (uploadFile) => {
  const file = uploadFile.raw

  // 限制图片大小为2MB
  const isLt2M = file.size / 1024 / 1024 < 2
  if (!isLt2M) {
    ElMessage.error('图片大小不能超过2MB')
    return false
  }

  // 验证图片格式
  const isValidFormat = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif'].includes(file.type)
  if (!isValidFormat) {
    ElMessage.error('图片格式必须是JPG/PNG/GIF')
    return false
  }

  // 存储文件对象和预览URL
  imageFile.value = file
  imageUrl.value = URL.createObjectURL(file)

  console.log('图片已选择:', imageUrl.value) // 调试信息
  return false
}

// 上传前钩子
const beforeAvatarUpload = (file) => {
  // 验证图片大小
  const isLt2M = file.size / 1024 / 1024 < 2
  // 验证图片格式
  const isValidFormat = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif'].includes(file.type)

  if (!isLt2M) {
    ElMessage.error('图片大小不能超过2MB')
  }

  if (!isValidFormat) {
    ElMessage.error('图片格式必须是JPG/PNG/GIF')
  }

  // 返回false阻止自动上传
  return false
}

// 显示创建班级对话框
const showCreateClassDialog = () => {
  createClassForm.className = ''
  imageUrl.value = ''
  imageFile.value = null
  createClassDialogVisible.value = true
}

// 提交创建班级
const submitCreateClass = async () => {
  if (!createClassFormRef.value) return

  try {
    // 表单验证
    await createClassFormRef.value.validate()

    // 检查班级名称
    if (!createClassForm.className.trim()) {
      ElMessage.error('请填写班级名称')
      return
    }

    // 确保课程ID存在并且是有效值
    if (!currentCourseId.value) {
      ElMessage.error('未能获取课程ID，无法创建班级')
      console.error('创建班级失败：未指定课程ID')
      return
    }

    // 打印详细的调试信息
    console.log('===== 创建班级请求信息 =====')
    console.log('课程ID:', currentCourseId.value)
    console.log('课程ID类型:', typeof currentCourseId.value)
    console.log('班级名称:', createClassForm.className)
    console.log('是否有图片:', !!imageFile.value)
    console.log('===========================')

    createClassLoading.value = true

    // 只调用接口，接口失败就提示失败，不写入本地store
    try {
      // 调用创建班级API
      const res = await createClassService(
        createClassForm.className,
        imageFile.value,
        currentCourseId.value,
      )

      console.log('创建班级API响应:', res)

      if (res && res.data && res.data.code === 200) {
        ElMessage.success('创建班级成功')
        createClassDialogVisible.value = false
        loadClassList() // 重新加载列表以获取最新数据
      } else {
        ElMessage.error(res?.data?.message || '创建班级失败')
      }
    } catch (apiError) {
      console.error('API调用失败:', apiError)
      ElMessage.error('创建班级失败，请检查网络或联系管理员')
    }
  } catch (validateError) {
    console.error('表单验证失败:', validateError)
    ElMessage.error('表单验证失败，请检查填写内容')
  } finally {
    createClassLoading.value = false
  }
}

// 确保课程ID总是有值
onMounted(() => {
  console.log('当前路由参数:', route.params)
  console.log('当前课程ID:', currentCourseId.value)

  if (!currentCourseId.value) {
    console.warn('未能从路由中获取课程ID，使用默认值1')
    currentCourseId.value = '1'
  }

  // 获取班级列表
  loadClassList()

  // 添加CORS相关的调试信息
  console.log('页面URL:', window.location.href)
  console.log('如果遇到CORS错误，说明后端服务器没有正确配置跨域资源共享')
})

// 格式化日期显示
const formatDate = (dateString) => {
  if (!dateString) return '未知'

  // 如果是ISO格式的日期字符串
  if (dateString.includes('T')) {
    return dateString.split('T')[0]
  }

  return dateString
}

// 处理搜索
const handleSearch = () => {
  currentPage.value = 1 // 重置为第一页
  loadClassList()
}

// 处理分页
const handlePageChange = (page) => {
  currentPage.value = page
  loadClassList()
}

// 处理删除班级
const handleDeleteClass = (classItem) => {
  ElMessageBox.confirm(`确定要删除班级"${classItem.className}"吗？此操作不可恢复。`, '删除确认', {
    confirmButtonText: '确定删除',
    cancelButtonText: '取消',
    type: 'warning',
    distinguishCancelAndClose: true,
    center: true,
    customClass: 'my-delete-confirm-dialog',
  })
    .then(async () => {
      try {
        // 调用删除API
        const response = await deleteClassService(currentCourseId.value, classItem.id)
        console.log('删除班级响应:', response)

        if (response && response.data && response.data.code === 200) {
          // API删除成功后，从store中移除
          const result = classStore.deleteClass(classItem.id)

          if (result) {
            ElMessage.success('班级删除成功')
            // 如果当前页没有数据了，返回上一页
            if (classList.value.length <= 1 && currentPage.value > 1) {
              currentPage.value--
            }
            // 重新加载列表
            loadClassList()
          } else {
            ElMessage.warning('本地班级数据删除失败，请刷新页面')
          }
        } else {
          // API错误处理
          const errorMsg = response?.data?.message || '未知错误'
          ElMessage.error(`删除班级失败: ${errorMsg}`)
          console.error('删除班级API错误:', response)
        }
      } catch (error) {
        console.error('删除班级操作失败:', error)
        ElMessage.error('删除班级操作失败，请稍后重试')

        // API调用失败，仍尝试从本地删除（用于演示）
        // 仅在开发环境执行
        const isDevelopment = import.meta.env.DEV
        if (isDevelopment) {
          const result = classStore.deleteClass(classItem.id)
          if (result) {
            ElMessage({
              type: 'warning',
              message: '由于API错误，仅从本地删除了班级数据（仅限开发环境）',
            })
            loadClassList()
          }
        }
      }
    })
    .catch(() => {
      // 用户取消，不做任何操作
    })
}

// 加载班级列表
const loadClassList = async () => {
  loading.value = true
  try {
    // 调用API获取班级列表，传递分页和搜索参数
    const response = await getClassListService(currentCourseId.value, {
      page: currentPage.value,
      size: pageSize.value,
      className: searchText.value, // 传递搜索内容
    })
    console.log('【班级列表接口返回数据】', response)

    console.log('获取班级列表响应:', response)
    if (response && response.data && response.data.data) {
      const { records, total: totalCount, size, current } = response.data.data
      console.log('班级 records:', records)

      // 更新分页信息
      total.value = totalCount
      pageSize.value = size
      currentPage.value = current

      // 将班级列表保存到store
      const classesWithCourseId = records.map((cls) => ({
        ...cls,
        courseId: currentCourseId.value,
        // 确保班级代码存在
        classCode: cls.classCode || `CLASS-${cls.id.toString().slice(-6)}`,
        // 确保学生数量字段存在且为数字
        studentCount: typeof cls.studentCount === 'number' ? cls.studentCount : 0,
        _refreshKey: Math.random(), // 新增：每次都变，强制刷新
      }))

      // 更新store中当前课程的班级
      const otherClasses = classStore.classList.filter(
        (cls) => cls.courseId !== currentCourseId.value,
      )
      classStore.classList = [...otherClasses, ...classesWithCourseId]
      classStore.persistClassList()
      classStore.classList = [...classStore.classList]
      console.log(
        '[loadClassList] 拉取后 classStore.classList:',
        JSON.stringify(classStore.classList, null, 2),
      )
      console.log(
        '[loadClassList] 拉取后 classList.value:',
        JSON.stringify(classList.value, null, 2),
      )
      // ElMessage.success('班级列表加载成功')

      // 同步获取每个班级的详情以更新学生数量
      syncClassStudentCounts(classesWithCourseId)
    } else {
      // 如果API返回异常或没有数据
      console.warn('班级列表接口返回异常:', response)
      ElMessage.warning('获取班级列表异常，显示本地缓存数据')
    }
  } catch (error) {
    console.error('加载班级列表失败:', error)
    ElMessage.error('获取班级列表失败，显示本地缓存数据')
  } finally {
    loading.value = false
  }
}

// 同步更新所有班级的学生数量
const syncClassStudentCounts = async (classes) => {
  if (!classes || !classes.length) return

  // 对于每个班级，异步获取学生数量
  for (const cls of classes) {
    try {
      const response = await getClassDetailService(currentCourseId.value, cls.id)
      if (response?.data?.data?.students) {
        const studentCount = response.data.data.students.length

        // 更新班级的学生数量
        const classIndex = classList.value.findIndex((c) => c.id === cls.id)
        if (classIndex !== -1) {
          classList.value[classIndex].studentCount = studentCount

          // 更新store中的班级
          const classToUpdate = { ...classList.value[classIndex] }
          updateStoreClass(classToUpdate)
        }
      }
    } catch (error) {
      console.error(`获取班级 ${cls.id} 的学生数量失败:`, error)
    }
  }
}

// 编辑班级相关
const editClassDialogVisible = ref(false)
const currentEditClass = ref(null)
const activeTab = ref('settings')
const editClassForm = reactive({
  className: '',
  classImage: null,
})

// 显示编辑班级对话框
const showEditClassDialog = (classItem) => {
  console.log('打开班级编辑对话框, 班级信息:', classItem)
  currentEditClass.value = classItem
  editClassForm.className = classItem.className
  editClassForm.previewUrl = classItem.classImage || ''
  activeTab.value = 'settings'
  editClassDialogVisible.value = true

  // 当切换到学生管理选项卡时加载学生列表
  console.log('设置选项卡监听')
}

// 监听弹窗状态变化
watch(editClassDialogVisible, (val) => {
  console.log('editClassDialogVisible变化:', val)
})

// 处理保存班级编辑
const handleSaveClassEdit = async () => {
  let isSuccess = false
  let errorMsg = ''
  try {
    const courseId = currentCourseId.value
    const classId = currentEditClass.value.id
    let imageToSend = editClassForm.classImage
    if (imageToSend === '') {
      imageToSend = ''
    }
    const res = await updateClassService(courseId, classId, editClassForm.className, imageToSend)
    if (res && res.data && res.data.code === 0) {
      isSuccess = true
    } else {
      errorMsg = res?.data?.message || '保存失败'
    }
    closeEditDialog()
  } catch (error) {
    errorMsg = error?.message || '未知错误'
    closeEditDialog()
  } finally {
    if (isSuccess) {
      ElMessage.success('班级信息保存成功！')
    } else {
      ElMessage.error('保存班级信息失败: ' + errorMsg)
    }
    window.location.reload()
  }
}

// Excel文件导入相关
const excelFileInput = ref(null)

// 处理Excel导入
const handleImportExcel = () => {
  console.log('点击了模板导入按钮')
  console.log('当前编辑的班级信息:', currentEditClass.value)

  if (!currentEditClass.value) {
    console.error('导入错误: currentEditClass为空，请先选择一个班级')
    ElMessage.error('请先选择一个班级')
    return
  }

  console.log('准备创建文件输入元素')
  // 创建隐藏的文件输入元素
  if (!excelFileInput.value) {
    console.log('创建新的文件输入元素')
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.xlsx, .xls'
    input.style.display = 'none'

    input.onchange = (event) => {
      console.log('文件选择事件触发')
      const file = event.target.files[0]
      if (!file) {
        console.log('没有选择文件')
        return
      }

      console.log('选择的文件:', file.name, '大小:', file.size, '类型:', file.type)
      // 校验文件类型
      const isExcel = file.name.endsWith('.xlsx') || file.name.endsWith('.xls')
      if (!isExcel) {
        console.error('文件格式不正确')
        ElMessage.error('请上传Excel文件(.xlsx或.xls格式)')
        return
      }

      // 上传并导入
      uploadExcelFile(file)
    }

    excelFileInput.value = input
    console.log('将文件输入元素添加到DOM')
    document.body.appendChild(input)
  } else {
    console.log('使用已有的文件输入元素')
  }

  // 触发文件选择
  console.log('触发文件选择对话框')
  try {
    excelFileInput.value.click()
    console.log('文件选择对话框已触发')
  } catch (error) {
    console.error('触发文件选择对话框失败:', error)
  }
}

// 上传Excel文件并导入学生
const uploadExcelFile = async (file) => {
  console.log('=== 开始上传Excel文件 ===')
  console.log('文件信息:', { name: file.name, size: file.size, type: file.type })
  console.log('当前环境:', import.meta.env.MODE)
  console.log('当前URL:', window.location.href)

  if (!currentEditClass.value || !currentEditClass.value.id) {
    console.error('上传失败: 班级信息不完整，无法导入')
    ElMessage.error('班级信息不完整，无法导入')
    return
  }

  const courseId = currentEditClass.value.courseId || currentCourseId.value
  const classId = currentEditClass.value.id

  console.log('导入参数:', { courseId, classId, file: file })

  // 显示加载中
  console.log('显示加载中状态')
  const loading = ElLoading.service({
    lock: true,
    text: '正在导入学生数据...',
    background: 'rgba(0, 0, 0, 0.7)',
  })

  try {
    console.log('调用API导入学生')
    const response = await importStudentsFromExcel(courseId, classId, file)
    console.log('导入响应:', response)

    // 检查响应状态码
    if (response?.data?.code === 200) {
      // 处理导入结果
      const result = response.data?.data
      if (result) {
        console.log('导入成功，数据:', result)
        ElMessage.success(
          `成功导入学生：共处理${result.totalCount}条数据，\n        新增${result.newCount}名学生，\n        已存在但添加到班级${result.existingCount}名，\n        跳过${result.skipCount}名，\n        失败${result.errorCount}条`,
        )

        if (result.errorCount > 0 && result.errorMessages && result.errorMessages.length > 0) {
          console.error('导入错误信息:', result.errorMessages)
          ElMessage.warning(`存在${result.errorCount}条导入错误，请检查导入模板格式是否正确`)
        }

        // 导入成功后，重新加载班级列表以更新学生数量
        try {
          await loadClassList()
          console.log('班级列表重新加载完成')
        } catch (loadError) {
          console.error('重新加载班级列表失败:', loadError)
        }

        // 延迟执行刷新，确保消息显示完成
        setTimeout(() => {
          console.log('准备刷新浏览器页面')
          try {
            // 尝试使用window.location.reload()
            window.location.reload()
          } catch (reloadError) {
            console.error('刷新浏览器失败:', reloadError)
            // 如果刷新失败，尝试其他方式更新页面
            try {
              // 备用方案1：使用location.replace
              window.location.replace(window.location.href)
            } catch (hrefError) {
              console.error('使用location.replace刷新也失败:', hrefError)
              // 备用方案2：提示用户手动刷新
              ElMessage.info('页面刷新失败，请手动刷新页面查看最新数据')
              // 备用方案3：尝试重新加载数据
              setTimeout(() => {
                loadClassList()
                if (currentEditClass.value) {
                  loadStudentList()
                }
              }, 500)
            }
          }
        }, 1000) // 延迟1秒执行刷新

        // 如果编辑对话框是打开的，并且当前编辑的班级就是导入的班级，并且当前激活的选项卡是学生管理，则刷新学生列表
        if (
          editClassDialogVisible.value &&
          currentEditClass.value &&
          currentEditClass.value.id === classId &&
          activeTab.value === 'students'
        ) {
          console.log('刷新编辑对话框中的学生列表')
          try {
            await loadStudentList()
          } catch (studentLoadError) {
            console.error('刷新学生列表失败:', studentLoadError)
          }
        }
      } else {
        console.warn('导入响应中没有data字段:', response)
        ElMessage.warning('导入成功但数据格式异常，请手动刷新页面')
        // 即使没有data字段，也尝试刷新
        setTimeout(() => {
          window.location.reload()
        }, 1000)
      }
    } else {
      // API返回错误状态码
      const errorMsg = response?.data?.message || '导入失败'
      console.error('API返回错误状态码:', response?.data?.code, errorMsg)
      ElMessage.error(`导入失败: ${errorMsg}`)
    }
  } catch (error) {
    console.error('导入学生失败:', error)
    ElMessage.error('导入学生失败: ' + (error.message || '未知错误'))
  } finally {
    console.log('关闭加载状态')
    loading.close()

    // 清空文件输入，以便下次选择同一文件时也能触发change事件
    if (excelFileInput.value) {
      console.log('清空文件输入元素值')
      excelFileInput.value.value = ''
    }
  }
}

// 组件卸载时清理文件输入元素
const cleanup = () => {
  if (excelFileInput.value && document.body.contains(excelFileInput.value)) {
    document.body.removeChild(excelFileInput.value)
  }
}

// 组件卸载前清理
onBeforeUnmount(() => {
  cleanup()
})

// 添加选项卡切换监听
watch(activeTab, (newVal) => {
  console.log('选项卡切换到:', newVal)
  if (newVal === 'students' && currentEditClass.value) {
    console.log('学生管理选项卡被选中，加载学生列表')
    loadStudentList()
  }
})

// 学生列表相关
const studentList = ref([])
const studentsLoading = ref(false)
const selectedStudents = ref([]) // 新增：选中的学生

// 密码显示状态管理
const passwordVisibility = ref({}) // 存储每个学生的密码显示状态

// 切换密码显示状态
const togglePasswordVisibility = (studentId) => {
  passwordVisibility.value[studentId] = !passwordVisibility.value[studentId]
}

// 获取学生密码（这里假设密码是学号，实际应该从API获取）
const getStudentPassword = (student) => {
  // 如果学生对象中有密码字段，使用该字段，否则使用学号作为默认密码
  return student.password || student.studentNumber || '123456'
}

// 加载学生列表
const loadStudentList = async () => {
  console.log('执行loadStudentList函数')
  if (!currentEditClass.value) {
    console.error('加载学生列表失败：currentEditClass为空')
    return
  }

  studentsLoading.value = true
  try {
    const courseId = currentCourseId.value
    const classId = currentEditClass.value.id

    console.log('获取班级详情，courseId:', courseId, 'classId:', classId)
    const response = await getClassDetailService(courseId, classId)
    console.log('班级详情响应:', response)

    if (response?.data?.data?.students) {
      studentList.value = response.data.data.students
      console.log('获取到的学生列表数据:', studentList.value)
      // 新增：打印所有学生对象，便于查看字段结构
      console.log('学生对象结构验证:', studentList.value)

      // 更新当前编辑班级的学生数量
      if (currentEditClass.value) {
        currentEditClass.value.studentCount = studentList.value.length

        // 更新store中的班级数据
        updateStoreClass(currentEditClass.value)

        // 更新班级列表中对应班级的学生数量
        const classIndex = classList.value.findIndex((c) => c.id === currentEditClass.value.id)
        if (classIndex !== -1) {
          classList.value[classIndex].studentCount = currentEditClass.value.studentCount
        }
      }
    } else {
      studentList.value = []
      console.warn('未获取到学生数据')
    }
  } catch (error) {
    console.error('获取学生列表失败:', error)
    ElMessage.error('获取学生列表失败')
    studentList.value = []
  } finally {
    studentsLoading.value = false
  }
}

// 处理删除学生
const handleDeleteStudent = (student) => {
  if (!currentEditClass.value || !currentEditClass.value.id) {
    ElMessage.error('班级信息缺失，无法删除学生')
    return
  }
  if (!student || !student.studentNumber) {
    ElMessage.error('学生信息缺失，无法删除')
    return
  }
  // 详细打印学生对象
  console.log('待删除学生完整对象:', JSON.stringify(student, null, 2))

  const studentNumber = student.studentNumber
  const courseId = currentCourseId.value
  const classId = currentEditClass.value.id

  // 打印参数及类型
  console.log('删除学生参数: ', {
    courseId,
    classId,
    studentNumber,
    studentNumberType: typeof studentNumber,
  })

  // 确认删除
  ElMessageBox.confirm(
    `确定要删除学生"${student.name}"(学号: ${student.studentNumber})吗？此操作不可恢复。`,
    '删除确认',
    {
      confirmButtonText: '删除',
      cancelButtonText: '取消',
      type: 'warning',
      distinguishCancelAndClose: true,
      center: true,
      customClass: 'my-delete-confirm-dialog',
    },
  )
    .then(async () => {
      const loading = ElLoading.service({
        lock: true,
        text: '正在删除学生...',
        background: 'rgba(0, 0, 0, 0.7)',
      })

      try {
        const response = await deleteStudentFromClass(courseId, classId, studentNumber)
        console.log('删除学生响应:', response)

        if (response?.data?.code === 200) {
          ElMessage.success('删除学生成功')
          await loadStudentList() // 删除成功后直接刷新学生列表
          await loadClassList() // 刷新班级卡片区
          window.location.reload() // 新增：强制刷新浏览器页面
        } else {
          const errorMsg = response?.data?.message || '删除失败，请重试'
          ElMessage.error(errorMsg)
        }
      } catch (error) {
        console.error('删除学生失败:', error)
        if (error.response) {
          console.error('后端返回 error.response:', error.response)
          if (error.response.data) {
            console.error('后端返回 error.response.data:', error.response.data)
          }
        }
        if (error && error.toJSON) {
          console.error('error.toJSON():', error.toJSON())
        }
        ElMessage.error('删除学生失败: ' + (error.message || '未知错误'))
      } finally {
        loading.close()
      }
    })
    .catch(() => {
      // 用户取消，不执行任何操作
    })
}

// 处理重置密码
const handleResetPassword = (student) => {
  if (!student || !student.studentNumber) {
    ElMessage.error('无法重置密码：学生信息不完整')
    return
  }
  const studentNumber = student.studentNumber
  const courseId = currentCourseId.value
  const classId = currentEditClass.value.id

  ElMessageBox.confirm(
    `确定要重置学生"${student.name}"(学号: ${student.studentNumber})的密码吗？`,
    '重置密码确认',
    {
      confirmButtonText: '重置',
      cancelButtonText: '取消',
      type: 'warning',
      distinguishCancelAndClose: true,
      center: true,
      customClass: 'my-delete-confirm-dialog',
    },
  )
    .then(async () => {
      const loading = ElLoading.service({
        lock: true,
        text: '正在重置密码...',
        background: 'rgba(0, 0, 0, 0.7)',
      })
      try {
        const response = await resetStudentPassword(courseId, classId, studentNumber)
        if (response?.data?.code === 200) {
          ElMessage.success('密码重置成功！')
        } else {
          const errorMsg = response?.data?.message || '重置密码失败'
          ElMessage.error(errorMsg)
        }
      } catch (error) {
        ElMessage.error('重置密码失败: ' + (error.message || '未知错误'))
      } finally {
        loading.close()
      }
    })
    .catch(() => {
      // 用户取消，不执行任何操作
    })
}

// 处理批量删除学生
const handleBatchDeleteStudents = () => {
  if (!selectedStudents.value || selectedStudents.value.length === 0) {
    ElMessage.warning('请先选择要删除的学生')
    return
  }

  ElMessageBox.confirm(
    `确定要删除选中的 ${selectedStudents.value.length} 名学生吗？此操作不可恢复。`,
    '批量删除确认',
    {
      confirmButtonText: '删除',
      cancelButtonText: '取消',
      type: 'warning',
      distinguishCancelAndClose: true,
      center: true,
      customClass: 'my-delete-confirm-dialog',
    },
  )
    .then(async () => {
      const loading = ElLoading.service({
        lock: true,
        text: '正在批量删除学生...',
        background: 'rgba(0, 0, 0, 0.7)',
      })

      try {
        const courseId = currentCourseId.value
        const classId = currentEditClass.value.id
        let successCount = 0
        for (const student of selectedStudents.value) {
          try {
            await deleteStudentFromClass(courseId, classId, student.studentNumber)
            // 删除成功后从 studentList 移除
            const idx = studentList.value.findIndex(
              (s) => s.studentNumber === student.studentNumber,
            )
            if (idx !== -1) studentList.value.splice(idx, 1)
            successCount++
          } catch (e) {
            console.error(`删除学号${student.studentNumber}失败`, e)
          }
        }
        selectedStudents.value = []
        ElMessage.success(`成功删除 ${successCount} 名学生`)
        window.location.reload() // 新增：批量删除后自动刷新浏览器
      } catch (error) {
        ElMessage.error('批量删除学生失败: ' + (error.message || '未知错误'))
      } finally {
        loading.close()
      }
    })
    .catch(() => {
      // 用户取消，不执行任何操作
    })
}

// 处理表格选择变化
const handleSelectionChange = (selection) => {
  selectedStudents.value = selection
  console.log('已选择学生:', selectedStudents.value)
}

// 下载Excel模板
const downloadExcelTemplate = () => {
  // 1. 表头
  const header = ['学号', '姓名', '性别', '专业', '密码']
  // 2. 只导出表头，不导出任何数据行
  const csvContent = [header.join(',')].join('\n')

  try {
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = '学生信息模板.csv'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    ElMessage.success('模板下载成功（CSV格式，仅表头）')
  } catch (error) {
    console.error('导出失败:', error)
    ElMessage.error('导出失败，请稍后重试')
  }
}

// 单一录入学生相关
const singleImportDialogVisible = ref(false)
const singleImportLoading = ref(false)
const singleImportFormRef = ref(null)
const singleImportForm = reactive({
  studentNumber: '',
  name: '',
  gender: '男',
  major: '',
  password: '',
})

const singleImportRules = {
  studentNumber: [
    { required: true, message: '请输入学号', trigger: 'blur' },
    { pattern: /^\d{5,12}$/, message: '学号格式不正确（5-12位数字）', trigger: 'blur' },
  ],
  name: [
    { required: true, message: '请输入姓名', trigger: 'blur' },
    { min: 2, max: 20, message: '姓名长度应为2-20个字符', trigger: 'blur' },
  ],
  gender: [{ required: true, message: '请选择性别', trigger: 'change' }],
  major: [
    { required: true, message: '请输入专业', trigger: 'blur' },
    { min: 2, max: 50, message: '专业名称长度应为2-50个字符', trigger: 'blur' },
  ],
}

// 显示单一录入对话框
const showSingleImportDialog = () => {
  if (!currentEditClass.value) {
    ElMessage.error('请先选择一个班级')
    return
  }

  // 重置表单
  singleImportForm.studentNumber = ''
  singleImportForm.name = ''
  singleImportForm.gender = '男'
  singleImportForm.major = ''
  singleImportForm.password = ''

  // 显示对话框
  singleImportDialogVisible.value = true
}

// 提交单一录入
const submitSingleImport = async () => {
  if (!singleImportFormRef.value) return

  try {
    // 表单验证
    await singleImportFormRef.value.validate()

    // 确保班级信息完整
    if (!currentEditClass.value || !currentEditClass.value.id) {
      ElMessage.error('班级信息不完整，无法添加学生')
      return
    }

    singleImportLoading.value = true

    const courseId = currentCourseId.value
    const classId = currentEditClass.value.id

    // 调用API添加学生
    const response = await importSingleStudent(courseId, classId, {
      studentNumber: singleImportForm.studentNumber,
      name: singleImportForm.name,
      gender: singleImportForm.gender,
      major: singleImportForm.major,
      password: singleImportForm.password || undefined, // 如果为空，则不发送该字段
    })

    console.log('单一导入学生响应:', response)

    if (response?.data?.code === 200) {
      ElMessage.success('学生添加成功')
      singleImportDialogVisible.value = false

      // 重新加载学生列表
      loadStudentList()

      // 更新班级卡片上的学生数量
      if (currentEditClass.value) {
        // 学生数量加1
        currentEditClass.value.studentCount = (currentEditClass.value.studentCount || 0) + 1

        // 更新store中的班级数据
        updateStoreClass(currentEditClass.value)

        // 更新班级列表中对应班级的学生数量
        const classIndex = classList.value.findIndex((c) => c.id === currentEditClass.value.id)
        if (classIndex !== -1) {
          classList.value[classIndex].studentCount = currentEditClass.value.studentCount
        }
      }
      window.location.reload() // 新增：单一录入成功后自动刷新浏览器
    } else {
      const errorMsg = response?.data?.message || '添加学生失败'
      ElMessage.error(errorMsg)
    }
  } catch (error) {
    console.error('添加学生失败:', error)
    ElMessage.error('添加学生失败: ' + (error.message || '未知错误'))
  } finally {
    singleImportLoading.value = false
  }
}

// 在 class store 中添加更新班级方法
const updateStoreClass = (updatedClass) => {
  if (typeof classStore.updateClass === 'function') {
    // 如果 store 已有更新方法，直接调用
    classStore.updateClass(updatedClass)
  } else {
    // 否则在当前组件内实现更新逻辑
    const index = classStore.classList.findIndex((c) => c.id === updatedClass.id)
    if (index !== -1) {
      classStore.classList[index] = { ...classStore.classList[index], ...updatedClass }
      classStore.persistClassList()
    }
  }
}

// 新增批量重置密码方法
const handleBatchResetPassword = () => {
  if (!selectedStudents.value || selectedStudents.value.length === 0) {
    ElMessage.warning('请先选择要重置密码的学生')
    return
  }

  ElMessageBox.confirm(
    `确定要重置选中的 ${selectedStudents.value.length} 名学生的密码吗？`,
    '批量重置密码确认',
    {
      confirmButtonText: '重置',
      cancelButtonText: '取消',
      type: 'warning',
      distinguishCancelAndClose: true,
      center: true,
      customClass: 'my-delete-confirm-dialog',
    },
  )
    .then(async () => {
      const loading = ElLoading.service({
        lock: true,
        text: '正在批量重置密码...',
        background: 'rgba(0, 0, 0, 0.7)',
      })
      try {
        const courseId = currentCourseId.value
        const classId = currentEditClass.value.id
        let successCount = 0
        for (const student of selectedStudents.value) {
          try {
            await resetStudentPassword(courseId, classId, student.studentNumber)
            successCount++
          } catch (e) {
            console.error(`重置学号${student.studentNumber}密码失败`, e)
          }
        }
        ElMessage.success(`成功重置 ${successCount} 名学生的密码`)
      } catch (error) {
        ElMessage.error('批量重置密码失败: ' + (error.message || '未知错误'))
      } finally {
        loading.close()
      }
    })
    .catch(() => {
      // 用户取消，不执行任何操作
    })
}

const closeEditDialog = () => {
  console.log('closeEditDialog被调用，editClassDialogVisible.value =', editClassDialogVisible.value)
  editClassDialogVisible.value = false
  editClassForm.className = ''
  editClassForm.classImage = null
  editClassForm.previewUrl = ''
  console.log('closeEditDialog执行后，editClassDialogVisible.value =', editClassDialogVisible.value)
}

// 展开行的班级ID
const expandedStudentListIds = ref([]) // 支持多个
// 存储每个班级的学生列表
const classStudentMap = reactive({})

const toggleStudentList = async (item) => {
  console.log('toggleStudentList 被调用，item:', item)
  console.log('当前 expandedStudentListIds:', expandedStudentListIds.value)

  const idx = expandedStudentListIds.value.indexOf(item.id)
  console.log('找到的索引:', idx)

  if (idx !== -1) {
    console.log('关闭学生列表')
    expandedStudentListIds.value.splice(idx, 1)
    return
  }

  console.log('打开学生列表')
  // 关闭所有其他展开区域
  expandedStudentListIds.value = []
  Object.keys(expandedSections).forEach((key) => {
    expandedSections[key] = null
  })

  expandedStudentListIds.value.push(item.id)

  // 拉取学生数据
  if (!classStudentMap[item.id]) {
    classStudentMap[item.id] = null // 先置为null，显示"加载中..."
    try {
      const res = await getClassDetailService(item.courseId, item.id)
      classStudentMap[item.id] = res?.data?.data?.students || []
    } catch (error) {
      console.error('获取学生数据失败:', error)
      classStudentMap[item.id] = []
    }
  }
}

// 展开功能区状态：{ [classId]: 'setting' | 'student' | 'group' | null }
const expandedSections = reactive({})
function toggleSection(classId, section) {
  console.log('toggleSection 被调用，classId:', classId, 'section:', section)
  console.log('当前 expandedSections:', expandedSections)

  // 关闭所有学生列表
  expandedStudentListIds.value = []

  // 只展开当前功能区，其它全部关闭
  Object.keys(expandedSections).forEach((key) => {
    expandedSections[key] = null
  })

  if (expandedSections[classId] === section) {
    console.log('关闭功能区:', section)
    expandedSections[classId] = null
  } else {
    console.log('打开功能区:', section)
    expandedSections[classId] = section
    // 新增：如果是学生管理区，设置currentEditClass
    if (section === 'student') {
      const classItem = classList.value.find((c) => c.id === classId)
      if (classItem) {
        currentEditClass.value = classItem
      }
    }
  }
}

// 开始编辑班级名称
const startEditClassName = (item) => {
  item.isEditing = true
  item.editingName = item.className
  // 等待DOM更新后聚焦输入框
  nextTick(() => {
    const input = document.querySelector('.banji-table-row .el-input__inner')
    if (input) {
      input.focus()
      input.select()
    }
  })
}

// 保存班级名称
const saveClassName = async (item) => {
  if (!item.editingName || item.editingName.trim() === '') {
    ElMessage.warning('班级名称不能为空')
    item.editingName = item.className
    item.isEditing = false
    return
  }

  if (item.editingName === item.className) {
    item.isEditing = false
    return
  }

  try {
    const res = await updateClassService(item.courseId, item.id, item.editingName, null)
    if (res?.data?.code === 200) {
      item.className = item.editingName
      ElMessage.success('班级名称修改成功！')
    } else {
      ElMessage.error('保存失败: ' + (res?.data?.message || '未知错误'))
      item.editingName = item.className
    }
  } catch (error) {
    ElMessage.error('保存失败: ' + (error.message || '未知错误'))
    item.editingName = item.className
  } finally {
    item.isEditing = false
  }
}

// 取消编辑班级名称
const cancelEditClassName = (item) => {
  item.isEditing = false
  item.editingName = item.className
}
</script>

<style>
/* 自定义删除确认对话框样式 */
.delete-confirm-dialog {
  /* 位置调整：居中但略微偏上 */
  position: fixed !important;
  top: 40% !important;
  left: 50% !important;
  transform: translate(-50%, -50%) !important;
  margin: 0 !important;
  max-width: 90% !important;

  /* 增强卡片感 */
  border-radius: 8px !important;
  box-shadow:
    0 6px 16px rgba(0, 0, 0, 0.12),
    0 3px 6px rgba(0, 0, 0, 0.08) !important;
  border: 1px solid #ebeef5 !important;
  background-color: #fff !important;
  overflow: hidden !important;
}

/* 对话框标题栏样式 */
.delete-confirm-dialog .el-message-box__header {
  background-color: #f8f9fa !important;
  padding: 15px 20px !important;
  border-bottom: 1px solid #ebeef5 !important;
}

/* 对话框标题文字样式 */
.delete-confirm-dialog .el-message-box__title {
  font-size: 18px !important;
  color: #303133 !important;
  font-weight: 600 !important;
}

/* 对话框内容样式 */
.delete-confirm-dialog .el-message-box__content {
  padding: 20px !important;
  color: #606266 !important;
  font-size: 16px !important;
  line-height: 1.5 !important;
}

/* 对话框按钮区域样式 */
.delete-confirm-dialog .el-message-box__btns {
  padding: 10px 20px 15px !important;
  text-align: right !important;
}

/* 确认按钮样式 */
.delete-confirm-dialog .el-button--primary {
  background-color: #f56c6c !important;
  border-color: #f56c6c !important;
  font-weight: 500 !important;
  padding: 10px 20px !important;
}

/* 取消按钮样式 */
.delete-confirm-dialog .el-button--default {
  border-color: #d9d9d9 !important;
  padding: 10px 20px !important;
  margin-right: 10px !important;
}

/* 自定义对话框头部样式 */
.custom-dialog-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  background-color: #f8f9fa;
  border-bottom: 1px solid #ebeef5;
}

.dialog-title {
  margin: 0;
  font-size: 18px;
  color: #303133;
  font-weight: 600;
}

/* 自定义关闭按钮样式 */
.dialog-close-btn {
  z-index: 10;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
  border: 2px solid #fff;
}

.edit-class-dialog .el-dialog__header {
  margin: 0;
  padding: 15px 20px;
  background-color: #f8f9fa;
  border-bottom: 1px solid #ebeef5;
}

.edit-class-dialog .el-dialog__body {
  padding-top: 20px;
}

/* 封面预览样式 */
.cover-preview-container {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.class-cover-preview {
  width: 100%;
  height: 150px;
  background-color: #f5f7fa;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.cover-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.no-cover-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  color: #909399;
}

.cover-upload-controls {
  display: flex;
  flex-direction: row;
  gap: 10px;
  justify-content: flex-start;
  margin-top: 5px;
}

.upload-control {
  margin-bottom: 0;
}

.code-display,
.time-display {
  display: flex;
  align-items: center;
  gap: 10px;
}

.class-info-preview h4 {
  margin: 0 0 20px 0;
  padding-left: 10px;
  border-left: 3px solid #409eff;
  color: #303133;
  font-size: 16px;
}

.warning-icon {
  color: #e6a23c;
  font-size: 14px;
  margin-left: 5px;
  vertical-align: middle;
  transition: all 0.3s ease;
}

.warning-icon:hover {
  color: #409eff;
  transform: scale(1.1);
  cursor: pointer;
}

.form-item-tip {
  font-size: 12px;
  color: #909399;
  margin-top: 5px;
  line-height: 1.5;
}

/* 操作按钮样式优化 */
.operation-buttons {
  display: flex;
  gap: 8px;
  justify-content: center;
  flex-wrap: nowrap;
}

.operation-buttons .el-button {
  min-width: 78px;
  font-size: 12px;
  padding: 6px 8px;
}

.student-table-container {
  position: relative;
  margin-bottom: 15px;
}

.student-table-container .el-table {
  margin-bottom: 10px;
}

.student-table-container .el-table__body-wrapper {
  overflow-x: hidden; /* 隐藏水平滚动条 */
}

/* 优化表头样式 */
.student-table-container .el-table th {
  background-color: #f5f7fa;
  color: #606266;
  font-weight: 600;
  padding: 8px 0;
}

/* 编辑班级对话框样式调整 */
.edit-class-dialog {
  display: flex;
  flex-direction: column;
  border-radius: 8px;
  max-height: 90vh;
}

.edit-class-dialog .el-dialog__body {
  flex: 1;
  overflow: auto;
  padding: 15px 20px;
}

/* 调整表格内文字和内容显示 */
.student-table-container .el-table td {
  padding: 6px 0;
}

/* 统一弹窗样式 */
.my-delete-confirm-dialog {
  border-radius: 10px !important;
  box-shadow:
    0 8px 32px rgba(0, 0, 0, 0.18),
    0 1.5px 6px rgba(0, 0, 0, 0.08) !important;
  max-width: 340px !important;
  min-width: 320px !important;
  padding: 0 !important;
  background: #fff !important;
  top: 50% !important;
  left: 50% !important;
  transform: translate(-50%, -50%) !important;
  position: fixed !important;
}
.my-delete-confirm-dialog .el-message-box__header {
  display: flex;
  align-items: center;
  font-size: 17px;
  font-weight: bold;
  padding: 18px 20px 10px 20px;
  border-bottom: none;
  justify-content: space-between;
}
.my-delete-confirm-dialog .el-message-box__title {
  display: flex;
  align-items: center;
  font-size: 17px;
  font-weight: bold;
}
.my-delete-confirm-dialog .el-message-box__headerbtn {
  top: 16px !important;
  right: 16px !important;
}
.my-delete-confirm-dialog .el-message-box__content {
  padding: 18px 24px 0 24px !important;
  color: #333;
  font-size: 15px;
  text-align: center;
}
.my-delete-confirm-dialog .el-message-box__btns {
  padding: 18px 24px 24px 24px !important;
  display: flex;
  justify-content: center;
  gap: 16px;
}
.my-delete-confirm-dialog .el-button--primary,
.my-delete-confirm-dialog .el-button--danger {
  background: #f56c6c;
  border-color: #f56c6c;
  color: #fff;
  min-width: 90px;
  font-size: 15px;
  border-radius: 4px;
}
.my-delete-confirm-dialog .el-button--default {
  background: #fff;
  color: #606266;
  min-width: 90px;
  font-size: 15px;
  border-radius: 4px;
  border: 1px solid #dcdfe6;
}
</style>

<style scoped>
.banji-container {
  padding: 20px;
}

.page-title {
  margin-bottom: 20px;
  font-weight: bold;
  color: #333;
  border-bottom: 2px solid #409eff;
  padding-bottom: 10px;
}

.form-tips {
  margin-bottom: 20px;
}

.operation-btns {
  margin-bottom: 20px;
  display: flex;
  gap: 10px;
}

.search-area {
  margin-bottom: 20px;
  display: flex;
  gap: 10px;
}

.search-input {
  width: 300px;
}

.class-list {
  margin-bottom: 30px;
}

.class-card {
  margin-bottom: 20px;
  transition: all 0.3s;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.class-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.class-name {
  font-weight: bold;
  font-size: 16px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 200px;
}

.card-content {
  margin-bottom: 15px;
  display: flex;
  flex-direction: column;
  flex: 1;
}

.class-image-wrapper {
  width: 100%;
  height: 150px; /* 固定高度 */
  margin-bottom: 15px;
  position: relative;
}

.class-image {
  width: 100%;
  height: 100%;
  background-color: #f6f8fa;
  border-radius: 4px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  position: absolute;
  top: 0;
  left: 0;
}

.class-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.class-image.placeholder {
  background-color: #eef2f6;
  color: #909399;
}

.class-info {
  flex: 1;
}

.label {
  font-weight: bold;
  color: #666;
}

.card-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: auto;
}

.pagination {
  margin: 20px 0;
  display: flex;
  justify-content: center;
}

/* 上传图片样式 */
.avatar-uploader {
  width: 100%;
  border: 1px dashed #409eff;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: border-color 0.3s;
}

.avatar-uploader:hover {
  border-color: #409eff;
}

.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 100%;
  height: 100%;
  text-align: center;
}

.upload-placeholder {
  height: 160px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: #c0c4cc;
}

.upload-text {
  margin-top: 8px;
  color: #606266;
  font-size: 14px;
}

.avatar {
  width: 100%;
  height: 160px;
  display: block;
  object-fit: cover;
}

.upload-tip {
  color: #909399;
  font-size: 12px;
  margin-top: 5px;
  line-height: 1.5;
  text-align: left;
}

/* 班级编辑对话框样式 */
.edit-class-dialog {
  border-radius: 8px;
}

.edit-class-container {
  padding: 0 10px;
}

.class-info-card {
  background-color: #f8f9fa;
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 20px;
}

.class-info-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.class-info-header h3 {
  margin: 0;
  color: #303133;
  font-size: 16px;
}

.class-image-container {
  width: 100%;
  height: 120px;
  margin-bottom: 15px;
  background-color: #f0f2f5;
  border-radius: 4px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

.class-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.class-image-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #909399;
}

.class-basic-info {
  margin-top: 10px;
}

.class-basic-info p {
  margin: 8px 0;
  font-size: 14px;
  color: #606266;
}

.edit-tabs {
  margin-top: 20px;
}

.function-group {
  background-color: #ffffff;
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 20px;
  border: 1px solid #ebeef5;
}

.function-group h4 {
  margin: 0 0 15px 0;
  color: #303133;
  font-size: 15px;
  font-weight: 500;
  border-left: 3px solid #409eff;
  padding-left: 10px;
}

.function-btns {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.student-table-placeholder {
  min-height: 200px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.table-actions {
  margin-top: 20px;
  display: flex;
  gap: 10px;
  justify-content: center;
}

.table-actions .el-button {
  min-width: 110px; /* 确保底部按钮宽度足够 */
  padding: 8px 12px;
}
.banji-table-list {
  width: 100%;
  margin: 0 auto;
  border-radius: 8px;
  background: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  padding: 0 0 10px 0;
}
.banji-table-header,
.banji-table-row {
  display: flex;
  align-items: center;
  border-bottom: 1px solid #f0f0f0;
  padding: 12px 24px;
}
.banji-table-header {
  font-weight: bold;
  background: #f6f8fa;
  border-radius: 8px 8px 0 0;
  font-size: 16px;
}
.banji-table-row {
  font-size: 15px;
  background: #fff;
  transition: background 0.2s;
}
.banji-table-row:hover {
  background: #f5f7fa;
}
.banji-col {
  text-align: left;
  padding-right: 4px;
}
.banji-col.name {
  flex: 0 0 400px;
  text-align: left;
  cursor: pointer;
}

.class-name-text {
  display: inline-block;
  padding: 4px 8px;
  border-radius: 4px;
  transition: background-color 0.2s;
  cursor: pointer;
  border: 1px solid transparent;
}

.class-name-text:hover {
  background-color: #f0f9ff;
  color: #1677ff;
  border-color: #1677ff;
}
.banji-col.count {
  flex: 0 0 100px;
  text-align: left;
}
.banji-col.actions {
  flex: 0 0 240px;
  text-align: left;
  display: flex;
  gap: 8px;
}
.expanded-row {
  background: #f9fafc;
  border-bottom: 1px solid #f0f0f0;
}
.expanded-row .el-table {
  background: #fff;
}
.expanded-row .el-table th,
.expanded-row .el-table td {
  padding: 6px 8px;
  font-size: 13px;
}
.class-section {
  margin-bottom: 24px;
  padding: 18px 20px 12px 20px;
  background: #f8f9fa;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.03);
}
.class-section h4,
.class-section h5 {
  margin: 0 0 12px 0;
  color: #409eff;
  font-size: 16px;
  font-weight: 600;
}
.class-section h5 {
  font-size: 15px;
  color: #333;
  font-weight: 500;
}

.form-actions {
  margin-top: 20px;
  text-align: center;
}
</style>
