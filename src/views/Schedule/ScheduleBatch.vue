<script setup>
import {ref} from "vue";
import {InboxOutlined, HomeOutlined} from "@ant-design/icons-vue";
import api from "@/api";
import {message} from "ant-design-vue";
import templateUrl from '@/assets/csv-templates/Add Schedule Template.zip?url'


const file = ref([]);
const uploading = ref(false);
const handleRemove = () => {
  file.value = [];
};
const newSchedules = ref([]);
const results = ref([]);
const visibleSchedules = ref(false);
const handleUpload = () => {
  let formData = new FormData();
  formData.append('file', file.value[0].originFileObj);
  uploading.value = true;
  let config = {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  };
  api.post("/schedule/upload", formData, config).then((res) => {
    let {data, msg} = res.data;
    newSchedules.value = data.schedules;
    results.value = data.results;
    visibleSchedules.value = true;
    uploading.value = false
    message.success(msg);
  }).catch((err) => {
    let {msg} = err.response.data;
    uploading.value = false
    message.error(msg);
  });
};

const handleCancel = () => {
  visibleSchedules.value = false;
}

const formItemLayout = {
  labelCol: {
    span: 6,
  },
  wrapperCol: {
    span: 14,
  },
};

</script>

<template>
  <a-layout-content
      :style="{margin: '16px'}"
  >
    <h2 style="display: flex; justify-content: space-between;">
      <span>批量添加值班计划</span><span style=" margin-bottom: 4px;"><router-link to="/"><HomeOutlined/> 首页</router-link></span>
    </h2>
    <a-row>
      <a-col :span="24" style="padding: 24px; background-color: #FFFFFF">
        <a-form
            name="validate_other"
            v-bind="formItemLayout"
            style="max-width: 500px;"
            @submit="handleUpload"

        >
          <a-form-item label="文件上传">
            <a-form-item name="csv-file" no-style>
              <a-upload-dragger accept=".csv" v-model:file-list="file" name="csv_file" :multiple="false"
                                :before-upload="true" max-count="1" @remove="handleRemove"
              >
                <p class="ant-upload-drag-icon">
                  <InboxOutlined/>
                </p>
                <p class="ant-upload-text">单击上传或将文件拖动到此区域</p>
                <p class="ant-upload-hint">注意CSV文件内容最后一行不能为空！</p>
                <p class="ant-upload-hint">要替换文件请先移除</p>
                <p class="ant-upload-hint">仅CSV文件</p>
              </a-upload-dragger>
            </a-form-item>
          </a-form-item>
          <a-form-item :wrapper-col="{ span: 12, offset: 6 }">
            <a-button type="primary" html-type="submit" :disabled="file.length === 0" :loading="uploading">尝试提交
            </a-button>
            <a :href="templateUrl"
               target="_blank">
              <a-button type="primary" ghost style="margin-left: 8px;">下载模板</a-button>
            </a>
          </a-form-item>
        </a-form>
      </a-col>
    </a-row>
    <a-modal v-model:visible="visibleSchedules" title="新增值班计划情况">
      <a-card style="margin-top: 4px;">
        <a-card v-for="result in results">
          {{ result }}
        </a-card>
      </a-card>
      <a-card v-for="item in newSchedules" style="margin-top: 4px;">
        <p>值班计划ID：<span>{{ item.id }}</span></p>
        <p>值班计划名称：<span>{{ item.schedule_name }}</span></p>
        <p>值班计划开始时间：<span>{{ item.schedule_start_time }}</span></p>
        <p>值班计划类型：<span>{{ item.schedule_type }}</span></p>
      </a-card>
      <template #footer>
        <a-button type="primary" @click="handleCancel">关闭</a-button>
      </template>
    </a-modal>
  </a-layout-content>
</template>

<style scoped>

</style>