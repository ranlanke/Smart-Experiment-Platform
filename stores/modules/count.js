import { defineStore } from 'pinia'
import { ref } from 'vue'
export const useCountStore = defineStore(
  'big-count',
  () => {
    // 这个里面去写你的逻辑
    const count = ref(100)
    const addCount = () => {
      count.value += 2
    }
    // const removeToken = () => {
    //   token.value = ''
    // }
    return {
      count,
      addCount,
      //   setToken,
      //   removeToken,
      // 这一步非常重要
    }
  },
  //   {
  //     persist: true,
  //   },
)
// big-user是自己取的名字，唯一标识用来做区分的
