import request from '@/utils/request'

// 分页获取通知列表
export function getNotificationList(params) {
  return request({
    url: '/admin/notification/list',
    method: 'get',
    params,
  })
}

// 获取通知详情
export function getNotificationDetail(id) {
  return request({
    url: `/admin/notification/${id}`,
    method: 'get',
  })
}

// 创建通知（草稿）
export function createNotificationDraft(title) {
  return request({
    url: '/admin/notification/basic',
    method: 'post',
    params: { title },
  })
}

// 删除通知（新闻）
export function deleteNotification(id) {
  return request({
    url: `/admin/notification/${id}`,
    method: 'delete',
  })
}

// 发布或更新通知
export function publishOrUpdateNotification(id, data) {
  return request({
    url: `/admin/notification/${id}/publish`,
    method: 'put',
    data,
  })
}

// 设置重要通知（置顶新闻）
export function setHighlightNotifications(ids) {
  return request({
    url: '/admin/notification/highlights',
    method: 'post',
    data: ids,
    headers: {
      // Authorization 由拦截器或全局配置自动注入，若需手动可在此补充
    },
  })
}
