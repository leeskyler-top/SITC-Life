<script setup>
import {reactive, ref, onMounted, computed, createVNode} from "vue";
import {ExclamationCircleOutlined, UploadOutlined, HomeOutlined, SearchOutlined} from '@ant-design/icons-vue';
import {Empty, message, Modal, Spin, Table} from "ant-design-vue";
import api from "@/api";
import my_config from "@/my_config";

const upload_url = my_config.upload_baseurl


const check_in_data = ref([]);

const activeKey = ref('started');

const currentWaitingPage = ref(1);
const currentStartedPage = ref(1);
const currentEndedPage = ref(1);

const currentWaitingPageData = computed(() => {
  const startIdx = (currentWaitingPage.value - 1) * 5;
  const endIdx = startIdx + 5;
  return filteredCheckInDataWaiting.value.slice(startIdx, endIdx);
});

const currentStartedPageData = computed(() => {
  const startIdx = (currentStartedPage.value - 1) * 5;
  const endIdx = startIdx + 5;
  return filteredCheckInDataStarted.value.slice(startIdx, endIdx);
});

const currentEndedPageData = computed(() => {
  const startIdx = (currentEndedPage.value - 1) * 5;
  const endIdx = startIdx + 5;
  return filteredCheckInDataEnded.value.slice(startIdx, endIdx);
});

const filteredCheckInDataWaiting = computed(() => {
  return check_in_data.value.filter(item => item.status === "未开始");
});

const filteredCheckInDataStarted = computed(() => {
  return check_in_data.value.filter(item => item.status === "未签到");
});

const filteredCheckInDataEnded = computed(() => {
  return check_in_data.value.filter(item => ['缺勤', '病假', '事假', '公务假', '符合要求的赛事或集训'].includes(item.status));
});

const spinning = ref(false);
const image_spinning = ref(false);

// 获取用户签到列表
const listMyCheckIns = () => {
  spinning.value = true;
  api.get("/checkin/my").then(res => {
    let {msg, data} = res.data;
    check_in_data.value = data;
    message.success(msg);
  }).catch(err => {
    let {msg} = err.response.data;
    message.error(msg);
  }).finally(() => {
    spinning.value = false; // 加载完成
  });
};

const checkin = (id, ciu_id) => {
  spinning.value = true;
  api.get("/checkin/checkin/" + id).then(res => {
    let {msg} = res.data;
    const index = check_in_data.value.findIndex(item => item.id === ciu_id)
    if (index !== -1) {
      check_in_data.value = [
        ...check_in_data.value.slice(0, index),
        {...check_in_data.value[index], status: '正常'},
        ...check_in_data.value.slice(index + 1)
      ]
    }
    message.success(msg);
  }).catch(err => {
    let {msg} = err.response.data;
    message.error(msg);
  }).finally(() => {
    spinning.value = false; // 加载完成
  });
};

onMounted(() => {
  getUploadType();
  handleResize();
  listMyCheckIns();
});

// 切换标签时更新当前显示的数据
const handleTabChange = (key) => {
  activeKey.value = key;
  // 这里可以增加需要的逻辑或状态更新
  if (activeKey.value === 'asl') {
    listMyASLApplications()
  }
};

// 模态框控制
const visible = ref(false);
const handleCancel = () => {
  visible.value = false;
  visibleASL.value = false;
};

const formItemLayout = {
  labelCol: {
    span: 6,
  },
  wrapperCol: {
    span: 14,
  },
};

const ASLForm = reactive({
  "asl_type": "病假",
  "asl_reason": "",
  "image_url": []
})

const visibleASL = ref(false);
const currentCheckInUserId = ref(null)

const showASL = (id) => {
  currentCheckInUserId.value = id;
  visibleASL.value = true;
}

