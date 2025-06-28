<script setup>

import {reactive, ref, onMounted, computed} from 'vue';
import {HomeOutlined, SearchOutlined, UploadOutlined} from '@ant-design/icons-vue';
import {Empty, message, Table} from "ant-design-vue";
import api from "@/api";
import my_config from "@/my_config";

const isShow = ref(true);

function handleResize(event) {
  // 页面宽度小于525px时，不显示表格
  if (document.documentElement.clientWidth < 1180) {
    isShow.value = false;
  } else {
    isShow.value = true;
  }
}

const formItemLayout = {
  labelCol: {
    span: 6,
  },
  wrapperCol: {
    span: 14,
  },
};

window.addEventListener('resize', handleResize);

const state = reactive({
  searchText: '',
  searchedColumn: '',
});

const handleSearch = (selectedKeys, confirm, dataIndex) => {
  confirm();
  state.searchText = selectedKeys[0];
  state.searchedColumn = dataIndex;
};

const handleReset = clearFilters => {
  clearFilters({confirm: true});
  state.searchText = '';
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

const spinning = ref(false);

const listMyInfo = () => {
  spinning.value = true;
  api.get("/user/my").then((res) => {
    spinning.value = false;
    let {data} = res.data;
    if (data.is_admin === true) {
      data.is_admin = '是';
    } else {
      data.is_admin = '否';
    }
    if (['部长', '副部长', '部门负责人'].includes(data.position) || data.is_admin === '是') {
      listASLApplications();
    }
    userData.value = data;
  }).catch((err) => {
    let {msg} = err.response.data;
    message.error(msg);
  });
}

const applicationsData = ref([]);
const userData = ref([]);
const listASLApplications = () => {
  spinning.value = true;
  api.get("/asl").then((res) => {
    let {data} = res.data;
    applicationsData.value = data;
    spinning.value = false;
  }).catch((err) => {
    let {msg} = err.response.data;
    spinning.value = false;
    message.error(msg);
  });
}

onMounted(() => {
  handleResize();
  listMyInfo();
});

const scroll = computed(() => {
  if (isShow.value === true) {
    return false
  } else {
    return {x: 1500}
  }
})

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
  ASLForm.asl_type = null;
  ASLForm.status = "已拒绝";
  ASLForm.reject_reason = "";
}

const ASLForm = reactive({
  "asl_type": null,
  "reject_reason": "",
  "status": "已拒绝"
})

const handleASL = () => {
  spinning.value = true;
  api.patch("/asl/" + currentASLApplicationId.value, ASLForm).then(res => {
    let {msg} = res.data
    spinning.value = false;
    currentASLApplicationData.value.asl_type = ASLForm.asl_type;
    currentASLApplicationData.value.reject_reason = ASLForm.reject_reason;
    currentASLApplicationData.value.status = ASLForm.status;
    handleClose();
    message.success(msg)
  }).catch(err => {
    let {msg} = err.response.data;
    spinning.value = false;
    message.error(msg);
  })
}

const images = ref([]);

const loadImages = async () => {
  images.value = []; // 清空旧图片
  spinning.value = true;

  try {
    // 并行加载所有图片
    const imagePromises = currentASLApplicationData.value.image_url.map(async (photoName) => {
      try {
        const response = await api.get(`/asl/photo/${currentASLApplicationId.value}/${photoName}`, {
          responseType: 'blob' // 重要：指定响应类型为 blob
        });

        return new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.readAsDataURL(response.data);
        });
      } catch (error) {
        console.error(`加载图片 ${photoName} 失败:`, error);
        return null;
      }
    });

    // 等待所有图片加载完成
    const loadedImages = await Promise.all(imagePromises);
    images.value = loadedImages.filter(img => img !== null);

  } catch (error) {
    console.error('加载图片时出错:', error);
    message.error('加载图片失败');
  } finally {
    spinning.value = false;
  }
}

const showCleanPhoto = ref(false);

