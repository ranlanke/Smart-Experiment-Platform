// 编辑器组件
import StaticTextEditor from './editor/StaticTextEditor.vue'
import DynamicTextEditor from './editor/DynamicTextEditor.vue'
import TableEditor from './editor/TableEditor.vue'
import FileUploader from './editor/FileUploader.vue'
import ImageUploader from './editor/ImageUploader.vue'

// 工具栏组件
import EditorToolbar from './toolbar/EditorToolbar.vue'

// 预览组件
import ContentPreview from './preview/ContentPreview.vue'

// 工具组件
import DirectoryView from './utils/DirectoryView.vue'

// 导出所有组件
export {
  // 编辑器组件
  StaticTextEditor,
  DynamicTextEditor,
  TableEditor,
  FileUploader,
  ImageUploader,

  // 工具栏组件
  EditorToolbar,

  // 预览组件
  ContentPreview,

  // 工具组件
  DirectoryView,
}

// 默认导出所有组件
export default {
  install(app) {
    // 注册编辑器组件
    app.component('StaticTextEditor', StaticTextEditor)
    app.component('DynamicTextEditor', DynamicTextEditor)
    app.component('TableEditor', TableEditor)
    app.component('FileUploader', FileUploader)
    app.component('ImageUploader', ImageUploader)

    // 注册工具栏组件
    app.component('EditorToolbar', EditorToolbar)

    // 注册预览组件
    app.component('ContentPreview', ContentPreview)

    // 注册工具组件
    app.component('DirectoryView', DirectoryView)
  },
}
