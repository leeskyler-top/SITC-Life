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
import {theme, message, legacyLogicalPropertiesTransformer} from "ant-design-vue";
import {ref, computed, reactive, watch, onMounted, onUnmounted} from 'vue';
import api from './api.js';
import router from "@/router";
import {jwtDecode} from 'jwt-decode';

import forge from 'node-forge';
import * as aesjs from 'aes-js';

const aesKey = ref(localStorage.aes_key ? base64ToBytes(localStorage.aes_key) : null);

function updateAESKeyFromLocalStorage() {
  const key = localStorage.aes_key;
  aesKey.value = key ? base64ToBytes(key) : null;
}

function formatPEM(pem) {
  // 去除多余空格与行首尾
  pem = pem.trim();
  // 如果是一整行，把它分块
  if (!pem.includes('\n')) {
    const lines = [];
    lines.push("-----BEGIN PUBLIC KEY-----");
    for (let i = 0; i < pem.length; i += 64) {
      lines.push(pem.slice(i, i + 64));
    }
    lines.push("-----END PUBLIC KEY-----");
    return lines.join('\n');
  }

  return pem;
}

// 登录后生成 AES 密钥，并使用 RSA 公钥加密
function generateAndStoreAESKey(publicKeyPem) {
  // 1. 生成原始 AES 密钥（Uint8Array）
  const aesKeyBytes = window.crypto.getRandomValues(new Uint8Array(32));

  // 2. 保存为原始字节的 Base64（仅供前端 AES 解密用，不给后端）
  localStorage.aes_key = btoa(String.fromCharCode(...aesKeyBytes));

  // 3. 将 Uint8Array 转为 binary string（node-forge 要求）
  const aesKeyBinaryString = String.fromCharCode(...aesKeyBytes);

  // 4. 加载公钥（确保格式正确）
  const publicKey = forge.pki.publicKeyFromPem(formatPEM(publicKeyPem));

  // 5. 使用 RSA-OAEP 加密原始 AES 密钥（不要转 Base64）
  const encrypted = publicKey.encrypt(aesKeyBinaryString, 'RSA-OAEP', {
    md: forge.md.sha256.create(),
    mgf1: forge.mgf1.create()
  });

  // 6. 返回 Base64 编码（传给后端）
  const encryptedBase64 = forge.util.encode64(encrypted);
  localStorage.encrypted_aes_key = encryptedBase64;

  return encryptedBase64;
}

function bytesToBase64(bytes) {
  return btoa(String.fromCharCode(...bytes));
}

function base64ToBytes(base64) {
  const binary = atob(base64);
  return Uint8Array.from(binary, c => c.charCodeAt(0));
}

async function decryptResponseData(encrypted) {
  if (!aesKey.value) {
    throw new Error("AES key not available for decryption");
  }
  const keyBytes = aesKey.value;
  const iv = base64ToBytes(encrypted.iv);
  const ciphertext = base64ToBytes(encrypted.ciphertext);
  const tag = base64ToBytes(encrypted.tag);

  // GCM 模式下，tag 应拼接在 ciphertext 后面
  const fullCiphertext = new Uint8Array(ciphertext.length + tag.length);
  fullCiphertext.set(ciphertext);
  fullCiphertext.set(tag, ciphertext.length);

  // 导入原始 AES key
  const cryptoKey = await crypto.subtle.importKey(
      "raw",
      keyBytes,
      { name: "AES-GCM" },
      false,
      ["decrypt"]
  );

  // 解密
  const decrypted = await crypto.subtle.decrypt(
      {
        name: "AES-GCM",
        iv: iv,
        tagLength: 128 // AES-GCM 默认 tag 是 16 字节（128 bit）
      },
      cryptoKey,
      fullCiphertext
  );

  return JSON.parse(new TextDecoder().decode(decrypted));
}

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
  password: null,
  captcha_uuid: null,
  captcha_answer: null,
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
  startCaptchaRefresh();
})

