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
  return check_in_data.value.filter(item => item.status === "缺勤");
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
          <a-space direction="vertical" :size="5">
            <a-descriptions v-for="item in currentWaitingPageData" :title="'签到名称：' + item.check_in.name"
                            style="background-color: #FFFFFF; padding: 16px; box-sizing: border-box;">
              <a-descriptions-item label="开始时间">{{ item.check_in.check_in_start_time }}</a-descriptions-item>
              <a-descriptions-item label="结束时间">{{ item.check_in.check_in_end_time }}</a-descriptions-item>
              <a-descriptions-item label="状态">{{ item.status }}</a-descriptions-item>
            </a-descriptions>
            <a-pagination align="center" style="margin-top: 8px;" v-model:current="currentWaitingPage" simple
                          pageSize="5"
                          :total="filteredCheckInDataWaiting.length"/>
          </a-space>
        </a-spin>
      </a-tab-pane>

      <a-tab-pane key="started" tab="正在进行">
        <a-spin :spinning="spinning" tip="Loading...">
          <div v-if="filteredCheckInDataStarted.length === 0">
            <Empty description="没有正在进行的签到"/>
          </div>
          <a-space direction="vertical" :size="5">
            <a-descriptions v-for="item in currentStartedPageData" :title="'签到名称：' + item.check_in.name"
                            style="background-color: #FFFFFF; padding: 16px; box-sizing: border-box;">
              <a-descriptions-item label="开始时间">{{ item.check_in.check_in_start_time }}</a-descriptions-item>
              <a-descriptions-item label="结束时间">{{ item.check_in.check_in_end_time }}</a-descriptions-item>
              <a-descriptions-item label="状态">{{ item.status }}</a-descriptions-item>
              <a-descriptions-item label="操作">
                <a-row>
                  <a-button type="primary" @click="checkin(item.check_in_id)" :disabled="item.status !== '未签到'">签到
                  </a-button>
                </a-row>
              </a-descriptions-item>
            </a-descriptions>
            <a-pagination align="center" style="margin-top: 8px;" v-model:current="currentStartedPage" simple
                          pageSize="5"
                          :total="filteredCheckInDataStarted.length"/>
          </a-space>
        </a-spin>
      </a-tab-pane>

      <a-tab-pane key="ended" tab="已结束">
        <a-spin :spinning="spinning" tip="Loading...">
          <div v-if="filteredCheckInDataEnded.length === 0">
            <Empty description="没有已结束的签到"/>
          </div>
          <a-space direction="vertical" :size="5">
            <a-descriptions v-for="item in currentEndedPageData" :title="'签到名称：' + item.check_in.name"
                            style="background-color: #FFFFFF; padding: 16px; box-sizing: border-box;">
              <a-descriptions-item label="开始时间">{{ item.check_in.check_in_start_time }}</a-descriptions-item>
              <a-descriptions-item label="结束时间">{{ item.check_in.check_in_end_time }}</a-descriptions-item>
              <a-descriptions-item label="状态">{{ item.status }}</a-descriptions-item>
              <a-descriptions-item label="操作">
                <a-row>
                  <a-button type="primary" @click="checkin(item.id)" :disabled="item.status !== 'unsigned'">签到
                  </a-button>
                </a-row>
              </a-descriptions-item>
            </a-descriptions>
            <a-pagination align="center" style="margin-top: 8px;" v-model:current="currentEndedPage" simple pageSize="5"
                          :total="filteredCheckInDataEnded.length"/>
          </a-space>
        </a-spin>
      </a-tab-pane>
    </a-tabs>
  </a-layout-content>
</template>

<style scoped>
.editable-row-operations a {
  margin-right: 8px;
}
</style>