<template>
  <div class="baogao-list">
    <el-card>
      <h2>实验报告列表</h2>
      <div class="report-table">
        <div class="report-table-header">
          <span class="col name">实验报告名称</span>
          <span class="col time">发布时间</span>
          <span class="col actions">操作</span>
        </div>
        <div class="report-table-row" v-for="item in pagedList" :key="item.id">
          <div class="col name name-with-classes">
            <div>{{ item.name }}</div>
            <div class="class-list">
              已发布班级：{{ item.classNames ? item.classNames.join('、') : '-' }}
            </div>
          </div>
          <span class="col time">{{ formatDate(item.createTime) }}</span>
          <span class="col actions">
            <el-button type="primary" size="small" @click="handlePreview(item)">查看</el-button>
            <!-- <el-button type="success" size="small" @click="handleEdit(item)">更新报告</el-button> -->
            <!-- <el-button type="primary" size="small" @click="handleViewSubmissions(item)"
              >查看学生提交记录</el-button
            > -->
            <!-- <el-button type="primary" size="small" @click="handleViewClassStatistics(item)"
              >查看班级统计</el-button
            > -->
            <el-button type="danger" size="small" @click="handleDelete(item)">删除</el-button>
          </span>
        </div>
      </div>
      <div class="pagination-bar">
        <el-pagination
          background
          layout="prev, pager, next, jumper"
          :total="reportList.length"
          :page-size="pageSize"
          :current-page="currentPage"
          @current-change="handlePageChange"
        />
      </div>
    </el-card>
    <!-- 新增：删除确认对话框 -->
    <el-dialog
      v-model="deleteConfirmVisible"
      title="提示"
      width="300px"
      :close-on-click-modal="false"
      align-center
    >
      <div class="dialog-content">
        <p>确定要删除该实验报告吗？此操作不可恢复</p>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="cancelDelete">取消</el-button>
          <el-button type="primary" @click="executeDelete" :loading="deletingId !== null"
            >确定</el-button
          >
        </span>
      </template>
    </el-dialog>
    <el-dialog
      v-model="submissionDialogVisible"
      :title="`学生提交记录 - ${currentTemplateName}`"
      width="1200px"
      top="5vh"
      :close-on-click-modal="false"
    >
      <div style="margin-bottom: 16px">
        <el-radio-group
          v-model="submissionTab"
          @change="
            (val) =>
              handleTabChange(
                val,
                pagedList.find((i) => i.name === currentTemplateName),
              )
          "
        >
          <el-radio-button label="report">报告提交记录</el-radio-button>
          <el-radio-button label="data">实验数据提交记录</el-radio-button>
        </el-radio-group>
      </div>
      <el-table :data="submissionList" v-loading="submissionLoading" style="width: 100%">
        <el-table-column prop="studentName" label="学生姓名" width="120" />
        <el-table-column prop="studentNumber" label="学号" width="120" />
        <el-table-column prop="className" label="班级" width="120" />
        <el-table-column prop="submitTime" label="提交时间" width="180" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="scope">
            <span v-if="scope.row.status === 0">草稿</span>
            <span v-else-if="scope.row.status === 1">已提交</span>
            <span v-else-if="scope.row.status === 2">已批改</span>
            <span v-else>未知</span>
          </template>
        </el-table-column>
        <el-table-column prop="score" label="评分" width="120">
          <template #default="scope">
            <el-input-number
              :model-value="getEditState(scope.row).score"
              @update:model-value="(val) => handleEditField(scope.row, 'score', val)"
              :min="0"
              :max="100"
              size="small"
              style="width: 100px"
              :placeholder="scope.row.score !== undefined ? '' : '未评分'"
            />
          </template>
        </el-table-column>
        <el-table-column prop="comment" label="评语" min-width="200">
          <template #default="scope">
            <el-input
              :model-value="getEditState(scope.row).comment"
              @update:model-value="(val) => handleEditField(scope.row, 'comment', val)"
              size="small"
              :placeholder="scope.row.comment !== undefined ? '' : '未填写'"
              style="width: 100%"
              clearable
            />
          </template>
        </el-table-column>
        <el-table-column label="操作" width="140" fixed="right">
          <template #default="scope">
            <el-button type="primary" size="small" @click="handleViewSubmissionDetail(scope.row)">
              查看
            </el-button>
            <el-button
              type="success"
              size="small"
              :loading="getEditState(scope.row).loading"
              @click="handleSaveGrade(scope.row)"
              style="margin-left: 4px"
            >
              保存
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      <template #footer>
        <el-button @click="submissionDialogVisible = false">关闭</el-button>
      </template>
    </el-dialog>
    <el-dialog
      v-model="submissionDetailDialogVisible"
      title="学生实验报告详情"
      width="900px"
      top="5vh"
      :close-on-click-modal="false"
    >
      <WodeshiyanBaogaochakan
        v-if="submissionDetailData"
        :submission-detail="submissionDetailData"
        :loading="submissionDetailLoading"
      />
      <div v-else style="text-align: center">加载中...</div>
      <template #footer>
        <el-button @click="submissionDetailDialogVisible = false">关闭</el-button>
      </template>
    </el-dialog>
    <el-dialog
      v-if="showClassStatistics"
      :model-value="showClassStatistics"
      title="班级统计"
      width="600px"
      @close="showClassStatistics = false"
    >
      <div style="margin-bottom: 16px">
        <el-radio-group v-model="classStatisticsTab" @change="handleClassStatisticsTabChange">
          <el-radio-button label="report">报告提交情况</el-radio-button>
          <el-radio-button label="data">实验数据提交情况</el-radio-button>
        </el-radio-group>
      </div>
      <div v-if="classStatisticsLoading" style="text-align: center; padding: 32px 0">加载中...</div>
      <div v-else-if="classStatisticsData">
        <div>班级总人数：{{ classStatisticsData.totalStudents }}</div>
        <div>已提交人数：{{ classStatisticsData.submittedCount }}</div>
        <div>已批改人数：{{ classStatisticsData.gradedCount }}</div>
        <div>平均分：{{ classStatisticsData.averageScore }}</div>
        <div>最高分：{{ classStatisticsData.highestScore }}</div>
        <div>最低分：{{ classStatisticsData.lowestScore }}</div>
        <div>分数分布：</div>
        <ul>
          <li v-for="(num, range) in classStatisticsData.scoreDistribution" :key="range">
            {{ range }}：{{ num }}人
          </li>
        </ul>
      </div>
      <div v-else>暂无数据</div>
      <template #footer>
        <el-button @click="showClassStatistics = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { getClassListService } from '@/api/class'
