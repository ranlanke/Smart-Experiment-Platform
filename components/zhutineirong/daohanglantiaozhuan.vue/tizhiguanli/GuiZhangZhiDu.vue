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
    <h1 class="main-title">规章制度</h1>
    <div class="main-content">
      <!-- 规章制度原有内容区，保持缩进、加粗等 -->
      <h2>一、技术人员岗位职责</h2>
      <p><b>1. 遵守制度：</b></p>
      <p class="indent">
        严格执行学校、学院及中心各项规章制度和管理条例。按时完成考勤，不做与本职工作无关的事务。
      </p>
      <p><b>2. 认真工作与协助：</b></p>
      <p class="indent">
        服从中心统一安排，协助做好实验前准备（元器件、耗材、仪器等）。实验过程配合，协助任课教师维护秩序，不得擅离岗位。
      </p>
      <p><b>3. 设备与安全：</b></p>
      <p class="indent">
        保持实验室安全、卫生，做好仪器设备维护与检查。实验结束后，填写实验记录，整理归档原始资料。
      </p>
      <p><b>4. 积极学习与总结：</b></p>
      <p class="indent">
        积极参与实验教学改革，不断完善实验内容和方法。定期总结实验教学开展情况，为中心建设提供建议。
      </p>
      <h2>二、环境与安全管理条例</h2>
      <p><b>场所与卫生</b></p>
      <p class="indent">
        各实验室分片负责本区域内卫生，严禁随地丢弃垃圾或乱泼液体。楼道、公共空间不得堆放杂物，保持整洁清静。
      </p>
      <p><b>设施使用与维护</b></p>
      <p class="indent">
        基础设施改建维修须主管领导审批。中心、卫生、地机、电源等由办公室统一管理。
      </p>
      <p><b>安全与用电</b></p>
      <p class="indent">
        实验室及公共场所严禁吸烟、焚烧可燃物。无人时关闭空调、灯具，禁止私拉电线或使用生活电器。每月至少两次检查灭火器等消防设施，确保完好。
      </p>
      <p><b>出入管理</b></p>
      <p class="indent">
        非实验中心人员未经许可，不得进入实验室。临时离岗须锁门、关窗、断电（服务器、工作站除外）。
      </p>
      <h2>三、学生实验管理条例</h2>
      <p><b>实验准备</b></p>
      <p class="indent">
        实验前认真预习，明确目的、步骤，迟到者取消实验资格。实验结束后须整理台面，需按要求整顿并补交。
      </p>
      <p><b>行为规范</b></p>
      <p class="indent">
        保持实验室整洁，不得喧哗、乱扔垃圾、饮食或吸烟。尊敬教师，听从安排，未经许可不得移动或调换设备。
      </p>
      <p class="indent">
        严格遵守操作规程，通电前需教师认可，遇故障冷静处置。禁止打闹、玩耍、做与实验无关的行为（如玩游戏）。
      </p>
      <p><b>离场管理</b></p>
      <p class="indent">实验结束，整理场地，检查设备，经指导教师认可方可离开。</p>
      <h2>四、技术人员管理条例</h2>
      <p><b>组织与纪律</b></p>
      <p class="indent">
        遵守请示汇报流程，不擅自越权处理中心事务。工作时间内不得闲谈，擅离岗位或从事与本职无关工作。
      </p>
      <p><b>任务执行</b></p>
      <p class="indent">
        申请假日须经批准，按规定方式进行补偿或轮休。遇临时任务或会议，须服从合理安排，不得推诿。
      </p>
      <p><b>团队风气</b></p>
      <p class="indent">维护同事间正常和谐关系，严禁争吵、传播不实言论。</p>
      <h2>五、设备管理条例</h2>
      <p><b>采购与验收</b></p>
      <p class="indent">设备采购须按学校招投标流程，按规范方式验收，负责到货验收。</p>
      <p><b>账务与台账</b></p>
      <p class="indent">设备台账存档完整，账物相符，定期核查。</p>
      <p><b>保养与维修</b></p>
      <p class="indent">
        实验室人员负责设备日常保养，定期与责任人核查使用情况。跨实验室调动需主管领导批准并办理手续。年久失效设备按学校规定流程报废。
      </p>
      <p><b>使用规范</b></p>
      <p class="indent">非本实验室人员未经允许不得使用设备，私自带出需审批。</p>
      <h2>六、教学管理条例</h2>
      <p><b>实验计划与任务</b></p>
      <p class="indent">
        新学期实验课统一排表，由实验室管理员任签字，中心办公室审核。考勤、任务完成情况作为评定并择优绩效考核的重要依据。
      </p>
      <p><b>准备与沟通</b></p>
      <p class="indent">
        教师须按中心实验计划、内容、所需设备、材料、学生人数等，提前报备，审批后方可安排实验。
      </p>
      <p><b>课堂与纪律</b></p>
      <p class="indent">
        实验人员须提前5分钟到门，严格执行《学生实验管理条例》。任课教师须提前到场，实验师到场后方可开课。
      </p>
      <p class="indent">
        请各位教职工、实验技术人员、学生认真学习，严格遵守，共同营造安全、有序、高效的实验教学环境。
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
.main-content h2 {
  font-size: 22px;
  color: #065bb2;
  font-weight: bold;
  margin-top: 32px;
  margin-bottom: 16px;
}
.main-content b {
  font-weight: bold;
  color: #065bb2;
}
</style>