const cleanImageDate = reactive({
  'target_date': null
});

const cleanPhotos = () => {
  spinning.value = true;
  api.post("/asl/cleanup-images", cleanImageDate).then(res => {
    let {msg} = res.data;
    spinning.value = false;
    showCleanPhoto.value = false;
    message.success(msg)
  }).catch(err => {
    let {msg} = err.response.data;
    spinning.value = false;
    message.error(msg)
  })
}

const visibleASL = ref(false);
const visibleCheckInUsers = ref(false);
const checkInUserFilter = reactive({
  "start_time": null,
  "end_time": null,
  "type": 'checkin_time',
});
const checkInUsersData = ref([]);
const liseCheckInUsers = () => {
  spinning.value = true;
  checkInUserForm.check_in_user_ids = [];
  api.post("/checkin/checkinuser", checkInUserFilter).then(res => {
    let {msg, data} = res.data;
    // data = data.map(item => {
    //   if (item.check_in.is_main_check_in === true) {
    //     item.check_in.is_main_check_in = '是';
    //   } else {
    //     item.check_in.is_main_check_in = '否';
    //   }
    //   return item;
    // })
    console.log(data);
    checkInUsersData.value = data.filter(ciu => ciu.asl.filter(asl => asl.status === '已批准').length === 0);
    spinning.value = false;
  }).catch(err => {
    let {msg} = err.response.data;
    spinning.value = false;
    message.error(msg);
  })
}

const checkInUserColumns = [
  {
    title: '签到流水ID',
    dataIndex: 'id',
    width: '7%',
    customFilterDropdown: true,
    sorter: (a, b) => a.id - b.id,
    onFilter: (value, record) =>
        record.id.toString().toLowerCase().includes(value.toLowerCase())
  },
  {
    title: '学籍号',
    dataIndex: ['user', 'studentId'],
    width: '7%',
    customFilterDropdown: true,
    sorter: (a, b) => a.id - b.id,
    onFilter: (value, record) =>
        record.user.studentId.toString().toLowerCase().includes(value.toLowerCase())
  },
  {
    title: '姓名',
    dataIndex: ['user', 'name'],
    width: '7%',
    customFilterDropdown: true,
    sorter: (a, b) => a.id - b.id,
    onFilter: (value, record) =>
        record.user.name.toString().toLowerCase().includes(value.toLowerCase())
  },
  {
    title: '计划ID',
    dataIndex: ['schedule', 'id'],
    width: '7%',
    customFilterDropdown: true,
    sorter: (a, b) => a.id - b.id,
    onFilter: (value, record) =>
        record.schedule.id.toString().toLowerCase().includes(value.toLowerCase())
  },
  {
    title: '签到ID',
    dataIndex: ['check_in', 'id'],
    width: '7%',
    customFilterDropdown: true,
    onFilter: (value, record) =>
        record.check_in.id.toString().toLowerCase().includes(value.toLowerCase()),
  },
  {
    title: '计划名称',
    dataIndex: ['schedule', 'schedule_name'],
    width: '7%',
    customFilterDropdown: true,
    onFilter: (value, record) =>
        record.schedule.schedule_name.toString().toLowerCase().includes(value.toLowerCase()),
  },
  {
    title: '计划开始时间',
    dataIndex: ['schedule', 'schedule_start_time'],
    width: '12%',
    customFilterDropdown: true,
    sorter: (a, b) => (new Date(a.schedule_start_time).getTime()) - (new Date(b.schedule_start_time).getTime()),
    onFilter: (value, record) =>
        record.schedule.schedule_start_time.toString().toLowerCase().includes(value.toLowerCase())
  },
  {
    title: '计划类型',
    dataIndex: ['schedule', 'schedule_type'],
    width: '7%',
    customFilterDropdown: true,
    onFilter: (value, record) =>
        record.schedule.schedule_type.toString().toLowerCase().includes(value.toLowerCase())
  },
  {
    title: '签到名称',
    dataIndex: ['check_in', 'name'],
    width: '7%',
    customFilterDropdown: true,
    onFilter: (value, record) =>
        record.check_in.name.toString().toLowerCase().includes(value.toLowerCase())
  },
  {
    title: '签到开始时间',
    dataIndex: ['check_in', 'check_in_start_time'],
    width: '12%',
    customFilterDropdown: true,
    sorter: (a, b) => (new Date(a.check_in_start_time).getTime()) - (new Date(b.check_in_start_time).getTime()),
    onFilter: (value, record) =>
        record.check_in.check_in_start_time.toString().toLowerCase().includes(value.toLowerCase())
  },
  {
    title: '签到结束时间',
    dataIndex: ['check_in', 'check_in_end_time'],
    width: '12%',
    customFilterDropdown: true,
    sorter: (a, b) => (new Date(a.check_in_end_time).getTime()) - (new Date(b.check_in_end_time).getTime()),
    onFilter: (value, record) =>
        record.check_in.check_in_end_time.toString().toLowerCase().includes(value.toLowerCase())
  },
  {
    title: '主签到',
    dataIndex: ['check_in', 'is_main_check_in'],
    width: '7%',
    customFilterDropdown: true,
    onFilter: (value, record) => record.check_in.is_main_check_in.toString().toLowerCase().includes(value.toLowerCase())
  },
];

