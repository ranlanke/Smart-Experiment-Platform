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
            <div
              v-if="item.classStats && item.classStats.length > 0"
              style="font-size: 13px; color: #888; margin-top: 2px"
            >
              已发布班级：
              <span v-for="(stat, idx) in item.classStats" :key="stat.classId">
                {{ stat.className }}<span v-if="idx < item.classStats.length - 1">，</span>
              </span>
            </div>
          </div>
          <span class="col time">{{ formatDate(item.createTime) }}</span>
          <span class="col actions">
            <div class="action-btns">
              <!-- <el-button type="primary" size="small" @click="handleViewSubmissions(item)"
                >查看学生提交记录</el-button
              > -->
              <!-- <el-button type="primary" size="small" @click="handleViewClassStatistics(item)"
                >查看班级统计</el-button
              > -->
              <!-- <el-button type="danger" size="small" @click="handleDelete(item)">删除</el-button> -->
            </div>
            <div class="class-stats-list">
              <!-- 新增：下拉菜单选择班级 -->
              <el-select
                v-if="item.classStats && item.classStats.length > 0"
                v-model="item.selectedClassId"
                size="small"
                style="width: 120px; margin-right: 16px; font-size: 18px"
                @change="onClassChange"
              >
                <el-option
                  v-for="stat in item.classStats"
                  :key="stat.classId"
                  :label="stat.className"
                  :value="stat.classId"
                  style="font-size: 18px"
                />
              </el-select>
              <!-- 只显示当前选中班级的统计 -->
              <template v-if="item.classStats && item.classStats.length > 0">
                <div class="class-stats-row" v-if="currentStat(item)">
                  <span
                    class="class-data"
                    @click="handleViewClassDataSubmissions(item, currentStat(item).classId)"
                    style="
                      cursor: pointer;
                      color: #409eff;
                      display: inline-block;
                      margin-right: 16px;
                      font-size: 18px;
                      font-weight: 500;
                    "
                  >
                    数据提交 {{ currentStat(item).dataSubmit }}/{{ currentStat(item).dataTotal }}
                  </span>
                  <span
                    style="
                      font-size: 16px;
                      color: #909399;
                      display: inline-block;
                      margin-right: 16px;
                    "
                  >
                    已批改 {{ currentStat(item).gradedCount }}/{{ currentStat(item).dataTotal }}
                  </span>
                  <span
                    class="class-report"
                    @click="handleViewClassSubmissions(item, currentStat(item).classId)"
                    style="
                      cursor: pointer;
                      color: #409eff;
                      display: inline-block;
                      margin-right: 16px;
                      font-size: 18px;
                      font-weight: 500;
                    "
                  >
                    报告提交 {{ currentStat(item).reportSubmit }}/{{
                      currentStat(item).reportTotal
                    }}
                  </span>
                  <span style="font-size: 16px; color: #909399; display: inline-block">
                    已批改 {{ currentStat(item).reportGraded }}/{{ currentStat(item).reportTotal }}
                  </span>
                </div>
              </template>
            </div>
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
    <!-- 使用新的弹窗组件 -->
    <!-- 移除PiYutangchuang弹窗，改为路由跳转 -->
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
      <div style="margin-bottom: 16px; display: flex; align-items: center; gap: 16px">
        <el-select v-model="selectedClassId" placeholder="请选择班级" style="width: 180px">
          <el-option
            v-for="cid in selectedTemplateItem?.classIds || []"
            :key="cid"
            :label="classMap[cid] || cid"
            :value="cid"
          />
        </el-select>
        <el-radio-group v-model="statisticsType" size="small">
          <el-radio-button label="report">报告提交情况</el-radio-button>
          <el-radio-button label="data">实验数据提交情况</el-radio-button>
        </el-radio-group>
      </div>
      <div style="margin-bottom: 8px; font-weight: bold">
        当前班级：{{ classMap[selectedClassId] || selectedClassId }}
        <span style="margin-left: 24px"
          >当前统计：{{ statisticsType === 'report' ? '报告提交情况' : '实验数据提交情况' }}</span
        >
      </div>
      <div v-if="classStatisticsLoading" style="text-align: center; padding: 32px 0">加载中...</div>
      <div v-else-if="classStatisticsData">
        <template v-if="statisticsType === 'report'">
          <div>班级总人数：{{ classStatisticsData.totalStudents }}</div>
          <div>已提交报告人数：{{ classStatisticsData.submittedCount }}</div>
          <div>未提交报告人数：{{ classStatisticsData.unsubmittedCount }}</div>
          <!-- 其它报告相关统计 -->
        </template>
        <template v-else>
          <div>班级总人数：{{ classStatisticsData.totalStudents }}</div>
          <div>已提交实验数据人数：{{ classStatisticsData.submittedCount }}</div>
          <div>未提交实验数据人数：{{ classStatisticsData.unsubmittedCount }}</div>
          <!-- 其它实验数据相关统计 -->
        </template>
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
  getExperimentDataStatisticsByClass,
  getClassStatisticsService,
} from '@/api/template'
import request from '@/utils/request'
import WodeshiyanBaogaochakan from './WodeshiyanBaogaochakan.vue'

