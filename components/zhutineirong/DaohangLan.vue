<script setup>
function openSmartLab() {
  window.open('/login', '_blank')
}
</script>

<template>
  <div class="nav-container">
    <!-- 导航栏 -->
    <div class="nav">
      <div class="con">
        <ul class="nav-list">
          <li class="nav-item">
            <router-link to="/" class="nav-link">首 页</router-link>
          </li>
          <li class="nav-item dropdown">
            <a href="#" class="nav-link dropdown-toggle">中心概况</a>
            <ul class="dropdown-menu">
              <li>
                <router-link to="/zhongxin-gaikuang" class="dropdown-item">中心概况</router-link>
              </li>
              <li>
                <router-link to="/shiziduiwu" class="dropdown-item">师资队伍</router-link>
              </li>
              <li>
                <router-link to="/zhongxinshiping" class="dropdown-item">中心视频</router-link>
              </li>
              <li>
                <router-link to="/jiaoxuelinian" class="dropdown-item">教学理念</router-link>
              </li>
            </ul>
          </li>
          <li class="nav-item dropdown">
            <a href="#" class="nav-link dropdown-toggle">体制管理</a>
            <ul class="dropdown-menu">
              <li>
                <router-link to="/guizhangzhidu" class="dropdown-item">规章制度</router-link>
              </li>
              <li>
                <router-link to="/guanlitizhi" class="dropdown-item">管理体制</router-link>
              </li>
              <li>
                <router-link to="/yunxingjizhi" class="dropdown-item">运行机制</router-link>
              </li>
            </ul>
          </li>
          <li class="nav-item dropdown">
            <a href="#" class="nav-link dropdown-toggle">实验教学</a>
            <ul class="dropdown-menu">
              <li><a href="#" class="dropdown-item">教学体系</a></li>
              <li><a href="#" class="dropdown-item">课程设置</a></li>
              <li><a href="#" class="dropdown-item">课程大纲</a></li>
              <li><a href="#" class="dropdown-item">精品课程</a></li>
            </ul>
          </li>
          <li class="nav-item dropdown">
            <a href="#" class="nav-link dropdown-toggle">教学资源</a>
            <ul class="dropdown-menu">
              <li><a href="#" class="dropdown-item">课程教材</a></li>
              <li><a href="#" class="dropdown-item">课程视频</a></li>
              <li><a href="#" class="dropdown-item">仪器介绍</a></li>
              <li><a href="#" class="dropdown-item">器件手册</a></li>
              <li><a href="#" class="dropdown-item">教学软件</a></li>
            </ul>
          </li>
          <li class="nav-item dropdown">
            <router-link to="/jiaoxuechengguo" class="nav-link">教学成果</router-link>
          </li>
          <li class="nav-item dropdown">
            <a href="#" class="nav-link dropdown-toggle">设备环境</a>
            <ul class="dropdown-menu">
              <li>
                <router-link to="/shiyanhuanjing" class="dropdown-item">实验环境</router-link>
              </li>
              <li>
                <router-link to="/weihuheyunxing" class="dropdown-item">维护和运行</router-link>
              </li>
              <li><router-link to="/yiqiheshebei" class="dropdown-item">仪器设备</router-link></li>
            </ul>
          </li>
          <li class="nav-item dropdown">
            <router-link to="/jingsaiyuandi" class="nav-link">竞赛园地</router-link>
          </li>
          <li class="nav-item dropdown">
            <router-link to="/shifanfushe" class="nav-link">示范辐射</router-link>
          </li>
          <!-- <li class="nav-item dropdown">
            <a href="#" class="nav-link dropdown-toggle">下载专区</a>
          </li> -->
          <li class="nav-item dropdown">
            <a href="#" class="nav-link dropdown-toggle">智慧系统</a>
            <ul class="dropdown-menu">
              <li>
                <a href="javascript:void(0)" class="dropdown-item" @click="openSmartLab"
                  >智慧实验系统</a
                >
              </li>
              <li><a href="#" class="dropdown-item">仪器借用系统</a></li>
            </ul>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* 导航栏 */
.nav-container {
  width: 100%;
}

.nav {
  display: flex;
  justify-content: center;
  width: 100%;
  background-color: #065bb2; /* 调整背景颜色 */
  padding: 10px 0;
  border-bottom: 1px solid #d0d0d0; /* 添加底部边框 */
}

.con {
  width: 80%;
  margin: 0 auto;
}

.nav-list {
  display: flex;
  list-style: none;
  margin: 0;
  padding: 0;
  text-align: center;
  justify-content: center; /* 水平居中对齐 */
}

.nav-item {
  margin: 0 15px;
  position: relative; /* 为子菜单定位 */
}

.nav-link {
  display: block;
  color: #fff; /* 调整字体颜色 */
  text-decoration: none;
  font-size: 15px; /* 调整字体大小 */
  font-family: 'Microsoft YaHei', sans-serif; /* 调整字体样式 */
  padding: 8px 0;
  transition: all 0.3s ease;
}

.nav-link:hover {
  color: #1e73be; /* 鼠标悬停时的字体颜色 */
  background-color: white; /* 鼠标悬停时背景变白 */
}

.nav-link.active {
  color: #1e73be; /* 当前活动页面的字体颜色 */
  font-weight: bold;
}

/* 子菜单样式 */
.dropdown-menu {
  display: none;
  position: absolute;
  background-color: rgba(255, 255, 255, 0.9); /* 半透明背景 */
  backdrop-filter: blur(5px); /* 毛玻璃效果增强 */
  box-shadow: 0 8px 16px 0 rgba(0, 0, 0, 0.2);
  z-index: 1;
  padding: 10px 15px;
  border-radius: 4px;
  left: 50%; /* 水平居中 */
  transform: translateX(-50%); /* 居中修正 */
  display: none;
  flex-direction: row; /* 横向排列 */
  flex-wrap: wrap; /* 允许换行 */
  min-width: 300px; /* 最小宽度 */
  gap: 10px; /* 间距 */
}

.dropdown-menu li {
  list-style: none;
  margin: 0;
  padding: 0;
  white-space: nowrap; /* 防止文字换行 */
}

.dropdown-menu a {
  color: #333;
  padding: 8px 12px;
  display: block;
  text-decoration: none;
  transition: all 0.2s;
  border-radius: 3px;
}
/* 调整hover效果 */
.dropdown-menu a:hover {
  background-color: rgba(6, 91, 178, 0.1); /* 半透明蓝色背景 */
  transform: translateY(-2px);
}

/* 调整下拉菜单出现位置 */
.dropdown:hover .dropdown-menu {
  display: flex;
  top: 100%; /* 出现在导航项下方 */
}
/* 调整导航项间距 */
.nav-item {
  margin: 0 20px;
}
</style>
```
