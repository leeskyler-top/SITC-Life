<script setup>
import {createVNode, onMounted, ref, computed} from "vue";
import {message, Modal} from "ant-design-vue";
import {Empty} from "ant-design-vue";
import {ExclamationCircleOutlined} from "@ant-design/icons-vue";
import my_config from "@/my_config";
import api from "@/api";

const dataApplying = ref([]);
const dataDelayApplying = ref([]);
const dataDelayed = ref([]);
const dataRejectedDelay = ref([]);
const dataRejected = ref([]);
const dataDamaged = ref([]);
const dataMissed = ref([]);

const activeKey = ref('application');
const activeKey2 = ref('applying');
const activeKey3 = ref('delay-applying');
const activeKey4 = ref('damaged');

const current = ref(1);

const spinning = ref(false);

const images = ref([]);

const visiblePhotos = ref(false)
const showPhotos = (id, key) => {
    visiblePhotos.value = true;
    if (key === 'applying') {
        images.value = JSON.parse(dataApplying.value.find(i => i.id === id).assigned_url);
        console.log(dataApplying.value.find(i => i.id === id).assigned_url);
    } else if (key === 'rejected') {
        images.value = JSON.parse(dataRejected.value.find(i => i.id === id).assigned_url);
    } else if (key === 'damaged') {
        images.value = JSON.parse(dataDamaged.value.find(i => i.id === id).damaged_url);
    }
};
const image_base_url = my_config.images_admin_base_url;

const handleCancel = () => {
    visiblePhotos.value = false;
};

const listApplyingApplications = () => {
    spinning.value = true;
    api.get("/equipment/list/application/applying").then(res => {
        spinning.value = false
        let {data} = res.data;
        dataApplying.value = data;
    }).catch(err => {
        spinning.value = false;
        let {msg} = err.response.data;
        message.error(msg);
    });
}
const listRejectedApplications = () => {
    spinning.value = true;
    api.get("/equipment/list/application/rejected").then(res => {
        spinning.value = false
        let {data} = res.data;
        dataRejected.value = data;
    }).catch(err => {
        spinning.value = false;
        let {msg} = err.response.data;
        message.error(msg);
    });
}
const listDelayApplyingApplications = () => {
    spinning.value = true;
    api.get("/equipment/list/delay-application/delay-applying").then(res => {
        spinning.value = false
        let {data} = res.data;
        dataDelayApplying.value = data;
    }).catch(err => {
        spinning.value = false;
        let {msg} = err.response.data;
        message.error(msg);
    });
}
const listDelayedApplications = () => {
    spinning.value = true;
    api.get("/equipment/list/delay-application/delayed").then(res => {
        spinning.value = false
        let {data} = res.data;
        dataDelayed.value = data
    }).catch(err => {
        spinning.value = false;
        let {msg} = err.response.data;
        message.error(msg);
    });
}
const listDelayRejectedApplications = () => {
    spinning.value = true;
    api.get("/equipment/list/delay-application/rejected").then(res => {
        spinning.value = false
        let {data} = res.data;
        dataRejectedDelay.value = data;
    }).catch(err => {
        spinning.value = false;
        let {msg} = err.response.data;
        message.error(msg);
    });
}
const listDamagedApplications = () => {
    spinning.value = true;
    api.get("/equipment/list/application/damaged").then(res => {
        spinning.value = false
        let {data} = res.data;
        dataDamaged.value = data;
    }).catch(err => {
        spinning.value = false;
        let {msg} = err.response.data;
        message.error(msg);
    });
}
const listMissedApplications = () => {
    spinning.value = true;
    api.get("/equipment/list/application/missed").then(res => {
        spinning.value = false
        let {data} = res.data;
        dataMissed.value = data;
    }).catch(err => {
        spinning.value = false;
        let {msg} = err.response.data;
        message.error(msg);
    });
}

onMounted(() => {
    listApplyingApplications();
});

const handleTabChange = (key) => {
    if (key === 'applying' || key === 'application') {
        listApplyingApplications();
    } else if (key === 'rejected') {
        listRejectedApplications();
    } else if (key === 'delay-applying' || key === 'delay-application') {
        listDelayApplyingApplications();
    } else if (key === 'delayed') {
        listDelayedApplications();
    } else if (key === 'delay-rejected') {
        listDelayRejectedApplications();
    } else if (key === 'damaged' || key === 'reported') {
        listDamagedApplications();
    } else if (key === 'missed') {
        listMissedApplications();
    }
};

