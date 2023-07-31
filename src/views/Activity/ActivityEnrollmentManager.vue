<script setup>
import {reactive, ref, onMounted, createVNode, computed} from 'vue';
import {cloneDeep} from 'lodash-es';
import {ExclamationCircleOutlined, SearchOutlined} from '@ant-design/icons-vue';
import {Empty, message, Modal} from "ant-design-vue";
import api from "@/api";

const isShow = ref(true);
function handleResize (event) {
    // 页面宽度小于525px时，不显示表格
    if (document.documentElement.clientWidth < 525) {
        isShow.value = false;
    } else {
        isShow.value = true;
    }
}

onMounted(() => {
    handleResize();
    listEnrollmentByActivity();
});

const activeKey = ref('activity');
const activeKey2 = ref('activity_applying');

const spinning = ref(false)

const handleTabChange = (key) => {
    // 根据切换的标签 key 执行相应的操作，节流，节省请求次数。
    if (key === 'activity') {
        listEnrollmentByActivity();
    } else if (key === 'type' || key === 'applying') {
        listApplyingApplication()
    }  else if (key === 'rejected') {
        listRejectedApplication();
    }
};

window.addEventListener('resize', handleResize);


const activityData = ref([]);
const currentActivity = ref();
const currentApplicationData = ref([]);
const currentRejectedData = ref([]);
const current_activity_id = ref();

const data_applying = ref([]);
const data_rejected = ref([]);

const currentRejectedPage = ref(1);
const currentApplyingPage = ref(1);
const currentRejectedPageData = computed(() => {
    const startIdx = (currentRejectedPage.value - 1) * 5;
    const endIdx = startIdx + 5;
    return data_rejected.value.slice(startIdx, endIdx);
});
const currentApplyingPageData = computed(() => {
    const startIdx = (currentRejectedPage.value - 1) * 5;
    const endIdx = startIdx + 5;
    return data_applying.value.slice(startIdx, endIdx);
});
const listEnrollmentByActivity = () => {
    spinning.value = true;
    api.get("/activity/enrollment/list").then((res) => {
        let {data} = res.data;
        spinning.value = false;
        data = data.map(item => {
            if (item.type === 'self-enrollment') {
                item.type = '仅自主报名';
            } else if (item.type === 'assignment') {
                item.type = '仅分配';
            } else if (item.type === 'ase') {
                item.type = '自主报名或分配';
            }
            return item;
        })
        activityData.value = data;
    }).catch((err) => {
        let {msg} = err.response.data;
        spinning.value = false;
        message.error(msg);
    });
}

const listApplyingApplication = () => {
    spinning.value = true;
    api.get("/activity/enrollment/list/rejected").then((res) => {
        let {data} = res.data;
        data_rejected.value = data;
        spinning.value = false;
    }).catch((err) => {
        let {msg} = err.response.data;
        spinning.value = false;
        message.error(msg);
    });
}

const listRejectedApplication = () => {
    spinning.value = true;
    api.get("/activity/enrollment/list/rejected").then((res) => {
        let {data} = res.data;
        data_rejected.value = data;
        spinning.value = false;
    }).catch((err) => {
        let {msg} = err.response.data;
        spinning.value = false;
        message.error(msg);
    });
}

const editableData = reactive({});
const state = reactive({
    searchText: '',
    searchedColumn: '',
});

const searchInput = ref();

