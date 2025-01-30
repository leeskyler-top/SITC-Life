<script setup>
import {
  CalendarOutlined,
  DashboardOutlined,
  ToolOutlined,
  UserOutlined,
  CarryOutOutlined,
  DownOutlined,
  AlertOutlined,
  ScheduleOutlined,
  BankOutlined,
  CloudServerOutlined,
  PieChartOutlined
} from '@ant-design/icons-vue';
import {message, legacyLogicalPropertiesTransformer} from "ant-design-vue";
import {ref, computed, reactive, watch, onMounted} from 'vue';
import api from './api.js';
import router from "@/router";
import axios from "axios";

// 初始化时间戳
const ACCESS_TOKEN_TIMESTAMP_KEY = "access_token_timestamp";
const REFRESH_TOKEN_TIMESTAMP_KEY = "refresh_token_timestamp";

// 获取时间戳
const getTimestamp = (key) => {
  return parseInt(localStorage.getItem(key)) || 0;
};

// 设置时间戳
const setTimestamp = (key, timestamp) => {
  localStorage.setItem(key, timestamp);
};

// 计算时间差（分钟）
const getTimeDifferenceInMinutes = (timestamp) => {
  const currentTime = Date.now();
  return (currentTime - timestamp) / (1000 * 60); // 以分钟为单位
};


const isShow = ref(true);

function handleResize(event) {
  // 页面宽度小于525px时，不显示表格
  if (document.documentElement.clientWidth < 525) {
    isShow.value = false;
  } else {
    isShow.value = true;
  }
}

window.addEventListener('resize', handleResize);

const formState = reactive({
  studentId: null,
  password: null
});

const disabled = computed(() => {
  return !(formState.studentId && formState.password);
});

const collapsed = ref(true);
const selectedKeys = ref(['1']);
const access_token = ref(localStorage.access_token);
const refresh_token = ref(localStorage.refresh_token);
let latestToken = access_token.value; // 中间变量存储最新的token值
const is_admin = ref(localStorage.is_admin);
const user_position = ref(localStorage.user_position);

onMounted(() => {
  handleResize();
  getCurrentYear();
})

const refreshToken = () => {
  api.post("/auth/refresh", null, {
        headers: {
          Authorization: `Bearer ${refresh_token.value}`
        }
      }
  ).then((res) => {
    let {data, msg} = res.data
    localStorage.access_token = data.access_token
    access_token.value = data.access_token
    latestToken = data.access_token
    setTimestamp(ACCESS_TOKEN_TIMESTAMP_KEY, Date.now());
    api.defaults.headers['Authorization'] = `Bearer ${latestToken}`;
  }).catch((err) => {
    let {msg} = err.response.data
    message.error(msg)
    if (msg === "Token has expired") {
      router.go('/');
      message.warn("登录超时，请重新登录")
      localStorage.clear();
      refresh_token.value = null;
      access_token.value = null;
      name.value = null;
      is_admin.value = null;
    }
  })
}

// 检查并执行 token 刷新
const checkTokenExpiration = async (config) => {
  const accessTokenTimestamp = getTimestamp(ACCESS_TOKEN_TIMESTAMP_KEY);
  const refreshTokenTimestamp = getTimestamp(REFRESH_TOKEN_TIMESTAMP_KEY);

  // 检查refresh_token是否超过29.5分钟未更新
  if (getTimeDifferenceInMinutes(refreshTokenTimestamp) > 29.5) {
    message.warn("refresh_token已过期，请重新登录");
    logout();
    localStorage.clear(); // 清除存储
    return Promise.reject(new Error('refresh_token expired'));
  }

  // 检查access_token是否过期 2.5分钟
  if (getTimeDifferenceInMinutes(accessTokenTimestamp) > 2.5 && !config.url.includes("/auth/refresh")) {
    await refreshToken(); // 刷新token
  }

};

// 每次请求之前检查token
api.interceptors.request.use(async (config) => {
  if (!config.url.includes("/auth/login")) {
    await checkTokenExpiration(config); // 每次请求前检查token是否过期
    const latestToken = localStorage.getItem('access_token');
    if (!config.url.includes("/auth/refresh")) {
      config.headers['Authorization'] = `Bearer ${latestToken}`;
    }
  }
  return config
}, (error) => {
  return Promise.reject(error);
});