import {
  deleteTemplateService,
  getTemplateSubmissionsService,
  gradeSubmissionService,
  getExperimentDataSubmissionsByTemplate,
  // gradeExperimentDataSubmission,
  gradeExperimentDataSubmissionService,
  getExperimentDataStatisticsByClass,
  getClassStatisticsService,
  getExperimentDataSubmissionDetail,
  getUnsubmittedReportStudents,
} from '@/api/template'
import request from '@/utils/request'
import WodeshiyanBaogaochakan from './WodeshiyanBaogaochakan.vue'

const route = useRoute()
const router = useRouter()
const courseId = route.params.id
const reportList = ref([])
const currentPage = ref(1)
const pageSize = ref(10)
const deletingId = ref(null)

// 删除确认对话框相关状态
const deleteConfirmVisible = ref(false)
const currentDeletingItem = ref(null) // 用于存储当前要删除的item

const submissionDialogVisible = ref(false)
const submissionLoading = ref(false)
const submissionList = ref([])
const currentTemplateName = ref('')
const submissionEditMap = ref({}) // { [submissionId]: { score, comment, loading } }
const submissionTab = ref('report') // 'report' or 'data'

const submissionDetailDialogVisible = ref(false)
const submissionDetailData = ref(null)
const submissionDetailLoading = ref(false)

