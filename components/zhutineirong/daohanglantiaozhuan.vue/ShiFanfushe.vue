<template>
  <!-- 顶部横幅 -->
  <div class="demo-banner">
    <div class="banner-content">
      <div class="circular-logo">
        <img class="university-logo" src="@/assets/logo.png" alt="logo" />
      </div>
      <h1 class="center-title-banner">浙江理工大学省级电工电子实验教学示范中心</h1>
    </div>
  </div>
  <!-- 导航栏 -->
  <DaohangLan />
  <!-- 主体内容 -->
  <div class="main-container">
    <h1 class="main-title">示范辐射介绍</h1>
    <div class="main-content">
      <p class="indent">
        浙江理工大学信息电子实验教学中心坚持以服务教学为核心、以合作开放为路径，积极发挥省级实验教学示范中心的辐射与带动作用，构建多层次、多领域的示范体系，在教学共享、学术交流、人才培训等方面持续拓展影响力。
      </p>
      <h2>一、对内开放，服务全校</h2>
      <p class="indent">
        中心以"资源共享、服务全校"为原则，除配备信息、电子专业基础实验教学设备外，还在约织、服装、机械等非电子专业中开展通识实践教学，推动多学科交叉融合发展。
      </p>
      <p class="indent">
        依托设计与创新实验室资源优势，创新实验室实行每年不少于15小时开放制，面向全校师生提供课程实验、技能训练、学科竞赛等服务，为其他学院课程提供高效支持，已成为学际实践教学的重要平台。
      </p>
      <h2>二、对外合作，广泛交流</h2>
      <p class="indent">
        中心积极承办各类教育活动与科普活动，同时接待来自浙江财经大学、金华职业技术学院等省内高校的参观交流团队，接待霍特斯坦工大学等国际来访专家学者，不断拓展国际视野，提升师资队伍国际化水平，打造"引得进、走得出"的交流窗口。
      </p>
      <h2>三、校政企联动，深度协同</h2>
      <p class="indent">
        中心主动服务地方经济社会发展，积极参与产教融合项目建设，先后建立13个校外实践教学基地，为"芯制造""机器电"等企业开展专业培训与技术支持。
      </p>
      <p class="indent">
        近年来，中心多次承担浙江省教育厅教师资格培训任务，组织社会类考试活动超过500人次以上。通过参与教育厅、人事等省级主管部门的培训考试工作，有效扩大了中心在行业内的示范影响力。
      </p>
      <h2>四、机制创新，引领示范</h2>
      <p class="indent">
        作为省级示范中心，中心不断探索实验教学管理创新模式，构建了信息化、智能化的教学管理平台，实现从实验预约到设备管理、教学资源共享、数据统计的全过程线上处理，提高了资源利用率和教学效率。
      </p>
      <p class="indent">
        在"产学合作协同育人"考察路基重点项目申报和实施成果中，中心已成为推动浙江省实验教学改革、促进优质教育资源共享的重要支点。
      </p>
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
.main-container {
  max-width: 900px;
  margin: 40px auto;
  padding: 32px 32px 24px 32px;
  box-sizing: border-box;
}
.main-title {
  font-size: 32px;
  font-weight: bold;
  color: #222;
  text-align: center;
  margin-bottom: 30px;
}
.main-content {
  font-size: 16px;
  color: #333;
  line-height: 2;
  text-align: left;
}
.main-content p {
  text-indent: 2em;
  margin: 10px 0;
}
.main-content h2 {
  font-size: 22px;
  color: #065bb2;
  font-weight: bold;
  margin-top: 32px;
  margin-bottom: 16px;
}
</style>