const checkInUserForm = reactive({
  "check_in_user_ids": [],
})

const onSelectChange = changableRowKeys => {
  checkInUserForm.check_in_user_ids = changableRowKeys;
};

const rowSelection = computed(() => {
  return {
    selectedRowKeys: checkInUserForm.check_in_user_ids,
    onChange: onSelectChange,
    hideDefaultSelections: true,
    selections: [Table.SELECTION_ALL, Table.SELECTION_INVERT, Table.SELECTION_NONE],
  };
});

const handleCancelSelect = () => {
  visibleCheckInUsers.value = false;
  checkInUserForm.check_in_user_ids = [];
}

const newASLForm = reactive({
  "asl_type": null,
  "asl_reason": null,
  "image_url": null
})

const createASL = async () => {
  try {
    let ASLPromises
    if (checkInUserForm.check_in_user_ids.length <= 6) {
      let formData = new FormData();
      for (let item of newASLForm.image_url) {
        formData.append('image_url', item.originFileObj)
      }
      formData.append("asl_type", newASLForm.asl_type)
      formData.append("asl_reason", newASLForm.asl_reason)
      ASLPromises = checkInUserForm.check_in_user_ids.map(ciu => {
        return api.post("/asl/" + ciu, formData, {
          headers: {
            'Content-Type': "multipart/form-data"
          }
        });
      });
    } else {
      ASLPromises = checkInUserForm.check_in_user_ids.map(ciu => {
        return api.post("/asl/" + ciu, {
          "asl_type": newASLForm.asl_type,
          "asl_reason": newASLForm.asl_reason
        }, {
          headers: {
            'Content-Type': "multipart/form-data"
          }
        });
      });
    }

    const results = await Promise.all(ASLPromises);

    results.forEach((res, index) => {

      // 更新 ciu 只在请求成功时
      const ASLCIUId = checkInUserForm.check_in_user_ids[index]; // 获取当前删除的排班 ID
      checkInUserForm.check_in_user_ids = checkInUserForm.check_in_user_ids.filter(ciu => ciu.id !== ASLCIUId);

    });
    message.success("已执行补充请假")

    // 清空选中的ciu ID
    checkInUserForm.check_in_user_ids.value = [];
    visibleASL.value = false;
    listASLApplications();
  } catch (err) {
    console.log(err);
    const {msg} = err.response.data;
    openNotification("补充请假失败", msg); // 使用通知组件
  }
}


</script>

