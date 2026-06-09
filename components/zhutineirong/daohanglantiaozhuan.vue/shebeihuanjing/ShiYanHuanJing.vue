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
    <h1 class="main-title">实验中心环境与安全</h1>
    <div class="main-content">
      <p class="indent">
        浙江理工大学信息电子实验教学中心坚持"安全第一、规范管理"的原则，持续优化实验教学环境，完善安全保障体系，为高质量实验教学和学生实践创新活动提供坚实支撑。
      </p>
      <h2>一、实验教学环境优良</h2>
      <p class="indent">
        信息电子实验教学中心建有电工电子实训中心、专业实验室和设计创新实验室，实验教学资源充足，布局科学合理，满足大规模实践教学与创新训练需求。
      </p>
      <h2>二、安全保障体系完善</h2>
      <p class="indent">
        实验中心高度重视实验教学安全管理，严格执行学校相关规定和中心制定的规章制度。各实验室配备完善的安全设施，定期对消防设备、供电系统、仪器仪表等进行巡检维护，确保实验环境安全可控。
      </p>
      <p class="indent">
        针对新入学学生，中心联合学院组织开展实验室安全教育培训，增强学生实验规范意识与应急处置能力。实验教学过程中，教师与技术人员严格值守，严防各类安全隐患。
      </p>
      <h2>三、实验室管理规范有序</h2>
      <p class="indent">
        实验中心制定有专门的《实验中心安全、卫生管理制度》《实验中心技术人员岗位职责》《实验室学生实验管理条例》等制度，明确人员职责与管理流程。中心对实验设备实行统一调配和管理，明确设备使用规范及安全注意事项，确保设备运行稳定、使用高效。
      </p>
      <p class="indent">
        中心同时注重实验室的环境卫生与秩序维护，实验区域干净整洁，实验过程中禁止使用大功率生活电器、严禁吸烟、饮食，并要求学生爱护公共设施，规范操作。
      </p>
      <h2>四、信息化平台助力智能管理</h2>
      <p class="indent">
        实验教学中心建成了网络化、开放型的实验教学与管理信息平台，实现了实验教学安排、设备预约、实验室运、成绩查询等功能的信息化管理。中心各实验室配备网络终端设备，学生和教师可高效完成教学活动及实验数据统计交流，提高了管理效率和资源使用率。
      </p>
      <p class="indent">
        通过严谨规范的管理机制，持续优化的实验教学环境与多层次的安全保障体系，浙江理工大学信息电子实验教学中心为师生提供了一个安全、智能、规范、先进的实验教学平台，有效支撑了人才培养质量的不断提升。
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