api.interceptors.response.use(
    (response) => response, // 成功响应直接返回
    async (error) => {
      const originalRequest = error.config;
      const {response} = error;

      if (response.status === 401 && response.data.msg === "Token has expired" && !originalRequest._retry) {
        originalRequest._retry = true; // 标记避免死循环
        // await refreshToken(); // 更新 Token
        originalRequest.headers.Authorization = `Bearer ${latestToken}`; // 更新请求头
        return api(originalRequest); // 重试请求
      }

      // 处理其他错误
      switch (response.status) {
        case 413:
          message.error("上传数据不得大于10M");
          break;
        case 429:
          message.error("请求过于频繁");
          break;
        case 500:
          message.error("服务器内部出错");
          break;
        case 502:
          message.error("网关出错");
          break;
        default:
          break;
      }
      return Promise.reject(error);
    }
);

watch(access_token, (newToken) => {
  // 直接在 request 中使用最新的 token
  latestToken = newToken; // 更新最新的token值
  api.defaults.headers['Authorization'] = `Bearer ${newToken}`;
});

// 在发送请求前应用最新的token值
api.interceptors.request.use((config) => {
  // 如果请求的 URL 是 /auth/refresh 则不覆盖 Authorization header
  if (!config.url.includes("/auth/refresh")) {
    config.headers.Authorization = `Bearer ${latestToken}`; // 非刷新令牌的请求，使用最新的 access_token
  }
  return config;
});

const name = ref(localStorage.name);

const signin = ref(false);
const login = () => {
  signin.value = true;
  api.post("/auth/login", formState).then((res) => {
    setTimestamp(REFRESH_TOKEN_TIMESTAMP_KEY, Date.now());
    setTimestamp(ACCESS_TOKEN_TIMESTAMP_KEY, Date.now());
    signin.value = false;
    formState.studentId = null;
    formState.password = null;
    let {data, msg} = res.data;
    access_token.value = data.access_token;
    refresh_token.value = data.refresh_token;
    name.value = data.user.name;
    is_admin.value = data.user.is_admin;
    user_position.value = data.user.position;
    localStorage.access_token = data.access_token;
    localStorage.refresh_token = data.refresh_token;
    localStorage.name = data.user.name;
    localStorage.is_admin = data.user.is_admin;
    localStorage.user_position = data.user.position;
    message.success(msg);
  }).catch((err) => {
    let {msg} = err.response.data;
    signin.value = false;
    message.error(msg);
  });
}

const logout = () => {
  router.push("/");
  localStorage.clear();
  refresh_token.value = null;
  access_token.value = null;
  name.value = null;
  is_admin.value = null;
  user_position.value = null;
  message.success("注销完成");
}

const logoLoading = ref('none')
const stopLoadingLogo = () => {
  logoLoading.value = 'block';
}

const year = ref(1971);

const getCurrentYear = () => {
  let date = new Date();
  date = date.getFullYear();
  year.value = date
}

</script>
<template>
  <a-style-provider hash-priority="high" :transformers="[legacyLogicalPropertiesTransformer]">
    <div v-if="!refresh_token" class="login">
      <a-form
          :model="formState"
          name="basic"
          :label-col="{ span: 8 }"
          :wrapper-col="{ span: 16 }"
          autocomplete="off"
          @submit="login"
          style="background-color: #FFFFFF;     z-index: 1;
             padding: 24px; box-sizing: border-box; display: flex; flex-direction: column; border-radius: 3px; box-shadow: #FFFFFF 0 0 1px 1px;
