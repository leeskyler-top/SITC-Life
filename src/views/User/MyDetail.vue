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
  old_password: '',
  new_password: '',
  confirm_password: '',
});
let validatePass = async (_rule, value) => {
  if (value === '') {
    return Promise.reject('请再次输入密码');
  } else if (value !== formState.new_password) {
    return Promise.reject("两次密码不一致!");
  } else {
    return Promise.resolve();
  }
};
const rules = {
  old_password: [{
    required: true,
    message: "请输入旧密码",
    trigger: 'change',
  }],
  new_password: [{
    required: true,
    message: "请输入新密码",
    trigger: 'change',
  }],
  confirm_password: [{
    required: true,
    validator: validatePass,
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

const myData = ref({});
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
    if (data.resident === true) {
      data.resident = '是';
    } else {
      data.resident = '否';
    }
    myData.value = data;
  }).catch((err) => {
    let {msg} = err.response.data;
    message.error(msg);
  });
}
const loading = ref(false);
const changePwd = () => {
  loading.value = true;
  api.patch("/user/pwd/update", formState).then((res) => {
    loading.value = false;
    let {msg} = res.data;
    message.success(msg);
  }).catch((err) => {
    let {msg} = err.response.data;
    loading.value = false;
    message.error(msg);
  });
}

onMounted(() => {
  listMyInfo();
});


</script>
<template>
  <a-layout-content
      :style="{margin: '16px'}"
  >
    <h2 style="display: flex; justify-content: space-between;">
      <span>我的资料</span><span style=" margin-bottom: 4px;"><router-link to="/"><HomeOutlined/> 首页</router-link></span>
    </h2>
    <a-row :style="{ background: '#fff', padding: '24px'}">

      <a-col :lg="{span: 8}" :md="{span: 24}" :sm="{span: 24}" :xs="{span: 24}" style="max-width: 200px;">
        <a-menu>
          <a-menu-item key="1" @click="changeMenu('myInfo')">
            <template #icon>
              <info-circle-outlined/>
            </template>
            账户信息
          </a-menu-item>
          <a-menu-item key="2" @click="changeMenu('changePwd')">
            <template #icon>
              <lock-outlined/>
            </template>
            密码变更
          </a-menu-item>
        </a-menu>
      </a-col>

      <a-col v-if="menu === 'myInfo'" :lg="{span: 16}" :md="{span: 24}" :sm="{span: 24}" :xs="{span: 24}"
             style=" padding: 0 16px;">
        <a-spin :spinning="spinning" tip="Loading...">
          <a-descriptions title="用户详情" bordered>
            <a-descriptions-item label="姓名">{{ myData.name }}</a-descriptions-item>
            <a-descriptions-item label="学籍号">{{ myData.studentId }}</a-descriptions-item>
            <a-descriptions-item label="系部">{{ myData.department }}</a-descriptions-item>
            <a-descriptions-item label="班级">{{ myData.classname }}</a-descriptions-item>
            <a-descriptions-item label="政治面貌" :span="3">{{ myData.politicalLandscape }}</a-descriptions-item>
            <a-descriptions-item label="职务">{{ myData.position }}</a-descriptions-item>
            <a-descriptions-item label="住宿">{{ myData.resident }}</a-descriptions-item>
            <a-descriptions-item label="管理员">{{ myData.is_admin }}</a-descriptions-item>
            <a-descriptions-item label="手机">{{ myData.phone }}</a-descriptions-item>
            <a-descriptions-item label="QQ">{{ myData.qq }}</a-descriptions-item>
            <a-descriptions-item label="入部时间">{{ myData.join_at }}</a-descriptions-item>
            <a-descriptions-item label="创建日期" :span="3">{{ myData.created_at }}</a-descriptions-item>
            <a-descriptions-item label="备注" :span="3">{{ myData.note }}</a-descriptions-item>

          </a-descriptions>
        </a-spin>
      </a-col>
      <a-col v-if="menu === 'changePwd'" :lg="{span: 16}" :md="{span: 24}" :sm="{span: 24}" :xs="{span: 24}"
             style=" padding: 0 16px;">
        <h2 class="ant-descriptions-title"> 密码更改 </h2>
        <a-form
            name="custom-validation"
            :model="formState"
            :rules="rules"
            v-bind="layout"
            @submit="changePwd"
            layout="vertical"
        >
          <a-form-item has-feedback label="旧密码" name="old_password" style="padding-top: 4px;">
            <a-input v-model:value="formState.old_password" type="password" autocomplete="off"/>
          </a-form-item>
          <a-form-item has-feedback label="新密码" name="new_password">
            <a-input v-model:value="formState.new_password" type="password" autocomplete="off"/>
          </a-form-item>
          <a-form-item has-feedback label="确认密码" name="confirm_password">
            <a-input v-model:value="formState.confirm_password" type="password" autocomplete="off"/>
          </a-form-item>
          <a-form-item>
            <a-button type="primary" html-type="submit" :loading="loading" :disabled="!formState.old_password || !formState.new_password || !formState.confirm_password || (formState.new_password !== formState.confirm_password)">提交</a-button>
          </a-form-item>
        </a-form>

      </a-col>
    </a-row>
  </a-layout-content>

</template>

<style>

</style>