<script setup>
import {ref, createVNode, computed, onMounted} from "vue";
import { ExclamationCircleOutlined } from '@ant-design/icons-vue';
import {Empty, message, Modal} from "ant-design-vue";
import api from "@/api";

const data_recruiting = ref([]);
const data_applying = ref([]);
const data_assignment = ref([]);
const data_rejected = ref([]);
const data_ended = ref([]);

const activeKey = ref('assignment');

const currentRecruitingPage = ref(1);
const currentApplyingPage = ref(1);
const currentAssignmentPage = ref(1);
const currentRejectedPage = ref(1);
const currentEndedPage = ref(1);

const currentRecruitingPageData = computed(() => {
    const startIdx = (currentRecruitingPage.value - 1) * 5;
    const endIdx = startIdx + 5;
    return data_recruiting.value.slice(startIdx, endIdx);
});
const currentApplyingPageData = computed(() => {
    const startIdx = (currentApplyingPage.value - 1) * 5;
    const endIdx = startIdx + 5;
    return data_applying.value.slice(startIdx, endIdx);
});
const currentAssignmentPageData = computed(() => {
    const startIdx = (currentAssignmentPage.value - 1) * 5;
    const endIdx = startIdx + 5;
    return data_assignment.value.slice(startIdx, endIdx);
});
const currentRejectedPageData = computed(() => {
    const startIdx = (currentRejectedPage.value - 1) * 5;
    const endIdx = startIdx + 5;
    return data_rejected.value.slice(startIdx, endIdx);
});
const currentEndedPageData = computed(() => {
    const startIdx = (currentEndedPage.value - 1) * 5;
    const endIdx = startIdx + 5;
    return data_ended.value.slice(startIdx, endIdx);
});

const spinning = ref(false)
const listRecuritingActivities = () => {
    spinning.value = true;
    api.get("/activity/list/recruiting").then((res) => {
        let {data} = res.data;
        data_recruiting.value = data;
        spinning.value = false;
    }).catch((err) => {
        let {msg} = err.response.data;
        spinning.value = false;
        message.error(msg);
    });
}

const listApplyingActivities = () => {
    spinning.value = true;
    api.get("/activity/list/application/applying").then((res) => {
        let {data} = res.data;
        data_applying.value = data;
        spinning.value = false;
    }).catch((err) => {
        let {msg} = err.response.data;
        spinning.value = false;
        message.error(msg);
    });
}

const listAssignmentActivities = () => {
    spinning.value = true;
    api.get("/activity/list/assignment").then((res) => {
        let {data} = res.data;
        data_assignment.value = data;
        spinning.value = false;
    }).catch((err) => {
        let {msg} = err.response.data;
        spinning.value = false;
        message.error(msg);
    });
}

const listRejectedActivities = () => {
    spinning.value = true;
    api.get("/activity/list/application/rejected").then((res) => {
        let {data} = res.data;
        data_rejected.value = data;
        spinning.value = false;
    }).catch((err) => {
        let {msg} = err.response.data;
        spinning.value = false;
        message.error(msg);
    });
}

