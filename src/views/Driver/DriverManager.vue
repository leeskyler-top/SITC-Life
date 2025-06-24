<script setup>
import {ExclamationCircleOutlined, HomeOutlined, CopyOutlined} from "@ant-design/icons-vue";
import {createVNode, onMounted, reactive, ref} from "vue";
import api from "@/api";
import {message, Modal, notification} from "ant-design-vue";
import my_config from "@/my_config";
import io from 'socket.io-client';
import {useClipboard} from "@vueuse/core";

const spinning = ref(false);
const userData = ref();
const currentDir = ref([]);
const currentFiles = ref([]);
let date = new Date();
const currentMonth = ref(date.getMonth() + 1);
const qrCodeVisible = ref(false);
const qrCodeData = ref('');
const qrCodeStatus = ref('初始化/未检查');
const wechat_file_server = my_config.wechat_file_transfer_server;
const socket_io_path = my_config.wfts_socket_path;
const wfts_proxy_path = my_config.wfts_proxy_path
const pan_baseurl = my_config.pan_baseurl

let socket = null;

const connectMMFileTrans = () => {
  socket = io(wechat_file_server, {
    path: socket_io_path  // 指定自定义路径
  });

  socket.on('update_qrcode', function (data) {
    qrCodeData.value = `data:image/png;base64,${data.qrcode_base64}`;
  });

  socket.on('login_status', function (data) {
    if (data.code === '408') {
      qrCodeStatus.value = "未扫码"
    } else if (data.code === '201') {
      qrCodeStatus.value = "已扫码，待确认"
    } else if (data.code === '200') {
      qrCodeStatus.value = "已登录"
    }
  });

  socket.on('login_success', function (data) {
    qrCodeStatus.value = '已登录';
  });

  socket.on('upload_progress', function (data) {
    uploadProgress.value = Math.round(data.progress * 100, 2);
  });

  socket.on('login_timeout', function (data) {
    qrCodeVisible.value = false;
    message.warn("微信登录超时，请重新操作！")
  });
}

const uploadProgress = ref(0);


const loginToWebSocket = () => {
  let session_id = localStorage.session_id ? localStorage.session_id : null
  api.post(wechat_file_server + wfts_proxy_path + "/login", {
    "session_id": session_id
  }).then(res => {
    let data = res.data
    let msg = data.message
    message.success(msg)
    if (data.message === 'Already Login.') {
      qrCodeStatus.value = "已登录"
    } else {
      qrCodeStatus.value = "需要重新登录"
    }
    localStorage.session_id = data.session_id
  }).catch(err => {
    message.error(err.response.message)
  })
};

const currentPushName = ref(null)
const currentPushDocid = ref(null)

const openQRCodeModal = (name, docid) => {
  qrCodeStatus.value = '检查登录状态...'
  qrCodeVisible.value = true;
  currentPushName.value = name
  currentPushDocid.value = docid;
  loginToWebSocket();  // Log in when opening the QR code modal
}

const listMyInfo = () => {
  spinning.value = true;
  api.get("/user/my").then((res) => {
    spinning.value = false;
    let {data} = res.data;
    userData.value = data;
    listHomeDir();  // Ensure this is called after userData is set
  }).catch((err) => {
    spinning.value = false;
    let {msg} = err.response.data;
    message.error(msg);
  });
}

const listLifeDepDir = () => {
  spinning.value = true;
  api.get("/driver/dir/list/life_dep").then(res => {
    let {data} = res.data;
    spinning.value = false;
    currentDir.value = data.dirs;
    currentFiles.value = data.files;
  }).catch(err => {
    let {msg} = err.response.data;
    spinning.value = false;
    message.error(msg);
  });
}

const listSemesterDir = () => {
  spinning.value = true;
  api.get("/driver/dir/list/semester").then(res => {
    let {data} = res.data;
    spinning.value = false;
    currentDir.value = data.dirs;
    currentFiles.value = data.files;
  }).catch(err => {
    let {msg} = err.response.data;
    spinning.value = false;
    message.error(msg);
  });
}