const currentApplyingPage = ref(1);
const currentRejectedPage = ref(1);
const currentDelayApplyingPage = ref(1);
const currentDelayedPage = ref(1);
const currentDelayRejectedPage = ref(1);
const currentDamagedPage = ref(1);
const currentMissedPage = ref(1);

// Define computed properties to calculate current page data for each tab
const currentApplyingPageData = computed(() => {
    const startIdx = (currentApplyingPage.value - 1) * 5;
    const endIdx = startIdx + 5;
    return dataApplying.value.slice(startIdx, endIdx);
});
const currentRejectedPageData = computed(() => {
    const startIdx = (currentRejectedPage.value - 1) * 5;
    const endIdx = startIdx + 5;
    return dataRejected.value.slice(startIdx, endIdx);
});
const currentDelayApplyingPageData = computed(() => {
    const startIdx = (currentDelayApplyingPage.value - 1) * 5;
    const endIdx = startIdx + 5;
    return dataDelayApplying.value.slice(startIdx, endIdx);
});
const currentDelayedPageData = computed(() => {
    const startIdx = (currentDelayedPage.value - 1) * 5;
    const endIdx = startIdx + 5;
    return dataDelayed.value.slice(startIdx, endIdx);
});
const currentDelayRejectedPageData = computed(() => {
    const startIdx = (currentDelayRejectedPage.value - 1) * 5;
    const endIdx = startIdx + 5;
    return dataRejectedDelay.value.slice(startIdx, endIdx);
});
const currentDamagedPageData = computed(() => {
    const startIdx = (currentDamagedPage.value - 1) * 5;
    const endIdx = startIdx + 5;
    return dataDamaged.value.slice(startIdx, endIdx);
});
const currentMissedPageData = computed(() => {
    const startIdx = (currentMissedPage.value - 1) * 5;
    const endIdx = startIdx + 5;
    return dataMissed.value.slice(startIdx, endIdx);
});

const loading = ref(false)
const agreeApplication = (id) => {
    loading.value = true;
    api.get("/equipment/audit/rent-application/agree/" + id).then(res => {
        let {msg} = res.data;
        loading.value = false;
        dataApplying.value = dataApplying.value.filter(item => item.id !== id);
        message.success(msg);
    }).catch(err => {
        let {msg} = err.response.data;
        loading.value = false;
        message.error(msg);
    });
}

const rejectApplication = (id) => {
    loading.value = true;
    api.get("/equipment/audit/rent-application/reject/" + id).then(res => {
        let {msg} = res.data;
        loading.value = false;
        dataApplying.value = dataApplying.value.filter(item => item.id !== id);
        message.success(msg);
    }).catch(err => {
        let {msg} = err.response.data;
        loading.value = false;
        message.error(msg);
    });
}

const agreeDelayApplication = (id) => {
    loading.value = true;
    api.get("/equipment/audit/delay-application/agree/" + id).then(res => {
        let {msg} = res.data;
        loading.value = false;
        dataDelayApplying.value = dataDelayApplying.value.filter(item => item.id !== id);
        message.success(msg);
    }).catch(err => {
        let {msg} = err.response.data;
        loading.value = false;
        message.error(msg);
    });
}

const rejectDelayApplication = (id) => {
    loading.value = true;
    api.get("/equipment/audit/delay-application/reject/" + id).then(res => {
        let {msg} = res.data;
        loading.value = false;
        dataDelayApplying.value = dataDelayApplying.value.filter(item => item.id !== id);
        message.success(msg);
    }).catch(err => {
        let {msg} = err.response.data;
        loading.value = false;
        message.error(msg);
    });
}