const showClassStatistics = ref(false)
const selectedTemplateId = ref(null)
const selectedClassId = ref(null)

const classStatisticsTab = ref('report') // 新增tab状态
const classStatisticsData = ref(null) // 班级统计数据
const classStatisticsLoading = ref(false)

const unsubmittedClassId = ref('')
const unsubmittedStudentList = ref([])
const unsubmittedLoading = ref(false)
const classOptions = ref([]) // 班级下拉选项

// 格式化日期，去掉T并转换为友好格式
const formatDate = (dateString) => {
  if (!dateString) return ''
  try {
    const date = new Date(dateString)
    return date
      .toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
      })
      .replace(/\//g, '-')
  } catch {
    // 如果解析失败，直接返回原字符串并去掉T
    return dateString.replace('T', ' ')
  }
}

const pagedList = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  return reportList.value.slice(start, start + pageSize.value)
})

const handlePageChange = (page) => {
  currentPage.value = page
}

// 获取实验报告列表及班级名
const fetchReportList = async () => {
  try {
    // 获取实验报告模板列表
    const res = await request({
      url: `/teacher/course/${courseId}/template`,
      method: 'get',
    })
    if (res && res.data && Array.isArray(res.data.data)) {
      // 获取所有班级信息
      const classRes = await getClassListService(courseId)
      let classMap = {}
      if (classRes && classRes.data && Array.isArray(classRes.data.data.records)) {
        classRes.data.data.records.forEach((cls) => {
          classMap[cls.id] = cls.className
        })
      }
      // 假设每个模板有 classIds 字段（如无需后端补充）
      reportList.value = res.data.data.map((item) => ({
        ...item,
        classNames: (item.classIds || []).map((cid) => classMap[cid] || cid),
      }))
    }
  } catch {
    ElMessage.error('获取实验报告列表失败')
  }
}

const handlePreview = (item) => {
  router.push({
    name: 'TemplatePreview',
    params: { id: courseId, templateId: item.id },
  })
}

const handleEdit = (item) => {
  console.log('【调试】跳转编辑页参数 courseId:', courseId, 'templateId:', item.id)
  router.push({
    name: 'BaoGao',
    params: { id: courseId, templateId: item.id },
  })
}

const handleViewSubmissions = async (item) => {
  submissionDialogVisible.value = true
  submissionLoading.value = true
  currentTemplateName.value = item.name
  submissionTab.value = 'report'
  console.log('点击查看学生提交记录，传入模板ID:', item.id)
  await fetchSubmissionList(item.id, 'report')
}

