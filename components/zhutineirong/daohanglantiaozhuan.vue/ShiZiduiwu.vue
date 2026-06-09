<template>
  <!-- 顶部横幅 -->
  <div class="demo-banner">
    <div class="banner-content">
      <div class="circular-logo">
        <img
          class="university-logo"
          src="@/assets/logo.png"
          alt="Zhejiang University of Technology Logo"
        />
      </div>
      <h1 class="center-title-banner">浙江理工大学省级电工电子实验教学示范中心</h1>
    </div>
  </div>
  <!-- 导航栏 -->
  <DaohangLan />
  <!-- 主体内容 -->
  <div class="teacher-container">
    <h1 class="teacher-title">师资队伍</h1>
    <div class="table-wrapper">
      <table class="teacher-table">
        <thead>
          <tr>
            <th>姓名</th>
            <th>性别</th>
            <th>职务</th>
            <th>职称</th>
            <th>专业</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>金海</td>
            <td>男</td>
            <td>实验中心主任</td>
            <td>副教授</td>
            <td>电子信息工程</td>
          </tr>
          <tr>
            <td>赵文来</td>
            <td>男</td>
            <td>实验中心副主任</td>
            <td>高级实验师</td>
            <td>电子科学与技术</td>
          </tr>
          <tr>
            <td>吕军</td>
            <td>男</td>
            <td>实验教师</td>
            <td>高级实验师</td>
            <td>电子科学与技术</td>
          </tr>
          <tr>
            <td>张红岩</td>
            <td>男</td>
            <td>实验教师</td>
            <td>高级实验师</td>
            <td>电子科学与技术</td>
          </tr>
          <tr>
            <td>严国红</td>
            <td>女</td>
            <td>实验教师</td>
            <td>实验师</td>
            <td>电子科学与技术</td>
          </tr>
          <tr>
            <td>陈秋妹</td>
            <td>女</td>
            <td>实验教师</td>
            <td>实验师</td>
            <td>电子科学与技术</td>
          </tr>
          <tr>
            <td>汪泓</td>
            <td>男</td>
            <td>实验教师</td>
            <td>实验师</td>
            <td>电子信息工程</td>
          </tr>
          <tr>
            <td>张琪君</td>
            <td>女</td>
            <td>实验教师</td>
            <td>实验师</td>
            <td>电子信息工程</td>
          </tr>
          <tr>
            <td>陈科</td>
            <td>男</td>
            <td>实验教师</td>
            <td>实验师</td>
            <td>电子信息工程</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import DaohangLan from '@/components/zhutineirong/DaohangLan.vue'
</script>

<style scoped>
.demo-banner {
  width: 100%;
  background-color: #1e73be;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 15px 0;
}
.banner-content {
  display: flex;
  align-items: center;
  color: white;
}
.circular-logo {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  overflow: hidden;
  margin-right: 30px;
  background-color: #1e73be;
  display: flex;
  justify-content: center;
  align-items: center;
}
.university-logo {
  width: 200%;
  height: 200%;
  object-fit: contain;
  transform: translate(3%, 3%);
}
.center-title-banner {
  font-size: 48px;
  font-weight: bold;
  color: white;
  text-align: center;
  margin: 0;
}
.teacher-container {
  max-width: 900px;
  margin: 40px auto;
  padding: 32px 32px 24px 32px;
  box-sizing: border-box;
}
.teacher-title {
  font-size: 32px;
  font-weight: bold;
  color: #222;
  text-align: center;
  margin-bottom: 30px;
}
.table-wrapper {
  overflow-x: auto;
  background: #fff;
  border-radius: 10px;
  padding: 20px;
  box-sizing: border-box;
  border: 1px solid #eee;
}
.teacher-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 16px;
  background: #fff;
}
.teacher-table th,
.teacher-table td {
  border: 1px solid #888;
  padding: 8px 16px;
  text-align: center;
}
.teacher-table th {
  background: #f5f7fa;
  font-weight: bold;
}
</style>