let isRefreshing = false; // 标记是否正在刷新 Token
let requestsQueue = [];   // 存储等待刷新的请求队列

const refreshToken = async () => {
  try {
    const res = await api.post("/auth/refresh", null, {
      headers: {Authorization: `Bearer ${refresh_token.value}`},
    });
    const {data} = res.data;
    localStorage.access_token = data.access_token;
    access_token.value = data.access_token;
    latestToken = data.access_token;
    return data.access_token;
  } catch (err) {
    const {msg} = err.response?.data || {};
    message.error(msg || "刷新 Token 失败");
    if (msg === "Token has expired") {
      logout();
    }
    throw err;
  }
};

const checkTokenExpiration = async () => {
  if (!refresh_token.value) {
    message.error("Token 不存在，请重新登录");
    logout();
  }

  try {
    // 检查 refresh_token 是否过期
    const decodedRefresh = jwtDecode(refresh_token.value);
    const refreshExp = decodedRefresh.exp * 1000;
    if (Date.now() > refreshExp) {
      message.warn("refresh_token 已过期，请重新登录");
      logout();
      // 构造 axios 错误格式
      throw {
        isAxiosError: true,
        response: {
          status: 401,
          data: {
            msg: "refresh_token 已过期",
          },
        },
      };
    }

    // 检查 access_token 是否即将过期（提前 5 分钟刷新）
    if (latestToken) {
      const decodedAccess = jwtDecode(latestToken);
      const accessExp = decodedAccess.exp * 1000; // 提前 5 分钟
      if (Date.now() > accessExp) {
        if (!isRefreshing) {
          isRefreshing = true;
          await refreshToken();
          isRefreshing = false;
          // 刷新完成后执行队列中的请求
          requestsQueue.forEach((cb) => cb(latestToken));
          requestsQueue = [];
        } else {
          // 如果正在刷新，将当前请求加入队列等待
          return new Promise((resolve) => {
            requestsQueue.push((newToken) => {
              resolve(newToken);
            });
          });
        }
      }
    }
  } catch (error) {
    console.error("Token 检查失败", error);
    logout();
    throw error;
  }
};

// 请求拦截器
api.interceptors.request.use(async (config) => {
  if (!config.url.includes("/auth/login") && !config.url.includes("/auth/refresh") && !config.url.includes("/auth/captcha")) {
    await checkTokenExpiration();

    // 使用登录时生成的加密 AES 密钥
    const encryptedKey = localStorage.encrypted_aes_key;
    const aesKeyBase64 = localStorage.aes_key;

    if (encryptedKey) {
      config.headers["X-AES-Key"] = encryptedKey; // ✅ 只有一次 base64，直接传
    }

    if (
        aesKeyBase64 &&
        encryptedKey &&
        config.headers['Content-Type'] === 'application/json' &&
        config.data &&
        typeof config.data === 'object' &&
        !config.url.includes('/auth/login') &&
        !config.url.includes('/auth/refresh')
    ) {
      try {
        const keyBytes = base64ToBytes(aesKeyBase64);

        const iv = crypto.getRandomValues(new Uint8Array(12)); // GCM 推荐 96-bit IV
        const plaintext = new TextEncoder().encode(JSON.stringify(config.data));

        const cryptoKey = await crypto.subtle.importKey(
            "raw",
            keyBytes,
            { name: "AES-GCM" },
            false,
            ["encrypt"]
        );

        const encrypted = await crypto.subtle.encrypt(
            {
              name: "AES-GCM",
              iv: iv,
              tagLength: 128
            },
            cryptoKey,
            plaintext
        );

        // 拆分 ciphertext 和 tag（GCM 加密结果中最后 16 字节是 tag）
        const encryptedBytes = new Uint8Array(encrypted);
        const ciphertext = encryptedBytes.slice(0, -16);
        const tag = encryptedBytes.slice(-16);

        config.data = {
          iv: bytesToBase64(iv),
          ciphertext: bytesToBase64(ciphertext),
          tag: bytesToBase64(tag)
        };

      } catch (err) {
        console.error("请求加密失败", err);
        throw new Error("请求加密失败");
      }
    }

    config.headers.Authorization = `Bearer ${latestToken}`;
  }
  return config;
});