const fetchSubmissionList = async (templateId, type) => {
  submissionLoading.value = true
  try {
    let res
    if (type === 'report') {
      res = await getTemplateSubmissionsService(templateId)
    } else {
      res = await getExperimentDataSubmissionsByTemplate(templateId)
    }
    if (res && res.data && Array.isArray(res.data.data)) {
      let list = res.data.data.map((row) => ({
        ...row,
        comment:
          row.comment !== undefined ? row.comment : row.feedback !== undefined ? row.feedback : '',
      }))
      // 如果是实验数据提交记录，循环请求详情接口补全评分和评语
      if (type === 'data' && list.length > 0) {
        const detailResults = await Promise.all(
          list.map(async (row) => {
            const detailRes = await getExperimentDataSubmissionDetail(row.id)
            const detailData =
              detailRes && detailRes.data && detailRes.data.data ? detailRes.data.data : {}
            console.log('[DEBUG] getExperimentDataSubmissionDetail', row.id, detailData)
            return detailData
          }),
        )
        list = list.map((row, idx) => ({
          ...row,
          score: detailResults[idx].score !== undefined ? detailResults[idx].score : row.score,
          comment:
            detailResults[idx].comment !== undefined
              ? detailResults[idx].comment
              : detailResults[idx].feedback !== undefined
                ? detailResults[idx].feedback
                : row.comment,
        }))
      }
      // 按提交时间排序，越早提交的显示在最上面
      list.sort((a, b) => {
        const timeA = new Date(a.submitTime || a.createTime || 0)
        const timeB = new Date(b.submitTime || b.createTime || 0)
        return timeA - timeB // 升序排列，最早的在最上面
      })

      submissionList.value = list
      // 初始化本地编辑状态
      submissionEditMap.value = {}
      submissionList.value.forEach((row) => {
        submissionEditMap.value[row.id] = {
          score: row.score,
          comment: row.comment,
          loading: false,
        }
      })
      // 刷新后打印
      console.log(
        '[DEBUG] 刷新后 submissionList:',
        JSON.parse(JSON.stringify(submissionList.value)),
      )
    } else {
      submissionList.value = []
    }
  } catch {
    ElMessage.error('获取学生提交记录失败')
    submissionList.value = []
  } finally {
    submissionLoading.value = false
  }
}

const handleTabChange = async (val, item) => {
  await fetchSubmissionList(item.id, val)
}

const handleViewSubmissionDetail = (row) => {
  // 获取所有 submissionId 和当前索引
  const ids = submissionList.value.map((item) => item.id).join(',')
  const index = submissionList.value.findIndex((item) => item.id === row.id)
  if (submissionTab.value === 'report') {
    router.push({
      name: 'XueshengTijiaode1shiyanbaogaochakan',
      params: { submissionId: row.id },
      query: { ids, index },
    })
  } else {
    router.push({
      path: `/house/xuesshuyanshujutijiaojiluchakan/${row.id}`,
      query: { ids, index },
    })
  }
}

// 获取编辑状态
const getEditState = (row) => {
  if (!submissionEditMap.value[row.id]) {
    submissionEditMap.value[row.id] = {
      score: row.score,
      comment: row.comment,
      loading: false,
    }
  }
  return submissionEditMap.value[row.id]
}

// 编辑时同步本地状态
const handleEditField = (row, field, value) => {
  const edit = getEditState(row)
  edit[field] = value
}

// 保存评分
const handleSaveGrade = async (row) => {
  const edit = submissionEditMap.value[row.id]
  if (!edit) return
  edit.loading = true
  // 保存前打印
  console.log('[DEBUG] 保存前 submissionList:', JSON.parse(JSON.stringify(submissionList.value)))
  try {
    if (submissionTab.value === 'report') {
      await gradeSubmissionService(row.id, {
        score: Number(edit.score),
        comment: edit.comment || '',
      })
    } else {
      await gradeExperimentDataSubmission(row.id, {
        score: Number(edit.score),
        comment: edit.comment || '', // 前端统一用 comment，接口内部会转为 feedback
      })
    }
    ElMessage.success('评分保存成功')
    row.score = edit.score
    row.comment = edit.comment
    // 保存后打印
    console.log('[DEBUG] 保存后 submissionList:', JSON.parse(JSON.stringify(submissionList.value)))
  } catch {
    ElMessage.error('评分保存失败')
  } finally {
    edit.loading = false
  }
}

const handleViewClassStatistics = (item) => {
  const classId = item.classIds && item.classIds.length > 0 ? item.classIds[0] : null
  if (!classId) {
    ElMessage.warning('该实验未发布到任何班级')
    return
  }
  selectedTemplateId.value = item.id
  selectedClassId.value = classId
  showClassStatistics.value = true
}

// 删除实验报告
const handleDelete = async (item) => {
  console.log('尝试删除实验报告:', item.id, item.name)
  currentDeletingItem.value = item
  deleteConfirmVisible.value = true // 打开删除确认对话框
}

