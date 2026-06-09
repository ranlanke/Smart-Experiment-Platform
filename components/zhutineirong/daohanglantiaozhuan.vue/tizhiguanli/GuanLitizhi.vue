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
  <div class="main-container">
    <h1 class="main-title">管理体制</h1>
    <div class="main-content">
      <p class="title"><b>双层管理架构</b></p>
      <p>
        <b>学校统筹：</b
        >由校领导负责下达实验教学任务，组织教学改革与示范项目评审立项，并对专项与运行经费进行督查与统筹；实验中心正副主任由学校人事部门统一任命。
      </p>
      <p>
        <b>学院协同：</b
        >依托信息科学与工程学院，在实验教学方案制定、师资选聘与平台建设等方面提供指导与支持，确立教学目标与专业建设深度融合。
      </p>
      <p class="title"><b>组织与职责划分</b></p>
      <p>
        <b>中心办公室：</b
        >负责教学任务的接收与分解，对下设各部门进行统筹安排，并组织例会督导各项工作落实。
      </p>
      <p>
        <b>实验管理组：</b
        >中心实验室由相应课程模块负责人或其指定责任教师任主任，日常管理由通过公开竞聘产生的核心技术岗位人员执行。
      </p>
      <p class="title"><b>教学任务与资源配置</b></p>
      <p>
        <b>任务分工：</b
        >所有实验教学任务由学校教务处统一下达，中心根据课程模块和师资情况进行统一调度。实验教学任务一般一个或多个课程模块的实验教学，也可多个实验室联合承担同一模块，保障实验任务的顺利进行。
      </p>
      <p>
        <b>设备管理：</b
        >中心统一规划和调拨所有仪器设备，配有专职管理人员、负责领用、维护与归还流程。仪器设备和实验室管理规范定期开展年度考核，促进资源高效使用。
      </p>
      <p class="title"><b>绩效考核与激励</b></p>
      <p>
        <b>年度考核：</b
        >以实验教学质量、设备录案、学生反馈和创新项目成果等为指标，对中心正副主任、实验室主任及核心技术人员进行综合评价。
      </p>
      <p>
        <b>项目激励：</b
        >对在教学改革、开放服务和学科竞赛中表现突出的团队与个人，给予项目经费支持，职称晋升时实验成果将作为考评参考。
      </p>
      <p class="title"><b>协同发展与持续改进</b></p>
      <p>
        <b>校院联动：</b
        >定期组织教学研讨会与课程评审会，学院专家与中心骨干共同参与，不断优化实验教学大纲和运行流程。
      </p>
      <p>
        <b>师生联动：</b
        >建立师生间、教学管理与学生代表联络会监督考察渠道反馈机制，及时发现问题并推动制度与管理持续改进和优化。
      </p>
      <p>
        通过"学校统筹—学院协助—中心实施—快速反馈"的管理体制，信息电子省级实验教学示范中心实现了教学任务的优化配置与持续创新，力争将建设提升高度、开放共享的实验教学平台。
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
.main-content p.title {
  text-indent: 0;
  font-weight: bold;
}
</style>
