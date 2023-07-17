<script setup>
import {onMounted, reactive, ref} from "vue";
import {UploadOutlined} from "@ant-design/icons-vue";
import api from "@/api";
import {message} from "ant-design-vue";

const formItemLayout = {
    labelCol: {
        span: 6,
    },
    wrapperCol: {
        span: 14,
    },
};

const unassignedEquipments = ref([]);

const formState = reactive({
    'equipment_id': null,
    'apply_time': null,
    'assigned_url': []
});

const spinning = ref(false);

// 获取当前日期
const now = new Date();
// 设置最小日期为当前日期
const minDate = ref(now);

// 禁用早于当前日期的日期
const disabledDate = (date) => {
    return date && date.valueOf() < now.valueOf();
};

const listUnassignedEquipments = () => {
    spinning.value = true;
    api.get("/equipment/unassigned").then((res) => {
        let {data} = res.data;
        unassignedEquipments.value = data;
        spinning.value = false;
    }).catch((err) => {
        let {msg} = err.response.data;
        spinning.value = false;
        message.error(msg);
    });
}

const loading = ref(false);

let config = {
    headers: {
        'Content-Type': 'multipart/form-data',
    },
};
const applyEquipment = () => {
    loading.value = true;
    let formData = new FormData();
    for (let item of formState.assigned_url) {
        formData.append('assigned_url[]', item.originFileObj)
    }
    formData.append('equipment_id', formState.equipment_id);
    formData.append('apply_time', formState.apply_time);
    api.post("/equipment/apply/", formData, config).then(res => {
        let {msg} = res.data;
        loading.value = false;
        formState.equipment_id = null;
        formState.apply_time = null;
        formState.assigned_url = [];
        unassignedEquipments.value = unassignedEquipments.value.filter(item => item.id !== current_rent_application_id.value);
        message.success(msg);
    }).catch(err => {
        let {msg} = err.response.data;
        loading.value = false;
        message.error(msg);
    });
}

onMounted(() => {
    listUnassignedEquipments();
})

</script>

<template>
    <a-layout-content
            :style="{margin: '16px'}"
    >
        <h2>
            设备借用
        </h2>
        <a-spin :spinning="spinning" tip="Loading...">
            <a-row>
                <a-col :span="24" style="padding: 24px; background-color: #FFFFFF">
                    <a-form
                        :model="formState"
                        name="validate_other"
                        v-bind="formItemLayout"
                        style="max-width: 500px;"

                    >
                        <a-form-item
                            name="equipment_id"
                            label="选择一个设备"
                            has-feedback
                            :rules="[{ required: true, message: '请选择设备' }]"
                        >
                            <a-select v-model:value="formState.equipment_id" placeholder="仅显示可用" >
                                <a-select-option v-for="i in unassignedEquipments" :value="i.id">{{ i.name }} {{ i.model }}</a-select-option>
                            </a-select>
                        </a-form-item>

                        <a-form-item has-feedback
                                     :rules="[{ required: true, message: '请选择日期' }]"   name="apply_time" label="承诺归还时间">
                            <a-date-picker
                                v-model:value="formState['apply_time']"
                                show-time
                                format="YYYY-MM-DD HH:mm:ss"
                                value-format="YYYY-MM-DD HH:mm:ss"
                                :disabled-date="disabledDate"
                                placeholder="不得早于当前时间"
                            />
                        </a-form-item>

                        <a-form-item has-feedback
                                     :rules="[{ required: true, message: '至少上传一张图片' }]" name="assigned_url" label="上传图片" extra="设备状态">
                            <a-upload
                                v-model:fileList="formState.assigned_url"
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

                        <a-form-item :wrapper-col="{ span: 12, offset: 6 }">
                            <a-button type="primary" html-type="submit" @click="applyEquipment" :disabled="!formState.equipment_id || !formState.apply_time || formState.assigned_url.length === 0" :loading="loading">提交申请</a-button>
                        </a-form-item>
                    </a-form>
                </a-col>
            </a-row>
        </a-spin>

    </a-layout-content>
</template>

<style scoped>

</style>