const columns = [
    {
        title: '活动标题',
        dataIndex: 'title',
        width: '25%',
        customFilterDropdown: true,
        onFilter: (value, record) =>
            record.uid.toString().toLowerCase().includes(value.toLowerCase()),
    },
    {
        title: '负责人学籍号',
        dataIndex: 'admin_uid',
        width: '10%',
        customFilterDropdown: true,
        onFilter: (value, record) =>
            record.admin_name.toString().toLowerCase().includes(value.toLowerCase()),
    },
    {
        title: '负责人姓名',
        dataIndex: 'admin_name',
        width: '10%',
        customFilterDropdown: true,
        onFilter: (value, record) =>
            record.admin_name.toString().toLowerCase().includes(value.toLowerCase()),
    },
    {
        title: '类型',
        dataIndex: 'type',
        width: '10%',
        customFilterDropdown: true,
        onFilter: (value, record) =>
            record.name.toString().toLowerCase().includes(value.toLowerCase()),
    },
    {
        title: '地点',
        dataIndex: 'place',
        width: '15%',
        customFilterDropdown: true,
        onFilter: (value, record) =>
            record.role.toString().toLowerCase().includes(value.toLowerCase()),
    },
    {
        title: '开始时间',
        dataIndex: 'start_time',
        width: '12%',
        customFilterDropdown: true,
        onFilter: (value, record) =>
            record.role.toString().toLowerCase().includes(value.toLowerCase()),
    },
    {
        title: '结束时间',
        dataIndex: 'end_time',
        width: '12%',
        customFilterDropdown: true,
        onFilter: (value, record) =>
            record.role.toString().toLowerCase().includes(value.toLowerCase()),
    },
    {
        title: '操作',
        dataIndex: 'operation',
    }
];

const handleSearch = (selectedKeys, confirm, dataIndex) => {
    confirm();
    state.searchText = selectedKeys[0];
    state.searchedColumn = dataIndex;
};

const handleReset = clearFilters => {
    clearFilters({ confirm: true });
    state.searchText = '';
};

const visible = ref(false);
const showConfirm = (op, id) => {
    if (op === "agree") {
        Modal.confirm({
            title: '确认操作',
            icon: createVNode(ExclamationCircleOutlined),
            content: '确定同意？',
            okText: '确认',
            cancelText: '取消',
            onOk() {
                agreeApplication(id);
            }
        });
    } else if (op === "refuse") {
        Modal.confirm({
            title: '确认操作',
            icon: createVNode(ExclamationCircleOutlined),
            content: '确认驳回？',
            okText: '确认',
            cancelText: '取消',
            onOk() {
                rejectApplication(id);
            }
        });
    }
}


const agreeApplication = (id) => {
    api.get("/activity/enrollment/agree/" + id).then(res => {
        let {msg} = res.data;
        currentApplicationData.value = currentApplicationData.value.filter(item => item.id !== id);
        message.success(msg);
    }).catch(err => {
        let {msg} = err.response.data;
        message.error(msg);
    })
}

const rejectApplication = (id) => {
    api.get("/activity/enrollment/reject/" + id).then(res => {
        let {msg} = res.data;
        currentRejectedData.value.push(currentApplicationData.value.find(item => item.id === id));
        currentApplicationData.value = currentApplicationData.value.filter(item => item.id !== id);
        message.success(msg);
    }).catch(err => {
        let {msg} = err.response.data;
        message.error(msg);
    })
}
const showModal = id => {
    visible.value = true;
    current_activity_id.value = id;
    currentActivity.value = activityData.value.find(item => item.id === id);
    currentApplicationData.value = currentActivity.value.activity_audits.filter(item => item.status === 'applying');
    currentRejectedData.value = currentActivity.value.activity_audits.filter(item => item.status === 'rejected');
};
const handleCancel = () => {
    visible.value = false;
};

