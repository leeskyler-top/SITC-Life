<script setup>
import {computed, onMounted, reactive, ref} from "vue";
import {Empty, message} from "ant-design-vue";
import {HomeOutlined, UploadOutlined} from "@ant-design/icons-vue";
import api from "@/api";
import my_config from "@/my_config";

const dataUsing = ref([]);
const dataAssigned = ref([]);
const dataApplying = ref([]);
const dataDelayApplying = ref([]);
const dataDelayed = ref([]);
const dataRejected = ref([]);
const dataReturned = ref([]);
const dataMissed = ref([]);
const dataDamaged = ref([]);

const activeKey = ref('using');
const activeKey2 = ref('all');
const activeKey3 = ref('damaged');



const currentUsingPage = ref(1);
const currentAssignedPage = ref(1);
const currentDelayApplyingPage = ref(1);
const currentDelayedPage = ref(1);
const currentApplyingPage = ref(1);
const currentRejectedPage = ref(1);
const currentReturnedPage = ref(1);
const currentDamagedPage = ref(1);
const currentMissedPage = ref(1);


const formState = reactive({
    delayForm: {
        reason: '',
        apply_time: ''
    },
    report: {
        type: 'damaged',
        damaged_url: []
    },
    return_photos: {
        returned_url: []
    }
});
const formItemLayout = {
    labelCol: {
        span: 6,
    },
    wrapperCol: {
        span: 14,
    },
};
const validateMessages = {
    required: '${label} 必填!',
};

const currentRentApplicationId = ref();

const visibleReturn = ref(false);

const showReturn = (id) => {
    visibleReturn.value = true;
    currentRentApplicationId.value = id;
}

const visibleDelay = ref(false);

const showDelay = (id) => {
    visibleDelay.value = true;
    currentRentApplicationId.value = id;
}

const visibleReport = ref(false);


const showReport = (id) => {
    visibleReport.value = true;
    currentRentApplicationId.value = id;
}

let config = {
    headers: {
        'Content-Type': 'multipart/form-data',
    },
};

// 获取当前日期
const now = new Date();
// 设置最小日期为当前日期
const minDate = ref(now);

// 禁用早于当前日期的日期
const disabledDate = (date) => {
    return date && date.valueOf() < now.valueOf();
};

const delayEquipment = () => {
    loading.value = true;
    api.post("/equipment/delay-apply/" + currentRentApplicationId.value, formState.delayForm).then(res => {
        let {msg} = res.data;
        loading.value = false;
        visibleDelay.value = false;
        formState.delayForm.apply_time = '';
        formState.delayForm.reason = '';
        currentRentApplicationId.value = null;
        let currentData = dataUsing.value.find(item => item.id === currentRentApplicationId.value);
        if (currentData && currentData.status === 'assigned') {
            dataAssigned.value = dataAssigned.value.filter(item => item.id !== currentRentApplicationId.value);
        } else if (currentData && currentData.status === 'delayed') {
            dataDelayed.value = dataDelayed.value.filter(item => item.id !== currentRentApplicationId.value);
        }
        message.success(msg);
    }).catch(err => {
        let {msg} = err.response.data;
        loading.value = false;
        message.error(msg);
    });
}

const returnEquipment = () => {
    loading.value = true;
    let formData = new FormData();
    for (let item of formState.return_photos.returned_url) {
        formData.append('returned_url[]', item.originFileObj)
    }
    api.post("/equipment/back/" + currentRentApplicationId.value, formData, config).then(res => {
        let {msg} = res.data;
        loading.value = false;
        visibleReturn.value = false;
        let currentData = dataUsing.value.find(item => item.id === currentRentApplicationId.value);
        if (currentData && currentData.status === 'assigned') {
            dataAssigned.value = dataAssigned.value.filter(item => item.id !== currentRentApplicationId.value);
        } else if (currentData && currentData.status === 'delay-applying') {
            dataDelayApplying.value = dataDelayApplying.value.filter(item => item.id !== currentRentApplicationId.value);
        } else if (currentData && currentData.status === 'delayed') {
            dataDelayed.value = dataDelayed.value.filter(item => item.id !== currentRentApplicationId.value);
        }
        dataUsing.value = dataUsing.value.filter(item => item.id !== currentRentApplicationId.value);
        formState.return_photos.returned_url = [];
        currentRentApplicationId.value = null;
        message.success(msg);
    }).catch(err => {
        let {msg} = err.response.data;
        loading.value = false;
        message.error(msg);
    });
}