// 执行删除操作（用户确认后调用）
const executeDelete = async () => {
  if (!currentDeletingItem.value) {
    console.error('没有要删除的实验报告')
    return
  }
  const item = currentDeletingItem.value
  deletingId.value = item.id // 设置加载状态
  try {
    console.log('正在发送删除请求...')
    const res = await deleteTemplateService(courseId, item.id)
    console.log('删除请求响应:', res)
    if (res.data.code === 200) {
      console.log('删除成功，准备刷新列表')
      ElMessage.success('删除成功')
      // 判断删除后当前页是否还有数据，如果没有则跳到上一页
      // 先获取删除后的总数
      const totalAfterDelete = reportList.value.length - 1
      const maxPage = Math.ceil(totalAfterDelete / pageSize.value) || 1
      if (currentPage.value > maxPage) {
        currentPage.value = maxPage
      }
      console.log(
        '删除后总数据量:',
        totalAfterDelete,
        '最大页数:',
        maxPage,
        '当前页:',
        currentPage.value,
      )
      await fetchReportList() // 重新拉取数据
      console.log('列表刷新完成')
    } else {
      console.error('删除失败，错误码:', res.data.code, '错误信息:', res.data.message)
      ElMessage.error(res.data.message || '删除失败')
    }
  } catch (error) {
    let msg = '删除失败'
    if (error && error.message) {
      msg = error.message
    } else if (error && error.response && error.response.data && error.response.data.message) {
      msg = error.response.data.message
    }
    console.error('删除过程中发生错误:', error)
    ElMessage.error(msg)
  } finally {
    deletingId.value = null // 移除加载状态
    deleteConfirmVisible.value = false // 关闭对话框
    currentDeletingItem.value = null // 清空当前删除项
    console.log('删除操作完成')
  }
}

// 取消删除操作
const cancelDelete = () => {
  deleteConfirmVisible.value = false
  currentDeletingItem.value = null
  console.log('用户取消了删除操作')
}

// 监听弹窗打开时默认加载报告统计
watch(showClassStatistics, async (val) => {
  if (val) {
    classStatisticsTab.value = 'report'
    await fetchClassStatistics('report')
  }
})

// 切换tab时加载不同统计
const handleClassStatisticsTabChange = async (val) => {
  await fetchClassStatistics(val)
}

async function fetchClassStatistics(type) {
  classStatisticsLoading.value = true
  classStatisticsData.value = null
  if (type === 'report') {
    // 报告统计接口
    try {
      const res = await getClassStatisticsService(selectedTemplateId.value, selectedClassId.value)
      if (res && res.data && res.data.data) {
        classStatisticsData.value = res.data.data
      } else {
        classStatisticsData.value = null
      }
    } catch {
      classStatisticsData.value = null
    } finally {
      classStatisticsLoading.value = false
    }
  } else {
    // 实验数据统计接口
    try {
      const res = await getExperimentDataStatisticsByClass(
        selectedTemplateId.value,
        selectedClassId.value,
      )
      if (res && res.data && res.data.data) {
        classStatisticsData.value = res.data.data
      } else {
        classStatisticsData.value = null
      }
    } catch {
      classStatisticsData.value = null
    } finally {
      classStatisticsLoading.value = false
    }
  }
}

onMounted(async () => {
  await fetchReportList()
  // 假设 reportList 里有 classIds 字段
  const allClassIds = new Set()
  reportList.value.forEach((item) => (item.classIds || []).forEach((cid) => allClassIds.add(cid)))
  classOptions.value = Array.from(allClassIds).map((cid) => ({ label: cid, value: cid }))
})

// 4. 获取未提交学生列表（带班级筛选）
const fetchUnsubmittedStudents = async (experimentId) => {
  unsubmittedLoading.value = true
  try {
    const res = await getUnsubmittedReportStudents(courseId, experimentId, {
      classId: unsubmittedClassId.value,
    })
    if (res && res.data && Array.isArray(res.data.data)) {
      unsubmittedStudentList.value = res.data.data
    } else {
      unsubmittedStudentList.value = []
    }
  } finally {
    unsubmittedLoading.value = false
  }
}
</script>

