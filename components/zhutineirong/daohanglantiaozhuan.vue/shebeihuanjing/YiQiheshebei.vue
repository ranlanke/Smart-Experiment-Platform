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
    <h1 class="main-title">仪器设备</h1>
    <div class="main-content">
      <p class="indent">
        浙江理工大学信息电子实验教学中心自2010年由浙江省教育厅批准立项建设以来，始终坚持"以教学为核心、以服务为导向、以创新为驱动"的理念，持续完善实验教学硬件条件，优化仪器设备结构。目前实验中心总面积4300余平方米，设备总价值约1800万元。下设7个功能实验（实训）室，支撑信息、电子类多门核心课程与跨学科教学实践。
      </p>
      <h2>一、基础实验设备配备齐全</h2>
      <p class="indent">
        中心高度重视本科实验教学支撑能力的提升，针对电路基础、电子技术、嵌入式系统、通信原理、软件编程等课程模块配备了大量标准化实验设备，包括但不限于：
      </p>
      <p class="indent">数字万用表、直流稳压电源、信号发生器、函数信号源、电源箱等基础测试仪器；</p>
      <p class="indent">双路数字存储示波器、模拟数字电路实训平台、电路板焊接与调试工作站；</p>
      <p class="indent">
        单片机开发系统、嵌入式综合实验箱、FPGA/EDA实验平台、C语言虚拟实验计算开发环境；
      </p>
      <p class="indent">通信原理实验装置、网络安全攻防演练平台、图像/音频处理实验终端。</p>
      <p class="indent">
        各实验室按教学需求进行科学配置，典型如电子技术实验室与微机原理实验室可支持多个班级同时开展实验，设备数量和性能满足课程全覆盖的实验教学要求。
      </p>
      <h2>二、专业特色设备建设突出</h2>
      <p class="indent">
        在通信、网络安全与数字媒体技术方向，中心依托通信工程实验室、网络安全实验室、数字媒体技术实验室，建设了一批特色应用平台：网络架构模拟平台与虚拟攻击防御系统，支持入侵检测、数据加密解密与基础安全协议实验；音视频编解码与压缩编解码平台、多模态交互设计实验端、数字通信系统实验设备，支持射频/AM调制解调、调制解调分析等基础通信的创新型实训场景。
      </p>
      <p class="indent">
        这些设备广泛应用于教学、竞赛与课外项目指导，为拓展学生专业实践能力提供坚实支撑。
      </p>
      <h2>三、创新实验平台助力自主探索</h2>
      <p class="indent">
        信息电子实验教学中心配置整套设计与创新实验室，作为一个全天候开放的学生创新平台，鼓励学生在课外进行项目开发、作品制作和竞赛准备。该实验室配备有：
      </p>
      <p class="indent">
        工具仪器台、原型组装试区、模块化调试工位；多种传感器、通信模块器资源包，支持多语音开发的计算平台与开放式空间。
      </p>
      <p class="indent">
        该实验室面向本科生推行长期开放管理机制，年均支持数十项大学生科技创新项目立项与成果孵化，是推动综合设计能力与工程实践能力培养的重要平台。
      </p>
      <h2>四、设备管理规范、资源利用率高</h2>
      <p class="indent">
        实验中心建立了完善的设备采购、运行、维护与更新制度。设备由中心统一管理与调配，按课程安排统筹使用，确保实验任务有序高效完成，充分发挥了中心实验资源的综合效益。
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