const listMonthDir = () => {
  spinning.value = true;
  let date = new Date();
  api.post("/driver/dir/list/month", {
    month: `${date.getUTCFullYear()}-${(date.getMonth() + 1).toString().padStart(2, "0")}`
  }).then(res => {
    let {data} = res.data;
    spinning.value = false;
    currentDir.value = data.dirs;
    currentFiles.value = data.files;
  }).catch(err => {
    let {msg} = err.response.data;
    spinning.value = false;
    message.error(msg);
  });
}

const parentDir = ref();

const listOtherDir = (docid) => {
  spinning.value = true;
  api.post("/driver/dir/list/other", {
    docid: docid,
  }).then(res => {
    let {data} = res.data;
    docid = docid.replace(/\/[^/]+$/, '');
    parentDir.value = docid;
    console.log(parentDir.value)
    spinning.value = false;
    currentDir.value = data.dirs;
    currentFiles.value = data.files;
  }).catch(err => {
    let {msg} = err.response.data;
    spinning.value = false;
    message.error(msg);
  });
}

const deleteDir = (docid) => {
  spinning.value = true;
  api.post("/driver/dir/del", {
    "docid": docid
  }).then(res => {
    let {data, msg} = res.data;
    spinning.value = false;
    currentDir.value = currentDir.value.filter(dir => dir.docid !== docid);
    currentFiles.value = currentFiles.value.filter(file => file.docid !== docid);
    message.success(msg)
  }).catch(err => {
    let {msg} = err.response.data;
    spinning.value = false;
    message.error(msg);
  });
}

const deleteFile = (docid) => {
  spinning.value = true;
  api.post("/driver/file/del", {
    "docid": docid
  }).then(res => {
    let {data, msg} = res.data;
    spinning.value = false;
    currentFiles.value = currentFiles.value.filter(file => file.docid !== docid);
    message.success(msg)
  }).catch(err => {
    let {msg} = err.response.data;
    spinning.value = false;
    message.error(msg);
  });
}

const linkData = ref();

const openLink = () => {
  spinning.value = true;
  api.post("/driver/dir/link", formState).then(res => {
    let {data, msg} = res.data;
    spinning.value = false;
    linkData.value = data;
    linkData.value.link = pan_baseurl + linkData.value.link
    showLink();
    message.success(msg)
  }).catch(err => {
    let {msg} = err.response.data;
    spinning.value = false;
    message.error(msg);
  });
}

const listHomeDir = () => {
  if (userData.value) {
    // Check the user's position or admin status
    if (["部长", "副部长", "部门负责人"].includes(userData.value.position) || userData.value.is_admin === true) {
      listLifeDepDir();
    } else if (["汇总负责人", "实习汇总负责人"].includes(userData.value.position) || userData.value.is_admin === true) {
      listSemesterDir();
    } else {
      listMonthDir();
    }
  }
}

const openNotification = (title, message) => {
  notification.open({
    message: title,
    description: message,
    duration: 0,
  });
};

const genSemesterDir = () => {
  spinning.value = true
  api.get("/driver/dir/all/create_by_semseter").then(res => {
    let {msg} = res.data;
    spinning.value = false;
    openNotification("生成成功", "文件夹已生成")
  }).catch(err => {
    let {msg} = err.response.data
    spinning.value = false;
    openNotification("生成失败", msg)
  })
}

const genMonthDir = () => {
  spinning.value = true
  api.post("/driver/dir/month/create_by_semseter", {
    month: currentMonth.value
  }).then(res => {
    let {msg} = res.data;
    spinning.value = false;
    visible.value = false;
    openNotification("生成成功", "文件夹已生成")
  }).catch(err => {
    let {msg} = err.response.data
    spinning.value = false;
    openNotification("生成失败", msg)
  })
}

const genCurrentMonthDir = () => {
  spinning.value = true
  api.get("/driver/dir/month/create_current_month").then(res => {
    let {msg} = res.data;
    spinning.value = false;
    visible.value = false;
    openNotification("生成成功", "文件夹已生成")
  }).catch(err => {
    let {msg} = err.response.data
    spinning.value = false;
    openNotification("生成失败", msg)
  })
}