const showConfirm = (id, op) => {
    if (op === "agree-equipmentApplication") {
        Modal.confirm({
            title: '确认操作',
            icon: createVNode(ExclamationCircleOutlined),
            content: '确定同意此设备请求？',
            okText: '确认',
            cancelText: '取消',
            onOk() {
                agreeApplication(id);
            }
        });
    } else if (op === "reject-equipmentApplication") {
        Modal.confirm({
            title: '确认操作',
            icon: createVNode(ExclamationCircleOutlined),
            content: '确认驳回此设备请求？',
            okText: '确认',
            cancelText: '取消',
            onOk() {
                rejectApplication(id);
            }
        });
    } else if (op === "agree-delayApplication") {
        Modal.confirm({
            title: '确认操作',
            icon: createVNode(ExclamationCircleOutlined),
            content: '确认同意此延期请求？',
            okText: '确认',
            cancelText: '取消',
            onOk() {
                agreeDelayApplication(id);
            }
        });
    } else if (op === "reject-delayApplication") {
        Modal.confirm({
            title: '确认操作',
            icon: createVNode(ExclamationCircleOutlined),
            content: '确认驳回此延期请求？',
            okText: '确认',
            cancelText: '取消',
            onOk() {
                rejectDelayApplication(id);
            }
        });
    }
}

const token = ref(localStorage.token);

</script>

