<template>
  <el-dialog
    v-model="visible"
    title="班级统计信息"
    width="700px"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <div v-if="loading" style="text-align: center">加载中...</div>
    <div v-else-if="error" style="color: red; text-align: center">{{ error }}</div>
    <div v-else-if="statistics" style="text-align: center">
      <p>班级总人数：{{ statistics.totalStudents }}</p>
      <p>已提交人数：{{ statistics.submittedCount }}</p>
      <p>已批改人数：{{ statistics.gradedCount }}</p>
      <p>平均分：{{ statistics.averageScore }}</p>
      <p>最高分：{{ statistics.highestScore }}</p>
      <p>最低分：{{ statistics.lowestScore }}</p>
      <div v-if="statistics.scoreDistribution">
        <h4>分数分布：</h4>
        <ul style="display: inline-block; text-align: left">
          <li v-for="(count, range) in statistics.scoreDistribution" :key="range">
            {{ range }} 分：{{ count }} 人
          </li>
        </ul>
      </div>
    </div>
    <div v-else style="text-align: center">暂无数据</div>
  </el-dialog>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { getClassStatisticsService } from '@/api/template'

const props = defineProps({
  templateId: {
    type: [String, Number],
    required: true,
  },
  classId: {
    type: [String, Number],
    required: true,
  },
})

const emit = defineEmits(['close'])
const visible = ref(true)
const statistics = ref(null)
const loading = ref(false)
const error = ref('')

const fetchStatistics = async () => {
  loading.value = true
  error.value = ''
  try {
    const res = await getClassStatisticsService(props.templateId, props.classId)
    if (res && res.data && res.data.data) {
      statistics.value = res.data.data
    } else {
      statistics.value = null
      error.value = '未获取到统计数据'
    }
  } catch {
    error.value = '获取统计信息失败'
    statistics.value = null
  } finally {
    loading.value = false
  }
}

const handleClose = () => {
  emit('close')
}

onMounted(fetchStatistics)
watch(() => [props.templateId, props.classId], fetchStatistics)
</script>

<style scoped>
.banji-tongji-xinxi {
  padding: 24px;
}
</style>
