<template>
  <div>
    <el-tabs v-model="activeTab">
      <el-tab-pane label="未分组学生" name="ungrouped">
        <el-table
          v-loading="loading"
          :data="students"
          style="width: 100%"
          v-if="students.length"
          @selection-change="handleSelectionChange"
          ref="tableRef"
        >
          <el-table-column type="selection" width="50" />
          <el-table-column prop="studentNumber" label="学号" width="120" />
          <el-table-column prop="name" label="姓名" width="120" />
          <el-table-column prop="gender" label="性别" width="80" />
          <el-table-column prop="major" label="专业" min-width="120" />
        </el-table>
        <el-empty v-else description="暂无未分组学生" />

        <div v-if="students.length" class="group-action-bar">
          <el-button
            type="primary"
            :disabled="selected.length === 0"
            @click="showGroupDialog = true"
            class="create-group-btn"
            v-if="!addMemberMode"
          >
            创建小组
          </el-button>
          <el-button
            type="info"
            @click="activeTab = 'groups'"
            class="view-group-btn"
            v-if="!addMemberMode"
          >
            查看分组
          </el-button>
          <el-button
            type="success"
            :disabled="selected.length === 0"
            @click="handleBatchAddMembers"
            v-if="addMemberMode"
          >
            添加
          </el-button>
          <el-button
            @click="
              () => {
                addMemberMode = false
                targetGroupId = null
                selected = []
              }
            "
            v-if="addMemberMode"
          >
            取消
          </el-button>
        </div>
      </el-tab-pane>
      <el-tab-pane label="小组列表" name="groups">
        <div class="group-list">
          <div class="group-card" v-for="group in groupList" :key="group.id">
            <div class="group-title">
              <span>{{ group.name }}</span>
              <span class="group-ops">
                <el-button size="small" type="success" @click="handleAddMember(group.id)"
                  >添加成员</el-button
                >

                <el-button size="small" type="warning" @click="handleBatchRemoveMembers(group.id)">
                  移除成员
                </el-button>
                <el-button size="small" type="danger">删除</el-button>
              </span>
            </div>
            <div class="group-members">
              <el-table
                :data="groupMembersMap[group.id] || []"
                style="width: 100%; margin-bottom: 8px"
                size="small"
                @selection-change="(val) => handleGroupMemberSelectionChange(group.id, val)"
                v-if="groupMembersMap[group.id] && groupMembersMap[group.id].length > 0"
              >
                <el-table-column type="selection" width="50" />
                <el-table-column prop="studentNumber" label="学号" width="120" />
                <el-table-column prop="name" label="姓名" width="120" />
                <el-table-column prop="gender" label="性别" width="80" />
                <el-table-column prop="major" label="专业" min-width="120" />
              </el-table>
              <span v-else class="more">暂无成员</span>
            </div>
          </div>
        </div>
      </el-tab-pane>
    </el-tabs>

    <!-- 创建小组弹窗 -->
    <el-dialog
      v-model="showGroupDialog"
      title="创建小组"
      width="400px"
      :close-on-click-modal="false"
    >
      <el-form :model="groupForm" :rules="groupRules" ref="groupFormRef" label-width="80px">
        <el-form-item label="小组名称" prop="name">
          <el-input
            v-model="groupForm.name"
            placeholder="请输入小组名称"
            maxlength="20"
            show-word-limit
          />
        </el-form-item>
        <el-form-item label="成员数量">
          <span>{{ selected.length }} 人</span>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showGroupDialog = false">取消</el-button>
        <el-button type="primary" :loading="groupLoading" @click="handleCreateGroup"
          >创建</el-button
        >
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import {
  getUngroupedStudents,
  createGroup,
  getClassGroupsSimple,
  addMemberToGroup,
  removeMemberFromGroup,
  getGroupDetail, // 新增
} from '@/api/class'
import { ElMessage } from 'element-plus'

const props = defineProps({
  courseId: {
    type: [String, Number],
    required: true,
  },
  classId: {
    type: [String, Number],
    required: true,
  },
})

const activeTab = ref('ungrouped')
const students = ref([])
const loading = ref(false)
const selected = ref([])
const tableRef = ref(null)

const showGroupDialog = ref(false)
const groupForm = ref({ name: '' })
const groupFormRef = ref(null)
const groupLoading = ref(false)
const groupRules = {
  name: [
    { required: true, message: '请输入小组名称', trigger: 'blur' },
    { min: 2, max: 20, message: '2-20个字符', trigger: 'blur' },
  ],
}

const groupList = ref([])
const addMemberMode = ref(false)
const targetGroupId = ref(null)
const groupMembersMap = ref({}) // { [groupId]: members[] }
const selectedGroupMembers = ref({}) // { [groupId]: [] }

