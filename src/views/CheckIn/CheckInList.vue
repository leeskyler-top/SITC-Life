<script setup>
import {ref, createVNode, computed, onMounted} from "vue";
import { ExclamationCircleOutlined } from '@ant-design/icons-vue';
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
                            <a-descriptions-item label="操作">
                                <a-row>
                                    <a-button type="primary" @click="checkin(item.id)">报名</a-button>
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
    <a-modal v-model:visible="visible" title="资料上传">
        <a-form
            :model="formState"
            name="validate_other"
            v-bind="formItemLayout"
            @finishFailed="onFinishFailed"
            @finish="onFinish"
        >

            <a-form-item name="upload" label="Upload" extra="至少上传一张图片，最多两张">
                <a-upload
                    v-model:fileList="formState.upload"
                    name="logo"
                    action="/upload.do"
                    list-type="picture"
                    before-upload="false" max-count="2"
                >
                    <a-button>
                        <template #icon><UploadOutlined /></template>
                        Click to upload
                    </a-button>
                </a-upload>
            </a-form-item>

            <a-form-item :wrapper-col="{ span: 12, offset: 6 }">
                <a-button type="primary" html-type="submit">上传并签到</a-button>
            </a-form-item>
        </a-form>
        <template #footer>
            <a-button type="primary" danger @click="handleCancel">取消</a-button>
        </template>
    </a-modal>
</template>

<style scoped>

</style>