const route = useRoute()
const router = useRouter()
const courseId = route.params.id // 课程ID从params.id获取
const reportList = ref([])
const currentPage = ref(1)
const pageSize = ref(10)
const deletingId = ref(null)

// 删除确认对话框相关状态
const deleteConfirmVisible = ref(false)
const currentDeletingItem = ref(null) // 用于存储当前要删除的item

const submissionDetailDialogVisible = ref(false)
const submissionDetailData = ref(null)
const submissionDetailLoading = ref(false)

const showClassStatistics = ref(false)
const selectedTemplateId = ref(null)
const selectedClassId = ref(null)
const selectedTemplateItem = ref(null)
const classMap = ref({})

const classStatisticsTab = ref('report') // 新增tab状态
const classStatisticsData = ref(null) // 班级统计数据
const classStatisticsLoading = ref(false)
const statisticsType = ref('report') // 'report' or 'data'

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
    console.log('[DEBUG] fetchReportList courseId:', courseId)
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
      // 组装reportList并批量请求统计
      const rawList = res.data.data.map((item) => ({ ...item, classStats: [] }))
      for (const item of rawList) {
        if (Array.isArray(item.classIds)) {
          const validClassIds = item.classIds.filter((cid) => !!cid)
          console.log(
            '[DEBUG] item.id:',
            item.id,
            'item.classIds:',
            item.classIds,
            'validClassIds:',
            validClassIds,
            'item:',
            item,
          )
          for (const cid of validClassIds) {
            console.log(
              '[DEBUG] getClassStatisticsService 参数:',
              courseId,
              item.id,
              cid,
              'item:',
              item,
            )
            // 并发请求两个统计接口
            const [reportRes, dataRes] = await Promise.all([
              getClassStatisticsService(courseId, item.id, cid),
              getExperimentDataStatisticsByClass(courseId, item.id, cid),
            ])
            console.log('[DEBUG] 班级统计接口返回:', {
              templateId: item.id,
              classId: cid,
              reportRes: reportRes?.data?.data,
              dataRes: dataRes?.data?.data,
              reportGraded: reportRes?.data?.data?.gradedCount,
            })
            item.classStats.push({
              classId: cid,
              className: classMap[cid] || cid,
              reportSubmit: reportRes?.data?.data?.submittedCount || 0,
              reportTotal: reportRes?.data?.data?.totalStudents || 0,
              reportGraded: reportRes?.data?.data?.gradedCount || 0,
              dataSubmit: dataRes?.data?.data?.submittedCount || 0,
              dataTotal: dataRes?.data?.data?.totalStudents || 0,
              gradedCount: dataRes?.data?.data?.gradedCount || 0,
            })
          }
          // 新增：默认选中第一个班级，但优先使用localStorage中保存的选择
          if (item.classStats.length > 0) {
            const savedClassId = localStorage.getItem(`selectedClass_${item.id}`)
            if (savedClassId && item.classStats.find((stat) => stat.classId == savedClassId)) {
              item.selectedClassId = parseInt(savedClassId)
            } else {
              item.selectedClassId = item.classStats[0].classId
            }
          }
        }
      }
      reportList.value = rawList
    }
  } catch {
    reportList.value = []
  }
}