const reportEquipment = () => {
    loading.value = true;
    let formData = new FormData();
    formData.append('type', formState.report.type);
    if (formState.report.type === 'damaged') {
        for (let item of formState.report.damaged_url) {
            formData.append('damaged_url[]', item.originFileObj)
        }
    }
    api.post("/equipment/report/" + currentRentApplicationId.value, formData, config).then(res => {
        let {msg} = res.data;
        loading.value = false;
        visibleReport.value = false;
        let currentData = dataUsing.value.find(item => item.id === currentRentApplicationId.value);
        if (currentData && currentData.status === 'assigned') {
            dataAssigned.value = dataAssigned.value.filter(item => item.id !== currentRentApplicationId.value);
        } else if (currentData && currentData.status === 'delay-applying') {
            dataDelayApplying.value = dataDelayApplying.value.filter(item => item.id !== currentRentApplicationId.value);
        } else if (currentData && currentData.status === 'delayed') {
            dataDelayed.value = dataDelayed.value.filter(item => item.id !== currentRentApplicationId.value);
        }
        dataUsing.value = dataUsing.value.filter(item => item.id !== currentRentApplicationId.value);
        formState.report.damaged_url = [];
        currentRentApplicationId.value = null;
        message.success(msg);
    }).catch(err => {
        let {msg} = err.response.data;
        loading.value = false;
        message.error(msg);
    });
}

const visiblePhotos = ref(false)
const images = ref();
const showPhotos = (id, key) => {
    visiblePhotos.value = true;
    if (key === 'returned') {
        images.value = JSON.parse(dataReturned.value.find(i => i.id === id).returned_url);
    } else if (key === 'damaged') {
        images.value = JSON.parse(dataDamaged.value.find(i => i.id === id).damaged_url);
    }
};
const image_base_url = my_config.images_user_base_url;

const handleCancel = () => {
    visibleReturn.value = false;
    visibleDelay.value = false;
    visibleReport.value = false;
    visiblePhotos.value = false;
};

const spinning = ref(false);
const loading = ref(false);

const listUsingApplications = () => {
    spinning.value = true;
    api.get("/equipment/my/using").then((res) => {
        let {data} = res.data;
        dataUsing.value = data;
        spinning.value = false;
    }).catch((err) => {
        let {msg} = err.response.data;
        spinning.value = false;
        message.error(msg);
    });
}

const listAssignedApplications = () => {
    spinning.value = true;
    api.get("/equipment/my/assigned").then((res) => {
        let {data} = res.data;
        dataAssigned.value = data;
        spinning.value = false;
    }).catch((err) => {
        let {msg} = err.response.data;
        spinning.value = false;
        message.error(msg);
    });
}

const listRejectedApplications = () => {
    spinning.value = true;
    api.get("/equipment/my/rejected").then((res) => {
        let {data} = res.data;
        dataReturned.value = data;
        spinning.value = false;
    }).catch((err) => {
        let {msg} = err.response.data;
        spinning.value = false;
        message.error(msg);
    });
}

const listApplyingApplications = () => {
    spinning.value = true;
    api.get("/equipment/my/applying").then((res) => {
        let {data} = res.data;
        dataApplying.value = data;
        spinning.value = false;
    }).catch((err) => {
        let {msg} = err.response.data;
        spinning.value = false;
        message.error(msg);
    });
}

const listDelayApplyingApplications = () => {
    spinning.value = true;
    api.get("/equipment/my/delay-applying").then((res) => {
        let {data} = res.data;
        dataDelayApplying.value = data;
        spinning.value = false;
    }).catch((err) => {
        let {msg} = err.response.data;
        spinning.value = false;
        message.error(msg);
    });
}

const listDelayedApplications = () => {
    spinning.value = true;
    api.get("/equipment/my/delayed").then((res) => {
        let {data} = res.data;
        dataDelayed.value = data;
        spinning.value = false;
    }).catch((err) => {
        let {msg} = err.response.data;
        spinning.value = false;
        message.error(msg);
    });
}

const listReturnedApplications = () => {
    spinning.value = true;
    api.get("/equipment/my/returned").then((res) => {
        let {data} = res.data;
        dataReturned.value = data;
        spinning.value = false;
    }).catch((err) => {
        let {msg} = err.response.data;
        spinning.value = false;
        message.error(msg);
    });
}

const listMissedApplications = () => {
    spinning.value = true;
    api.get("/equipment/my/missed").then((res) => {
        let {data} = res.data;
        dataMissed.value = data;
        spinning.value = false;
    }).catch((err) => {
        let {msg} = err.response.data;
        spinning.value = false;
        message.error(msg);
    });
}

const listDamagedApplications = () => {
    spinning.value = true;
    api.get("/equipment/my/damaged").then((res) => {
        let {data} = res.data;
        dataDamaged.value = data;
        spinning.value = false;
    }).catch((err) => {
        let {msg} = err.response.data;
        spinning.value = false;
        message.error(msg);
    });
}

const handleTabChange = (key) => {
    // 根据切换的标签 key 执行相应的操作，节流，节省请求次数。
    if (key === 'using') {
        listUsingApplications();
    } else if (key === 'assigned') {
        listAssignedApplications();
    } else if (key === 'delay-applying') {
        listDelayApplyingApplications();
    } else if (key === 'delayed') {
        listDelayedApplications();
    } else if (key === 'applying') {
        listApplyingApplications();
    } else if (key === 'rejected') {
        listRejectedApplications();
    } else if (key === 'returned') {
        listReturnedApplications();
    } else if (key === 'damaged' || key === 'reported') {
        listDamagedApplications();
    } else if (key === 'missed') {
        listMissedApplications();
    }
};