"

      >
        <h2 align="center">欢迎登录</h2>
        <p align="center">SITC 团委学生会 生活部</p>
        <a-form-item
            label="账户"
            name="studentId"
            :rules="[{ required: true, message: '请输入账户!' }]"
            style="margin-top: 16px;"
        >
          <a-input v-model:value="formState.studentId"/>
        </a-form-item>

        <a-form-item
            label="密码"
            name="password"
            :rules="[{ required: true, message: '请输入密码!' }]"
        >
          <a-input-password v-model:value="formState.password"/>
        </a-form-item>
        <div style="display: flex; align-items: center; justify-content: center; margin-top: 16px;">
          <a-form-item>
            <a-button type="primary" html-type="submit" :loading="signin"
                      :disabled="!formState.studentId || !formState.password">登录
            </a-button>
          </a-form-item>
        </div>

      </a-form>
      <footer id="login-footer">
        <div>
          <a href="https://beian.miit.gov.cn" style="text-decoration: none; color: rgba(255,255,255,0.7); font-size: 15px;">
            沪ICP备2023001976号-1
          </a>
        </div>
      </footer>
    </div>
    <div v-if="refresh_token" style="height: 100%;">
      <a-layout style="min-height: 100vh">
        <a-layout-sider v-model:collapsed="collapsed" collapsible v-if="isShow">
          <div class="logo"
               :style="{height: '64px',display: 'flex', alignItems: 'center', justifyContent: 'center'}">
            <img src="./assets/imgs/logo.jpg" @load="stopLoadingLogo" :style="{ display: logoLoading }"
                 height="60" width="60"
                 style="border-radius: 50%; background-color: #FFFFFF"/>
            <a-spin :spinning="logoLoading === 'none'"></a-spin>

          </div>
          <a-menu v-model:selectedKeys="selectedKeys" theme="dark" mode="inline">
            <a-menu-item key="1" @click.prevent="$router.push('/')">
              <dashboard-outlined/>
              <span>工作台</span>
            </a-menu-item>
            <a-menu-item key="cloud" @click.prevent="$router.push('/cloud/manager')">
              <CloudServerOutlined/>
              <span>网盘管理</span>
            </a-menu-item>
            <a-menu-item key="semester" @click.prevent="$router.push('/semester/manager')">
              <carry-out-outlined/>
              <span>学期配置</span>
            </a-menu-item>
            <a-sub-menu key="room">
              <template #title>
                <BankOutlined/>
                <span>房间配置</span>
              </template>
              <a-menu-item key="template-list">
                <RouterLink to="/template/manager">模板管理</RouterLink>
              </a-menu-item>
              <a-menu-item key="template-upload" v-if="is_admin === 'true'">
                <RouterLink to="/template/batch">模板上传</RouterLink>
              </a-menu-item>
            </a-sub-menu>
            <a-sub-menu key="checkIn">
              <template #title>
                <ScheduleOutlined/>
                <span>签到</span>
              </template>
              <a-menu-item key="17">
                <RouterLink to="/checkin/list">签到</RouterLink>
              </a-menu-item>
              <a-menu-item key="18" v-if="is_admin === 'true'">
                <RouterLink to="/checkin/manager">签到管理</RouterLink>
              </a-menu-item>
            </a-sub-menu>
            <a-sub-menu key="user">
              <template #title>
                          <span>
                            <user-outlined/>
                            <span>用户</span>
                          </span>
              </template>
              <a-menu-item key="3">
                <RouterLink to="/user/detail">用户资料</RouterLink>
              </a-menu-item>
              <div v-if="is_admin === 'true'">
                <a-menu-item key="4">
                  <router-link to="/user/manager">用户管理</router-link>
                </a-menu-item>
                <a-menu-item key="5">
                  <router-link to="/user/add">用户添加</router-link>
                </a-menu-item>
                <a-menu-item key="6">
                  <router-link to="/user/batch">批量添加</router-link>
                </a-menu-item>
              </div>

            </a-sub-menu>
            <a-menu-item key="security-history" v-if="is_admin === 'true'"
                         @click.prevent="$router.push('/security/history')">
              <alert-outlined/>
              <span>安全审计记录</span>
            </a-menu-item>
            <a-menu-item key="data-analyzer"
                         v-if="['部长', '副部长', '部门负责人'].includes(user_position) || is_admin === 'true'"
                         @click.prevent="$router.push('/analyzer/view')">
              <PieChartOutlined/>
              <span>数据统计</span>
            </a-menu-item>
          </a-menu>
        </a-layout-sider>
        <a-layout>
          <a-layout-header style="background: #fff; padding: 0">
            <div class="header-bar">
              <div class="welcome-display" style="margin-left: 28px;">
                <span>SITC 团委学生会生活部-管理系统</span>
              </div>
              <div style="margin-left: 24px; margin-right: 28px;">
                <span style="margin-right: 8px;">你好！{{ name }}</span>
                <span @click="logout"><a>登出</a></span>
              </div>
              <div style="margin-right: 28px;" v-if="!isShow">
                <a-dropdown>
                  <a class="ant-dropdown-link" @click.prevent>
                    菜单
                    <DownOutlined/>
                  </a>
                  <template #overlay>
                    <a-menu v-model:selectedKeys="selectedKeys" theme="dark" mode="inline">
                      <a-menu-item key="home" @click.prevent="$router.push('/')">
                        <dashboard-outlined/>
                        <span>工作台</span>
                      </a-menu-item>
                      <a-menu-item key="cloud" @click.prevent="$router.push('/cloud/manager')">
                        <CloudServerOutlined/>
                        <span>网盘管理</span>
                      </a-menu-item>
                      <a-menu-item key="semester" @click.prevent="$router.push('/semester/manager')">
                        <carry-out-outlined/>
                        <span>学期配置</span>
                      </a-menu-item>
                      <a-sub-menu key="room">
                        <template #title>
                          <BankOutlined/>
                          <span>房间配置</span>
                        </template>
                        <a-menu-item key="template-list">
                          <RouterLink to="/template/manager">模板管理</RouterLink>
                        </a-menu-item>
                        <a-menu-item key="template-upload" v-if="is_admin === 'true'">
                          <RouterLink to="/template/batch">模板上传</RouterLink>
                        </a-menu-item>
                      </a-sub-menu>
                      <a-sub-menu key="checkIn">
                        <template #title>
                          <ScheduleOutlined/>
                          <span>签到</span>
                        </template>
                        <a-menu-item key="17">
                          <RouterLink to="/checkin/list">签到</RouterLink>
                        </a-menu-item>
                        <a-menu-item key="18" v-if="is_admin === 'true'">
                          <RouterLink to="/checkin/manager">签到管理</RouterLink>
                        </a-menu-item>
                      </a-sub-menu>
                      <a-sub-menu key="user">
                        <template #title>
                                          <span>
                                            <user-outlined/>
                                            <span>用户</span>
                                          </span>
                        </template>
                        <a-menu-item key="3">
                          <RouterLink to="/user/detail">用户资料</RouterLink>
                        </a-menu-item>
                        <div v-if="is_admin === 'true'">
                          <a-menu-item key="4">
                            <router-link to="/user/manager">用户管理</router-link>
                          </a-menu-item>
                          <a-menu-item key="5">
                            <router-link to="/user/add">用户添加</router-link>
                          </a-menu-item>
                          <a-menu-item key="6">
                            <router-link to="/user/batch">批量添加</router-link>
                          </a-menu-item>
                        </div>

                      </a-sub-menu>
                      <a-menu-item key="security-history" v-if="is_admin === 'true'"
                                   @click.prevent="$router.push('/security/history')">
                        <alert-outlined/>
                        <span>安全历史</span>
                      </a-menu-item>
                      <a-menu-item key="data-analyzer"
                                   v-if="['部长', '副部长', '部门负责人'].includes(user_position) || is_admin === 'true'"
                                   @click.prevent="$router.push('/analyzer/view')">
                        <PieChartOutlined/>
                        <span>数据统计</span>
                      </a-menu-item>
                    </a-menu>
                  </template>
                </a-dropdown>

              </div>
            </div>
          </a-layout-header>
          <a-layout-content style="margin: 0 16px">
            <RouterView></RouterView>
          </a-layout-content>
          <a-layout-footer style="text-align: center">
            <div>上海信息技术学校团委学生会生活部 &copy; {{ year }}</div>
            <div style="margin-top: 4px;">
              <a href="https://beian.miit.gov.cn" style="text-decoration: none; color: black">
                沪ICP备2023001976号-1
              </a>
              |
              <a
                  href="https://github.com/leeskyler-top/SITC-Life-Driver"
                  style="text-decoration: none; color: black">Github 仓库
              </a>
            </div>
          </a-layout-footer>
        </a-layout>
      </a-layout>
    </div>
  </a-style-provider>

</template>

<style>

#login-footer {
  background: rgba(0, 0, 0, 0.3);
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
}

#components-layout-demo-side .logo {
  height: 32px;
  margin: 16px;
  background: rgba(255, 255, 255, 0.3);
}

.site-layout .site-layout-background {
  background: #fff;
}

[data-theme='dark'] .site-layout .site-layout-background {
  background: #141414;
}

.header-bar {
  display: flex;
  justify-content: space-between;
}

@media screen and (max-width: 525px) {
  .welcome-display {
    display: none;
  }
}

.login {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.login:before {
  content: "";
  width: 100%;
  height: 100%;
  position: fixed;
  top: 0;
  left: 0;
  background-image: url("@/assets/imgs/Login_container_bg.jpg");
  background-size: cover;
  background-repeat: no-repeat;
  background-position: center;
  filter: blur(8px);
}

</style>