const fetchUngroupedStudents = async () => {
  loading.value = true
  try {
    const res = await getUngroupedStudents(props.courseId, props.classId)
    if (res.data && (res.data.code === 0 || res.data.code === 200)) {
      students.value = res.data.data || []
    } else {
      ElMessage.error(res.data?.message || '获取未分组学生失败')
    }
  } catch {
    ElMessage.error('请求未分组学生失败')
  } finally {
    loading.value = false
  }
}

// 获取小组列表
const fetchGroupList = async () => {
  try {
    const res = await getClassGroupsSimple(props.courseId, props.classId)
    console.log('getClassGroupsSimple接口返回：', res)
    if (res.data && (res.data.code === 0 || res.data.code === 200)) {
      groupList.value = res.data.data || []
      console.log('最终groupList：', groupList.value)
    } else {
      groupList.value = []
      console.log('groupList为空')
    }
  } catch (e) {
    groupList.value = []
    console.error('getClassGroupsSimple接口异常', e)
  }
}

const fetchAllGroupMembers = async () => {
  for (const group of groupList.value) {
    try {
      const res = await getGroupDetail(props.courseId, props.classId, group.id)
      if (res.data && (res.data.code === 0 || res.data.code === 200)) {
        groupMembersMap.value[group.id] = res.data.data.members || []
      } else {
        groupMembersMap.value[group.id] = []
      }
    } catch {
      groupMembersMap.value[group.id] = []
    }
  }
}

watch(
  () => [props.courseId, props.classId, activeTab.value],
  ([, , tab]) => {
    if (tab === 'groups') fetchGroupList()
  },
  { immediate: true },
)

watch(() => [props.courseId, props.classId], fetchUngroupedStudents, { immediate: true })

watch(groupList, fetchAllGroupMembers, { immediate: true })

function handleSelectionChange(val) {
  selected.value = val
}

function handleGroupMemberSelectionChange(groupId, val) {
  selectedGroupMembers.value[groupId] = val
}

async function handleCreateGroup() {
  if (!groupFormRef.value) return
  await groupFormRef.value.validate()
  if (!groupForm.value.name) return
  groupLoading.value = true
  try {
    const studentIds = selected.value.map((s) => s.id)
    const res = await createGroup(props.courseId, props.classId, groupForm.value.name, studentIds)
    if (res.data && (res.data.code === 0 || res.data.code === 200)) {
      ElMessage.success('小组创建成功！')
      showGroupDialog.value = false
      groupForm.value.name = ''
      selected.value = []
      // 清除表格选中
      if (tableRef.value) tableRef.value.clearSelection()
      fetchUngroupedStudents()
    } else {
      ElMessage.error(res.data?.message || '创建小组失败')
    }
  } catch {
    ElMessage.error('创建小组失败')
  } finally {
    groupLoading.value = false
  }
}

function handleAddMember(groupId) {
  addMemberMode.value = true
  targetGroupId.value = groupId
  activeTab.value = 'ungrouped'
  selected.value = []
}

async function handleBatchAddMembers() {
  if (!targetGroupId.value || selected.value.length === 0) return
  try {
    for (const stu of selected.value) {
      await addMemberToGroup(props.courseId, props.classId, targetGroupId.value, stu.id)
    }
    ElMessage.success('添加成员成功！')
    addMemberMode.value = false
    targetGroupId.value = null
    selected.value = []
    fetchUngroupedStudents()
    fetchGroupList()
  } catch {
    ElMessage.error('添加成员失败')
  }
}

// 移除成员功能
async function handleBatchRemoveMembers(groupId) {
  const members = selectedGroupMembers.value[groupId] || []
  if (!members.length) {
    ElMessage.warning('请先勾选要移除的成员')
    return
  }
  try {
    for (const member of members) {
      await removeMemberFromGroup(props.courseId, props.classId, groupId, member.id)
    }
    ElMessage.success('成员移除成功！')
    // 移除后刷新
    await fetchAllGroupMembers()
    await fetchUngroupedStudents() // 新增：刷新未分组学生
    selectedGroupMembers.value[groupId] = []
  } catch {
    ElMessage.error('成员移除失败')
  }
}

// 静态小组数据
</script>

<style scoped>
.group-action-bar {
  position: sticky;
  bottom: 0;
  left: 0;
  width: 100%;
  background: #fff;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 16px 0 8px 0;
  box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.04);
  z-index: 10;
  gap: 16px;
}
.create-group-btn {
  min-width: 140px;
  font-size: 16px;
  font-weight: bold;
  letter-spacing: 2px;
}
.view-group-btn {
  min-width: 120px;
  font-size: 15px;
  font-weight: normal;
}
.group-list {
  margin-top: 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.group-card {
  background: #f7faff;
  border-radius: 8px;
  padding: 16px 20px;
  min-width: 220px;
  box-shadow: 0 2px 8px rgba(22, 119, 255, 0.04);
}
.group-title {
  font-weight: bold;
  margin-bottom: 8px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.group-members {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.member-item {
  background: #e6f7ff;
  border-radius: 4px;
  padding: 2px 8px;
  font-size: 13px;
}
.more {
  color: #999;
  font-size: 13px;
}
</style>