onMounted(() => {
  connectMMFileTrans();
  listMyInfo();
});

const pushZip = () => {
  let session_id = localStorage.session_id
  spinning.value = true;
  api.post("/driver/dir/download", {
    session_id: session_id,
    name: currentPushName.value,
    docid: currentPushDocid.value
  }).then(res => {
    let {msg} = res.data
    spinning.value = false;
  }).catch(err => {
    let {msg} = err.response.data
    spinning.value = false;
  })
}

const logoutMM = () => {
  const session_id = localStorage.session_id ? localStorage.session_id : null;

  // 请求头信息
  const headers = {
    "Content-Type": "application/json"
  };

  // 进行登出操作
  api.delete(wechat_file_server + wfts_proxy_path + "/logout", {
    headers,
    data: {session_id}  // 将 session_id 放入请求体中
  }).then(res => {
    // 请求成功，处理注销后的操作
    qrCodeVisible.value = false;
    if (socket) {
      socket.disconnect();
      socket = null; // 重置 socket 变量
    }
    connectMMFileTrans();
    message.success("成功登出，请刷新页面");
  }).catch(err => {
    // 发生错误时处理
    if (socket) {
      socket.disconnect();
      socket = null; // 重置 socket 变量
    }
    connectMMFileTrans();
    qrCodeVisible.value = false;
    message.error("登出失败：" + (err.response?.data?.message || "未知错误"));
  });
};

const showConfirm = (op, docid = null) => {
  let contentText = ""
  if (op === "genSemester") {
    contentText = '是否尝试按照模板生成文件夹？大约需要25分钟，且不可中断！';
  } else if (op === "deleteDir") {
    contentText = '是否删除文件夹，操作不可逆！';
  } else if (op === "deleteFile") {
    contentText = '是否删除文件，操作不可逆！';
  }
  Modal.confirm({
    title: '确认操作',
    icon: createVNode(ExclamationCircleOutlined),
    content: contentText,
    okText: '确认',
    cancelText: '取消',
    onOk() {
      if (op === "genSemester") {
        genSemesterDir()
      } else if (op === 'deleteDir') {
        deleteDir(docid)
      } else if (op === 'deleteFile') {
        deleteFile(docid)
      }
    }
  });
}

const visible = ref(false)
const visibleGenCurrentMonth = ref(false)
const visibleCreate = ref(false)
const visibleLink = ref(false)

const showModal = () => {
  visible.value = true;
}

const showGenCurrentMonthModal = () => {
  visibleGenCurrentMonth.value = true;
}

const showCreateModal = (docid) => {
  visibleCreate.value = true;
  formState.docid = docid
}

const showLink = () => {
  visibleLink.value = true;
}

const handleCancel = () => {
  visible.value = false;
  visibleCreate.value = false;
  visibleLink.value = false;
  visibleGenCurrentMonth.value = false;
  qrCodeVisible.value = false;
};

// 获取当前日期
const today = new Date();

// 设置时间为次日的 00:00:00
const nextDay = new Date(today);
nextDay.setDate(today.getDate() + 1); // 设置为明天
nextDay.setHours(0, 0, 0, 0); // 设置为00:00:00

// 获取次日0时的时间戳（单位：毫秒）
const timestamp = nextDay.getTime() * 1000;
console.log(timestamp)

const formState = reactive({
  docid: "",
  endtime: timestamp,
  perm: 7,
  usePassword: false,
});


const copyLink = (text, msg) => {
  const { copy, copied } = useClipboard({ source: text });
  copy();
  if (copied) {
    message.success("复制" + msg + "成功")
  }
}


</script>