// 响应拦截器（精简错误处理）
api.interceptors.response.use(
    async (response) => {
      if (response?.data?.data?.iv) {
        const decryptedData = await decryptResponseData(response.data.data);
        response.data.data = decryptedData;
        // try {
        //   const decryptedData = await decryptResponseData(response.data.data);
        //   response.data.data = decryptedData;
        // } catch (e) {
        //   message.error("响应数据解密失败");
        // }
      }
      return response;
    },
    async (error) => {
      const originalRequest = error.config;
      const res = error.response;  // 正确地拿到 response 对象

      // 尝试处理 Token 刷新逻辑
      if (res?.status === 401 && !originalRequest._retry &&
          !originalRequest.url.includes("/auth/refresh") &&
          !originalRequest.url.includes("/auth/login") &&
          !originalRequest.url.includes("/auth/captcha")) {
        originalRequest._retry = true;
        try {
          const newToken = await refreshToken();
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return api(originalRequest);
        } catch (err) {
          logout();
          return Promise.reject(err);
        }
      }

      // 错误提示处理（注意这里的 res 替代原来的 response）
      if (res) {
        switch (res.status) {
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
          case 503:
            message.error("服务器离线，请刷新页面，如果问题仍然存在请联系管理员");
            break;
          case 520:
            message.error("响应超时，请刷新页面");
            break;
          default:
            break;
        }
      } else {
        message.error("网络错误，请检查网络连接");
      }

      return Promise.reject(error);
    });

watch(access_token, (newToken) => {
  // 直接在 request 中使用最新的 token
  latestToken = newToken; // 更新最新的token值
});

const name = ref(localStorage.name);

const signin = ref(false);

const captchaImage = ref(null);
const captchaType = ref('image');
const showTips = ref(false);

const speakWord = (word) => {
  speechSynthesis.cancel();
  const msg = new SpeechSynthesisUtterance(word);
  msg.lang = 'en-US'; // 美式英语
  msg.rate = 0.8;      // 语速略慢一点更清晰
  window.speechSynthesis.speak(msg);
}

const handleCancelTips = () => {
  showTips.value = false;
  formState.captcha_answer = null;
}
const natoPhonetic = {
  'A': 'Alpha', 'B': 'Bravo', 'C': 'Charlie', 'D': 'Delta', 'E': 'Echo',
  'F': 'Foxtrot', 'G': 'Golf', 'H': 'Hotel', 'I': 'India', 'J': 'Juliett',
  'K': 'Kilo', 'L': 'Lima', 'M': 'Mike', 'N': 'November', 'O': 'Oscar',
  'P': 'Papa', 'Q': 'Quebec', 'R': 'Romeo', 'S': 'Sierra', 'T': 'Tango',
  'U': 'Uniform', 'V': 'Victor', 'W': 'Whiskey', 'X': 'X-ray', 'Y': 'Yankee', 'Z': 'Zulu',
  '0': 'Zero', '1': 'One', '2': 'Two', '3': 'Three', '4': 'Four',
  '5': 'Five', '6': 'Six', '7': 'Seven', '8': 'Eight', '9': 'Nine',
}
const captchaTimer = ref(null);

// 是否未登录（响应式判断）
const isNotLoggedIn = computed(() => {
  return !access_token.value && !refresh_token.value;
});

// 开启自动刷新验证码定时器
function startCaptchaRefresh() {
  if (captchaTimer.value) return; // 已经开启

  getCaptcha(); // 初始化加载一次
  captchaTimer.value = setInterval(() => {
    if (!access_token.value && !refresh_token.value) {
      getCaptcha();
    }
  }, 160 * 1000); // 每 160 秒
}