const countDown = () => {
    let secondsToGo = 5;
    const modal = Modal.success({
        title: '操作成功',
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

const loading = ref(false);
const openEnroll = () => {
    loading.value = true;
    api.patch("/activity/" + current_activity_id.value, {
        'is_enrolling': '1'
    }).then(res => {
        loading.value = false;
        const currentActivityIndex = activityData.value.findIndex(
            (activity) => activity.id === current_activity_id.value
        );
        if (currentActivityIndex !== -1) {
            activityData.value[currentActivityIndex].is_enrolling = '1';
        }
        message.success("活动已开始报名")
    }).catch(err => {
        let {msg} = err.response.data;
        loading.value = false;
        message.error(msg);
    })
}
const closeEnroll = () => {
    loading.value = true;
    api.patch("/activity/" + current_activity_id.value, {
        'is_enrolling': '0'
    }).then(res => {
        loading.value = false;
        const currentActivityIndex = activityData.value.findIndex(
            (activity) => activity.id === current_activity_id.value
        );
        if (currentActivityIndex !== -1) {
            activityData.value[currentActivityIndex].is_enrolling = '0';
        }
        message.success("活动已停止报名")
    }).catch(err => {
        let {msg} = err.response.data;
        loading.value = false;
        message.error(msg);
    })
}

const shouldRenderOpenEnrollButton = computed(() => {
    // 获取当前活动的类型
    const currentActivity = activityData.value.find(
        (activity) => activity.id === current_activity_id.value
    );
    return currentActivity.type !== "仅分配" && currentActivity.is_enrolling === '0';
});

const shouldRenderCloseEnrollButton = computed(() => {
    // 获取当前活动的类型
    const currentActivity = activityData.value.find(
        (activity) => activity.id === current_activity_id.value
    );
    return currentActivity.type !== "仅分配" && currentActivity.is_enrolling === '1';
});


</script>
<template>
    <a-layout-content
            :style="{margin: '16px'}"
    >
        <h2>审核列表</h2>
        <div style="padding: 8px;" v-if="isShow" >
            <a-tabs v-model:activeKey="activeKey" @update:activeKey="handleTabChange" type="card">
                <a-tab-pane key="activity" tab="按活动分组">
                    <a-spin :spinning="spinning" tip="Loading...">
                        <a-table style="background-color: #FFFFFF;" :columns="columns" :data-source="activityData" bordered>
                            <template
                                #customFilterDropdown="{ setSelectedKeys, selectedKeys, confirm, clearFilters, column }"
                            >
                                <div style="padding: 8px">
                                    <a-input
                                        ref="searchInput"
                                        :placeholder="`Search ${column.dataIndex}`"
                                        :value="selectedKeys[0]"
                                        style="width: 188px; margin-bottom: 8px; display: block"
                                        @change="e => setSelectedKeys(e.target.value ? [e.target.value] : [])"
                                        @pressEnter="handleSearch(selectedKeys, confirm, column.dataIndex)"
                                    />
                                    <a-button
                                        type="primary"
                                        size="small"
                                        style="width: 90px; margin-right: 8px"
                                        @click="handleSearch(selectedKeys, confirm, column.dataIndex)"
                                    >
                                        <template #icon><search-outlined /></template>
                                        Search
                                    </a-button>
                                    <a-button size="small" style="width: 90px" @click="handleReset(clearFilters)">
                                        Reset
                                    </a-button>
                                </div>
                            </template>
                            <template #bodyCell="{ column, text, record }">
                                <template v-if="['title', 'type', 'place', 'start_datetime', 'end_datetime'].includes(column.dataIndex)">
                                    <div>
                                        <a-input
                                            v-if="editableData[record.key]"
                                            v-model:value="editableData[record.key][column.dataIndex]"
                                            style="margin: -5px 0"
                                        />
                                        <template v-else>
                                            {{ text }}
                                        </template>
                                    </div>
                                </template>
                                <template v-else-if="column.dataIndex === 'operation'">
                                    <div class="editable-row-operations">
                        <span>
                          <a @click="showModal(record.id)">详情</a>
                        </span>
                                    </div>
                                </template>
                            </template>
                        </a-table>
                    </a-spin>
                </a-tab-pane>
                <a-tab-pane key="type" tab="按类型分组">
                    <a-spin :spinning="spinning" tip="Loading...">
                        <a-tabs v-model:activeKey="activeKey2" @update:activeKey="handleTabChange" type="card">
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
                                            <a-descriptions-item label="地点">{{  item.activity.place  }}</a-descriptions-item>
                                            <a-descriptions-item label="需求">{{ item.activity.note }}</a-descriptions-item>
                                            <a-descriptions-item label="开始时间">{{ item.activity.start_time }}</a-descriptions-item>
                                            <a-descriptions-item label="结束时间">{{  item.activity.end_time  }}</a-descriptions-item>
                                            <a-descriptions-item label="面向人员类型">{{  item.activity.type  }}</a-descriptions-item>
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
                                            <a-descriptions-item label="活动标题">校内8#影视中心</a-descriptions-item>
                                            <a-descriptions-item label="负责人学籍号">demo demo demo demo demo demo demo demo demo demo demo demo demo demo demo demo demo demo demo demo demo demo demo demo demo demo demo demo demo demo demo demo demo demo demo demo demo demo demo demo demo demo demo demo demo demo demo demo demo demo demo demo demo demo demo demo demo demo demo demo</a-descriptions-item>
                                            <a-descriptions-item label="负责人姓名">2023/05/14 14:45:00</a-descriptions-item>
                                            <a-descriptions-item label="报名者">2023/05/14 14:45:00</a-descriptions-item>
                                            <a-descriptions-item label="报名时间">2023/05/14 14:45:00</a-descriptions-item>
                                        </a-descriptions>
                                        <a-pagination align="center" style="margin-top: 8px;" v-model:current="currentRejectedPage" simple pageSize="5"
                                                      :total="data_rejected.length" v-if="data_rejected.length !== 0"/>
                                    </a-space>
                                </a-spin>
                            </a-tab-pane>
                        </a-tabs>
                    </a-spin>

                </a-tab-pane>
            </a-tabs>

        </div>
        <div style="padding: 8px; background-color: #FFFFFF" v-if="isShow === false" >
            管理员相关功能不支持宽度小于525px的设备显示，建议使用电脑端操作。
        </div>
        <a-modal v-model:visible="visible" title="报名管理">
            <a-card>
                <div>
                    <a-button type="primary" style="padding-top: 5px; box-sizing: border-box; margin-left: 4px;"
                              @click="closeEnroll" :loading="loading" v-if="shouldRenderCloseEnrollButton" danger>关闭报名
                    </a-button>
                    <a-button type="primary" style="padding-top: 5px; box-sizing: border-box; margin-left: 4px;"
                              @click="openEnroll" :loading="loading" v-if="shouldRenderOpenEnrollButton">打开报名
                    </a-button>
                </div>
            </a-card>
            <a-tabs v-model:activeKey="activeKey2" @update:activeKey="handleTabChange">
                <a-tab-pane key="activity_applying" tab="申请中">
                    <a-descriptions-item v-if="currentApplicationData.length === 0">
                        <div style="height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center;">
                            <a-empty :image="Empty.PRESENTED_IMAGE_SIMPLE" style="width: 100%;  "/>
                        </div>
                    </a-descriptions-item>
                    <a-card v-for="item in currentApplicationData">
                        <a-descriptions
                            :title="item.uid + '-' + item.department + '-' + item.name"
                            layout="vertical" style="padding-top: 6px;">

                            <a-descriptions-item label="报名时间">{{  item.created_at  }}</a-descriptions-item>
                            <a-descriptions-item label="操作" style="display:flex; gap: 4px;">
                                <a-button type="primary" style="padding-top: 5px; box-sizing: border-box;"
                                          @click="showConfirm('agree', item.id)">同意
                                </a-button>
                                <a-button type="primary" style="padding-top: 5px; box-sizing: border-box; margin-left: 4px;" danger
                                          @click="showConfirm('refuse', item.id)">拒绝
                                </a-button>
                            </a-descriptions-item>
                        </a-descriptions>
                    </a-card>
                </a-tab-pane>

                <a-tab-pane key="activity_rejected" tab="已拒绝">
                    <a-descriptions-item v-if="currentRejectedData.length === 0">
                        <div style="height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center;">
                            <a-empty :image="Empty.PRESENTED_IMAGE_SIMPLE" style="width: 100%;  "/>
                        </div>
                    </a-descriptions-item>
                    <a-card v-for="item in currentRejectedData">
                        <a-descriptions
                            :title="item.uid + '-' + item.department + '-' + item.name"
                            layout="vertical" style="padding-top: 6px;">

                            <a-descriptions-item label="报名时间">{{ item.created_at }}</a-descriptions-item>
                        </a-descriptions>
                    </a-card>
                </a-tab-pane>
            </a-tabs>

            <template #footer>
                <a-button type="primary" @click="handleCancel">关闭</a-button>
            </template>
        </a-modal>
    </a-layout-content>

</template>

<style scoped>
.editable-row-operations a {
    margin-right: 8px;
}
</style>