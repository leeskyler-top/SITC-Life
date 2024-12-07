<script setup>
import { ref } from "vue";
import { HomeOutlined, InboxOutlined, DownloadOutlined } from "@ant-design/icons-vue";
import { message } from 'ant-design-vue';

const file = ref([]);

// 处理移除上传的文件
const handleRemove = () => {
  file.value = [];
};

// 文件选择处理
const handleFileChange = (info) => {
  const { fileList } = info;
  // 只接受图片
  const imageFile = fileList.find(file => file.type.includes("image"));
  if (imageFile) {
    file.value = [imageFile];
  }
};

// 提取嵌入在图片中的ZIP文件
const extractZipFromJpg = () => {
  if (file.value.length === 0) {
    message.error("请先上传图片文件！");
    return;
  }

  const jpgFile = file.value[0].originFileObj;

  const reader = new FileReader();
  reader.onload = (e) => {
    const jpgData = new Uint8Array(e.target.result);

    // 查找ZIP文件的起始位置 (ZIP文件的标识是 "PK 03 04")
    const zipStartIndex = findZipStart(jpgData);
    if (zipStartIndex === -1) {
      message.error("转换失败：没有在图片中找到ZIP文件！");
      return;
    }

    // 提取ZIP文件数据
    const zipData = jpgData.slice(zipStartIndex);

    // 创建Blob对象并提供下载链接
    const blob = new Blob([zipData], { type: 'application/zip' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'extracted.zip';

    // 触发下载
    link.click();
  };

  reader.readAsArrayBuffer(jpgFile);
};

// 查找ZIP文件的起始位置 (ZIP标识 "PK 03 04")
const findZipStart = (byteArray) => {
  const ZIP_SIGNATURE = [0x50, 0x4b, 0x03, 0x04]; // ZIP文件标识 "PK\x03\x04"
  for (let i = 0; i < byteArray.length - ZIP_SIGNATURE.length; i++) {
    if (isMatching(byteArray.slice(i, i + ZIP_SIGNATURE.length), ZIP_SIGNATURE)) {
      return i;
    }
  }
  return -1;
};

// 判断字节数组是否匹配
const isMatching = (array, signature) => {
  for (let i = 0; i < array.length; i++) {
    if (array[i] !== signature[i]) {
      return false;
    }
  }
  return true;
};

</script>

<template>
  <a-layout-content :style="{ margin: '16px' }">
    <h2 style="display: flex; justify-content: space-between;">
      <span>提取ZIP文件</span>
      <span style="margin-bottom: 4px;">
        <router-link to="/"><HomeOutlined /> 首页</router-link>
      </span>
    </h2>

    <!-- 文件选择器 -->
    <div style="margin-top: 20px;">
      <a-upload-dragger
          accept=".png,.jpg,.jpeg,.gif"
          v-model:file-list="file"
          name="picture_file"
          :multiple="false"
          :before-upload="() => false"
      @change="handleFileChange"
      @remove="handleRemove"
      max-count="1"
      >
      <p class="ant-upload-drag-icon">
        <InboxOutlined />
      </p>
      <p class="ant-upload-text">单击上传或将文件拖动到此区域</p>
      <p class="ant-upload-hint">仅支持 JPG/PNG/GIF 图片文件</p>
      </a-upload-dragger>
    </div>

    <!-- 提取ZIP按钮 -->
    <a-button
        type="primary"
        size="large"
        :disabled="file.length === 0"
        @click="extractZipFromJpg"
        style="margin-top: 16px;"
    >
      <template #icon>
        <DownloadOutlined />
      </template>
      提取ZIP文件
    </a-button>
  </a-layout-content>
</template>

<style scoped>
.download-link {
  display: inline-block;
  padding: 10px;
  background-color: #4CAF50;
  color: white;
  text-decoration: none;
  border-radius: 4px;
  margin-top: 20px;
}

.download-link:hover {
  background-color: #45a049;
}
</style>
