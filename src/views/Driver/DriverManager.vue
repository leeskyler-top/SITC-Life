<script setup>
import {ExclamationCircleOutlined, HomeOutlined} from "@ant-design/icons-vue";
import {createVNode, onMounted, reactive, ref} from "vue";
import api from "@/api";
import {message, Modal, notification} from "ant-design-vue";
import my_config from "@/my_config";
import io from 'socket.io-client';

const spinning = ref(false);
const userData = ref();
const currentDir = ref([]);
const currentFiles = ref([]);
let date = new Date();
const currentMonth = ref(date.getMonth() + 1);
const qrCodeVisible = ref(false);
const qrCodeData = ref('');
const qrCodeStatus = ref('');
const wechat_file_server = my_config.wechat_file_transfer_server;
const socket_io_path = my_config.wfts_socket_path;

const socket = io(wechat_file_server,{
  path: socket_io_path  // 指定自定义路径
});

socket.on('update_qrcode', function (data) {
  qrCodeData.value = `data:image/png;base64,${data.qrcode_base64}`;
});

socket.on('login_status', function (data) {
  qrCodeStatus.value = 'Login Status: ' + data.code;
});

socket.on('login_success', function (data) {
  qrCodeStatus.value = 'Login Successful';
});

const loginToWebSocket = () => {
  let session_id = localStorage.session_id ? localStorage.session_id : null
  api.post(wechat_file_server + "/login", {
    "session_id": session_id
  }).then(res => {
    let data = res.data
    let msg = data.message
    message.success(msg)
    localStorage.session_id = data.session_id
  }).catch(err => {
    message.error(err.response.message)
  })
};

const currentPushName = ref(null)
const currentPushDocid = ref(null)

const openQRCodeModal = (name, docid) => {
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
    openNotification("已尝试发送", msg)
  }).catch(err => {
    let {msg} = err.response.data
    spinning.value = false;
    openNotification("发送失败", msg)
  })
}

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
                          @click="openQRCodeModal(item.name,item.docid)">尝试推送
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
    <a-modal v-model:visible="visible" title="要生成当前学期哪个月份的文件夹？">
      <a-input-number id="inputNumber" v-model:value="currentMonth" :min="1" :max="12"/>
      <template #footer>
        <a-button type="primary" @click="handleCancel">关闭</a-button>
        <a-button type="primary" danger @click="genMonthDir" :loading="spinning">变更</a-button>
      </template>
    </a-modal>
    <a-modal v-model:visible="visibleGenCurrentMonth" title="要生成当前学期当前月份的文件夹？">
      <template #footer>
        <a-button type="primary" @click="handleCancel">关闭</a-button>
        <a-button type="primary" danger @click="genCurrentMonthDir" :loading="spinning">变更</a-button>
      </template>
    </a-modal>
    <a-modal v-model:visible="visibleCreate" title="获取链接">
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
        <a-button type="primary" danger @click="openLink">创建</a-button>
      </template>
    </a-modal>
    <a-modal v-model:visible="visibleLink" title="链接信息">
      <a-card>
        <p>链接：<span>https://pan.shitac.net/link/{{ linkData.link }}</span></p>
        <p>密码：<span>{{ linkData.password }}</span></p>
      </a-card>
      <template #footer>
        <a-button type="primary" @click="handleCancel">关闭</a-button>
      </template>
    </a-modal>

    <a-modal v-model:visible="qrCodeVisible" title="QR Code for File Upload">
      <img :src="qrCodeData" alt="QR Code" style="width: 200px; height: 200px;"/>
      <p>{{ qrCodeStatus }}</p>
      <template #footer>
        <a-button type="primary" @click="handleCancel" ghost>关闭</a-button>
        <a-button type="primary" @click="pushZip">推送</a-button>
      </template>
    </a-modal>

  </a-layout-content>
</template>

<style scoped>
</style>