// const handlePreview = (item) => {
//   router.push({
//     name: 'TemplatePreview',
//     params: { id: courseId, templateId: item.id },
//   })
// }

// const handleEdit = (item) => {
//   console.log('【调试】跳转编辑页参数 courseId:', courseId, 'templateId:', item.id)
//   router.push({
//     name: 'BaoGao',
//     params: { id: courseId, templateId: item.id },
//   })
// }

// const handleViewSubmissions = async (item) => {
//   // 自动选中第一个班级
//   if (item.classIds && item.classIds.length > 0) {
//     selectedClassId.value = item.classIds[0]
//   } else {
//     selectedClassId.value = null
//   }
//   console.log('[DEBUG] handleViewSubmissions 自动选中班级:', selectedClassId.value)
//   submissionDialogVisible.value = true
//   submissionLoading.value = true
//   currentTemplateName.value = item.name
//   submissionTab.value = 'report'
//   submissionTabType.value = 'all'
//   console.log('点击查看学生提交记录，传入模板ID:', item.id)
//   await fetchSubmissionList(item.id, 'report')
// }

// const handleViewClassStatistics = (item) => {
//   // 默认选中第一个班级
//   selectedTemplateId.value = item.id
//   selectedTemplateItem.value = item
//   selectedClassId.value = item.classIds && item.classIds.length > 0 ? item.classIds[0] : null
//   showClassStatistics.value = true
// }

// 删除实验报告
// const handleDelete = async (item) => {
//   console.log('尝试删除实验报告:', item.id, item.name)
//   currentDeletingItem.value = item
//   deleteConfirmVisible.value = true // 打开删除确认对话框
// }

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
// const handleClassStatisticsTabChange = async (val) => {
//   await fetchClassStatistics(val)
// }

