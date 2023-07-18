<script setup>
import {reactive, ref} from "vue";
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
const formState = reactive({
    fixed_assets_num: null,
    name: null,
    model: null,
    status: "unassigned",
    create_time: null,
});

const now = new Date();
// 禁用早于当前日期的日期
const disabledDate = (date) => {
    return date && date.valueOf() > now.valueOf();
};


const validateMessages = {
    required: '${label} 必填!',
    types: {
        email: '${label} 非法邮箱格式',
    },
};
const loading = ref(false)
const addEquipment = () => {
    loading.value = true;
    api.post("/equipment", formState).then((res) => {
        loading.value = false;
        let {msg} = res.data;
        message.success(msg);
        formState.fixed_assets_num = null;
        formState.name = null;
        formState.model = null;
        formState.status = 'unassigned';
        formState.create_time = null;
    }).catch((err) => {
        let {msg} = err.response.data;
        loading.value = false;
        message.error(msg);
    });
}
</script>

<template>
    <a-layout-content
            :style="{margin: '16px'}"
    >
        <h2>
            设备资产添加
        </h2>
        <a-row>
            <a-col :span="24" style="padding: 24px; background-color: #FFFFFF">
                <a-form
                        :model="formState"
                        name="validate_other"
                        v-bind="formItemLayout"
                        :validate-messages="validateMessages"
                        style="max-width: 500px;"

                >
                    <a-form-item name="fixed_assets_num" label="固定资产编号" :rules="[{ required: true }]">
                        <a-input v-model:value="formState.fixed_assets_num" />
                    </a-form-item>
                    <a-form-item name="name" label="设备名称" :rules="[{ required: true }]">
                        <a-input v-model:value="formState.name" />
                    </a-form-item>
                    <a-form-item name="model" label="设备型号" :rules="[{ required: true }]">
                        <a-input v-model:value="formState.model" />
                    </a-form-item>
                    <a-form-item name="status" label="设备状态" :rules="[{ required: true }]">
                        <a-select v-model:value="formState.status"
                                  placeholder="请选择状态"
                                  style="width: 200px">
                            <a-select-option value="unassigned">空闲</a-select-option>
                            <a-select-option value="scrapped">报废</a-select-option>
                            <a-select-option value="missed">丢失</a-select-option>
                            <a-select-option value="damaged">损坏</a-select-option>
                        </a-select>
                    </a-form-item>
                    <a-form-item has-feedback
                                 :rules="[{ required: true, message: '请选择日期' }]" name="create_time" label="入库时间">
                        <a-date-picker
                                v-model:value="formState.create_time"
                                show-time
                                :disabled-time="disabledDate"
                                format="YYYY-MM-DD HH:mm:ss"
                                value-format="YYYY-MM-DD HH:mm:ss"
                                placeholder="不得晚于当前时间"
                        />
                    </a-form-item>
                    <a-form-item :wrapper-col="{ span: 12, offset: 6 }">
                        <a-button type="primary" html-type="submit" @click="addEquipment" :disabled="!formState.fixed_assets_num || !formState.name || !formState.model || !formState.create_time">提交</a-button>
                    </a-form-item>
                </a-form>
            </a-col>
        </a-row>

    </a-layout-content>
</template>

<style scoped>

</style>