// 上传文件至你的 Cloudflare Worker 并返回链接
async function uploadFileToWorker(file) {
  const accessToken = localStorage.access_token?.trim();

  if (!file || !upload_url || !accessToken) {
    throw new Error("❌ 参数缺失：文件、base_url 或 access_token");
  }

  const isSmall = file.size <= 35 * 1024 * 1024;

  if (isSmall) {
    // ✅ 小文件直接上传
    const formData = new FormData();
    formData.append("image_url", file);

    const res = await fetch(`${upload_url}/upload`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`
      },
      body: formData
    });

    const result = await res.json();
    if (!res.ok || result.status !== "success") {
      throw new Error(result.msg || "上传失败");
    }
    return result.data.url;
  } else {
    // 📦 大文件走分片逻辑
    // 1. 创建上传会话
    const sessionRes = await fetch(`${upload_url}/upload-session`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        file_name: file.name,
        file_size: file.size
      })
    });

    const sessionData = await sessionRes.json();
    if (sessionData.status !== 'success') {
      throw new Error('创建上传会话失败: ' + sessionData.msg);
    }

    const { uploadId, guid } = sessionData.data;

    // 2. 开始分片上传
    const chunkSize = 80 * 1024 * 1024; // 80MB
    let uploaded = 0;
    while (uploaded < file.size) {
      const end = Math.min(uploaded + chunkSize, file.size);
      const chunk = file.slice(uploaded, end);
      const contentRange = `bytes ${uploaded}-${end - 1}/${file.size}`;

      const res = await fetch(`${upload_url}/upload-chunk`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'X-Upload-Id': uploadId,
          'X-Upload-Guid': guid,
          'X-Content-Range': contentRange,
          'Content-Length': chunk.size
        },
        body: chunk
      });

      const json = await res.json();
      if (json.status !== 'success') {
        throw new Error(`上传失败 (${contentRange}): ${json.msg}`);
      }

      // 分片上传完成后可能带有最终地址
      if (json.data?.url) {
        return json.data.url;
      }

      uploaded = end;
    }

    throw new Error("上传完成但未获取到最终地址");
  }
}



const handleASL = async () => {
  spinning.value = true;
  await getUploadType();
  try {
    let imageUrls = [];

    if (uploadType.type === "microsoft") {

      for (let item of ASLForm.image_url) {
        const file = item.originFileObj;
        const uploadedUrl = await uploadFileToWorker(file);
        imageUrls.push(uploadedUrl);
      }
    }

    const formData = new FormData();
    formData.append('asl_type', ASLForm.asl_type);
    formData.append('asl_reason', ASLForm.asl_reason || '');

    if (uploadType.type === 'local') {
      for (let item of ASLForm.image_url) {
        formData.append('image_url', item.originFileObj);
      }
    } else if (uploadType.type === 'microsoft') {
      for (let imageurl of imageUrls) {
        formData.append('image_url', imageurl);
      }
    }

    const res = await api.post(`/asl/my/${currentCheckInUserId.value}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });

    const {msg, data} = res.data;
    const index = check_in_data.value.findIndex(ciu => ciu.id === currentCheckInUserId.value);
    if (index !== -1) {
      const newAsl = [...check_in_data.value[index].asl, {
        id: data.id,
        asl_reason: ASLForm.asl_reason,
        asl_type: ASLForm.asl_type,
        status: '待审核'
      }];
      check_in_data.value[index].asl = newAsl;
    }

    ASLForm.asl_type = null;
    ASLForm.asl_reason = null;
    ASLForm.image_url = [];
    visibleASL.value = false;
    message.success(msg);
  } catch (err) {
    message.error(err.message || '提交失败');
  } finally {
    spinning.value = false;
  }
};

// 查看签到确认框
const showConfirm = (id) => {
  Modal.confirm({
    title: '确认操作',
    icon: createVNode(ExclamationCircleOutlined),
    content: '确定删除此签到记录?',
    okText: '确认',
    cancelText: '取消',
    onOk() {
      cancelApplication(id);
    }
  });
};

