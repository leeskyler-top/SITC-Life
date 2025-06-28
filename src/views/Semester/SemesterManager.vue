<script setup>
import {onMounted, reactive, ref} from 'vue';
import {
  InfoCircleOutlined,
  LockOutlined,
  HomeOutlined
} from '@ant-design/icons-vue';
import api from "@/api";
import {message} from "ant-design-vue";

const formState = reactive({
  start_month: '',
  end_month: '',
  semester_name: '',
});

const visible = ref(false);
const is_admin = ref(localStorage.is_admin);

const rules = {
  semester_name: [{
    required: true,
    message: "请输入学期名",
    trigger: 'change',
  }],
  start_month: [{
    required: true,
    message: "起始月份",
    trigger: 'change',
  }],
  end_month: [{
    required: true,
    message: "结束月份",
    trigger: 'change',
  }],
};
const layout = {
  labelCol: {
    span: 4,
  },
  wrapperCol: {
    span: 14,
  },
};
const menu = ref("myInfo");

function changeMenu(op) {
  menu.value = op;
}

const openModal = () => {
  visible.value = true;
  formState.semester_name = myData.value.semester_name
  formState.start_month = myData.value.start_month
  formState.end_month = myData.value.end_month
}

const handleCancel = () => {
  visible.value = false;
};


const myData = ref({});
const spinning = ref(false);
const fetchSemesterInfo = () => {
  spinning.value = true;
  api.get("/semester").then((res) => {
    spinning.value = false;
    let {data} = res.data;
    myData.value = data;
  }).catch((err) => {
    let {msg} = err.response.data;
    message.error(msg);
  });
}

const loading = ref(false);

const updateSemester = () => {
  loading.value = true;
  api.post("/semester", formState).then((res) => {
    loading.value = false;
    let {msg} = res.data;
    message.success(msg);
  }).catch((err) => {
    let {msg} = err.response.data;
    loading.value = false;
    message.error(msg);
  });
}

const formItemLayout = {
  labelCol: {
    span: 6,
  },
  wrapperCol: {
    span: 14,
  },
};

onMounted(() => {
  fetchSemesterInfo();
});


</script>
<template>
  <a-layout-content
      :style="{margin: '16px'}"
  >
    <h2 style="display: flex; justify-content: space-between;">
      <span>学期配置</span>
      <span>
        <a-button type="primary" style="margin-right: 16px; " ghost @click="openModal" v-if="is_admin === 'true'">编辑当前配置</a-button>
        <router-link to="/"><HomeOutlined/> 首页</router-link>
      </span>
    </h2>
    <a-row justify="end">
    </a-row>
    <div :style="{ background: '#fff', padding: '24px'}">

      <a-spin :spinning="spinning" tip="Loading...">
        <a-descriptions bordered>
          <a-descriptions-item label="学期">{{ myData.semester_name }}</a-descriptions-item>
          <a-descriptions-item label="开始时间">{{ myData.start_month }}</a-descriptions-item>
          <a-descriptions-item label="结束时间">{{ myData.end_month }}</a-descriptions-item>
        </a-descriptions>
      </a-spin>
    </div>
    <a-modal v-model:open="visible" title="修改学期配置">
      <a-form
          :model="formState"
          name="validate_other"
          v-bind="formItemLayout"
          :rules="rules"
      >
        <a-form-item name="semester_name" label="学期名称" :rules="[{ required: true }]">
          <a-input v-model:value="formState.semester_name"/>
        </a-form-item>
        <a-form-item name="start_month" label="开始时间" :rules="[{ required: true }]">
          <a-date-picker picker="month" v-model:value="formState.start_month" placeholder="选择年-月-日"
                         valueFormat="YYYY-MM"/>
        </a-form-item>
        <a-form-item name="end_month" label="结束时间" :rules="[{ required: true }]">
          <a-date-picker picker="month" v-model:value="formState.end_month" placeholder="选择年-月-日"
                         valueFormat="YYYY-MM"/>
        </a-form-item>
      </a-form>
      <template #footer>
        <a-button type="primary" @click="handleCancel">关闭</a-button>
        <a-button type="primary" danger @click="updateSemester" :disabled="!formState.semester_name || !formState.start_month || !formState.end_month">变更</a-button>
      </template>
    </a-modal>
  </a-layout-content>

</template>

<style>

</style>