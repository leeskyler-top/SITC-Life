<script setup>
import {reactive, ref, onMounted, computed, createVNode} from "vue";
import {ExclamationCircleOutlined, UploadOutlined, HomeOutlined} from '@ant-design/icons-vue';
import {Empty, message, Modal, Spin, Table} from "ant-design-vue";
import api from "@/api";

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

const checkin = (id) => {
  spinning.value = true;
  api.get("/checkin/checkin/" + id).then(res => {
    let {msg} = res.data;
    check_in_data.value = check_in_data.value.filter(x => x.id !== id)
    message.success(msg);
  }).catch(err => {
    let {msg} = err.response.data;
    message.error(msg);
  }).finally(() => {
    spinning.value = false; // 加载完成
  });
};

onMounted(() => {
  listMyCheckIns();
});

// 切换标签时更新当前显示的数据
const handleTabChange = (key) => {
  activeKey.value = key;
  // 这里可以增加需要的逻辑或状态更新
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


const handleASL = () => {
  let formData = new FormData();
  for (let item of ASLForm.image_url) {
    formData.append('image_url', item.originFileObj)
  }
  formData.append("asl_type", ASLForm.asl_type)
  formData.append("asl_reason", ASLForm.asl_reason)
  api.post("/asl/my/" + currentCheckInUserId.value, formData, {
    headers: {
      'Content-Type': "multipart/form-data"
    }
  }).then(res => {
    let {msg} = res.data;
    spinning.value = false;
    ASLForm.asl_type = null;
    ASLForm.asl_reason = null;
    ASLForm.image_url = [];
    message.success(msg);
  }).catch(err => {
    let {msg} = err.response.data;
    spinning.value = false;
    message.error(msg);
  });
}

// 查看签到确认框
const showConfirm = (id) => {
  Modal.confirm({
    title: '确认操作',
    icon: createVNode(ExclamationCircleOutlined),
    content: '确定删除此签到记录?',
    okText: '确认',
    cancelText: '取消',
    onOk() {
      // 删除逻辑在此
    }
  });
};

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
              <a-descriptions-item label="值班ID">{{ item.schedule.id }}</a-descriptions-item>
              <a-descriptions-item label="值班名称">{{ item.schedule.schedule_name }}</a-descriptions-item>
              <a-descriptions-item label="值班开始时间"><span :style=" item.check_in.need_check_schedule_time ? {'color': 'red', 'font-weight': 'bold'} : {} ">{{ item.schedule.schedule_start_time }}</span></a-descriptions-item>
              <a-descriptions-item label="值班类型">{{ item.schedule.schedule_type }}</a-descriptions-item>
              <a-descriptions-item label="开始时间">{{ item.check_in.check_in_start_time }}</a-descriptions-item>
              <a-descriptions-item label="结束时间">{{ item.check_in.check_in_end_time }}</a-descriptions-item>
              <a-descriptions-item label="操作" v-if="item.check_in.is_main_check_in">
                <a-row>
                  <a-button type="primary" @click="showASL(item.id)" :disabled="item.asl.filter(asl => asl.status === '已批准' || asl.status === '待审核').length !== 0">请假申请
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
            <a-descriptions  :title="'签到名称：' + item.check_in.name"
                            style="background-color: #FFFFFF; padding: 16px; box-sizing: border-box;">
              <a-descriptions-item label="值班ID">{{ item.schedule.id }}</a-descriptions-item>
              <a-descriptions-item label="值班名称">{{ item.schedule.schedule_name }}</a-descriptions-item>
              <a-descriptions-item label="值班开始时间"><span :style=" item.need_check_schedule_time ? {'color': red} : {} ">{{ item.schedule.schedule_start_time }}</span></a-descriptions-item>
              <a-descriptions-item label="值班类型">{{ item.schedule.schedule_type }}</a-descriptions-item>
              <a-descriptions-item label="开始时间">{{ item.check_in.check_in_start_time }}</a-descriptions-item>
              <a-descriptions-item label="结束时间">{{ item.check_in.check_in_end_time }}</a-descriptions-item>
              <a-descriptions-item label="状态">{{ item.status }}</a-descriptions-item>
              <a-descriptions-item label="操作">
                <a-row>
                  <a-button type="primary" @click="checkin(item.check_in_id)">签到
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
            <a-descriptions  :title="'签到名称：' + item.check_in.name"
                            style="background-color: #FFFFFF; padding: 16px; box-sizing: border-box;">
              <a-descriptions-item label="值班ID">{{ item.schedule.id }}</a-descriptions-item>
              <a-descriptions-item label="值班名称">{{ item.schedule.schedule_name }}</a-descriptions-item>
              <a-descriptions-item label="值班开始时间"><span :style=" item.need_check_schedule_time ? {'color': red} : {} ">{{ item.schedule.schedule_start_time }}</span></a-descriptions-item>
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
                     :rules="ASLForm.asl_reason !== '事假' ? [{ required: true, message: '至少上传一张图片' }] : []" name="image_url" label="上传图片" extra="证明材料">
          <a-upload
              v-model:fileList="ASLForm.image_url"
              name="pic1"
              list-type="picture"
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
        <a-button type="primary" danger @click="handleASL" :loading="spinning">变更</a-button>
      </template>
    </a-modal>
  </a-layout-content>
</template>

<style scoped>
.editable-row-operations a {
  margin-right: 8px;
}
</style>