async function fetchClassStatistics(type) {
  classStatisticsLoading.value = true
  classStatisticsData.value = null
  if (type === 'report') {
    // 报告统计接口
    try {
      console.log('[DEBUG][fetchClassStatistics] getClassStatisticsService 调用', {
        templateId: selectedTemplateId.value,
        classId: selectedClassId.value,
        selectedTemplateId: selectedTemplateId.value,
        selectedClassId: selectedClassId.value,
      })
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
      console.log('[DEBUG][fetchClassStatistics] getExperimentDataStatisticsByClass 调用', {
        templateId: selectedTemplateId.value,
        classId: selectedClassId.value,
        selectedTemplateId: selectedTemplateId.value,
        selectedClassId: selectedClassId.value,
      })
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

watch([selectedClassId, statisticsType], async ([cid, type]) => {
  console.log(
    '[DEBUG][watch] selectedClassId:',
    cid,
    'statisticsType:',
    type,
    'selectedTemplateItem:',
    selectedTemplateItem.value,
  )
  if (!cid || !selectedTemplateItem.value) return
  classStatisticsLoading.value = true
  try {
    if (type === 'report') {
      console.log('[DEBUG][watch] getClassStatisticsService 调用', {
        templateId: selectedTemplateItem.value.id,
        classId: cid,
        selectedTemplateItem: selectedTemplateItem.value,
      })
      const res = await getClassStatisticsService(selectedTemplateItem.value.id, cid)
      classStatisticsData.value = res.data.data
    } else {
      console.log('[DEBUG][watch] getExperimentDataStatisticsByClass 调用', {
        templateId: selectedTemplateItem.value.id,
        classId: cid,
        selectedTemplateItem: selectedTemplateItem.value,
      })
      const res = await getExperimentDataStatisticsByClass(selectedTemplateItem.value.id, cid)
      classStatisticsData.value = res.data.data
    }
  } finally {
    classStatisticsLoading.value = false
  }
})

// 在模板 class-stats-row 的"报告提交"span加点击事件
// <span class="class-report" @click="handleViewClassSubmissions(item, stat.classId)">
//   报告提交 {{ stat.reportSubmit }}/{{ stat.reportTotal }}
// </span>
const handleViewClassSubmissions = (item, classId) => {
  console.log('[DEBUG][handleViewClassSubmissions] 点击班级报告提交:', { item, classId })

  // 保存当前选择的班级
  if (item.selectedClassId) {
    localStorage.setItem(`selectedClass_${item.id}`, item.selectedClassId.toString())
    console.log(`[DEBUG] 跳转前保存班级选择: 模板${item.id} -> 班级${item.selectedClassId}`)
  }

  // 使用路由跳转而不是弹窗
  router.push({
    name: 'PiYutangchuang',
    params: {
      courseId: courseId,
      templateId: item.id,
    },
    query: {
      templateName: item.name,
      classId: classId,
      tabType: 'reportOnly',
    },
  })
}

// 在 <script setup> 里添加事件处理函数
const handleViewClassDataSubmissions = (item, classId) => {
  console.log('[DEBUG] handleViewClassDataSubmissions 被点击', { item, classId })

  // 保存当前选择的班级
  if (item.selectedClassId) {
    localStorage.setItem(`selectedClass_${item.id}`, item.selectedClassId.toString())
    console.log(`[DEBUG] 跳转前保存班级选择: 模板${item.id} -> 班级${item.selectedClassId}`)
  }

  // 使用路由跳转而不是弹窗
  router.push({
    name: 'PiYutangchuang',
    params: {
      courseId: courseId,
      templateId: item.id,
    },
    query: {
      templateName: item.name,
      classId: classId,
      tabType: 'dataOnly',
    },
  })
}

// 新增：用于切换班级时只显示当前选中班级的统计
function currentStat(item) {
  if (!item.classStats || item.classStats.length === 0) return null
  // 如果没有selectedClassId，默认第一个
  if (!item.selectedClassId) {
    item.selectedClassId = item.classStats[0].classId
  }
  return item.classStats.find((stat) => stat.classId === item.selectedClassId) || item.classStats[0]
}
// 切换班级时，保持功能不变
function onClassChange() {
  // 保存用户选择的班级到localStorage
  const currentItem = reportList.value.find((item) => item.selectedClassId)
  if (currentItem) {
    localStorage.setItem(`selectedClass_${currentItem.id}`, currentItem.selectedClassId.toString())
    console.log(`[DEBUG] 保存班级选择: 模板${currentItem.id} -> 班级${currentItem.selectedClassId}`)
  }
}

onMounted(async () => {
  console.log('🔍 [baogaoPiYue] onMounted 开始')
  console.log('🔍 当前路由:', window.location.href)
  console.log('🔍 当前历史记录状态:', window.history.state)
  console.log('【调试】BaogaoList.vue onMounted, 当前 courseId:', courseId)
  await fetchReportList()
  console.log('🔍 [baogaoPiYue] onMounted 结束')
})
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
  flex: 1; /* 减少flex值 */
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
  flex: 1; /* 减少flex值，让发布时间列占用更少空间 */
  min-width: 80px;
  color: #909399;
  align-items: center;
  padding-right: 8px; /* 减少右边距 */
}
.col.actions {
  flex: 2.5; /* 增加flex值，让操作列占用更多空间 */
  min-width: 320px;
  gap: 8px;
  align-items: center;
  padding-left: 8px; /* 减少左边距 */
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
.submit-stats {
  font-size: 14px;
  color: #666;
  margin-bottom: 4px;
  display: flex;
  flex-wrap: wrap;
}
.submit-stats span {
  margin-right: 16px;
}
.action-btns {
  display: flex;
  gap: 8px;
  margin-bottom: 6px;
}
.class-stats-list {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 16px;
}
.class-stats-row {
  font-size: 14px;
  color: #666;
  display: flex;
  align-items: center;
  gap: 16px;
}
.class-data,
.class-report {
  margin-left: 8px;
}
.class-graded {
  margin-left: 8px;
  color: #409eff;
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
