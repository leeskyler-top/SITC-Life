<script setup>
import {ref} from "vue";
import {InboxOutlined, HomeOutlined} from "@ant-design/icons-vue";
import api from "@/api";
import {message} from "ant-design-vue";

const file = ref([]);
const uploading = ref(false);
const handleRemove = () => {
    // const index = file.value.indexOf(file);
    // const newfile = file.value.slice();
    // newfile.splice(index, 1);
    // file.value = newfile;
    file.value = [];
};
const newUsers = ref([]);
const visibleUsers = ref(false);
const handleUpload = () => {
    let formData = new FormData();
    // console.log(file.value[0].originFileObj);
    formData.append('csv_file', file.value[0].originFileObj);
    // for (let entry of formData.entries()) {
    //     console.log(entry);
    // }
    uploading.value = true;
    let config = {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    };
    api.post("/user/batch/add", formData, config).then((res) => {
        let {data, msg} = res.data;
        data = data.map(item => {
            if (item.is_admin === '1') {
                item.is_admin = '管理员';
            } else {
                item.is_admin = '用户';
            }
            return item;
        })
        newUsers.value = data;
        visibleUsers.value = true;
        uploading.value = false
        message.success(msg);
    }).catch((err) => {
        let {msg} = err.response.data;
        uploading.value = false
        message.error(msg);
    });
};

const handleCancel = () => {
    visibleUsers.value = false;
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
            <span>用户批量添加</span><span style=" margin-bottom: 4px;"><router-link to="/"><HomeOutlined /> 首页</router-link></span>
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
                        <a-button type="primary" html-type="submit" :disabled="file.length === 0" :loading="uploading">尝试提交</a-button>
                        <a href="https://twxc-beta.leeskyler.top/backend/public/files/User Add Template (SITC-Publicity).csv"
                           target="_blank">
                            <a-button type="primary" ghost style="margin-left: 8px;">下载模板</a-button>
                        </a>
                    </a-form-item>
                </a-form>
            </a-col>
        </a-row>
        <a-modal v-model:visible="visibleUsers" title="新增成功的用户">
            <a-card v-for="item in newUsers" style="margin-top: 4px;">
                <p>用户id：<span>{{ item.id }}</span></p>
                <p>学籍号：<span>{{ item.uid }}</span></p>
                <p>姓名：<span>{{ item.name }}</span></p>
                <p>班级：<span>{{ item.classname }}</span></p>
                <p>系部：<span>{{ item.department }}</span></p>
                <p>角色：<span>{{ item.is_admin }}</span></p>
            </a-card>
            <template #footer>
                <a-button type="primary" @click="handleCancel">关闭</a-button>
            </template>
        </a-modal>
    </a-layout-content>
</template>

<style scoped>

</style>