const columns = [
  {
    title: '请假ID',
    dataIndex: 'id',
    width: '6.75%',
    customFilterDropdown: true,
    sorter: (a, b) => a.id - b.id,
    onFilter: (value, record) =>
        record.id.toString().toLowerCase().includes(value.toLowerCase()),
  },
  {
    title: '学籍号',
    dataIndex: ['check_in_user', 'user', 'studentId'],
    width: '6.75%',
    customFilterDropdown: true,
    onFilter: (value, record) =>
        record.check_in_user.user.studentId.toString().toLowerCase().includes(value.toLowerCase()),
  },
  {
    title: '姓名',
    dataIndex: ['check_in_user', 'user', 'name'],
    width: '6.75%',
    customFilterDropdown: true,
    onFilter: (value, record) =>
        record.check_in_user.user.name.toString().toLowerCase().includes(value.toLowerCase()),
  },
  {
    title: '值班ID',
    dataIndex: ['check_in_user', 'schedule', 'id'],
    width: '6.75%',
    customFilterDropdown: true,
    onFilter: (value, record) =>
        record.check_in_user.schedule.id.toString().toLowerCase().includes(value.toLowerCase()),
  },
  {
    title: '值班名称',
    dataIndex: ['check_in_user', 'schedule', 'schedule_name'],
    width: '6.75%',
    customFilterDropdown: true,
    onFilter: (value, record) =>
        record.check_in_user.chedule.chedule_name.toString().toLowerCase().includes(value.toLowerCase()),
  },
  {
    title: '值班开始时间',
    dataIndex: ['check_in_user', 'schedule', 'schedule_start_time'],
    width: '6.75%',
    customFilterDropdown: true,
    onFilter: (value, record) =>
        record.check_in_user.schedule.schedule_start_time.toString().toLowerCase().includes(value.toLowerCase()),
  },
  {
    title: '值班类型',
    dataIndex: ['check_in_user', 'schedule', 'schedule_type'],
    width: '6.75%',
    customFilterDropdown: true,
    onFilter: (value, record) =>
        record.check_in_user.schedule.schedule_type.toString().toLowerCase().includes(value.toLowerCase()),
  },
  {
    title: '签到ID',
    dataIndex: ['check_in_user', 'check_in', 'id'],
    width: '6.75%',
    customFilterDropdown: true,
    onFilter: (value, record) =>
        record.check_in_user.check_in.id.toString().toLowerCase().includes(value.toLowerCase()),
  },
  {
    title: '签到流水ID',
    dataIndex: ['check_in_user', 'id'],
    width: '6.75%',
    customFilterDropdown: true,
    onFilter: (value, record) =>
        record.check_in_user.id.toString().toLowerCase().includes(value.toLowerCase()),
  },
  {
    title: '审批状态',
    dataIndex: ['status'],
    width: '6.75%',
    customFilterDropdown: true,
    onFilter: (value, record) =>
        record.status.toString().toLowerCase().includes(value.toLowerCase()),
  },
  {
    title: '请假类型',
    dataIndex: 'asl_type',
    width: '6.75%',
    customFilterDropdown: true,
    onFilter: (value, record) =>
        record.asl_type.status.toString().toLowerCase().includes(value.toLowerCase()),
  },
  {
    title: '申请时间',
    dataIndex: 'created_at',
    width: '6.75%',
    customFilterDropdown: true,
    sorter: (a, b) => (new Date(a.created_at).getTime()) - (new Date(b.created_at).getTime()),
    onFilter: (value, record) =>
        record.created_at.toString().toLowerCase().includes(value.toLowerCase()),
  },
  {
    title: '操作',
    width: '6.75%',
    dataIndex: 'operation',
    fixed: 'right'
  }
];

const isShow = ref(true);

function handleResize(event) {
  // 页面宽度小于525px时，不显示表格
  if (document.documentElement.clientWidth < 979) {
    isShow.value = false;
  } else {
    isShow.value = true;
  }
}

const scroll = computed(() => {
  if (isShow.value === true) {
    return false
  } else {
    return {x: 1000}
  }
})

const applicationsData = ref([])

const listMyASLApplications = () => {
  spinning.value = true;
  api.get("/asl/my").then((res) => {
    let {data} = res.data;
    applicationsData.value = data;
    spinning.value = false;
  }).catch((err) => {
    let {msg} = err.response.data;
    spinning.value = false;
    message.error(msg);
  });
}

const visibleInfo = ref(false);
const currentASLApplicationId = ref(null);
const currentASLApplicationData = ref({})
const visiblePhotos = ref(false);
const showInfo = async (id) => {
  currentASLApplicationId.value = id;
  currentASLApplicationData.value = applicationsData.value.find(asl => asl.id === id);
  ASLForm.asl_type = currentASLApplicationData.value.asl_type;
  ASLForm.reject_reason = !currentASLApplicationData.value.reject_reason ? "" : currentASLApplicationData.value.reject_reason;
  visibleInfo.value = true;

  // 处理图片
  if (currentASLApplicationData.value.image_url && currentASLApplicationData.value.image_url.length > 0) {
    await loadImages();
  } else {
    images.value = [];
  }
}
const handleClose = () => {
  visibleInfo.value = false;
  currentASLApplicationId.value = null;
}

