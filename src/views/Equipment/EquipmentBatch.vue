<script setup>
import {ref} from "vue";
import {InboxOutlined} from "@ant-design/icons-vue";
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
const newEquipments = ref([]);
const visibleEquipments = ref(false);
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
    api.post("/equipment/batch/add", formData, config).then((res) => {
        let {data, msg} = res.data;
        data = data.map(item => {
            if (item.status === 'unassigned') {
                item.status = '空闲';
            } else if (item.status === 'assigned') {
                item.status = '出借';
            } else if (item.status === 'scrapped') {
                item.status = '报废';
            } else if (item.status === 'damaged') {
                item.status = '损坏';
            } else if (item.status === 'missed') {
                item.status = '丢失';
            }
            return item;
        })
        newEquipments.value = data;
        visibleEquipments.value = true;
        uploading.value = false
        message.success(msg);
    }).catch((err) => {
        let {msg} = err.response.data;
        uploading.value = false
        message.error(msg);
    });
};

const handleCancel = () => {
    visibleEquipments.value = false;
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
        <h2>
            用户批量添加
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
                        <a href="https://twxc-beta.leeskyler.top/backend/public/files/Equipments Add Template.csv"
                           target="_blank">
                            <a-button type="primary" ghost style="margin-left: 8px;">下载模板</a-button>
                        </a>
                    </a-form-item>
                </a-form>
            </a-col>
        </a-row>
        <a-modal v-model:visible="visibleEquipments" title="新增成功的用户">
            <a-card v-for="item in newEquipments" style="margin-top: 4px;">
                <p>设备ID：<span>{{ item.id }}</span></p>
                <p>固定资产编号：<span>{{ item.fixed_assets_num }}</span></p>
                <p>设备名称：<span>{{ item.name }}</span></p>
                <p>设备型号：<span>{{ item.model }}</span></p>
                <p>状态：<span>{{ item.status }}</span></p>
                <p>入库时间：<span>{{ item.create_time }}</span></p>
            </a-card>
            <template #footer>
                <a-button type="primary" @click="handleCancel">关闭</a-button>
            </template>
        </a-modal>
    </a-layout-content>
</template>

<style scoped>

</style>