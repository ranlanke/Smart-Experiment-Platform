import request from '@/utils/request'

// 获取已发布的通知列表（首页新闻用）
export function getPublishedNotifications(params) {
  return request({
    url: '/notifications',
    method: 'get',
    params,
  })
}

// 获取单个已发布的通知详情
export function getNotificationDetail(id) {
  return request({
    url: `/notifications/${id}`,
    method: 'get',
  })
}

// 获取重要通知列表（置顶新闻）
export function getHighlightNotifications() {
  return request({
    url: '/notifications/highlights',
    method: 'get',
    // Authorization 由拦截器自动注入
  })
}
