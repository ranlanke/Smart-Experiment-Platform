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
    <h1 class="main-title">维护与运行</h1>
    <div class="main-content">
      <p class="indent">
        浙江理工大学信息电子实验教学中心高度重视实验设备的维护与管理工作，结合学校实际情况，制定并严格执行《实验中心设备管理条例》。该条例明确了各级人员在教学活动及实验环节中对仪器设备的管理职责和操作规范，确保实验设备的规范、安全使用。
      </p>
      <p class="indent">
        为强化设备管理效果，中心将设备的完好率和管理规范程度纳入实验技术人员的年度绩效考核，实行一票否决制，确保管理责任落实到人。近年来，得益于这一严格的管理机制，实验中心未发生任何因设备管理或使用不当引发的事故，保障了教学和科研活动的安全稳定运行。
      </p>
      <p class="indent">
        在设备采购方面，基础及专业实验室的设备购置经费主要由学校和化学学院专项预算支持，确保设备更新和补充及时。日常维护遵循"轻故障随时中心技术人员内部处理，重大故障由设备供应商现场维修"的原则，维修费用由学校及相关学院专项经费报销，保证维修工作的高效和资金充足。
      </p>
      <p class="indent">
        此外，作为创新实践的重要载体，电子设计训练基地的运行和维护费用全部由学校专项经费保障，为学生创新实践计划提供了坚实的硬件支持和资金保障。
      </p>
      <p class="indent">
        整体而言，完善的维护与运行保障体系，有效提升了实验设备的使用寿命和教学质量，确保了实验教学工作的顺利开展与持续发展。
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
</style>
