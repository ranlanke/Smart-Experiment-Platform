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
  <div class="idea-container">
    <h1 class="idea-title">教学理念</h1>
    <div class="idea-content">
      <p>
        浙江理工大学信息电子实验教学中心坚持以"培养应用型创新人才"为根本目标，围绕"以人为本、知行合一、协同发展、持续创新"的四大理念，整合多层次、结构多样化、无界化、开放性的实验教学体系。
      </p>
      <h3>一、以人为本，关注个体成长</h3>
      <p>
        <b>基本理念：</b
        >针对学生的知识基础与学习和实践需要，提供分层、差异化的实验任务设计，营造自主学习与成长环境。
      </p>
      <p>
        <b>实施方式：</b
        >注重学生个体差异，分层分步考核，考查实际操作与创新能力，激发学生的主动性。鼓励学生自行开发和改进实验装置。
      </p>
      <p>
        <b>多方协同：</b
        >建立学生实验过程的过程性观测机制，推进任课教师、指导老师及双导师双不定、递进学习策略。
      </p>
      <h3>二、知行合一，强化能力培养</h3>
      <p><b>基本理念：</b>在理论实验中，让学生深入理解电路原理，有方案、编程调试等基本知识。</p>
      <p><b>实施方式：</b>设置课程设计、开放性实验、创新实验等多样化实验内容，提升学生综合能力。</p>
      <p>
        <b>创新实践：</b
        >在研究型实验中，鼓励学生创新和面向前沿，开展自主选题创新研究，提升科研能力与工程素养。
      </p>
      <h3>三、协同发展，融通校企资源</h3>
      <p>
        <b>基本理念：</b
        >专业领域企业共建实验项目，鼓励企业工程师参与课程指导与实验指导，让学生体验真实生产环境和流程。
      </p>
      <p>
        <b>实施方式：</b
        >校企联合开发实验装置，整合多学科资源，形成由理论—实践—研究一贯式实验教学的完整体系。
      </p>
      <p>
        <b>多方协同：</b
        >构建教师—学生—企业—社会的协同育人机制，多渠道获取反馈，不断完善实验教学内容与方法。
      </p>
      <h3>四、持续创新，迭代优化体系</h3>
      <p>
        <b>基本理念：</b
        >定期引入新型技术（如人工智能与嵌入式物联网应用），升级实验项目与教学案例，保持教学内容行业发展前沿。
      </p>
      <p>
        <b>实施方式：</b
        >将科研和教学科研成果转化为实验室与项目，加强学研结合，实现课题与前沿研究的衔接与交互。
      </p>
      <p>
        <b>多方协同：</b
        >鼓励学生参与课题研究，完善实验室管理机制及企业反馈，形成持续优化的实验教学体系。
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
.idea-container {
  max-width: 900px;
  margin: 40px auto;
  padding: 32px 32px 24px 32px;
  box-sizing: border-box;
}
.idea-title {
  font-size: 32px;
  font-weight: bold;
  color: #222;
  text-align: center;
  margin-bottom: 30px;
}
.idea-content {
  font-size: 16px;
  color: #333;
  line-height: 2;
  text-align: left;
}
.idea-content p {
  text-indent: 2em;
  margin: 10px 0;
}
.idea-content h3 {
  font-size: 20px;
  color: #1e73be;
  font-weight: bold;
  margin: 24px 0 10px 0;
  text-indent: 0;
}
</style>
