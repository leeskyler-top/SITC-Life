<script setup>
import {ref, createVNode, computed, onMounted, reactive} from "vue";
import {ExclamationCircleOutlined, UploadOutlined} from '@ant-design/icons-vue';
import {Empty, message, Modal} from "ant-design-vue";
import api from "@/api";

const data_waiting = ref([]);
const data_started = ref([]);
const data_ended = ref([]);

const activeKey = ref('started');

const currentWaitingPage = ref(1);
const currentStartedPage = ref(1);
const currentEndedPage = ref(1);

const currentWaitingPageData = computed(() => {
    const startIdx = (currentWaitingPage.value - 1) * 5;
    const endIdx = startIdx + 5;
    return data_waiting.value.slice(startIdx, endIdx);
});
const currentStartedPageData = computed(() => {
    const startIdx = (currentStartedPage.value - 1) * 5;
    const endIdx = startIdx + 5;
    return data_started.value.slice(startIdx, endIdx);
});
const currentEndedPageData = computed(() => {
    const startIdx = (currentEndedPage.value - 1) * 5;
    const endIdx = startIdx + 5;
    return data_ended.value.slice(startIdx, endIdx);
});

const spinning = ref(false)

const formState = reactive({
    image_url: []
})
const listWaitingCheckIns = () => {
    spinning.value = true;
    api.get("/checkin/list/waiting").then((res) => {
        let {data} = res.data;
        data_waiting.value = data;
        spinning.value = false;
    }).catch((err) => {
        let {msg} = err.response.data;
        spinning.value = false;
        message.error(msg);
    });
}

const listStartedCheckIns = () => {
    spinning.value = true;
    api.get("/checkin/list/started").then((res) => {
        let {data} = res.data;
        data_started.value = data;
        spinning.value = false;
    }).catch((err) => {
        let {msg} = err.response.data;
        spinning.value = false;
        message.error(msg);
    });
}

const listEndedCheckIns = () => {
    spinning.value = true;
    api.get("/checkin/list/ended").then((res) => {
        let {data} = res.data;
        data_ended.value = data;
        spinning.value = false;
    }).catch((err) => {
        let {msg} = err.response.data;
        spinning.value = false;
        message.error(msg);
    });
}

onMounted(() => {
    listStartedCheckIns();
});

const handleTabChange = (key) => {
    // 根据切换的标签 key 执行相应的操作，节流，节省请求次数。
    if (key === 'started') {
        listStartedCheckIns();
    } else if (key === 'waiting') {
        listWaitingCheckIns()
    } else if (key === 'ended') {
        listEndedCheckIns();
    }
};

const visible = ref(false);
const hideModal = () => {
    visible.value = false;
};

const loading = ref(false)

const handleCancel = () => {
    visible.value = false;
}

let config = {
    headers: {
        'Content-Type': 'multipart/form-data',
    },
};

const checkin = (id) => {
    visible.value = true;
    current_id.value = id
}

const current_id = ref(null)

const checkInNow = () => {
    loading.value = true;
    let formData = new FormData();
    for (let item of formState.image_url) {
        formData.append('image_url[]', item.originFileObj)
    }
    api.post("/checkin/now/" + current_id.value, formData, config).then(res => {
        let {msg} = res.data;
        loading.value = false;
        visible.value = false;
        data_started.value = data_started.value.filter(item => item.id !== current_id.value);
        formState.image_url = [];
        current_id.value = null;
        message.success(msg);
    }).catch(err => {
        let {msg} = err.response.data;
        loading.value = false;
        message.error(msg);
    });
}

</script>