<template>
    <a-layout-content :style="{margin: '16px', height: '100%'}">
        <h2>
            设备申请审核
        </h2>
        <a-tabs v-model:activeKey="activeKey" @update:activeKey="handleTabChange" type="card">
            <a-tab-pane key="application" tab="设备申请">
                <a-tabs v-model:activeKey="activeKey2" @update:activeKey="handleTabChange" type="card">
                    <a-tab-pane key="applying" tab="待审核">
                        <a-spin :spinning="spinning" tip="Loading...">
                            <a-descriptions-item v-if="dataApplying.length === 0">
                                <div style="height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center;">
                                    <a-empty :image="Empty.PRESENTED_IMAGE_SIMPLE" style="width: 100%;  "/>
                                </div>
                            </a-descriptions-item>
                            <a-space direction="vertical" :size="5" style="height: 100%">

                                <a-descriptions v-for="item in currentApplyingPageData" title="设备申请"
                                                style="background-color: #FFFFFF; padding: 16px; box-sizing: border-box;">
                                    <a-descriptions-item label="固定资产编号">{{
                                        item.equipment_fixed_assets_num
                                        }}
                                    </a-descriptions-item>
                                    <a-descriptions-item label="设备名称">{{
                                        item.equipment_name
                                        }}
                                    </a-descriptions-item>
                                    <a-descriptions-item label="设备型号">{{
                                        item.equipment_model
                                        }}
                                    </a-descriptions-item>
                                    <a-descriptions-item label="申请时间">{{ item.created_at }}</a-descriptions-item>
                                    <a-descriptions-item label="承诺归还时间">{{
                                        item.apply_time
                                        }}
                                    </a-descriptions-item>
                                    <a-descriptions-item label="使用人学籍号">{{ item.user_uid }}</a-descriptions-item>
                                    <a-descriptions-item label="使用人姓名">{{ item.user_name }}</a-descriptions-item>
                                    <a-descriptions-item label="状态">{{ item.status }}</a-descriptions-item>
                                    <a-descriptions-item label="操作">
                                        <a-row style="gap: 5px;">
                                            <a-col>
                                                <a-button type="primary"
                                                          style="padding-top: 5px; box-sizing: border-box;" danger
                                                          @click="showConfirm(item.id, 'reject-equipmentApplication')">
                                                    拒绝
                                                </a-button>
                                            </a-col>
                                            <a-col>
                                                <a-button type="primary"
                                                          style="padding-top: 5px; box-sizing: border-box;"
                                                          @click="showConfirm(item.id, 'agree-equipmentApplication')">同意
                                                </a-button>
                                            </a-col>
                                            <a-col>
                                                <a-button type="primary"
                                                          style="padding-top: 5px; box-sizing: border-box;"
                                                          @click="showPhotos(item.id, 'applying')">查看照片
                                                </a-button>
                                            </a-col>
                                        </a-row>
                                    </a-descriptions-item>

                                </a-descriptions>
                                <a-pagination align="center" style="margin-top: 8px;"
                                              v-model:current="currentApplyingPage" simple pageSize="5"
                                              :total="dataApplying.length" v-if="dataApplying.length !== 0"/>
                            </a-space>
                        </a-spin>
                    </a-tab-pane>
                    <a-tab-pane key="rejected" tab="已拒绝">
                        <a-spin :spinning="spinning" tip="Loading...">
                            <a-descriptions-item v-if="dataRejected.length === 0">
                                <div style="height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center;">
                                    <a-empty :image="Empty.PRESENTED_IMAGE_SIMPLE" style="width: 100%;  "/>
                                </div>
                            </a-descriptions-item>
                            <a-space direction="vertical" :size="5" style="height: 100%">

                                <a-descriptions v-for="item in currentRejectedPageData" title="借条"
                                                style="background-color: #FFFFFF; padding: 16px; box-sizing: border-box;">
                                    <a-descriptions-item label="固定资产编号">{{
                                        item.equipment_fixed_assets_num
                                        }}
                                    </a-descriptions-item>
                                    <a-descriptions-item label="设备名称">{{
                                        item.equipment_name
                                        }}
                                    </a-descriptions-item>
                                    <a-descriptions-item label="设备型号">{{
                                        item.equipment_model
                                        }}
                                    </a-descriptions-item>
                                    <a-descriptions-item label="申请时间">{{ item.created_at }}</a-descriptions-item>
                                    <a-descriptions-item label="承诺归还时间">{{
                                        item.apply_time
                                        }}
                                    </a-descriptions-item>
                                    <a-descriptions-item label="使用人学籍号">{{ item.user_uid }}</a-descriptions-item>
                                    <a-descriptions-item label="使用人姓名">{{ item.user_name }}</a-descriptions-item>
                                    <a-descriptions-item label="审批人学籍号">{{ item.audit_uid }}</a-descriptions-item>
                                    <a-descriptions-item label="审批人姓名">{{ item.audit_name }}</a-descriptions-item>
                                    <a-descriptions-item label="审批人时间">{{ item.audit_time }}</a-descriptions-item>
                                    <a-descriptions-item label="状态">{{ item.status }}</a-descriptions-item>
                                    <a-descriptions-item label="操作">
                                        <a-row style="gap: 5px;">
                                            <a-col>
                                                <a-button type="primary"
                                                          style="padding-top: 5px; box-sizing: border-box;"
                                                          @click="showPhotos(item.id, 'rejected')">查看照片
                                                </a-button>
                                            </a-col>
                                        </a-row>
                                    </a-descriptions-item>

                                </a-descriptions>
                                <a-pagination align="center" style="margin-top: 8px;"
                                              v-model:current="currentRejectedPage" simple pageSize="5"
                                              :total="dataRejected.length" v-if="dataRejected.length !== 0"/>
                            </a-space>
                        </a-spin>
                    </a-tab-pane>
                </a-tabs>
            </a-tab-pane>
            <a-tab-pane key="delay-application" tab="延期申请">
                <a-tabs v-model:activeKey="activeKey3" @update:activeKey="handleTabChange" type="card">
                    <a-tab-pane key="delay-applying" tab="待审核延期申请">
                        <a-spin :spinning="spinning" tip="Loading...">
                            <a-descriptions-item v-if="dataDelayApplying.length === 0">
                                <div style="height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center;">
                                    <a-empty :image="Empty.PRESENTED_IMAGE_SIMPLE" style="width: 100%;  "/>
                                </div>
                            </a-descriptions-item>
                            <a-space direction="vertical" :size="5" style="height: 100%">

                                <a-descriptions v-for="item in currentDelayApplyingPageData" title="延期申请"
                                                style="background-color: #FFFFFF; padding: 16px; box-sizing: border-box;">
                                    <a-descriptions-item label="固定资产编号">{{
                                        item.equipment_fixed_assets_num
                                        }}
                                    </a-descriptions-item>
                                    <a-descriptions-item label="设备名称">{{
                                        item.equipment_name
                                        }}
                                    </a-descriptions-item>
                                    <a-descriptions-item label="设备型号">{{
                                        item.equipment_model
                                        }}
                                    </a-descriptions-item>
                                    <a-descriptions-item label="申请时间">{{ item.created_at }}</a-descriptions-item>
                                    <a-descriptions-item label="承诺延期归还时间">{{
                                        item.apply_time
                                        }}
                                    </a-descriptions-item>
                                    <a-descriptions-item label="理由">{{ item.reason }}</a-descriptions-item>
                                    <a-descriptions-item label="使用人学籍号">{{ item.user_uid }}</a-descriptions-item>
                                    <a-descriptions-item label="使用人姓名">{{ item.user_name }}</a-descriptions-item>
                                    <a-descriptions-item label="设备申请审批人学籍号">{{
                                        item.equipment_application_audit_uid
                                        }}
                                    </a-descriptions-item>
                                    <a-descriptions-item label="设备申请审批人姓名">{{
                                        item.equipment_application_audit_name
                                        }}
                                    </a-descriptions-item>
                                    <a-descriptions-item label="状态">{{ item.status }}</a-descriptions-item>
                                    <a-descriptions-item label="操作">
                                        <a-row style="gap: 5px;">
                                            <a-col>
                                                <a-button danger style="padding-top: 5px; box-sizing: border-box;"
                                                          @click="showConfirm(item.id , 'reject-delayApplication')">拒绝
                                                </a-button>
                                            </a-col>
                                            <a-col>
                                                <a-button type="primary"
                                                          style="padding-top: 5px; box-sizing: border-box;"
                                                          @click="showConfirm(item.id, 'agree-delayApplication')">同意
                                                </a-button>
                                            </a-col>
                                        </a-row>
                                    </a-descriptions-item>

                                </a-descriptions>
                                <a-pagination align="center" style="margin-top: 8px;"
                                              v-model:current="currentDelayApplyingPage" simple pageSize="5"
                                              :total="dataDelayApplying.length"
                                              v-if="dataDelayApplying.length !== 0"/>
                            </a-space>
                        </a-spin>
                    </a-tab-pane>
                    <a-tab-pane key="delayed" tab="已同意">
                        <a-spin :spinning="spinning" tip="Loading...">
                            <a-descriptions-item v-if="dataDelayed.length === 0">
                                <div style="height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center;">
                                    <a-empty :image="Empty.PRESENTED_IMAGE_SIMPLE" style="width: 100%;  "/>
                                </div>
                            </a-descriptions-item>
                            <a-space direction="vertical" :size="5" style="height: 100%">

                                <a-descriptions v-for="item in currentDelayedPageData" title="延期申请"
                                                style="background-color: #FFFFFF; padding: 16px; box-sizing: border-box;">
                                    <a-descriptions-item label="固定资产编号">{{
                                        item.equipment_fixed_assets_num
                                        }}
                                    </a-descriptions-item>
                                    <a-descriptions-item label="设备名称">{{
                                        item.equipment_name
                                        }}
                                    </a-descriptions-item>
                                    <a-descriptions-item label="设备型号">{{
                                        item.equipment_model
                                        }}
                                    </a-descriptions-item>
                                    <a-descriptions-item label="申请时间">{{ item.created_at }}</a-descriptions-item>
                                    <a-descriptions-item label="承诺归还时间">{{
                                        item.apply_time
                                        }}
                                    </a-descriptions-item>
                                    <a-descriptions-item label="使用人学籍号">{{ item.user_uid }}</a-descriptions-item>
                                    <a-descriptions-item label="使用人姓名">{{ item.user_name }}</a-descriptions-item>
                                    <a-descriptions-item label="设备申请延期审批人学籍号">{{
                                        item.audit_uid
                                        }}
                                    </a-descriptions-item>
                                    <a-descriptions-item label="设备申请延期审批人姓名">{{
                                            item.audit_name
                                        }}
                                    </a-descriptions-item>
                                    <a-descriptions-item label="设备申请审批时间">{{
                                            item.equipment_application_audit_time
                                        }}
                                    </a-descriptions-item>
                                    <a-descriptions-item label="设备申请审批人学籍号">{{
                                            item.equipment_application_audit_uid
                                        }}
                                    </a-descriptions-item>
                                    <a-descriptions-item label="设备申请审批人姓名">{{
                                            item.equipment_application_audit_name
                                        }}
                                    </a-descriptions-item>
                                    <a-descriptions-item label="状态">{{ item.status }}</a-descriptions-item>
                                </a-descriptions>
                                <a-pagination align="center" style="margin-top: 8px;"
                                              v-model:current="currentDelayedPage" simple pageSize="5"
                                              :total="dataDelayed.length" v-if="dataDelayed.length !== 0"/>
                            </a-space>
                        </a-spin>
                    </a-tab-pane>
                    <a-tab-pane key="delay-rejected" tab="已拒绝">
                        <a-spin :spinning="spinning" tip="Loading...">
                            <a-descriptions-item v-if="dataRejectedDelay.length === 0">
                                <div style="height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center;">
                                    <a-empty :image="Empty.PRESENTED_IMAGE_SIMPLE" style="width: 100%;  "/>
                                </div>
                            </a-descriptions-item>
                            <a-space direction="vertical" :size="5" style="height: 100%">

                                <a-descriptions v-for="item in currentDelayRejectedPageData" title="延期申请"
                                                style="background-color: #FFFFFF; padding: 16px; box-sizing: border-box;">
                                    <a-descriptions-item label="固定资产编号">{{
                                        item.equipment_fixed_assets_num
                                        }}
                                    </a-descriptions-item>
                                    <a-descriptions-item label="设备名称">{{
                                        item.equipment_name
                                        }}
                                    </a-descriptions-item>
                                    <a-descriptions-item label="设备型号">{{
                                        item.equipment_model
                                        }}
                                    </a-descriptions-item>
                                    <a-descriptions-item label="申请时间">{{ item.created_at }}</a-descriptions-item>
                                    <a-descriptions-item label="承诺归还时间">{{
                                        item.apply_time
                                        }}
                                    </a-descriptions-item>
                                    <a-descriptions-item label="使用人学籍号">{{ item.user_uid }}</a-descriptions-item>
                                    <a-descriptions-item label="使用人姓名">{{ item.user_name }}</a-descriptions-item>
                                    <a-descriptions-item label="设备延期申请审批人学籍号">{{
                                            item.audit_uid
                                        }}
                                    </a-descriptions-item>
                                    <a-descriptions-item label="设备延期申请审批人姓名">{{
                                            item.audit_name
                                        }}
                                    </a-descriptions-item>
                                    <a-descriptions-item label="设备申请审批人时间">{{
                                            item.equipment_application_audit_time
                                        }}
                                    </a-descriptions-item>
                                    <a-descriptions-item label="设备申请审批人学籍号">{{
                                            item.equipment_application_audit_uid
                                        }}
                                    </a-descriptions-item>
                                    <a-descriptions-item label="设备申请审批人姓名">{{
                                            item.equipment_application_audit_name
                                        }}
                                    </a-descriptions-item>
                                    <a-descriptions-item label="状态">{{ item.status }}</a-descriptions-item>
                                </a-descriptions>
                                <a-pagination align="center" style="margin-top: 8px;"
                                              v-model:current="currentDelayRejectedPage" simple pageSize="5"
                                              :total="dataRejectedDelay.length"
                                              v-if="dataRejectedDelay.length !== 0"/>
                            </a-space>
                        </a-spin>
                    </a-tab-pane>
                </a-tabs>
            </a-tab-pane>
            <a-tab-pane key="reported" tab="异常报告">
                <a-tabs v-model:activeKey="activeKey4" @update:activeKey="handleTabChange" type="card">
                    <a-tab-pane key="damaged" tab="报损坏">
                        <a-spin :spinning="spinning" tip="Loading...">
                            <a-descriptions-item v-if="dataDamaged.length === 0">
                                <div style="height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center;">
                                    <a-empty :image="Empty.PRESENTED_IMAGE_SIMPLE" style="width: 100%;  "/>
                                </div>
                            </a-descriptions-item>
                            <a-space direction="vertical" :size="5" style="height: 100%">

                                <a-descriptions v-for="item in currentDamagedPageData" title="损坏情况"
                                                style="background-color: #FFFFFF; padding: 16px; box-sizing: border-box;">
                                    <a-descriptions-item label="设备ID">{{
                                        item.equipment_fixed_assets_num
                                        }}
                                    </a-descriptions-item>
                                    <a-descriptions-item label="设备名称">{{
                                        item.equipment_name
                                        }}
                                    </a-descriptions-item>
                                    <a-descriptions-item label="设备型号">{{
                                        item.equipment_model
                                        }}
                                    </a-descriptions-item>
                                    <a-descriptions-item label="使用人学籍号">{{ item.user_uid }}</a-descriptions-item>
                                    <a-descriptions-item label="使用人姓名">{{ item.user_name }}</a-descriptions-item>
                                    <a-descriptions-item label="审批人学籍号">{{ item.audit_uid }}</a-descriptions-item>
                                    <a-descriptions-item label="审批人姓名">{{ item.audit_name }}</a-descriptions-item>
                                    <a-descriptions-item label="审批时间">{{ item.audit_time }}</a-descriptions-item>
                                    <a-descriptions-item label="报告时间">{{ item.report_time }}</a-descriptions-item>
                                    <a-descriptions-item label="情况">{{ item.status }}</a-descriptions-item>
                                    <a-descriptions-item label="操作">
                                        <a-row style="gap: 5px;">
                                            <a-col>
                                                <a-button type="primary"
                                                          style="padding-top: 5px; box-sizing: border-box;"
                                                          @click="showPhotos(item.id, 'damaged')">查看照片
                                                </a-button>
                                            </a-col>
                                        </a-row>
                                    </a-descriptions-item>

                                </a-descriptions>
                                <a-pagination align="center" style="margin-top: 8px;"
                                              v-model:current="currentDamagedPage" simple pageSize="5"
                                              :total="dataDamaged.length" v-if="dataDamaged.length !== 0"/>
                            </a-space>
                        </a-spin>
                    </a-tab-pane>
                    <a-tab-pane key="missed" tab="报丢失">
                        <a-spin :spinning="spinning" tip="Loading...">
                            <a-descriptions-item v-if="dataMissed.length === 0">
                                <div style="height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center;">
                                    <a-empty :image="Empty.PRESENTED_IMAGE_SIMPLE" style="width: 100%;  "/>
                                </div>
                            </a-descriptions-item>
                            <a-space direction="vertical" :size="5" style="height: 100%">

                                <a-descriptions v-for="item in currentMissedPageData" title="丢失记录"
                                                style="background-color: #FFFFFF; padding: 16px; box-sizing: border-box;">
                                    <a-descriptions-item label="设备ID">{{
                                        item.equipment_fixed_assets_num
                                        }}
                                    </a-descriptions-item>
                                    <a-descriptions-item label="设备名称">{{
                                        item.equipment_name
                                        }}
                                    </a-descriptions-item>
                                    <a-descriptions-item label="设备型号">{{
                                        item.equipment_model
                                        }}
                                    </a-descriptions-item>
                                    <a-descriptions-item label="使用人学籍号">{{ item.user_uid }}</a-descriptions-item>
                                    <a-descriptions-item label="使用人姓名">{{ item.user_name }}</a-descriptions-item>
                                    <a-descriptions-item label="审批人学籍号">{{ item.audit_uid }}</a-descriptions-item>
                                    <a-descriptions-item label="审批人姓名">{{ item.audit_name }}</a-descriptions-item>
                                    <a-descriptions-item label="审批时间">{{ item.audit_time }}</a-descriptions-item>
                                    <a-descriptions-item label="报告时间">{{ item.report_time }}</a-descriptions-item>
                                    <a-descriptions-item label="情况">{{ item.type }}</a-descriptions-item>

                                </a-descriptions>
                                <a-pagination align="center" style="margin-top: 8px;"
                                              v-model:current="currentMissedPage" simple pageSize="5"
                                              :total="dataMissed.length" v-if="dataMissed.length !== 0"/>
                            </a-space>
                        </a-spin>
                    </a-tab-pane>
                </a-tabs>
            </a-tab-pane>
        </a-tabs>
        <a-modal v-model:visible="visiblePhotos" title="查看图片">
            <a-spin :spinning="spinning">
                <a-descriptions-item v-if="!images">
                    <div style="height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center;">
                        <a-empty :image="Empty.PRESENTED_IMAGE_SIMPLE" style="width: 100%;  "/>
                    </div>
                </a-descriptions-item>
                <a-image-preview-group>
                    <a-image v-for="i in images" :width="200"
                             fallback="data:image/png;base64,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"
                             :src="image_base_url + i + '?token=' + token"/>
                </a-image-preview-group>
            </a-spin>
            <template #footer>
                <a-button type="primary" @click="handleCancel">OK</a-button>
            </template>
        </a-modal>
    </a-layout-content>
</template>

<style scoped>

</style>