const images = ref([]);

const loadImages = async () => {
  images.value = []; // 清空旧图片
  image_spinning.value = true;
  await getUploadType();

  try {
    const imagePromises = currentASLApplicationData.value.image_url.map(async (imageRef) => {
      // 如果是 https 开头，说明是 Graph 上传的外链图片，直接用
      if (typeof imageRef === 'string' && imageRef.startsWith('https://')) {
        try {
          const response = await fetch(imageRef, {
            headers: {
              Authorization: `Bearer ${localStorage.access_token}`
            }
          });
          if (!response.ok) throw new Error('无法加载图片');

          const blob = await response.blob();
          return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.readAsDataURL(blob);
          });
        } catch (error) {
          console.error(`Graph 图片加载失败:`, error);
          return null;
        }
      }

      // 否则认为是本地文件名，需要从后端获取 Blob
      try {
        const response = await api.get(`/asl/my/photo/${currentASLApplicationId.value}/${imageRef}`, {
          responseType: 'blob' // 指定响应类型为 blob
        });

        return new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.readAsDataURL(response.data);
        });
      } catch (error) {
        console.error(`加载图片 ${imageRef} 失败:`, error);
        return null;
      }
    });

    const loadedImages = await Promise.all(imagePromises);
    images.value = loadedImages.filter(img => img !== null);

  } catch (error) {
    console.error('加载图片时出错:', error);
    message.error('加载图片失败');
  } finally {
    image_spinning.value = false;
  }
};

const cancelApplication = (id) => {
  spinning.value = true;
  api.get("/asl/my/cancel/" + id).then(res => {
    let {msg} = res.data;
    spinning.value = false;
    applicationsData.value.find(asl => asl.id === id).status = '已取消';
    check_in_data.value.find(ciu => ciu.asl.find(asl => asl.id === id)).asl.find(asl => asl.id === id).status = '已取消';
    message.success(msg);
  }).catch(err => {
    let {msg} = err.response.data;
    spinning.value = false;
    message.error(msg)
  })
}

const handleReset = clearFilters => {
  clearFilters({confirm: true});
  state.searchText = '';
};

const handleSearch = (selectedKeys, confirm, dataIndex) => {
  confirm();
  state.searchText = selectedKeys[0];
  state.searchedColumn = dataIndex;
};

const disableButton = computed(() => {
  return !ASLForm.asl_reason || ((typeof (ASLForm.image_url)) === 'object' && ASLForm.image_url.length === 0 && ASLForm.asl_type !== '事假') || (!ASLForm.image_url && ASLForm.asl_type !== '事假')
})

const uploadType = reactive({
  "type": "local",
})

// 获取存储类型和初始化token信息
const getUploadType = async () => {
  try {
    const res = await api.get("/security-history/storage-type");
    const {data} = res.data;
    uploadType.type = data.type;
    localStorage.setItem("storage_type", data.type);
  } catch (error) {
    message.error("由于驱动器类型不明，请假功能不可用，如需使用联系管理员。")
    throw error;
  }
}


</script>