<template>
  <a-layout-content
      :style="{margin: '16px'}"
  >
    <h2 style="display: flex; justify-content: space-between;">
      <span>请假管理</span><span style=" margin-bottom: 4px;"><router-link to="/"><HomeOutlined/> 首页</router-link></span>
    </h2>

    <div style="padding: 8px; background-color: #FFFFFF">
      <a-row justify="end">
        <a-button type="primary" style="margin: 8px; " @click="showCleanPhoto = true;" v-if="userData.is_admin" danger
                  ghost>清空指定日期前的照片
        </a-button>
        <a-button type="primary" style="margin: 8px; " @click="visibleASL = true;" ghost>补充请假</a-button>
      </a-row>
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
              <a-button size="small" type="primary" ghost @click="showInfo(record.id)">审批</a-button>
            </span>
              </div>
            </template>
          </template>
        </a-table>

      </a-spin>
    </div>
    <a-modal v-model:open="visibleInfo" title="请假审批">
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

      </a-card>
      <a-card :title=" currentASLApplicationData.asl_type + '-' + '请假理由'">
        <p>请假人学籍号: {{ currentASLApplicationData.check_in_user.user.studentId }}</p>
        <p>请假人姓名: {{ currentASLApplicationData.check_in_user.user.name }}</p>
        <p>{{
            currentASLApplicationData.asl_reason
          }}</p>
        查看图片：
        <a-button type="primary" ghost :disabled="images.length === 0" @click="visiblePhotos = true;">查看照片
        </a-button>
      </a-card>

      <a-card title="审批">
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

          <a-form-item name="reject_reason" label="审批意见"
                       :rules="ASLForm.asl_type === '已批准' ? [{'required': false}] : [{'required': true}]">
            <a-textarea v-model:value="ASLForm.reject_reason"/>
          </a-form-item>

          <a-form-item
              name="status"
              label="选择审批结果"
              has-feedback
              :rules="[{ required: true, message: '请选择类型' }]"
          >
            <a-select v-model:value="ASLForm.status" placeholder="选择审批结果">
              <a-select-option value="已拒绝">已拒绝</a-select-option>
              <a-select-option value="已批准">已批准</a-select-option>
            </a-select>
          </a-form-item>
        </a-form>
      </a-card>
      <template #footer>
        <a-button type="primary" @click="handleClose">关闭</a-button>
        <a-button type="primary" danger @click="handleASL" :loading="spinning" :disabled="ASLForm.status === '已拒绝' && !ASLForm.reject_reason">变更</a-button>
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
    <a-modal v-model:open="showCleanPhoto" title="清理指定日期前的照片">
      <a-spin :spinning="spinning">
        <a-form
            :model="cleanImageDate"
            name="validate_other"
            v-bind="formItemLayout"
        >

          <a-form-item
              name="target_date"
              label="指定日期"
              has-feedback
              :rules="[{ required: true, message: '请选择类型' }]"
          >
            <a-date-picker v-model:value="cleanImageDate.target_date" placeholder="选择年-月-日"
                           valueFormat="YYYY-MM-DD"/>
          </a-form-item>

        </a-form>

      </a-spin>
      <template #footer>
        <a-button type="primary" @click="showCleanPhoto = false">取消</a-button>
        <a-button type="primary" danger @click="cleanPhotos" :disabled="!cleanImageDate.target_date">删除</a-button>
      </template>
    </a-modal>
    <a-modal v-model:open="visibleASL" title="补充请假">
      <a-col style="margin-bottom: 8px;">
        <a-form
            :model="newASLForm"
            name="validate_other"
            v-bind="formItemLayout"
        >

          <a-form-item
              name="asl_type"
              label="请假类型"
              has-feedback
              :rules="[{ required: true, message: '请选择类型' }]"
          >
            <a-select v-model:value="newASLForm.asl_type" placeholder="选择请假类型">
              <a-select-option value="病假">病假</a-select-option>
              <a-select-option value="事假">事假</a-select-option>
              <a-select-option value="公务假">公务假</a-select-option>
              <a-select-option value="符合要求的赛事或集训">符合要求的赛事或集训</a-select-option>
            </a-select>
          </a-form-item>

          <a-form-item name="asl_reason" label="请假具体原因" :rules="[{ required: true }]">
            <a-textarea v-model:value="newASLForm.asl_reason"/>
          </a-form-item>
          <a-form-item label="选择签到流水">
            <a-button @click="visibleCheckInUsers = true;">查询未请假的签到流水</a-button>
            <p>当前选择的流水ID: {{ checkInUserForm.check_in_user_ids }}</p>
            <p style="color: red;">请注意：选择超过5个流水将忽略图片上传。</p>
          </a-form-item>
          <a-form-item has-feedback
                       :rules="newASLForm.asl_reason !== '事假' ? [{ required: true, message: '至少上传一张图片' }] : []"
                       name="image_url" label="上传图片" extra="证明材料">
            <a-upload
                v-model:fileList="newASLForm.image_url"
                name="pic1"
                list-type="picture"
                :before-upload="true"
            >
              <a-button :disabled="checkInUserForm.check_in_user_ids.length >= 6">
                <template #icon>
                  <UploadOutlined/>
                </template>
                单击上传
              </a-button>
            </a-upload>
          </a-form-item>


        </a-form>
      </a-col>

      <template #footer>
        <a-button type="primary" danger @click="visibleASL = false;">取消</a-button>
        <a-button type="primary" @click="createASL"
                  :disabled="checkInUserForm.check_in_user_ids.length===0 || !newASLForm.asl_type || !newASLForm.asl_reason || !newASLForm.asl_reason">
          变更
        </a-button>
      </template>
    </a-modal>
    <a-modal title="查询未请假的签到流水" width="100%" wrap-class-name="full-modal" v-model:open="visibleCheckInUsers">
      <a-form layout="inline">
        <a-form-item label="开始时间">
          <a-date-picker v-model:value="checkInUserFilter.start_time"
                         format="YYYY-MM-DD HH:mm:ss"
                         show-time
                         valueFormat="YYYY-MM-DD HH:mm:ss"/>
        </a-form-item>
        <a-form-item label="结束时间">
          <a-date-picker v-model:value="checkInUserFilter.end_time"
                         format="YYYY-MM-DD HH:mm:ss"
                         show-time
                         valueFormat="YYYY-MM-DD HH:mm:ss"/>
        </a-form-item>
        <a-form-item>
          <a-button type="primary" @click="liseCheckInUsers" :disabled="!checkInUserFilter.start_time || !checkInUserFilter.end_time">查询</a-button>
        </a-form-item>
        <a-radio-group v-model:value="checkInUserFilter.type" :options="[
                {
                    label: '根据值班时间',
                    value: 'schedule_time'
                },
                {
                    label: '根据签到时间',
                    value: 'checkin_time'
                }
            ]"/>
      </a-form>
      <a-spin :spinning="spinning">
        <a-table :row-selection="rowSelection" :row-key="record => record.id" :columns="checkInUserColumns"
                 :data-source="checkInUsersData" :scroll="scroll" bordered>
          <template #customFilterDropdown="{ setSelectedKeys, selectedKeys, confirm, clearFilters, column }">
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
            <template v-if="['studentId', 'name', 'is_main_check_in'].includes(column.dataIndex)">
              <div>
                {{ text }}
              </div>
            </template>
          </template>
        </a-table>
      </a-spin>
      <template #footer>
        <a-button type="primary" danger @click="handleCancelSelect">放弃选择</a-button>
        <a-button type="primary" @click="visibleCheckInUsers=false;" :disabled="(typeof(checkInUserForm.check_in_user_ids) === 'object' && checkInUserForm.check_in_user_ids.length === 0) || !checkInUserForm.check_in_user_ids">保存选择</a-button>
      </template>
    </a-modal>
  </a-layout-content>
</template>

<style scoped>

</style>