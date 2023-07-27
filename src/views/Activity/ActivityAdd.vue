<script setup>
import {reactive, ref, computed, onMounted} from "vue";
import {MinusCircleOutlined, PlusOutlined} from "@ant-design/icons-vue";
import {debounce} from 'lodash-es';
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
    activity: {
        title: null,
        note: null,
        type: 'self-enrollment',
        place: null,
        start_time: null,
        end_time: null,
    },
    checkIn: {
        name: null,
        start_time: null,
        end_time: null,
    }
});

const validateMessages = {
    required: '${label} 必填!',
    types: {
        email: '${label} 非法邮箱格式',
    },
};

const state = reactive({
    data: [],
    value: [],
});

const checkInSwitcher = ref(false);

const spinning = ref(false);

const users = ref([]);
const listUsers = () => {
    spinning.value = true;
    api.get("/user").then((res) => {
        spinning.value = false;
        let {data} = res.data;
        users.value = data.map(i => ({
            label: `${i.uid} - ${i.name}`,
            value: `${i.id}`,
        }));
    }).catch((err) => {
        let {msg} = err.response.data;
        message.error(msg);
    });
}

onMounted(() => {
    listUsers()
});

const loading = ref(false);
const addActivity = () => {
    loading.value = true;
    let formData = formState.activity;
    if (formState.activity.type !== 'self-enrollment') {
        formData.user_id = []
        for (let item of state.value) {
            formData.user_id.push(item.value)
        }
    }
    api.post("/activity", formData).then((res) => {
        loading.value = false;
        let {msg} = res.data;
        message.success(msg);
        formState.activity.title = null;
        formState.activity.note = null;
        formState.activity.place = null;
        formState.activity.start_time = null;
        formState.activity.end_time = null;
        state.value = [];
    }).catch((err) => {
        let {msg} = err.response.data;
        loading.value = false;
        message.error(msg);
    });
    if (checkInSwitcher.value) {

    }
}

const now = new Date();
// 禁用早于当前日期的日期
const disabledDate = (date) => {
    return date && date.valueOf() < now.valueOf();
};

</script>

<template>
    <a-layout-content
            :style="{margin: '16px'}"
    >
        <h2>
            活动添加
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
                    <a-form-item :name="['activity', 'title']" label="活动标题" :rules="[{ required: true }]">
                        <a-input v-model:value="formState.activity.title"/>
                    </a-form-item>
                    <a-form-item :name="['activity', 'note']" label="需求" :rules="[{ required: true }]">
                        <a-textarea v-model:value="formState.activity.note"/>
                    </a-form-item>
                    <a-form-item :name="['activity', 'place']" label="地点" :rules="[{ required: true }]">
                        <a-input v-model:value="formState.activity.place"/>
                    </a-form-item>
                    <a-form-item
                            :name="['activity', 'type']"
                            label="发布类型"
                            has-feedback
                            :rules="[{ required: true, message: '请选择发布方式' }]"
                    >
                        <a-select v-model:value="formState.activity.type" placeholder="选择一个发布类型">
                            <a-select-option value="assignment">指派</a-select-option>
                            <a-select-option value="self-enrollment">自主报名</a-select-option>
                            <a-select-option value="ase">自主报名与指派</a-select-option>
                        </a-select>
                    </a-form-item>
                    <a-form-item v-if="formState.activity.type === 'assignment' || formState.activity.type === 'ase'" label="指派用户" >
                        <a-select
                                v-model:value="state.value"
                                mode="multiple"
                                label-in-value
                                placeholder="选择用户"
                                :filter-option="false"
                                :options="users"
                        >
                        </a-select>
                    </a-form-item>
                    <a-form-item has-feedback
                                 :rules="[{ required: true, message: '请选择日期' }]"
                                 :name="['activity','start_time']"
                                 label="开始时间">
                        <a-date-picker
                                v-model:value="formState.activity.start_time"
                                show-time
                                format="YYYY-MM-DD HH:mm:ss"
                                :disabled-date="disabledDate"
                                value-format="YYYY-MM-DD HH:mm:ss"
                                placeholder="不得早于当前时间"
                        />
                    </a-form-item>
                    <a-form-item has-feedback
                                 :rules="[{ required: true, message: '请选择日期' }]"
                                 :name="['activity','end_time']"
                                 label="结束时间">
                        <a-date-picker
                                v-model:value="formState.activity.end_time"
                                show-time
                                format="YYYY-MM-DD HH:mm:ss"
                                :disabled-date="disabledDate"
                                value-format="YYYY-MM-DD HH:mm:ss"
                                placeholder="不得早于当前时间"
                        />
                    </a-form-item>
                    <a-form-item name="switch" label="生成签到">
                        <a-switch v-model:checked="checkInSwitcher"/>
                    </a-form-item>


                </a-form>
                <div v-if="checkInSwitcher">
                    <a-form
                            :model="formState"
                            name="validate_other"
                            v-bind="formItemLayout"
                            :validate-messages="validateMessages"
                            style="max-width: 500px;"

                    >
                        <a-form-item :name="['checkIn','name']" label="签到名称" :rules="[{ required: true }]">
                            <a-input v-model:value="formState.checkIn.name"/>
                        </a-form-item>
                        <a-form-item has-feedback
                                     :rules="[{ required: true, message: '请选择日期' }]"
                                     label="签到开始时间"
                                     :name="['checkIn','start_time']"
                        >

                            <a-date-picker
                                    v-model:value="formState.checkIn.start_time"
                                    show-time
                                    format="YYYY-MM-DD HH:mm:ss"
                                    value-format="YYYY-MM-DD HH:mm:ss"
                                    placeholder="不得早于当前时间"
                            />
                        </a-form-item>
                        <a-form-item has-feedback
                                     :rules="[{ required: true, message: '请选择日期' }]"
                                     label="签到结束时间"
                                     :name="['checkIn','end_time']"
                        >
                            <a-date-picker
                                    v-model:value="formState.checkIn.end_time"
                                    show-time
                                    format="YYYY-MM-DD HH:mm:ss"
                                    value-format="YYYY-MM-DD HH:mm:ss"
                                    placeholder="不得早于当前时间"
                            />
                        </a-form-item>

                    </a-form>
                </div>
                <a-form-item :wrapper-col="{ span: 12, offset: 2 }">
                    <a-button type="primary" :loading="loading" @click="addActivity" :disabled="!formState.activity.title || !formState.activity.start_time ||  !formState.activity.end_time || !formState.activity.place">提交</a-button>
                </a-form-item>
            </a-col>
        </a-row>
    </a-layout-content>
</template>

<style scoped>

</style>