<style scoped>
.baogao-list {
  padding: 24px;
}
.report-table {
  width: 100%;
  margin-top: 24px;
}
.report-table-header {
  display: flex;
  background: #f5f7fa;
  padding: 12px 0;
  font-weight: bold;
  border-radius: 4px 4px 0 0;
  border-bottom: 1px solid #ebeef5;
}
.report-table-row {
  display: flex;
  align-items: flex-start;
  padding: 14px 0;
  border-bottom: 1px solid #f0f0f0;
  transition: background 0.2s;
}
.report-table-row:hover {
  background: #f6faff;
}
.col {
  display: flex;
  align-items: center;
  padding: 0 12px;
}
.col.name {
  flex: 1.2;
  min-width: 80px;
  flex-direction: column;
  align-items: flex-start;
}
.name-with-classes {
  flex-direction: column;
  align-items: flex-start;
}
.class-list {
  font-size: 12px;
  color: #909399;
  margin-top: 2px;
  word-break: break-all;
}
.col.time {
  flex: 1.5;
  min-width: 140px;
  color: #909399;
  align-items: center;
}
.col.actions {
  flex: 2.2;
  min-width: 380px;
  gap: 8px;
  align-items: center;
}
.pagination-bar {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}
.preview-content {
  padding: 24px 16px;
  background: #fafbfc;
  border-radius: 8px;
  min-height: 300px;
}
.preview-item {
  margin-bottom: 18px;
}
.item-text {
  font-size: 16px;
  color: #222;
  margin-bottom: 8px;
  white-space: pre-wrap;
}
.empty-dynamic-text {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 10px;
  background: #f0f0f0;
  border-radius: 4px;
  font-size: 12px;
  color: #909399;
}
.file-preview {
  display: flex;
  align-items: center;
  padding: 8px;
  background: #f0f0f0;
  border-radius: 4px;
}
.file-icon {
  margin-right: 8px;
}
.file-info {
  flex: 1;
}
.file-name {
  font-size: 14px;
  font-weight: bold;
}
.file-size {
  font-size: 12px;
  color: #909399;
}
.file-link {
  color: #409eff;
  text-decoration: underline;
  cursor: pointer;
}
/* 新增：删除确认对话框内容样式 */
.dialog-content {
  text-align: center;
  margin-top: -10px; /* 适当调整间距 */
}
.el-table th,
.el-table td {
  padding: 4px 6px !important; /* 缩小内边距 */
}
.el-table .cell {
  padding: 0 2px !important;
}
.el-input-number {
  width: 100px !important;
}
.el-input-number .el-input__wrapper {
  padding: 0 4px !important;
}
@media (max-width: 1200px) {
  .baogao-list {
    padding: 8px;
  }
  .report-table-header,
  .report-table-row {
    font-size: 14px;
    padding: 8px 0;
  }
  .col.name {
    min-width: 120px;
  }
  .col.actions {
    min-width: 200px;
  }
}
@media (max-width: 900px) {
  .report-table-header,
  .report-table-row {
    font-size: 12px;
    padding: 6px 0;
  }
  .col {
    padding: 0 4px;
  }
  .col.name {
    min-width: 80px;
  }
  .col.actions {
    min-width: 120px;
    flex-direction: column;
    gap: 4px;
  }
}
@media (max-width: 600px) {
  .report-table-header,
  .report-table-row {
    flex-direction: column;
    align-items: flex-start;
  }
  .col {
    width: 100%;
    min-width: 0;
    padding: 2px 0;
    word-break: break-all;
  }
  .col.actions {
    min-width: 0;
    width: 100%;
    flex-direction: column;
    gap: 2px;
  }
}
</style>
