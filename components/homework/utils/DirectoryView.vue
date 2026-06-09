<template>
  <div class="directory-view">
    <h4 class="directory-title">目录</h4>
    <div class="directory-list">
      <div
        v-for="(entry, index) in directory"
        :key="index"
        class="directory-item"
        @click="$emit('entry-click', entry)"
      >
        <span
          :class="['directory-text', `level-${entry.level}`]"
          :style="{ marginLeft: `${entry.level * 10}px` }"
        >
          {{ entry.text }}
        </span>
      </div>
      <div v-if="directory.length === 0" class="empty-directory">
        <el-empty description="暂无内容，从编辑区拖入组件" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  items: {
    type: Array,
    default: () => [],
  },
})

const emit = defineEmits(['entry-click'])

// 生成目录
const directory = computed(() => {
  const result = []
  props.items.forEach((item, itemIndex) => {
    if (item.type === 'static-text' && item.content) {
      const spans = item.content.match(/<span[^>]*data-level="(\d+)"[^>]*>(.*?)<\/span>/g)
      if (spans) {
        spans.forEach((span, spanIndex) => {
          const levelMatch = span.match(/data-level="(\d+)"/)
          const textMatch = span.match(/>(.*?)<\/span>/)

          if (levelMatch && textMatch) {
            const level = parseInt(levelMatch[1])
            const text = textMatch[1]
            result.push({
              text,
              level,
              item,
              itemIndex,
              headingId: `heading-${itemIndex}-${spanIndex}`,
            })
          }
        })
      }
    }
  })
  return result
})
</script>

<style scoped>
.directory-view {
  display: flex;
  flex-direction: column;
  width: 100%;
}

.directory-title {
  color: #606266;
  margin: 0 0 12px 0;
  font-size: 16px;
  font-weight: 500;
}

.directory-list {
  flex: 1;
  overflow-y: auto;
  padding-right: 8px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.directory-item {
  display: flex;
  align-items: center;
  padding: 10px 12px;
  background-color: #ffffff;
  border-radius: 4px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
  transition: all 0.3s;
  cursor: pointer;
}

.directory-item:hover {
  background-color: #ecf5ff;
  transform: translateY(-2px);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.12);
}

.directory-text {
  color: #303133;
  font-size: 14px;
  flex: 1;
}

.empty-directory {
  height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.level-1 {
  font-weight: bold;
  font-size: 16px;
}

.level-2 {
  font-weight: bold;
  font-size: 15px;
  color: #303133;
}

.level-3 {
  font-weight: bold;
  font-size: 14px;
  color: #606266;
}

.level-4 {
  font-size: 14px;
  color: #606266;
}

.level-5 {
  font-size: 13px;
  color: #909399;
}
</style>