<template>
  <a-layout-content :style="{ margin: '16px' }">
    <h2 style="display: flex; justify-content: space-between;">
      <span>网盘管理</span>
      <span style="margin-bottom: 4px;">
        <router-link to="/"><HomeOutlined/> 首页</router-link>
      </span>
    </h2>
    <div style="padding: 8px; background-color: #FFFFFF">

      <a-spin :spinning="spinning">

        <a-row justify="end">
          <a-button style="margin: 8px;" @click="listHomeDir()" type="primary">返回根目录</a-button>
          <a-button style="margin: 8px;" @click="listOtherDir(parentDir)" type="primary"
                    v-if="['部长', '副部长', '部门负责人'].includes(userData?.position) || userData?.is_admin === true"
                    :disabled="!parentDir">返回上一级
          </a-button>
          <a-button type="primary" style="margin: 8px;" ghost @click="showConfirm('genSemester')"
                    v-if="['部长', '副部长', '部门负责人'].includes(userData?.position) || userData?.is_admin === true">
            生成学期文件夹
          </a-button>
          <a-button type="primary" style="margin: 8px;" ghost @click="showModal"
                    v-if="['部长', '副部长', '部门负责人', '汇总负责人', '实习汇总负责人'].includes(userData?.position) || userData?.is_admin === true">
            生成月文件夹
          </a-button>
          <a-button type="primary" style="margin: 8px;" ghost @click="showGenCurrentMonthModal"
                    v-if="['普通部员', '实习部员'].includes(userData?.position) || userData?.is_admin === true">生成当前月文件夹
          </a-button>
        </a-row>
        <a-row style="padding: 32px; box-sizing: border-box;" v-if="uploadProgress > 0 && uploadProgress < 100">
          <span :style="{ marginLeft: 8 }">上传进度 : {{ uploadProgress }}%</span>
          <a-progress :percent="uploadProgress"/>
        </a-row>
        <a-list :data-source="currentDir" v-if="currentDir?.length !== 0">

          <template #renderItem="{ item }">
            <a-list-item>
              <a-row justify="end" @click="listOtherDir(item.docid)">
                <a-button type="text">
                  {{ item.name }}
                </a-button>
              </a-row>
              <a-row justify="end">
                <a-button type="link" @click="showCreateModal(item.docid)">获取链接</a-button>
                <a-button type="link"
                          v-if="['部长', '副部长', '部门负责人', '汇总负责人', '实习汇总负责人'].includes(userData?.position) || userData?.is_admin === true"
                          @click="openQRCodeModal(item.name,item.docid)"
                          :disabled="(uploadProgress > 0 && uploadProgress < 100) || spinning">尝试推送
                </a-button>
                <a-button type="link" danger
                          v-if="['部长', '副部长', '部门负责人'].includes(userData?.position) || userData?.is_admin === true"
                          @click="showConfirm('deleteDir', item.docid)">删除
                </a-button>
              </a-row>
            </a-list-item>
          </template>
        </a-list>
        <a-list :data-source="currentFiles" v-if="currentFiles?.length !== 0 || currentDir?.length === 0">
          <template #renderItem="{ item }">
            <a-list-item>
              <a-row justify="end">
                <a-button type="text">
                  {{ item.name }}
                </a-button>
              </a-row>
              <a-row justify="end">
                <a-button type="link" danger
                          v-if="['部长', '副部长', '部门负责人', '汇总负责人', '实习汇总负责人'].includes(userData?.position) || userData?.is_admin === true"
                          @click="showConfirm('deleteDir', item.docid)">删除
                </a-button>
                <a-button type="link" danger v-else @click="showConfirm('deleteFile', item.docid)">删除</a-button>

              </a-row>
            </a-list-item>
          </template>
        </a-list>
      </a-spin>
    </div>
    <a-modal v-model:open="visible" title="要生成当前学期哪个月份的文件夹？">
      <a-input-number id="inputNumber" v-model:value="currentMonth" :min="1" :max="12"/>
      <template #footer>
        <a-button type="primary" @click="handleCancel">关闭</a-button>
        <a-button type="primary" danger @click="genMonthDir" :loading="spinning">变更</a-button>
      </template>
    </a-modal>
    <a-modal v-model:open="visibleGenCurrentMonth" title="要生成当前学期当前月份的文件夹？">
      <template #footer>
        <a-button type="primary" @click="handleCancel">关闭</a-button>
        <a-button type="primary" danger @click="genCurrentMonthDir" :loading="spinning">变更</a-button>
      </template>
    </a-modal>
    <a-modal v-model:open="visibleCreate" title="获取链接">
      <a-form
          :model="formState"
          name="validate_other"
          v-bind="formItemLayout"
          :rules="rules"
      >
        <a-form-item name="perm" label="权限" :rules="[{ required: true }]">
          <a-select v-model:value="formState.perm" placeholder="选择权限">
            <a-select-option :value="1">仅预览</a-select-option>
            <a-select-option :value="3">预览与下载</a-select-option>
            <a-select-option :value="4">仅上传</a-select-option>
            <a-select-option :value="5">预览与上传</a-select-option>
            <a-select-option :value="7">全部权限</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item name="usePassword" label="是否使用密码">
          <a-switch v-model:checked="formState.usePassword"></a-switch>
        </a-form-item>
      </a-form>
      <template #footer>
        <a-button type="primary" @click="handleCancel">关闭</a-button>
        <a-button type="primary" danger @click="openLink" :loading="spinning">创建</a-button>
      </template>
    </a-modal>
    <a-modal v-model:open="visibleLink" title="链接信息">
      <a-card>
        <p>链接：
        <a-input-group>
          <a-input v-model:value="linkData.link" style="width: calc(100% - 32px)" :readonly="true" @click="copyLink(linkData.link, '网盘链接')" />
          <a-tooltip title="复制网盘链接" @click="copyLink(linkData.link, '网盘链接')">
            <a-button>
              <template #icon><CopyOutlined /></template>
            </a-button>
          </a-tooltip>
        </a-input-group>
        </p>
        <p v-if="linkData.password">密码：
          <a-input-group>
            <a-input-password v-model:value="linkData.password" style="width: 80px;" @click="copyLink(linkData.password, '网盘密码')" :readonly="true" />
            <a-tooltip title="复制链接密码" @click="copyLink(linkData.password, '网盘密码')">
              <a-button>
                <template #icon><CopyOutlined /></template>
              </a-button>
            </a-tooltip>
          </a-input-group>
        </p>
      </a-card>
      <template #footer>
        <a-button type="primary" @click="handleCancel">关闭</a-button>
      </template>
    </a-modal>

    <a-modal v-model:open="qrCodeVisible" title="微信传输助手二维码上传">
      <a-card title="使用方法" style="margin-bottom: 8px;">
        <p>
          1. 请使用手机微信扫描下方二维码登录文件传输助手。
        </p>
        <p>
          2. 登录完成后点击“推送”.
        </p>
        <p>
          3. 5分钟内文件传输助手没有收到文件请重试，请勿多次点击。
        </p>
        <p>
          ⚠ 二维码仅限使用摄像头扫描，请勿截图使用相册打开。
        </p>
      </a-card>
      <a-col>
        <a-row align="center">
          <a-image-preview-group>
            <a-image :width="200"
                     fallback="data:image/png;base64,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"
                     :src="qrCodeData"/>
          </a-image-preview-group>
        </a-row>
        <a-row align="center">
          <p>二维码状态：{{ qrCodeStatus }}</p>
        </a-row>
        <a-row>
          <a-progress :percent="uploadProgress"/>
        </a-row>
      </a-col>
      <template #footer>
        <a-button type="primary" @click="handleCancel" ghost>关闭</a-button>
        <a-button type="primary" @click="logoutMM" :disabled="qrCodeStatus !== '已登录' || (uploadProgress > 0 && uploadProgress < 100) || spinning" danger ghost>登出会话</a-button>
        <a-button type="primary" @click="pushZip" :disabled="qrCodeStatus !== '已登录' || (uploadProgress > 0 && uploadProgress < 100)" :loading="spinning">推送</a-button>
      </template>
    </a-modal>

  </a-layout-content>
</template>

<style scoped>
</style>