const listEndedActivities = () => {
    spinning.value = true;
    api.get("/activity/list/ended").then((res) => {
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
    listAssignmentActivities();
});

const handleTabChange = (key) => {
    // 根据切换的标签 key 执行相应的操作，节流，节省请求次数。
    if (key === 'assignment') {
        listAssignmentActivities();
    } else if (key === 'recruiting') {
        listRecuritingActivities()
    } else if (key === 'applying') {
        listApplyingActivities()
    } else if (key === 'ended') {
        listEndedActivities();
    } else if (key === 'rejected') {
        listRejectedActivities();
    }
};

const visible = ref(false);
const hideModal = () => {
    visible.value = false;
};

const enroll = id => {
    Modal.confirm({
        title: '确认',
        icon: createVNode(ExclamationCircleOutlined),
        content: '确认报名？',
        okText: '确认',
        cancelText: '取消',
        onOk() {
            countDown();
        }
    });

}

const countDown = () => {
    let secondsToGo = 5;
    const modal = Modal.success({
        title: '报名成功',
        content: `提示框将在 ${secondsToGo}s 后关闭`,
    });
    const interval = setInterval(() => {
        secondsToGo -= 1;
        modal.update({
            content: `提示框将在 ${secondsToGo}s 后关闭`,
        });
    }, 1000);
    setTimeout(() => {
        clearInterval(interval);
        modal.destroy();
    }, secondsToGo * 1000);
};

</script>

<template>
    <a-layout-content :style="{margin: '16px', height: '100%'}">
        <h2>
            活动列表
        </h2>
        <a-tabs v-model:activeKey="activeKey" @update:activeKey="handleTabChange" type="card">
            <a-tab-pane key="assignment" tab="已分配">
                <a-spin :spinning="spinning" tip="Loading...">
                    <a-descriptions-item v-if="data_assignment.length === 0">
                        <div style="height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center;">
                            <a-empty :image="Empty.PRESENTED_IMAGE_SIMPLE" style="width: 100%;  "/>
                        </div>
                    </a-descriptions-item>
                    <a-space direction="vertical" :size="5" style="height: 100%">

                        <a-descriptions v-for="item in currentAssignmentPageData" title="活动公告"
                                        style="background-color: #FFFFFF; padding: 16px; box-sizing: border-box;">
                            <a-descriptions-item label="地点">{{  item.place  }}</a-descriptions-item>
                            <a-descriptions-item label="需求">{{ item.note }}</a-descriptions-item>
                            <a-descriptions-item label="开始时间">{{ item.start_time }}</a-descriptions-item>
                            <a-descriptions-item label="结束时间">{{  item.end_time  }}</a-descriptions-item>
                            <a-descriptions-item label="面向人员类型">{{  item.type  }}</a-descriptions-item>
                            <a-descriptions-item label="负责人学籍号">{{  item.admin_uid  }}</a-descriptions-item>
                            <a-descriptions-item label="负责人姓名">{{  item.admin_name  }}</a-descriptions-item>
                        </a-descriptions>
                        <a-pagination align="center" style="margin-top: 8px;" v-model:current="currentAssignmentPage" simple pageSize="5"
                                      :total="data_assignment.length" v-if="data_assignment.length !== 0"/>
                    </a-space>
                </a-spin>
            </a-tab-pane>
            <a-tab-pane key="recruiting" tab="正在招募">
                <a-spin :spinning="spinning" tip="Loading...">
                    <a-descriptions-item v-if="data_recruiting.length === 0">
                        <div style="height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center;">
                            <a-empty :image="Empty.PRESENTED_IMAGE_SIMPLE" style="width: 100%;  "/>
                        </div>
                    </a-descriptions-item>
                    <a-space direction="vertical" :size="5" style="height: 100%">

                        <a-descriptions v-for="item in currentRecruitingPageData" title="活动公告"
                                        style="background-color: #FFFFFF; padding: 16px; box-sizing: border-box;">
                            <a-descriptions-item label="地点">{{  item.place  }}</a-descriptions-item>
                            <a-descriptions-item label="需求">{{ item.note }}</a-descriptions-item>
                            <a-descriptions-item label="开始时间">{{ item.start_time }}</a-descriptions-item>
                            <a-descriptions-item label="结束时间">{{  item.end_time  }}</a-descriptions-item>
                            <a-descriptions-item label="面向人员类型">{{  item.type  }}</a-descriptions-item>
                            <a-descriptions-item label="负责人学籍号">{{  item.admin_uid  }}</a-descriptions-item>
                            <a-descriptions-item label="负责人姓名">{{  item.admin_name  }}</a-descriptions-item>
                            <a-descriptions-item label="操作">
                                <a-row>
                                    <a-button type="primary" @click="enroll(item.id)">报名</a-button>
                                </a-row>
                            </a-descriptions-item>

                        </a-descriptions>
                        <a-pagination align="center" style="margin-top: 8px;" v-model:current="currentRecruitingPage" simple pageSize="5"
                                      :total="data_recruiting.length" v-if="data_recruiting.length !== 0"/>
                    </a-space>
                </a-spin>
            </a-tab-pane>
            <a-tab-pane key="applying" tab="待审核">
                <a-spin :spinning="spinning" tip="Loading...">
                    <a-descriptions-item v-if="data_applying.length === 0">
                        <div style="height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center;">
                            <a-empty :image="Empty.PRESENTED_IMAGE_SIMPLE" style="width: 100%;  "/>
                        </div>
                    </a-descriptions-item>
                    <a-space direction="vertical" :size="5" style="height: 100%">

                        <a-descriptions v-for="item in currentApplyingPageData" title="活动公告"
                                        style="background-color: #FFFFFF; padding: 16px; box-sizing: border-box;">
                            <a-descriptions-item label="地点">{{  item.place  }}</a-descriptions-item>
                            <a-descriptions-item label="需求">{{ item.note }}</a-descriptions-item>
                            <a-descriptions-item label="开始时间">{{ item.start_time }}</a-descriptions-item>
                            <a-descriptions-item label="结束时间">{{  item.end_time  }}</a-descriptions-item>
                            <a-descriptions-item label="面向人员类型">{{  item.type  }}</a-descriptions-item>
                            <a-descriptions-item label="负责人学籍号">{{  item.admin_uid  }}</a-descriptions-item>
                            <a-descriptions-item label="负责人姓名">{{  item.admin_name  }}</a-descriptions-item>
                        </a-descriptions>
                        <a-pagination align="center" style="margin-top: 8px;" v-model:current="currentApplyingPage" simple pageSize="5"
                                      :total="data_applying.length" v-if="data_applying.length !== 0"/>

                    </a-space>
                </a-spin>
            </a-tab-pane>
            <a-tab-pane key="rejected" tab="曾驳回">
                <a-spin :spinning="spinning" tip="Loading...">
                    <a-descriptions-item v-if="data_rejected.length === 0">
                        <div style="height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center;">
                            <a-empty :image="Empty.PRESENTED_IMAGE_SIMPLE" style="width: 100%;  "/>
                        </div>
                    </a-descriptions-item>
                    <a-space direction="vertical" :size="5" style="height: 100%">

                        <a-descriptions v-for="item in currentRejectedPageData" title="活动公告"
                                        style="background-color: #FFFFFF; padding: 16px; box-sizing: border-box;">
                            <a-descriptions-item label="地点">校内8#影视中心</a-descriptions-item>
                            <a-descriptions-item label="需求">demo demo demo demo demo demo demo demo demo demo demo demo demo demo demo demo demo demo demo demo demo demo demo demo demo demo demo demo demo demo demo demo demo demo demo demo demo demo demo demo demo demo demo demo demo demo demo demo demo demo demo demo demo demo demo demo demo demo demo demo</a-descriptions-item>
                            <a-descriptions-item label="开始时间">2023/05/14 14:45:00</a-descriptions-item>
                            <a-descriptions-item label="结束时间">2023/05/14 14:45:00</a-descriptions-item>
                            <a-descriptions-item label="申请时间">2023/05/14 14:45:00</a-descriptions-item>
                            <a-descriptions-item label="面向人员类型">面向全体和指派</a-descriptions-item>
                            <a-descriptions-item label="审批人学籍号">22100001</a-descriptions-item>
                            <a-descriptions-item label="审批人姓名">Demo</a-descriptions-item>
                            <a-descriptions-item label="驳回时间">2023/05/14 14:45:00</a-descriptions-item>
                            <a-descriptions-item label="操作">
                                <a-row>
                                    <a-col v-if="true">
                                        <a-button type="primary" @click="enroll(item.id)">再次报名</a-button>
                                    </a-col>
                                </a-row>
                            </a-descriptions-item>

                        </a-descriptions>
                        <a-pagination align="center" style="margin-top: 8px;" v-model:current="currentRejectedPage" simple pageSize="5"
                                      :total="data_rejected.length" v-if="data_rejected.length !== 0"/>
                    </a-space>
                </a-spin>
            </a-tab-pane>
            <a-tab-pane key="ended" tab="已结束活动">
                <a-spin :spinning="spinning" tip="Loading...">
                    <a-descriptions-item v-if="data_ended.length === 0">
                        <div style="height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center;">
                            <a-empty :image="Empty.PRESENTED_IMAGE_SIMPLE" style="width: 100%;  "/>
                        </div>
                    </a-descriptions-item>
                    <a-space direction="vertical" :size="5" style="height: 100%">

                        <a-descriptions v-for="item in currentEndedPageData" title="活动公告"
                                        style="background-color: #FFFFFF; padding: 16px; box-sizing: border-box;">
                            <a-descriptions-item label="地点">{{  item.place  }}</a-descriptions-item>
                            <a-descriptions-item label="需求">{{ item.note }}</a-descriptions-item>
                            <a-descriptions-item label="开始时间">{{ item.start_time }}</a-descriptions-item>
                            <a-descriptions-item label="结束时间">{{  item.end_time  }}</a-descriptions-item>
                            <a-descriptions-item label="面向人员类型">{{  item.type  }}</a-descriptions-item>
                            <a-descriptions-item label="负责人学籍号">{{  item.admin_uid  }}</a-descriptions-item>
                            <a-descriptions-item label="负责人姓名">{{  item.admin_name  }}</a-descriptions-item>
                        </a-descriptions>
                        <a-pagination align="center" style="margin-top: 8px;" v-model:current="currentEndedPage" simple pageSize="5"
                                      :total="data_ended.length" v-if="data_ended.length !== 0"/>
                    </a-space>
                </a-spin>
            </a-tab-pane>
        </a-tabs>

        <a-modal
            v-model:visible="visible"
            title="报名确认"
            ok-text="确认"
            cancel-text="取消"
            @ok="hideModal"
        >
        </a-modal>
    </a-layout-content>
</template>

<style scoped>

</style>