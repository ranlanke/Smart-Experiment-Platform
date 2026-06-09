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
    <h1 class="main-title">运行机制</h1>
    <div class="main-content">
      <p class="indent">
        为持续巩固和突出教学改革成果，提升学生实践能力与创新素养，本中心构建了"开放管理、制度规范、质量保障、经费充足"的"四位一体"运行机制，确保教学与科研协同推进、资源高效利用、服务社会能力不断提升。
      </p>
      <h2>一、开放运行情况</h2>
      <p><b>全天候开放平台</b></p>
      <p class="indent">
        硬件实验室、软件实验室和计算中心等几大实验室，除公共假期外全年对全校学生开放。年均实验人时数
        达一百万，主要面向科研实践、自主创新学分、校内外竞赛培训。
      </p>
      <p><b>阶段性开放实验室</b></p>
      <p class="indent">
        电子线路、通信原理、射频技术、网络安全等专业实验室，依课程进度分阶段开放。
        按学期教学计划灵活调度，确保实践环节与理论教学紧密衔接。
      </p>
      <h2>二、制度建设与组织架构</h2>
      <p><b>清晰的职责分工</b></p>

      <p class="indent">
        制定《实验中心教学管理条例》《人员管理条例》《设备管理条例》《学生实验管理条例》《责任人制度》《实验室安全管理办法》等多项制度，形成规范管理、管理、维护的制度网络。
      </p>
      <p><b>中心主任：</b> 统筹与决策指挥；</p>
      <p><b>教学指导委员会：</b> 审定实验计划，抽查教学质量；</p>
      <p><b>课程组：</b> 制定实验大纲、组织教材与项目报告；</p>
      <p><b>实验室主任：</b> 落实日常管理与安全维护；</p>
      <p><b>学生自律组织：</b> 参与自主管理与意见反馈。</p>
      <h2>三、教学质量保障体系</h2>
      <p><b>多维度监控评价</b></p>
      <p>制度保障：学校、基础、学院三层制度联动；</p>
      <p class="indent">过程监控：教学已配套闭环反馈与多维环节随机抽检；</p>
      <p class="indent">反馈机制：在线填写调查问卷，及时收集改进建议；</p>
      <p class="indent">成果公开：优秀成果按批次公开展示，强化学风建设。</p>
      <p><b>多级考核责任制</b></p>
      <p class="indent">教学期末均收集环节，分负责人和课程组综效考核；<br /></p>
      <p class="indent">设备部及财务，维修记录和账目，确保长期稳定运行。</p>
      <h2>四、运行经费保障</h2>
      <p><b>中心运行预算</b></p>
      <p class="indent">单独科目核拨，用于大型仪器采购与平台升级；<br /></p>
      <p class="indent">
        教师经费：按教学规模与人数制订预算，教务财务联合审核拨付，用于日常维护与耗材补给。
      </p>
      <p><b>多元化资金渠道</b></p>
      <p class="indent">学院配套资金支持；<br /></p>
      <p class="indent">校企合作引进捐赠；<br /></p>
      <p class="indent">自成立以来经费投入保障了中心的持续发展。</p>
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