<template>
    <a-layout-content :style="{margin: '16px', height: '100%'}">
        <h2>
            我的签到
        </h2>
        <a-tabs v-model:activeKey="activeKey" @update:activeKey="handleTabChange" type="card">
            <a-tab-pane key="started" tab="正在进行">
                <a-spin :spinning="spinning" tip="Loading...">
                    <a-descriptions-item v-if="data_started.length === 0">
                        <div style="height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center;">
                            <a-empty :image="Empty.PRESENTED_IMAGE_SIMPLE" style="width: 100%;  "/>
                        </div>
                    </a-descriptions-item>
                    <a-space direction="vertical" :size="5" style="height: 100%">

                        <a-descriptions v-for="item in currentStartedPageData" :title="'签到名称：' + item.title"
                                        style="background-color: #FFFFFF; padding: 16px; box-sizing: border-box;">
                            <a-descriptions-item label="活动标题">{{  item.activity_title  }}</a-descriptions-item>
                            <a-descriptions-item label="活动地点">{{  item.activity_place  }}</a-descriptions-item>
                            <a-descriptions-item label="签到开始时间">{{ item.start_time }}</a-descriptions-item>
                            <a-descriptions-item label="签到结束时间">{{  item.end_time  }}</a-descriptions-item>
                            <a-descriptions-item label="签到状态">{{  item.status  }}</a-descriptions-item>
                            <a-descriptions-item label="操作">
                                <a-row>
                                    <a-button type="primary" @click="checkin(item.id)" :disabled="item.status !== 'unsigned'">签到</a-button>
                                </a-row>
                            </a-descriptions-item>

                        </a-descriptions>
                        <a-pagination align="center" style="margin-top: 8px;" v-model:current="currentStartedPage" simple pageSize="5"
                                      :total="data_started.length" v-if="data_started.length !== 0"/>
                    </a-space>
                </a-spin>
            </a-tab-pane>
            <a-tab-pane key="waiting" tab="等待开始">
                <a-spin :spinning="spinning" tip="Loading...">
                    <a-descriptions-item v-if="data_waiting.length === 0">
                        <div style="height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center;">
                            <a-empty :image="Empty.PRESENTED_IMAGE_SIMPLE" style="width: 100%;  "/>
                        </div>
                    </a-descriptions-item>
                    <a-space direction="vertical" :size="5" style="height: 100%">

                        <a-descriptions v-for="item in currentWaitingPageData" :title="'签到名称：' + item.title"
                                        style="background-color: #FFFFFF; padding: 16px; box-sizing: border-box;">
                            <a-descriptions-item label="活动标题">{{  item.activity_title  }}</a-descriptions-item>
                            <a-descriptions-item label="活动地点">{{  item.activity_place  }}</a-descriptions-item>
                            <a-descriptions-item label="签到开始时间">{{ item.start_time }}</a-descriptions-item>
                            <a-descriptions-item label="签到结束时间">{{  item.end_time  }}</a-descriptions-item>
                        </a-descriptions>
                        <a-pagination align="center" style="margin-top: 8px;" v-model:current="currentWaitingPage" simple pageSize="5"
                                      :total="data_waiting.length" v-if="data_waiting.length !== 0"/>
                    </a-space>
                </a-spin>
            </a-tab-pane>
            <a-tab-pane key="ended" tab="已结束">
                <a-spin :spinning="spinning" tip="Loading...">
                    <a-descriptions-item v-if="data_ended.length === 0">
                        <div style="height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center;">
                            <a-empty :image="Empty.PRESENTED_IMAGE_SIMPLE" style="width: 100%;  "/>
                        </div>
                    </a-descriptions-item>
                    <a-space direction="vertical" :size="5" style="height: 100%">

                        <a-descriptions v-for="item in currentEndedPageData"  :title="'签到名称：' + item.title"
                                        style="background-color: #FFFFFF; padding: 16px; box-sizing: border-box;">
                            <a-descriptions-item label="活动标题">{{  item.activity_title  }}</a-descriptions-item>
                            <a-descriptions-item label="活动地点">{{  item.activity_place  }}</a-descriptions-item>
                            <a-descriptions-item label="签到开始时间">{{ item.start_time }}</a-descriptions-item>
                            <a-descriptions-item label="签到结束时间">{{  item.end_time  }}</a-descriptions-item>
                        </a-descriptions>
                        <a-pagination align="center" style="margin-top: 8px;" v-model:current="currentEndedPage" simple pageSize="5"
                                      :total="data_ended.length" v-if="data_ended.length !== 0"/>
                    </a-space>
                </a-spin>
            </a-tab-pane>
        </a-tabs>


    </a-layout-content>
    <a-modal v-model:visible="visible" title="打卡图片上传">
        <a-form
            :model="formState"
            name="validate_other"
        >

            <a-form-item name="image_url" label="图片" extra="至少上传一张图片，最多两张" :rules="[{ required: true, message: '至少上传一张图片' }]">
                <a-upload
                    list-type="picture"
                    :before-upload="true" max-count="2"
                    v-model:file-list="formState.image_url"
                >
                    <a-button>
                        <template #icon><UploadOutlined /></template>
                        Click to upload
                    </a-button>
                </a-upload>
            </a-form-item>
        </a-form>
        <template #footer>
            <a-button type="primary" danger @click="handleCancel">取消</a-button>
            <a-button type="primary" @click="checkInNow" :disabled="formState.image_url.length === 0" :loading="loading">上传并归还</a-button>
        </template>
    </a-modal>
</template>

<style scoped>

</style>