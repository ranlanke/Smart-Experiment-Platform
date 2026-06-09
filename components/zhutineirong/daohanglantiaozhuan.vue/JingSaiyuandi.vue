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
    <h1 class="main-title">竞赛园地介绍</h1>
    <div class="main-content">
      <p class="indent">
        为激发学生的科技创新热情，提升工程实践能力，浙江理工大学信息电子省级实验教学示范中心高度重视学科竞赛的组织与管理。依托实验教学平台，教师指导团队与实践教学资源，积极构建"课内外联动、赛教研融合"的育人机制，不断完善学科竞赛体系，营造良好的创新创业氛围。
      </p>
      <h2>精心组织，多维覆盖</h2>
      <p class="indent">
        中心围绕信息电子类专业特色，长期组织学生参加各级各类学科竞赛活动，涵盖电子设计、程序设计、服务外包、数字媒体、网络安全、互联网+、挑战杯、新苗人才计划、国创项目等多个领域，形成"基础普及及"重点突破高培提升""的多层次竞赛育人格局。
      </p>
      <p class="indent">
        依托本科生导师制、课外学科科技活动组织、专家讲座与经验分享机制，中心不断增强学生科技竞赛参与的广度与深度，推动从参与走向成果、从训练走向转化。
      </p>
      <h2>成果丰硕，成效显著</h2>
      <p class="indent">自2018年以来，中心师生在学科竞赛方面取得了丰硕成果：</p>
      <p class="indent">新苗人才计划立项 11项</p>
      <p class="indent">国家级大学生创新创业训练计划（国创）立项 20项</p>
      <p class="indent">"挑战杯"课外学科科技作品竞赛立项 5项</p>
      <p class="indent">"互联网+"大学生创新创业大赛获奖 3项</p>
      <p class="indent">ACM 国际大学生程序设计竞赛（ICPC/CCPC）获奖 251项</p>
      <p class="indent">大学生服务外包大赛获奖 74项</p>
      <p class="indent">全国大学生电子设计竞赛获奖 77项</p>
      <p class="indent">数字媒体竞赛获奖 147项</p>
      <p class="indent">网络安全竞赛获奖 20项</p>
      <p class="indent">
        此外，学生累计发表本科论文 50篇，登记获著与专利共计
        196项。通过竞赛实践，有效促进了学生综合素质的提升，显著增强了工程创新与协作能力。
      </p>
      <h2>平台支持，全面保障</h2>
      <p class="indent">
        中心依托设计与创新实验室、电子系统实验室、网络安全实验室等重点实践平台，为学生竞赛训练提供良好场地、设备与技术支持。教师团队通过专题指导、模拟训练、项目孵化等多种方式，帮助学生从0到1完成科研选题、方案设计、调试实现、成果展示全过程。
      </p>
      <p class="indent">
        同时，学校设立专项经费支持竞赛训练，形成了机制健全、保障有力、效果突出的竞赛支持体系。
      </p>
      <h2>培养导向，持续深化</h2>
      <p class="indent">
        中心始终将学科竞赛视为提升学生专业素养与创新能力的重要抓手，坚持"以赛促学、以赛促教、以赛促创"的工作理念，不断拓展竞赛平台，优化培养路径，力求在人才培养中发挥更大价值。未来，中心将继续深化产教融合、校企合作，强化学生创新创业意识，努力打造竞赛成果与育人成效双提升的育人高地。
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