<template>
  <a-layout-content :style="{margin: '16px', height: '100%'}">
    <h2 style="display: flex; justify-content: space-between;">
      <span>签到列表</span>
      <span style="margin-bottom: 4px;">
        <router-link to="/"><HomeOutlined/> 首页</router-link>
      </span>
    </h2>

    <a-tabs v-model:activeKey="activeKey" @update:activeKey="handleTabChange" type="card">
      <a-tab-pane key="waiting" tab="等待开始">
        <a-spin :spinning="spinning" tip="Loading...">
          <div v-if="filteredCheckInDataWaiting.length === 0">
            <Empty description="没有等待开始的签到"/>
          </div>
          <a-card v-for="item in currentWaitingPageData">
            <a-descriptions :title="item.check_in.name">
              <a-descriptions-item label="签到流水ID">{{ item.id }}</a-descriptions-item>
              <a-descriptions-item label="值班ID">{{ item.schedule.id }}</a-descriptions-item>
              <a-descriptions-item label="签到ID">{{ item.check_in.id }}</a-descriptions-item>
              <a-descriptions-item label="值班名称">{{ item.schedule.schedule_name }}</a-descriptions-item>
              <a-descriptions-item label="值班开始时间"><span
                  :style=" item.check_in.need_check_schedule_time ? {'color': 'red', 'font-weight': 'bold'} : {} ">{{
                  item.schedule.schedule_start_time
                }}</span></a-descriptions-item>
              <a-descriptions-item label="值班类型">{{ item.schedule.schedule_type }}</a-descriptions-item>
              <a-descriptions-item label="开始时间">{{ item.check_in.check_in_start_time }}</a-descriptions-item>
              <a-descriptions-item label="结束时间">{{ item.check_in.check_in_end_time }}</a-descriptions-item>
              <a-descriptions-item label="要求内网签到">{{
                  item.check_in.check_internal ? "是" : "否"
                }}
              </a-descriptions-item>
              <a-descriptions-item label="操作" v-if="item.check_in.is_main_check_in">
                <a-row>
                  <a-button type="primary" @click="showASL(item.id)"
                            :disabled="item.asl.filter(asl => asl.status === '已批准' || asl.status === '待审核').length !== 0">
                    请假申请
                  </a-button>
                </a-row>
              </a-descriptions-item>
            </a-descriptions>

          </a-card>
          <a-pagination align="center" style="margin-top: 8px;" v-model:current="currentWaitingPage" simple
                        pageSize="5"
                        :total="filteredCheckInDataWaiting.length"/>
        </a-spin>
      </a-tab-pane>

      <a-tab-pane key="started" tab="正在进行">
        <a-spin :spinning="spinning" tip="Loading...">
          <div v-if="filteredCheckInDataStarted.length === 0">
            <Empty description="没有正在进行的签到"/>
          </div>
          <a-card v-for="item in currentStartedPageData">
            <a-descriptions :title="'签到名称：' + item.check_in.name"
                            style="background-color: #FFFFFF; padding: 16px; box-sizing: border-box;">
              <a-descriptions-item label="签到流水ID">{{ item.id }}</a-descriptions-item>
              <a-descriptions-item label="值班ID">{{ item.schedule.id }}</a-descriptions-item>
              <a-descriptions-item label="签到ID">{{ item.check_in.id }}</a-descriptions-item>
              <a-descriptions-item label="值班名称">{{ item.schedule.schedule_name }}</a-descriptions-item>
              <a-descriptions-item label="值班开始时间"><span
                  :style=" item.need_check_schedule_time ? {'color': red} : {} ">{{
                  item.schedule.schedule_start_time
                }}</span></a-descriptions-item>
              <a-descriptions-item label="值班类型">{{ item.schedule.schedule_type }}</a-descriptions-item>
              <a-descriptions-item label="开始时间">{{ item.check_in.check_in_start_time }}</a-descriptions-item>
              <a-descriptions-item label="结束时间">{{ item.check_in.check_in_end_time }}</a-descriptions-item>
              <a-descriptions-item label="要求内网签到">{{
                  item.check_in.check_internal ? "是" : "否"
                }}
              </a-descriptions-item>
              <a-descriptions-item label="操作">
                <a-row>
                  <a-button type="primary" @click="checkin(item.check_in_id, item.id)"
                            :disabled="check_in_data.find(ciu => ciu.id === item.id).status !== '未签到'">签到
                  </a-button>
                </a-row>
              </a-descriptions-item>
            </a-descriptions>

          </a-card>
          <a-pagination align="center" style="margin-top: 8px;" v-model:current="currentStartedPage" simple
                        pageSize="5"
                        :total="filteredCheckInDataStarted.length"/>
        </a-spin>
      </a-tab-pane>
      <a-tab-pane key="ended" tab="已结束">
        <a-spin :spinning="spinning" tip="Loading...">
          <div v-if="filteredCheckInDataEnded.length === 0">
            <Empty description="没有已结束的签到"/>
          </div>
          <a-card v-for="item in currentEndedPageData">
            <a-descriptions :title="'签到名称：' + item.check_in.name"
                            style="background-color: #FFFFFF; padding: 16px; box-sizing: border-box;">
              <a-descriptions-item label="签到流水ID">{{ item.id }}</a-descriptions-item>
              <a-descriptions-item label="值班ID">{{ item.schedule.id }}</a-descriptions-item>
              <a-descriptions-item label="签到ID">{{ item.check_in.id }}</a-descriptions-item>
              <a-descriptions-item label="值班名称">{{ item.schedule.schedule_name }}</a-descriptions-item>
              <a-descriptions-item label="值班开始时间"><span
                  :style=" item.check_in.need_check_schedule_time ? {'color': 'red', 'font-weight': 'bold'} : {} ">{{
                  item.schedule.schedule_start_time
                }}</span></a-descriptions-item>
              <a-descriptions-item label="值班类型">{{ item.schedule.schedule_type }}</a-descriptions-item>
              <a-descriptions-item label="开始时间">{{ item.check_in.check_in_start_time }}</a-descriptions-item>
              <a-descriptions-item label="结束时间">{{ item.check_in.check_in_end_time }}</a-descriptions-item>
              <a-descriptions-item label="状态">{{ item.status }}</a-descriptions-item>
            </a-descriptions>
          </a-card>
          <a-pagination align="center" style="margin-top: 8px;" v-model:current="currentEndedPage" simple pageSize="5"
                        :total="filteredCheckInDataEnded.length"/>
        </a-spin>
      </a-tab-pane>
      <a-tab-pane key="asl" tab="请假历史">
        <a-spin :spinning="spinning" tip="Loading...">
          <a-table :columns="columns" :data-source="applicationsData" :scroll="scroll" bordered>
            <template
                #customFilterDropdown="{ setSelectedKeys, selectedKeys, confirm, clearFilters, column }"
            >
              <div style="padding: 8px">
                <a-input
                    ref="searchInput"
                    :placeholder="`Search ${column.dataIndex}`"
                    :value="selectedKeys[0]"
                    style="width: 188px; margin-bottom: 8px; display: block"
                    @change="e => setSelectedKeys(e.target.value ? [e.target.value] : [])"
                    @pressEnter="handleSearch(selectedKeys, confirm, column.dataIndex)"
                />
                <a-button
                    type="primary"
                    size="small"
                    style="width: 90px; margin-right: 8px"
                    @click="handleSearch(selectedKeys, confirm, column.dataIndex)"
                >
                  <template #icon>
                    <search-outlined/>
                  </template>
                  Search
                </a-button>
                <a-button size="small" style="width: 90px" @click="handleReset(clearFilters)">
                  Reset
                </a-button>
              </div>
            </template>
            <template #bodyCell="{ column, text, record }">
              <template
                  v-if="['studentId','name','schedule_name','schedule_start_time','schedule_type','id','status','asl_type','created_at'].includes(column.dataIndex)">
                <div>
                  {{ text }}
                </div>
              </template>

              <template v-else-if="column.dataIndex === 'operation'">
                <div class="editable-row-operations">
            <span>
              <a-button size="small" type="primary" ghost @click="showInfo(record.id)">查看</a-button>
              <a-button size="small" type="primary" ghost danger @click="showConfirm(record.id)"
                        :disabled="record.status !== '待审核'">取消</a-button>
            </span>
                </div>
              </template>
            </template>
          </a-table>
        </a-spin>
      </a-tab-pane>
    </a-tabs>
    <a-modal v-model:open="visibleASL" title="请假申请">
      <a-form
          :model="ASLForm"
          name="validate_other"
          v-bind="formItemLayout"
      >

        <a-form-item
            name="asl_type"
            label="请假类型"
            has-feedback
            :rules="[{ required: true, message: '请选择类型' }]"
        >
          <a-select v-model:value="ASLForm.asl_type" placeholder="选择请假类型">
            <a-select-option value="病假">病假</a-select-option>
            <a-select-option value="事假">事假</a-select-option>
            <a-select-option value="公务假">公务假</a-select-option>
            <a-select-option value="符合要求的赛事或集训">符合要求的赛事或集训</a-select-option>
          </a-select>
        </a-form-item>

        <a-form-item name="asl_reason" label="请假具体原因" :rules="[{ required: true }]">
          <a-textarea v-model:value="ASLForm.asl_reason"/>
        </a-form-item>

        <a-form-item has-feedback
                     :rules="ASLForm.asl_reason !== '事假' ? [{ required: true, message: '至少上传一张图片' }] : []"
                     name="image_url" label="上传图片" extra="证明材料">
          <a-upload
              v-model:fileList="ASLForm.image_url"
              name="pic1"
              list-type="picture"
              accept=".jpg,.jpeg,.png,.heic,.heif,.tiff,.jiff"
              :before-upload="true"
          >
            <a-button>
              <template #icon>
                <UploadOutlined/>
              </template>
              单击上传
            </a-button>
          </a-upload>
        </a-form-item>
      </a-form>
      <template #footer>
        <a-button type="primary" @click="handleCancel">关闭</a-button>
        <a-button type="primary" danger @click="handleASL" :loading="spinning" :disabled="disableButton">变更</a-button>
      </template>
    </a-modal>
    <a-modal v-model:open="visibleInfo" title="信息一览">
      <a-card title="值班信息">
        <p>请假ID: {{ currentASLApplicationData.id }}</p>
        <p>值班ID: {{ currentASLApplicationData.check_in_user.schedule.id }}</p>
        <p>签到ID: {{ currentASLApplicationData.check_in_user.check_in.id }}</p>
        <p>签到流水ID: {{ currentASLApplicationData.check_in_user.id }}</p>
        <p>值班名称: {{ currentASLApplicationData.check_in_user.schedule.schedule_name }}</p>
        <p>值班开始时间: <span
            :style=" currentASLApplicationData.check_in_user.check_in.need_check_schedule_time ? {'color': 'red', 'font-weight': 'bold'} : {} ">{{
            currentASLApplicationData.check_in_user.schedule.schedule_start_time
          }}</span></p>
        <p>值班类型: {{ currentASLApplicationData.check_in_user.schedule.schedule_type }}</p>
        <p>签到名称: {{ currentASLApplicationData.check_in_user.check_in.name }}</p>
        <p>签到开始时间: {{ currentASLApplicationData.check_in_user.check_in.check_in_start_time }}</p>
        <p>签到结束时间: {{ currentASLApplicationData.check_in_user.check_in.check_in_end_time }}</p>
        <p>主签到: {{ currentASLApplicationData.check_in_user.check_in.is_main_check_in ? "是" : "否" }}</p>
        <a-button type="primary" danger :disabled="currentASLApplicationData.status !== '待审核'">
          取消申请
        </a-button>
      </a-card>
      <a-card :title=" currentASLApplicationData.asl_type + '-' + '请假理由'">
        <p>请假人学籍号: {{ currentASLApplicationData.check_in_user.user.studentId }}</p>
        <p>请假人姓名: {{ currentASLApplicationData.check_in_user.user.name }}</p>
        <p>{{
            currentASLApplicationData.asl_reason
          }}</p>
        查看图片：
        <a-button type="primary" ghost :disabled="images.length === 0" @click="visiblePhotos = true;" :loading="image_spinning">查看照片
        </a-button>
      </a-card>

      <template #footer>
        <a-button type="primary" @click="handleClose">关闭</a-button>
      </template>
    </a-modal>
    <a-modal v-model:open="visiblePhotos" title="查看图片">
      <a-spin :spinning="spinning">
        <a-descriptions-item v-if="!images">
          <div
              style="height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center;">
            <a-empty :image="Empty.PRESENTED_IMAGE_SIMPLE" style="width: 100%;  "/>
          </div>
        </a-descriptions-item>
        <a-image-preview-group>
          <a-image v-for="i in images" :width="200"
                   fallback="data:image/png;base64,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"
                   :src="i"/>
        </a-image-preview-group>
      </a-spin>
      <template #footer>
        <a-button type="primary" @click="visiblePhotos = false;">OK</a-button>
      </template>
    </a-modal>
  </a-layout-content>
</template>

<style scoped>
.editable-row-operations a {
  margin-right: 8px;
}
</style>