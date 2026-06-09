<template>
  <div class="experiment-list-container">
    <h2>实验报告列表</h2>
    <el-table :data="experimentList" style="width: 100%">
      <el-table-column prop="title" label="实验标题" width="200" />
      <el-table-column prop="publishTime" label="发布时间" width="180" />
      <el-table-column prop="classes" label="发布班级">
        <template #default="scope">
          <el-tag
            v-for="cls in scope.row.classes"
            :key="cls.id"
            type="success"
            style="margin-right: 4px"
          >
            {{ cls.name }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="220">
        <template #default="scope">
          <el-button type="primary" size="small" @click="onEdit(scope.row)">编辑</el-button>
          <el-button type="info" size="small" @click="onView(scope.row)">查看</el-button>
          <el-button type="danger" size="small" @click="onDelete(scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script setup>
const experimentList = [
  {
    id: 1,
    title: '电子工艺实验',
    publishTime: '2024-06-01 10:00',
    classes: [
      { id: 1, name: '2023级计算机科学1班' },
      { id: 2, name: '2023级软件工程1班' },
    ],
  },
  {
    id: 2,
    title: '信号与系统实验',
    publishTime: '2024-06-02 14:30',
    classes: [{ id: 3, name: '2023级计算机科学2班' }],
  },
]

const onEdit = () => {
  // 跳转到编辑页
}
const onView = () => {
  // 跳转到预览页
}
const onDelete = () => {
  // 弹窗确认删除
}
</script>

<style scoped>
.experiment-list-container {
  padding: 30px;
  background: #fff;
  border-radius: 8px;
}
</style>