// 停止自动刷新验证码
function stopCaptchaRefresh() {
  if (captchaTimer.value) {
    clearInterval(captchaTimer.value);
    captchaTimer.value = null;
  }
}

// 页面卸载时清理定时器
onUnmounted(() => {
  stopCaptchaRefresh();
});

const disableAudio = computed(() => {
  return !captchaImage.value
})

const playAudio = () => {
  const audio = document.getElementById('captcha_audio');
  if (audio.src) {
    audio.play();
  }
}

const getCaptcha = (type=null) => {
  if (type) {
    captchaType.value = type;
  }
  logoLoading.value = true;
  if (captchaType.value === 'audio') {
    captchaImage.value = null;
  }
  api.get("/auth/captcha?type=" + captchaType.value).then(res => {
    let {data} = res.data;
    logoLoading.value = false;
    formState.captcha_uuid = data.uuid;
    captchaImage.value = data.image_data;
  }).catch(err => {
    console.log("验证码获取失败");
    getCaptcha();
  })
}

const login = () => {
  signin.value = true;
  api.post("/auth/login", formState).then((res) => {
    signin.value = false;
    formState.studentId = null;
    formState.password = null;
    formState.captcha_uuid = null;
    formState.captcha_answer = null;
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
    // AESKey 生成并保存，同时 RSA 加密传输给后端
    localStorage.encrypted_aes_key = generateAndStoreAESKey(formatPEM(data.public_key));
    updateAESKeyFromLocalStorage();
    message.success(msg);
  }).catch((err) => {
    let msg = err?.response?.data?.msg;
    if (!msg) {
      message.error("服务器离线，请刷新页面，如果问题仍然存在请联系管理员")
    }
    signin.value = false;
    getCaptcha();
    message.error(msg);
  });
}

