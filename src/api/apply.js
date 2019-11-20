import request from '@/utils/request'

export function createApply(data) {
  return request({
    url: '/apply',
    method: 'post',
    data
  })
}
