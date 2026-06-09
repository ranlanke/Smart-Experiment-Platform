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
  <div class="center-container">
    <h1 class="center-title">中心概况</h1>
    <div class="center-subtitle">省级电工电子实验教学示范中心（浙江理工大学）</div>
    <div class="center-section">
      <h3>一、中心简介</h3>
      <div class="center-desc">
        <p>
          浙江理工大学信息电子省级实验教学示范中心成立于2010年12月，由浙江省教育厅批准建设。中心贯彻"以人为本、整合培养、求是创新、追求卓越"的指导思想，坚持"以学生为本、知识、能力、创新协调发展"的教学理念，构建了"信息电子类能力、行业应用能力、工程创新能力"三个维度的"三维立体式"实验教学体系。
        </p>
        <p>
          中心下设电工电子实训中心、专业实验室和设计与创新实验室。其中电工电子实训中心主要承担全校电工、数电、模电等基础课程的实验实践教学，专业实验室主要包括嵌入式实验室、通信综合实验室、单片机实验室、高频实验室和微波实验室等，主要服务于电子信息类专业核心的实验实践教学；设计与创新实验室为开放实验室，主要服务于全院的学科竞赛、导师制和毕业设计等环节。
        </p>
      </div>
      <div class="center-images">
        <div class="image-row">
          <img :src="img1" alt="实验室1" class="lab-img" />
          <img :src="img2" alt="实验室2" class="lab-img" />
        </div>
        <div class="image-row">
          <img :src="img3" alt="实验室3" class="lab-img" />
          <img :src="img4" alt="实验室4" class="lab-img" />
        </div>
        <div class="img-caption">图：实验室基本情况</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import DaohangLan from '@/components/zhutineirong/DaohangLan.vue'
import img1 from '@/assets/zhongxingaikuang/2f5c9b5e-99c7-414e-aaae-23170d615088.png'
import img2 from '@/assets/zhongxingaikuang/c8bfcc5c-74df-4164-9f17-15bc3f075def.png'
import img3 from '@/assets/zhongxingaikuang/37756ac5-c640-45e9-9570-1bb91cdfd5de.png'
import img4 from '@/assets/zhongxingaikuang/d27efc89-367d-47dc-a7d4-f749229e60ea.png'
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
.center-container {
  max-width: 900px;
  margin: 40px auto;
  /* background: #fff; */
  border-radius: 10px;
  padding: 32px 32px 24px 32px;
  box-sizing: border-box;
  /* box-shadow: 0 2px 8px rgba(0,0,0,0.08); */
}
.center-title {
  font-size: 32px;
  font-weight: bold;
  color: #222;
  text-align: center;
  margin-bottom: 10px;
}
.center-subtitle {
  font-size: 18px;
  color: #444;
  text-align: center;
  margin-bottom: 30px;
  font-weight: 500;
}
.center-section {
  margin-bottom: 30px;
}
.center-section h3 {
  font-size: 20px;
  font-weight: bold;
  color: #1e73be;
  margin-bottom: 16px;
}
.center-desc {
  font-size: 16px;
  color: #333;
  line-height: 2;
  margin-bottom: 30px;
  text-align: left;
  text-indent: 2em;
}
.center-images {
  margin: 0 auto 10px auto;
  max-width: 700px;
  background: #fafbfc;
  border: 1px solid #eee;
  border-radius: 8px;
  padding: 18px 10px 10px 10px;
}
.image-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 12px;
}
.lab-img {
  width: 48%;
  height: 180px;
  object-fit: cover;
  border-radius: 6px;
  border: 1px solid #e0e0e0;
  background: #f4f5f7;
}
.img-caption {
  text-align: center;
  color: #888;
  font-size: 15px;
  margin-top: 8px;
}
</style>