const logout = () => {
  router.push("/");
  localStorage.clear();
  refresh_token.value = null;
  access_token.value = null;
  aesKey.value = null;
  name.value = null;
  is_admin.value = null;
  user_position.value = null;
  message.success("注销完成");
  getCaptcha();
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
  <a-config-provider :theme="{
      token: {
        // colorPrimary: '#e7662c',
      },
      // algorithm: theme.darkAlgorithm
    }">
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
          <a-form-item
              label="验证码"
              name="captcha_answer"
              :rules="[{ required: true, message: '请输入验证码' }]"
          >
            <a-row>
              <a-input-password :style="{ width: captchaType === 'audio' ? '100%' : '35%' }"
                                v-model:value="formState.captcha_answer"/>
              <a-col :flex="1" style="padding-top: 2px; padding-left: 4px;" v-if="captchaType==='image'">
                <img :src="captchaImage" @load="stopLoadingLogo" :style="{ display: logoLoading }" @click="getCaptcha('image')"/>
                <a-spin :spinning="logoLoading === 'none'"></a-spin>
              </a-col>
              <a-col :flex="1" style="padding-top: 2px; padding-left: 4px;" v-if="captchaType==='audio'">
                <audio id="captcha_audio" :src="captchaImage" />
                <a-spin :spinning="logoLoading === 'none'"></a-spin>
              </a-col>
            </a-row>
            <a-row v-if="captchaType==='audio'">
              <a-button @click="playAudio()" :disabled="disableAudio">▶</a-button>
              <a-button @click="getCaptcha()">🔁</a-button>
              <a-button @click="showTips=true;">提示</a-button>
            </a-row>
            <a-row>
              <a v-if="captchaType === 'image'" @click="getCaptcha('audio')">语音验证码</a>
              <a v-else @click="getCaptcha('image')">文字验证码</a>
            </a-row>
          </a-form-item>
          <div style="display: flex; align-items: center; justify-content: center; margin-top: 16px;">
            <a-form-item>
              <a-button type="primary" html-type="submit" :loading="signin"
                        :disabled="!formState.studentId || !formState.password || !formState.captcha_uuid || !formState.captcha_answer">登录
              </a-button>
            </a-form-item>
          </div>

        </a-form>
        <a-modal title="语音验证码完成指引" v-model:open="showTips">
          <a-col>
            <p>请注意一个验证码只有三分钟有效期。</p>
            <p>对照表内的读音部分可以单击收听范例。</p>
            <p>指引最下方可以进行验证码收听和答案填写。</p>
          </a-col>
          <a-descriptions
              title="NATO 音标对照表"
              bordered
              :column="{ xs: 1, sm: 2, md: 3, lg: 3 }"
          >
            <a-descriptions-item
                v-for="(word, char) in natoPhonetic"
                :key="char"
                :label="char"
            >
              <span @click="speakWord(word)">{{ word }}</span>
            </a-descriptions-item>
          </a-descriptions>
          <a-col style="margin-top: 8px;">
            请根据读音对应字母或数字，填写验证码
            <a-input v-model:value="formState.captcha_answer"></a-input>
          </a-col>
          <a-row v-if="captchaType==='audio'">
            <a-button @click="playAudio()" :disabled="disableAudio">▶ 播放</a-button>
            <a-button @click="getCaptcha()">🔁 刷新</a-button>
          </a-row>
          <template #footer>
            <a-button type="primary" danger @click="handleCancelTips">放弃输入</a-button>
            <a-button type="primary" @click="showTips=false;">保存</a-button>
          </template>
        </a-modal>
        <footer id="login-footer">
          <div>
            <a href="https://beian.miit.gov.cn"
               style="text-decoration: none; color: rgba(255,255,255,0.7); font-size: 15px;">
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
                <a-menu-item key="checkin-list">
                  <RouterLink to="/checkin/list">签到</RouterLink>
                </a-menu-item>
                <a-menu-item key="checkin-asl"
                             v-if="['部长', '副部长', '部门负责人'].includes(user_position) || is_admin === 'true'">
                  <RouterLink to="/checkin/asl">请假管理</RouterLink>
                </a-menu-item>
                <a-menu-item key="schedule-manager">
                  <RouterLink to="/schedule/manager">值班管理</RouterLink>
                </a-menu-item>
                <a-menu-item key="schedule-list"
                             v-if="['部长', '副部长', '部门负责人'].includes(user_position) || is_admin === 'true'">
                  <RouterLink to="/schedule/list">值班列表</RouterLink>
                </a-menu-item>
                <a-menu-item key="schedule-batch" v-if="is_admin === 'true'">
                  <RouterLink to="/schedule/batch">批量计划</RouterLink>
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
                <a-menu-item key="4"
                             v-if="['部长', '副部长', '部门负责人'].includes(user_position) || is_admin === 'true'">
                  <router-link to="/user/manager">用户管理</router-link>
                </a-menu-item>
                <div v-if="is_admin === 'true'">
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
                          <a-menu-item key="checkin-list">
                            <RouterLink to="/checkin/list">签到</RouterLink>
                          </a-menu-item>
                          <a-menu-item key="checkin-asl"
                                       v-if="['部长', '副部长', '部门负责人'].includes(user_position) || is_admin === 'true'">
                            <RouterLink to="/checkin/asl">请假管理</RouterLink>
                          </a-menu-item>
                          <a-menu-item key="schedule-manager">
                            <RouterLink to="/schedule/manager">值班管理</RouterLink>
                          </a-menu-item>
                          <a-menu-item key="schedule-list"
                                       v-if="['部长', '副部长', '部门负责人'].includes(user_position) || is_admin === 'true'">
                            <RouterLink to="/schedule/list">值班列表</RouterLink>
                          </a-menu-item>
                          <a-menu-item key="schedule-batch" v-if="is_admin === 'true'">
                            <RouterLink to="/schedule/batch">批量计划</RouterLink>
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
                          <a-menu-item key="4">
                            <router-link to="/user/manager">用户管理</router-link>
                          </a-menu-item>
                          <div v-if="is_admin === 'true'">
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
  </a-config-provider>

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

.ant-dropdown {
  z-index: 5051 !important;
}

</style>