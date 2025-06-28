<script setup>
import {computed, reactive, ref} from "vue";
import api from "@/api";
import dayjs from 'dayjs';
import 'dayjs/locale/zh-cn';
import {message} from "ant-design-vue";
import {
  HomeOutlined
} from '@ant-design/icons-vue';

const formItemLayout = {
  labelCol: {
    span: 6,
  },
  wrapperCol: {
    span: 14,
  },
};

const formState = reactive({
  studentId: '',
  position: '普通部员',
  name: '',
  department: '',
  classname: '',
  gender: '',
  resident:  false,
  is_admin: false,
  phone: '',
  politicalLandscape: '群众',
  qq: '',
  join_at: '',
  note: '',
});


const validateMessages = {
  required: '${label} 必填!',
  types: {
    email: '${label} 非法邮箱格式',
  },
};
const loading = ref(false)
const addUser = () => {
  loading.value = true;
  api.post("/user", formState).then((res) => {
    loading.value = false;
    let {msg} = res.data;
    message.success(msg);
    formState.studentId = '';
    formState.name = '';
    formState.department = '';
    formState.classname = '';
    formState.resident = false;
    formState.position = '普通部员'
    formState.is_admin = false;
    formState.phone = "";
    formState.gender = "";
    formState.politicalLandscape = "群众";
    formState.qq = "";
    formState.note = '';
  }).catch((err) => {
    let {msg} = err.response.data;
    loading.value = false;
    message.error(msg);
  });
}

const disableButton = computed(() => {
  return !formState.studentId || !formState.name || !formState.department || !formState.classname || !formState.gender || !formState.join_at || !formState.phone
})

</script>

<template>
  <a-layout-content
      :style="{margin: '16px'}"
  >
    <h2 style="display: flex; justify-content: space-between;">
      <span>用户添加</span><span style=" margin-bottom: 4px;"><router-link to="/"><HomeOutlined/> 首页</router-link></span>
    </h2>
    <a-row>
      <a-col :span="24" style="padding: 24px; background-color: #FFFFFF">
        <a-form
            :model="formState"
            name="validate_other"
            v-bind="formItemLayout"
            :validate-messages="validateMessages"
            @submit="addUser"
            style="max-width: 500px;"

        >
          <a-form-item
              name="position"
              label="职务"
              has-feedback
              :rules="[{ required: true, message: '请选择角色' }]"
          >
            <a-select v-model:value="formState.position" placeholder="选择用户角色">
              <a-select-option value="普通部员">普通部员</a-select-option>
              <a-select-option value="实习部员">实习部员</a-select-option>
              <a-select-option value="汇总负责人">汇总负责人</a-select-option>
              <a-select-option value="实习汇总负责人">实习汇总负责人</a-select-option>
              <a-select-option value="部门负责人">部门负责人（锻炼岗）</a-select-option>
              <a-select-option value="副部长">副部长</a-select-option>
              <a-select-option value="部长">部长</a-select-option>
            </a-select>
          </a-form-item>
          <a-form-item name="studentId" label="学籍号" :rules="[{ required: true }]">
            <a-input v-model:value="formState.studentId"/>
          </a-form-item>
          <a-form-item name="name" label="姓名" :rules="[{ required: true }]">
            <a-input v-model:value="formState.name"/>
          </a-form-item>
          <a-form-item name="department" label="系部" :rules="[{ required: true }]">
            <a-select v-model:value="formState.department" placeholder="选择用户角色">
              <a-select-option value="信息技术系">信息技术系</a-select-option>
              <a-select-option value="智能制造系">智能制造系</a-select-option>
              <a-select-option value="材料与检测系">材料与检测系</a-select-option>
              <a-select-option value="商务管理系">商务管理系</a-select-option>
              <a-select-option value="公共基础部">公共基础部</a-select-option>
              <a-select-option value="校团委">校团委</a-select-option>
              <a-select-option value="其它">其它</a-select-option>
            </a-select>
          </a-form-item>
          <a-form-item name="classname" label="班级" :rules="[{ required: true }]">
            <a-input v-model:value="formState.classname"/>
          </a-form-item>
          <a-form-item
              name="gender"
              label="性别"
              has-feedback
              :rules="[{ required: true, message: '请选择性别' }]"
          >
            <a-select v-model:value="formState.gender" placeholder="选择性别">
              <a-select-option value="男">男</a-select-option>
              <a-select-option value="女">女</a-select-option>
            </a-select>
          </a-form-item>
          <a-form-item name="phone" label="手机" :rules="[{ required: true }]">
            <a-input v-model:value="formState.phone"/>
          </a-form-item>
          <a-form-item
              name="politicalLandscape"
              label="政治面貌"
              has-feedback
              :rules="[{ required: true, message: '请选择政治面貌' }]"
          >
            <a-select v-model:value="formState.politicalLandscape" placeholder="选择政治面貌">
              <a-select-option value="群众">群众</a-select-option>
              <a-select-option value="中国共产主义青年团团员">中国共产主义青年团团员</a-select-option>
              <a-select-option value="中国共产党正式党员">中国共产党正式党员</a-select-option>
              <a-select-option value="中国共产党预备党员">中国共产党预备党员</a-select-option>
              <a-select-option value="其它">其它</a-select-option>
            </a-select>
          </a-form-item>
          <a-form-item
              name="resident"
              label="是否住宿"
              has-feedback
              :rules="[{ required: true, message: '请选择就读方式' }]"
          >
            <a-switch v-model:checked="formState.resident" />
          </a-form-item>
          <a-form-item
              name="is_admin"
              label="是否管理员"
              :rules="[{ required: true, message: '请选择是否为管理员' }]">
            <a-switch v-model:checked="formState.is_admin" />
          </a-form-item>
          <a-form-item name="QQ" label="QQ">
            <a-input v-model:value="formState.qq"/>
          </a-form-item>
          <a-form-item name="notes" label="备注" :rules="[{ required: false }]">
            <a-textarea v-model:value="formState.note"/>
          </a-form-item>
          <a-form-item name="join_at" label="加入部门时间" :rules="[{ required: true }]">
            <a-date-picker v-model:value="formState.join_at" placeholder="选择年-月-日" valueFormat="YYYY-MM-DD"/>
          </a-form-item>
          <a-form-item :wrapper-col="{ span: 12, offset: 6 }">
            <a-button type="primary" html-type="submit" :loading="loading" :disabled="disableButton">提交</a-button>
          </a-form-item>
        </a-form>
      </a-col>
    </a-row>

  </a-layout-content>
</template>

<style scoped>

</style>