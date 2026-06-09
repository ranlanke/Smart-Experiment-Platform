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
    <h1 class="main-title">教学成果报告</h1>
    <div class="main-content">
      <p class="indent">
        近年来，信息电子实验教学示范中心坚持"以学生为本、能力导向、创新驱动"的人才培养理念，持续深化实验教学改革，全面提升学生素养与动手实践，构建起"三维立体式"实验教学体系。依托"电工电子基础"专业能力提升和拓展—工程综合创新"三级实践平台，中心在课程建设、学生竞赛、成果转化等方面取得了一系列标志性教学成果。
      </p>
      <h2>一、成果概述</h2>
      <p class="indent">
        近年来，信息电子实验教学示范中心坚持"以学生为本、能力导向、创新驱动"的人才培养理念，持续深化实验教学改革，全面提升学生素养与动手实践，构建起"三维立体式"实验教学体系。依托"电工电子基础"专业能力提升和拓展—工程综合创新"三级实践平台，中心在课程建设、学生竞赛、成果转化等方面取得了一系列标志性教学成果。
      </p>
      <h2>二、课程建设成效</h2>
      <b>1. 打造精品实验课程体系</b>
      <p class="indent">构建通道基础验证型、综合设计型、研究创新型的分层次课程结构；</p>
      <p class="indent">
        《信息电子综合实验实践课程》被认定为校级重点精品课程，已进入省级一流课程培育计划；
      </p>
      <p class="indent">
        课程建设实现100%标准化、信息化，支持学生通过线上平台的均设备、提交报告、获取反馈。
      </p>
      <b>2. 完善教学资源配套建设</b>
      <p class="indent">编制和完善实验教学大纲、实验指导手册，安全操作规程等教学文档；</p>
      <p class="indent">
        自主开发实验数据管理信息平台，实现教学任务分发、成绩考评、设备预约等功能一体化。
      </p>
      <h2>三、竞赛与创新成果</h2>
      <b>1. 学生科技竞赛成果显著</b>
      <p class="indent">
        2018年以来共获省部级竞赛立项11项、国创立项20项、挑战杯立项5项、互联网+获奖3项、ACM竞赛251项、服务外包竞赛74项，大学生电子设计竞赛获奖77项、数学竞赛获奖147项、网络竞赛获奖20项。
      </p>
      <b>2. 创新创业项目成果丰硕</b>
      <p class="indent">立项省新苗人才计划11项，国家级大学生创新创业训练计划项目20项；</p>
      <p class="indent">学生团队发表科技论文50篇，获软件著作权及专利196项。</p>
      <h2>四、人才培养质量提升</h2>
      <p class="indent">
        毕业生受知名企业如华为、中兴、海康威视、阿里达摩院等欢迎，部分学生考入复旦大学、浙大、中科院等知名高校和科研院所攻读硕士博士学位；
      </p>
      <p class="indent">
        中心通过项目驱动多素质激励机制，全面提高学生综合素质、工程实践能力与团队协作能力；
      </p>
      <p class="indent">
        建立"教师-本科生-研究生"三层科研育人梯队，增强本科生参与科研与工程设计的能力。
      </p>
      <h2>五、教学管理与服务创新</h2>
      <p class="indent">
        实行全天候实验平台开放机制，推行实验教学考核改革，试行过程性考核和创新能力评价，激励学生高质量训练；
      </p>
      <p class="indent">完成对专业实验室的功能优化与软硬件升级，实验资源开放共享。</p>
      <h2>六、社会服务与辐射示范</h2>
      <p class="indent">承接省市师资培训项目，5站集训共计，九届实验竞赛共13个核心实验基地；</p>
      <p class="indent">
        接待省内外高校师资团队参观学习，为省内外兄弟高校的实验室的共性培训超过1000人次以上；
      </p>
      <p class="indent">
        多次承办全国软件仿真与编程大赛、浙江智能芯片化创新发展研讨会、浙江人工智能与医学影像前沿技术和运营高研平台，发挥示范引领作用。
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
  /* background: #fff; */
  /* border-radius: 8px; */
  /* box-shadow: 0 2px 8px rgba(0,0,0,0.06); */
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