// Define computed properties to calculate current page data for each tab
const currentUsingPageData = computed(() => {
    const startIdx = (currentUsingPage.value - 1) * 5;
    const endIdx = startIdx + 5;
    return dataUsing.value.slice(startIdx, endIdx);
});

const currentAssignedPageData = computed(() => {
    const startIdx = (currentAssignedPage.value - 1) * 5;
    const endIdx = startIdx + 5;
    return dataAssigned.value.slice(startIdx, endIdx);
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

const currentReturnedPageData = computed(() => {
    const startIdx = (currentReturnedPage.value - 1) * 5;
    const endIdx = startIdx + 5;
    return dataReturned.value.slice(startIdx, endIdx);
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


onMounted(() => {
    listUsingApplications();
})

const token = ref(localStorage.token);
</script>

<template>
    <a-layout-content :style="{margin: '16px', height: '100%'}">
        <h2 style="display: flex; justify-content: space-between;">
            <span>我的设备</span><span style=" margin-bottom: 4px;"><router-link to="/"><HomeOutlined /> 首页</router-link></span>
        </h2>
        <a-tabs v-model:activeKey="activeKey" @update:activeKey="handleTabChange" type="card">
            <a-tab-pane key="using" tab="使用中">
                <a-tabs v-model:activeKey="activeKey2" @update:activeKey="handleTabChange" type="card" >
                    <a-tab-pane key="all" tab="全部">
                        <a-spin :spinning="spinning" tip="Loading...">
                            <a-descriptions-item v-if="dataUsing.length === 0">
                                <div style="height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center;">
                                    <a-empty :image="Empty.PRESENTED_IMAGE_SIMPLE" style="width: 100%;  "/>
                                </div>
                            </a-descriptions-item>
                            <a-space direction="vertical" :size="5" style="height: 100%">

                                <a-descriptions v-for="item in currentUsingPageData" title="借条"
                                                style="background-color: #FFFFFF; padding: 16px; box-sizing: border-box;">
                                    <a-descriptions-item label="固定资产编号">{{ item.equipment_fixed_assets_num }}</a-descriptions-item>
                                    <a-descriptions-item label="设备名称">{{ item.equipment_name }}</a-descriptions-item>
                                    <a-descriptions-item label="设备型号">{{ item.equipment_model }}</a-descriptions-item>
                                    <a-descriptions-item label="申请时间">{{ item.created_at }}</a-descriptions-item>
                                    <a-descriptions-item label="承诺归还时间">{{ item.apply_time }}</a-descriptions-item>
                                    <a-descriptions-item label="审批人学籍号">{{ item.audit_uid }}</a-descriptions-item>
                                    <a-descriptions-item label="审批人姓名">{{ item.audit_name }}</a-descriptions-item>
                                    <a-descriptions-item label="审批人时间">{{ item.audit_time }}</a-descriptions-item>
                                    <a-descriptions-item label="状态">{{ item.status }}</a-descriptions-item>
                                    <a-descriptions-item label="操作">
                                        <a-row style="gap: 5px;">
                                            <a-col>
                                                <a-button type="primary" style="padding-top: 5px; box-sizing: border-box;" @click="showReturn(item.id)">归还申报</a-button>
                                            </a-col>
                                            <a-col v-if="item.status !== 'delay-applying'">
                                                <a-button type="primary" style="padding-top: 5px; box-sizing: border-box;" @click="showDelay(item.id)">延期申报</a-button>
                                            </a-col>
                                            <a-col>
                                                <a-button danger style="padding-top: 5px; box-sizing: border-box;" @click="showReport(item.id)">异常报告</a-button>
                                            </a-col>
                                        </a-row>
                                    </a-descriptions-item>

                                </a-descriptions>
                                <a-pagination align="center" style="margin-top: 8px;" v-model:current="currentUsingPage" simple pageSize="5"
                                              :total="dataUsing.length" v-if="dataUsing.length !== 0"/>
                            </a-space>
                        </a-spin>
                    </a-tab-pane>
                    <a-tab-pane key="assigned" tab="正常使用">
                        <a-spin :spinning="spinning" tip="Loading...">
                            <a-descriptions-item v-if="dataAssigned.length === 0">
                                <div style="height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center;">
                                    <a-empty :image="Empty.PRESENTED_IMAGE_SIMPLE" style="width: 100%;  "/>
                                </div>
                            </a-descriptions-item>
                            <a-space direction="vertical" :size="5" style="height: 100%">

                                <a-descriptions v-for="item in currentUsingPageData" title="借条"
                                                style="background-color: #FFFFFF; padding: 16px; box-sizing: border-box;">
                                    <a-descriptions-item label="固定资产编号">{{ item.equipment_fixed_assets_num }}</a-descriptions-item>
                                    <a-descriptions-item label="设备名称">{{ item.equipment_name }}</a-descriptions-item>
                                    <a-descriptions-item label="设备型号">{{ item.equipment_model }}</a-descriptions-item>
                                    <a-descriptions-item label="申请时间">{{ item.created_at }}</a-descriptions-item>
                                    <a-descriptions-item label="承诺归还时间">{{ item.apply_time }}</a-descriptions-item>
                                    <a-descriptions-item label="审批人学籍号">{{ item.audit_uid }}</a-descriptions-item>
                                    <a-descriptions-item label="审批人姓名">{{ item.audit_name }}</a-descriptions-item>
                                    <a-descriptions-item label="审批人时间">{{ item.audit_time }}</a-descriptions-item>
                                    <a-descriptions-item label="状态">{{ item.status }}</a-descriptions-item>
                                    <a-descriptions-item label="操作">
                                        <a-row style="gap: 5px;">
                                            <a-col>
                                                <a-button type="primary" style="padding-top: 5px; box-sizing: border-box;" @click="showReturn(item.id)">归还申报</a-button>
                                            </a-col>
                                            <a-col>
                                                <a-button type="primary" style="padding-top: 5px; box-sizing: border-box;" @click="showDelay(item.id)">延期申报</a-button>
                                            </a-col>
                                            <a-col>
                                                <a-button danger style="padding-top: 5px; box-sizing: border-box;" @click="showReport(item.id)">异常报告</a-button>
                                            </a-col>
                                        </a-row>
                                    </a-descriptions-item>

                                </a-descriptions>
                                <a-pagination align="center" style="margin-top: 8px;" v-model:current="currentAssignedPage" simple pageSize="5"
                                              :total="dataAssigned.length" v-if="dataAssigned.length !== 0"/>
                            </a-space>
                        </a-spin>
                    </a-tab-pane>
                    <a-tab-pane key="delay-applying" tab="申请延期中">
                        <a-spin :spinning="spinning" tip="Loading...">
                            <a-descriptions-item v-if="dataDelayApplying.length === 0">
                                <div style="height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center;">
                                    <a-empty :image="Empty.PRESENTED_IMAGE_SIMPLE" style="width: 100%;  "/>
                                </div>
                            </a-descriptions-item>
                            <a-space direction="vertical" :size="5" style="height: 100%">

                                <a-descriptions v-for="item in currentDelayApplyingPageData" title="借条"
                                                style="background-color: #FFFFFF; padding: 16px; box-sizing: border-box;">
                                    <a-descriptions-item label="固定资产编号">{{ item.equipment_fixed_assets_num }}</a-descriptions-item>
                                    <a-descriptions-item label="设备名称">{{ item.equipment_name }}</a-descriptions-item>
                                    <a-descriptions-item label="设备型号">{{ item.equipment_model }}</a-descriptions-item>
                                    <a-descriptions-item label="申请时间">{{ item.created_at }}</a-descriptions-item>
                                    <a-descriptions-item label="承诺归还时间">{{ item.apply_time }}</a-descriptions-item>
                                    <a-descriptions-item label="审批人学籍号">{{ item.audit_uid }}</a-descriptions-item>
                                    <a-descriptions-item label="审批人姓名">{{ item.audit_name }}</a-descriptions-item>
                                    <a-descriptions-item label="审批人时间">{{ item.audit_time }}</a-descriptions-item>
                                    <a-descriptions-item label="状态">{{ item.status }}</a-descriptions-item>
                                    <a-descriptions-item label="操作">
                                        <a-row style="gap: 5px;">
                                            <a-col>
                                                <a-button type="primary" style="padding-top: 5px; box-sizing: border-box;" @click="showReturn(item.id)">归还申报</a-button>
                                            </a-col>
                                            <a-col>
                                                <a-button danger style="padding-top: 5px; box-sizing: border-box;" @click="showReport(item.id)">异常报告</a-button>
                                            </a-col>
                                        </a-row>
                                    </a-descriptions-item>

                                </a-descriptions>
                                <a-pagination align="center" style="margin-top: 8px;" v-model:current="currentDelayApplyingPage" simple pageSize="5"
                                              :total="dataDelayApplying.length" v-if="dataDelayApplying.length !== 0"/>
                            </a-space>
                        </a-spin>
                    </a-tab-pane>
                    <a-tab-pane key="delayed" tab="已延期">
                        <a-spin :spinning="spinning" tip="Loading...">
                            <a-descriptions-item v-if="dataDelayed.length === 0">
                                <div style="height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center;">
                                    <a-empty :image="Empty.PRESENTED_IMAGE_SIMPLE" style="width: 100%;  "/>
                                </div>
                            </a-descriptions-item>
                            <a-space direction="vertical" :size="5" style="height: 100%">

                                <a-descriptions v-for="item in currentDelayedPageData" title="借条"
                                                style="background-color: #FFFFFF; padding: 16px; box-sizing: border-box;">
                                    <a-descriptions-item label="固定资产编号">{{ item.equipment_fixed_assets_num }}</a-descriptions-item>
                                    <a-descriptions-item label="设备名称">{{ item.equipment_name }}</a-descriptions-item>
                                    <a-descriptions-item label="设备型号">{{ item.equipment_model }}</a-descriptions-item>
                                    <a-descriptions-item label="申请时间">{{ item.created_at }}</a-descriptions-item>
                                    <a-descriptions-item label="承诺归还时间">{{ item.apply_time }}</a-descriptions-item>
                                    <a-descriptions-item label="审批人学籍号">{{ item.audit_uid }}</a-descriptions-item>
                                    <a-descriptions-item label="审批人姓名">{{ item.audit_name }}</a-descriptions-item>
                                    <a-descriptions-item label="审批人时间">{{ item.audit_time }}</a-descriptions-item>
                                    <a-descriptions-item label="状态">{{ item.status }}</a-descriptions-item>
                                    <a-descriptions-item label="操作">
                                        <a-row style="gap: 5px;">
                                            <a-col>
                                                <a-button type="primary" style="padding-top: 5px; box-sizing: border-box;" @click="showReturn(item.id)">归还申报</a-button>
                                            </a-col>
                                            <a-col>
                                                <a-button type="primary" style="padding-top: 5px; box-sizing: border-box;" @click="showDelay(item.id)">延期申报</a-button>
                                            </a-col>
                                            <a-col>
                                                <a-button danger style="padding-top: 5px; box-sizing: border-box;" @click="showReport(item.id)">异常报告</a-button>
                                            </a-col>
                                        </a-row>
                                    </a-descriptions-item>

                                </a-descriptions>
                                <a-pagination align="center" style="margin-top: 8px;" v-model:current="currentDelayedPage" simple pageSize="5"
                                              :total="dataDelayed.length" v-if="dataDelayed.length !== 0"/>
                            </a-space>
                        </a-spin>
                    </a-tab-pane>
                </a-tabs>
            </a-tab-pane>
            <a-tab-pane key="applying" tab="待审核">
                <a-spin :spinning="spinning" tip="Loading...">
                    <a-descriptions-item v-if="dataApplying.length === 0">
                        <div style="height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center;">
                            <a-empty :image="Empty.PRESENTED_IMAGE_SIMPLE" style="width: 100%;  "/>
                        </div>
                    </a-descriptions-item>
                    <a-space direction="vertical" :size="5" style="height: 100%">

                        <a-descriptions v-for="item in currentApplyingPageData" title="审核信息"
                                        style="background-color: #FFFFFF; padding: 16px; box-sizing: border-box;">
                            <a-descriptions-item label="固定资产编号">{{ item.equipment_fixed_assets_num }}</a-descriptions-item>
                            <a-descriptions-item label="设备名称">{{ item.equipment_name }}</a-descriptions-item>
                            <a-descriptions-item label="设备型号">{{ item.equipment_model }}</a-descriptions-item>
                            <a-descriptions-item label="申请时间">{{ item.created_at }}</a-descriptions-item>
                            <a-descriptions-item label="承诺归还时间">{{ item.apply_time }}</a-descriptions-item>
                            <a-descriptions-item label="状态">{{ item.status }}</a-descriptions-item>

                        </a-descriptions>
                        <a-pagination align="center" style="margin-top: 8px;" v-model:current="currentApplyingPage" simple pageSize="5"
                                      :total="dataApplying.length" v-if="dataApplying.length !== 0"/>
                    </a-space>
                </a-spin>
            </a-tab-pane>
            <a-tab-pane key="rejected" tab="已驳回">
                <a-spin :spinning="spinning" tip="Loading...">
                    <a-descriptions-item v-if="dataRejected.length === 0">
                        <div style="height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center;">
                            <a-empty :image="Empty.PRESENTED_IMAGE_SIMPLE" style="width: 100%;  "/>
                        </div>
                    </a-descriptions-item>
                    <a-space direction="vertical" :size="5" style="height: 100%">

                        <a-descriptions v-for="item in currentRejectedPageData" title="驳回通知"
                                        style="background-color: #FFFFFF; padding: 16px; box-sizing: border-box;">
                            <a-descriptions-item label="固定资产编号">{{ item.equipment_fixed_assets_num }}</a-descriptions-item>
                            <a-descriptions-item label="设备名称">{{ item.equipment_name }}</a-descriptions-item>
                            <a-descriptions-item label="设备型号">{{ item.equipment_model }}</a-descriptions-item>
                            <a-descriptions-item label="申请时间">{{ item.created_at }}</a-descriptions-item>
                            <a-descriptions-item label="承诺归还时间">{{ item.apply_time }}</a-descriptions-item>
                            <a-descriptions-item label="审批人学籍号">{{ item.audit_uid }}</a-descriptions-item>
                            <a-descriptions-item label="审批人姓名">{{ item.audit_name }}</a-descriptions-item>
                            <a-descriptions-item label="审批人时间">{{ item.audit_time }}</a-descriptions-item>
                            <a-descriptions-item label="状态">{{ item.status }}</a-descriptions-item>

                        </a-descriptions>
                        <a-pagination align="center" style="margin-top: 8px;" v-model:current="currentRejectedPage" simple pageSize="5"
                                      :total="dataRejected.length" v-if="dataRejected.length !== 0"/>
                    </a-space>
                </a-spin>
            </a-tab-pane>
            <a-tab-pane key="returned" tab="已归还">
                <a-spin :spinning="spinning" tip="Loading...">
                    <a-descriptions-item v-if="dataReturned.length === 0">
                        <div style="height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center;">
                            <a-empty :image="Empty.PRESENTED_IMAGE_SIMPLE" style="width: 100%;  "/>
                        </div>
                    </a-descriptions-item>
                    <a-space direction="vertical" :size="5" style="height: 100%">

                        <a-descriptions v-for="item in currentReturnedPageData" title="归还情况"
                                        style="background-color: #FFFFFF; padding: 16px; box-sizing: border-box;">
                            <a-descriptions-item label="设备ID">{{ item.equipment_fixed_assets_num }}</a-descriptions-item>
                            <a-descriptions-item label="设备名称">{{ item.equipment_name }}</a-descriptions-item>
                            <a-descriptions-item label="设备型号">{{ item.equipment_model }}</a-descriptions-item>
                            <a-descriptions-item label="审批人学籍号">{{ item.audit_uid }}</a-descriptions-item>
                            <a-descriptions-item label="审批人姓名">{{ item.audit_name }}</a-descriptions-item>
                            <a-descriptions-item label="审批时间">{{ item.audit_time }}</a-descriptions-item>
                            <a-descriptions-item label="归还时间">{{ item.back_time }}</a-descriptions-item>
                            <a-descriptions-item label="操作">
                                <a-row style="gap: 5px;">
                                    <a-col>
                                        <a-button type="primary" style="padding-top: 5px; box-sizing: border-box;"
                                                  @click="showPhotos(item.id, 'returned')">查看照片
                                        </a-button>
                                    </a-col>
                                </a-row>
                            </a-descriptions-item>
                        </a-descriptions>
                        <a-pagination align="center" style="margin-top: 8px;" v-model:current="currentReturnedPage" simple pageSize="5"
                                      :total="dataReturned.length" v-if="dataReturned.length !== 0"/>
                    </a-space>
                </a-spin>
            </a-tab-pane>
            <a-tab-pane key="reported" tab="异常报告">
                <a-tabs  v-model:activeKey="activeKey3" @update:activeKey="handleTabChange" type="card">
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
                                    <a-descriptions-item label="设备ID">{{ item.equipment_fixed_assets_num }}</a-descriptions-item>
                                    <a-descriptions-item label="设备名称">{{ item.equipment_name }}</a-descriptions-item>
                                    <a-descriptions-item label="设备型号">{{ item.equipment_model }}</a-descriptions-item>
                                    <a-descriptions-item label="审批人学籍号">{{ item.audit_uid }}</a-descriptions-item>
                                    <a-descriptions-item label="审批人姓名">{{ item.audit_name }}</a-descriptions-item>
                                    <a-descriptions-item label="审批时间">{{ item.audit_time }}</a-descriptions-item>
                                    <a-descriptions-item label="报告时间">{{ item.report_time }}</a-descriptions-item>
                                    <a-descriptions-item label="情况">{{ item.status }}</a-descriptions-item>
                                    <a-descriptions-item label="操作">
                                        <a-row style="gap: 5px;">
                                            <a-col>
                                                <a-button type="primary" style="padding-top: 5px; box-sizing: border-box;"
                                                          @click="showPhotos(item.id, 'damaged')">查看照片
                                                </a-button>
                                            </a-col>
                                        </a-row>
                                    </a-descriptions-item>

                                </a-descriptions>
                                <a-pagination align="center" style="margin-top: 8px;" v-model:current="currentDamagedPage" simple pageSize="5"
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
                                    <a-descriptions-item label="设备ID">{{ item.equipment_fixed_assets_num }}</a-descriptions-item>
                                    <a-descriptions-item label="设备名称">{{ item.equipment_name }}</a-descriptions-item>
                                    <a-descriptions-item label="设备型号">{{ item.equipment_model }}</a-descriptions-item>
                                    <a-descriptions-item label="审批人学籍号">{{ item.audit_uid }}</a-descriptions-item>
                                    <a-descriptions-item label="审批人姓名">{{ item.audit_name }}</a-descriptions-item>
                                    <a-descriptions-item label="审批时间">{{ item.audit_time }}</a-descriptions-item>
                                    <a-descriptions-item label="报告时间">{{ item.report_time }}</a-descriptions-item>
                                    <a-descriptions-item label="情况">{{ item.type }}</a-descriptions-item>

                                </a-descriptions>
                                <a-pagination align="center" style="margin-top: 8px;" v-model:current="currentMissedPage" simple pageSize="5"
                                              :total="dataMissed.length" v-if="dataMissed.length !== 0"/>
                            </a-space>
                        </a-spin>
                    </a-tab-pane>
                </a-tabs>
            </a-tab-pane>

        </a-tabs>


        <a-modal v-model:visible="visibleReturn" title="归还实物照片登记">
            <a-form
                    :model="formState"
                    name="validate_other"
            >

                <a-form-item :name="['return_photos', 'returned_url']" label="图片" extra="至少上传一张图片，最多两张" :rules="[{ required: true, message: '至少上传一张图片' }]">
                    <a-upload
                        list-type="picture"
                        :before-upload="true" max-count="2"
                        v-model:file-list="formState.return_photos.returned_url"
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
                <a-button type="primary" @click="returnEquipment" :disabled="formState.return_photos.returned_url.length === 0" :loading="loading">上传并归还</a-button>
            </template>
        </a-modal>
        <a-modal v-model:visible="visibleDelay" title="延期申报">
            <a-form :model="formState">
                <a-form-item :name="['delayForm', 'reason']" label="理由"  :rules="[{ required: true, message: '请说明理由' }]">
                    <a-textarea v-model:value="formState.delayForm.reason" />
                </a-form-item>
                <a-form-item has-feedreturned
                             :rules="[{ required: true, message: '请选择日期' }]"    :name="['delayForm', 'apply_time']" label="承诺归还时间" v-bind="config">
                    <a-date-picker
                        v-model:value="formState.delayForm.apply_time"
                        :disabled-date="disabledDate"
                        show-time
                        format="YYYY-MM-DD HH:mm:ss"
                        value-format="YYYY-MM-DD HH:mm:ss"
                        placeholder="不得早于当前时间"
                    />
                </a-form-item>
            </a-form>
            <template #footer>
                <a-button type="primary" danger @click="handleCancel">取消</a-button>
                <a-button type="primary" @click="delayEquipment" :disabled="!formState.delayForm.reason || !formState.delayForm.apply_time" :loading="loading">确定</a-button>
            </template>
        </a-modal>
        <a-modal v-model:visible="visibleReport" title="异常报告">
            <a-form :model="formState">
                <a-form-item
                    :name="['report', 'type']"
                    label="类型"
                    has-feedreturned
                    :rules="[{ required: true, message: '请选择类型' }]"
                >
                    <a-select v-model:value="formState.report.type" placeholder="选择类型">
                        <a-select-option value="damaged">损坏</a-select-option>
                        <a-select-option value="missed">丢失</a-select-option>
                    </a-select>
                </a-form-item>
                <div v-if="formState.report.type === 'damaged'">
                    <a-form-item :name="['report', 'damaged_url']" label="图片" extra="至少上传一张图片，最多两张" :rules="[{ required: true, message: '至少上传一张图片' }]">
                        <a-upload
                            list-type="picture"
                            before-upload="false" max-count="2"
                            v-model:file-list="formState.report.damaged_url"
                        >
                            <a-button>
                                <template #icon><UploadOutlined /></template>
                                Click to upload
                            </a-button>
                        </a-upload>
                    </a-form-item>
                </div>
            </a-form>
            <template #footer>
                <a-button type="primary" danger @click="handleCancel">取消</a-button>
                <a-button type="primary" @click="reportEquipment" :disabled="formState.report.type === 'damaged' && formState.report.damaged_url.length === 0" :loading="loading">确定</a-button>
            </template>
        </a-modal>
        <a-modal v-model:visible="visiblePhotos" title="查看图片">
            <a-spin :spinning="spinning">
                <a-descriptions-item v-if="!images">
                    <div style="height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center;">
                        <a-empty :image="Empty.PRESENTED_IMAGE_SIMPLE" style="width: 100%;  "/>
                    </div>
                </a-descriptions-item>
                <a-image-preview-group>
                    <a-image v-for="i in images" :width="200"
                             fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMIAAADDCAYAAADQvc6UAAABRWlDQ1BJQ0MgUHJvZmlsZQAAKJFjYGASSSwoyGFhYGDIzSspCnJ3UoiIjFJgf8LAwSDCIMogwMCcmFxc4BgQ4ANUwgCjUcG3awyMIPqyLsis7PPOq3QdDFcvjV3jOD1boQVTPQrgSkktTgbSf4A4LbmgqISBgTEFyFYuLykAsTuAbJEioKOA7DkgdjqEvQHEToKwj4DVhAQ5A9k3gGyB5IxEoBmML4BsnSQk8XQkNtReEOBxcfXxUQg1Mjc0dyHgXNJBSWpFCYh2zi+oLMpMzyhRcASGUqqCZ16yno6CkYGRAQMDKMwhqj/fAIcloxgHQqxAjIHBEugw5sUIsSQpBobtQPdLciLEVJYzMPBHMDBsayhILEqEO4DxG0txmrERhM29nYGBddr//5/DGRjYNRkY/l7////39v///y4Dmn+LgeHANwDrkl1AuO+pmgAAADhlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAAqACAAQAAAABAAAAwqADAAQAAAABAAAAwwAAAAD9b/HnAAAHlklEQVR4Ae3dP3PTWBSGcbGzM6GCKqlIBRV0dHRJFarQ0eUT8LH4BnRU0NHR0UEFVdIlFRV7TzRksomPY8uykTk/zewQfKw/9znv4yvJynLv4uLiV2dBoDiBf4qP3/ARuCRABEFAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghgg0Aj8i0JO4OzsrPv69Wv+hi2qPHr0qNvf39+iI97soRIh4f3z58/u7du3SXX7Xt7Z2enevHmzfQe+oSN2apSAPj09TSrb+XKI/f379+08+A0cNRE2ANkupk+ACNPvkSPcAAEibACyXUyfABGm3yNHuAECRNgAZLuYPgEirKlHu7u7XdyytGwHAd8jjNyng4OD7vnz51dbPT8/7z58+NB9+/bt6jU/TI+AGWHEnrx48eJ/EsSmHzx40L18+fLyzxF3ZVMjEyDCiEDjMYZZS5wiPXnyZFbJaxMhQIQRGzHvWR7XCyOCXsOmiDAi1HmPMMQjDpbpEiDCiL358eNHurW/5SnWdIBbXiDCiA38/Pnzrce2YyZ4//59F3ePLNMl4PbpiL2J0L979+7yDtHDhw8vtzzvdGnEXdvUigSIsCLAWavHp/+qM0BcXMd/q25n1vF57TYBp0a3mUzilePj4+7k5KSLb6gt6ydAhPUzXnoPR0dHl79WGTNCfBnn1uvSCJdegQhLI1vvCk+fPu2ePXt2tZOYEV6/fn31dz+shwAR1sP1cqvLntbEN9MxA9xcYjsxS1jWR4AIa2Ibzx0tc44fYX/16lV6NDFLXH+YL32jwiACRBiEbf5KcXoTIsQSpzXx4N28Ja4BQoK7rgXiydbHjx/P25TaQAJEGAguWy0+2Q8PD6/Ki4R8EVl+bzBOnZY95fq9rj9zAkTI2SxdidBHqG9+skdw43borCXO/ZcJdraPWdv22uIEiLA4q7nvvCug8WTqzQveOH26fodo7g6uFe/a17W3+nFBAkRYENRdb1vkkz1CH9cPsVy/jrhr27PqMYvENYNlHAIesRiBYwRy0V+8iXP8+/fvX11Mr7L7ECueb/r48eMqm7FuI2BGWDEG8cm+7G3NEOfmdcTQw4h9/55lhm7DekRYKQPZF2ArbXTAyu4kDYB2YxUzwg0gi/41ztHnfQG26HbGel/crVrm7tNY+/1btkOEAZ2M05r4FB7r9GbAIdxaZYrHdOsgJ/wCEQY0J74TmOKnbxxT9n3FgGGWWsVdowHtjt9Nnvf7yQM2aZU/TIAIAxrw6dOnAWtZZcoEnBpNuTuObWMEiLAx1HY0ZQJEmHJ3HNvGCBBhY6jtaMoEiJB0Z29vL6ls58vxPcO8/zfrdo5qvKO+d3Fx8Wu8zf1dW4p/cPzLly/dtv9Ts/EbcvGAHhHyfBIhZ6NSiIBTo0LNNtScABFyNiqFCBChULMNNSdAhJyNSiECRCjUbEPNCRAhZ6NSiAARCjXbUHMCRMjZqBQiQIRCzTbUnAARcjYqhQgQoVCzDTUnQIScjUohAkQo1GxDzQkQIWejUogAEQo121BzAkTI2agUIkCEQs021JwAEXI2KoUIEKFQsw01J0CEnI1KIQJEKNRsQ80JECFno1KIABEKNdtQcwJEyNmoFCJAhELNNtScABFyNiqFCBChULMNNSdAhJyNSiECRCjUbEPNCRAhZ6NSiAARCjXbUHMCRMjZqBQiQIRCzTbUnAARcjYqhQgQoVCzDTUnQIScjUohAkQo1GxDzQkQIWejUogAEQo121BzAkTI2agUIkCEQs021JwAEXI2KoUIEKFQsw01J0CEnI1KIQJEKNRsQ80JECFno1KIABEKNdtQcwJEyNmoFCJAhELNNtScABFyNiqFCBChULMNNSdAhJyNSiECRCjUbEPNCRAhZ6NSiAARCjXbUHMCRMjZqBQiQIRCzTbUnAARcjYqhQgQoVCzDTUnQIScjUohAkQo1GxDzQkQIWejUogAEQo121BzAkTI2agUIkCEQs021JwAEXI2KoUIEKFQsw01J0CEnI1KIQJEKNRsQ80JECFno1KIABEKNdtQcwJEyNmoFCJAhELNNtScABFyNiqFCBChULMNNSdAhJyNSiEC/wGgKKC4YMA4TAAAAABJRU5ErkJggg=="
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