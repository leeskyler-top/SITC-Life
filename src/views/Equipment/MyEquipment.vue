<script setup>
import {computed, onMounted, reactive, ref} from "vue";
import {Empty, message} from "ant-design-vue";
import {UploadOutlined} from "@ant-design/icons-vue";
import api from "@/api";

const data_using = ref([]);
const data_assigned = ref([]);
const data_applying = ref([]);
const data_delay_applying = ref([]);
const data_delayed = ref([]);
const data_reject = ref([]);
const data_returned = ref([]);
const data_missed = ref([]);
const data_damaged = ref([]);

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

const current_rent_application_id = ref();

const visibleReturn = ref(false);

const showReturn = (id) => {
    visibleReturn.value = true;
    current_rent_application_id.value = id;
}

const visibleDelay = ref(false);

const showDelay = (id) => {
    visibleDelay.value = true;
    current_rent_application_id.value = id;
}

const visibleReport = ref(false);


const showReport = (id) => {
    visibleReport.value = true;
    current_rent_application_id.value = id;
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
    api.post("/equipment/delay-apply/" + current_rent_application_id.value, formState.delayForm).then(res => {
        let {msg} = res.data;
        loading.value = false;
        visibleDelay.value = false;
        formState.delayForm.apply_time = '';
        formState.delayForm.reason = '';
        current_rent_application_id.value = null;
        let current_data = data_using.value.find(item => item.id === current_rent_application_id.value);
        if (current_data && current_data.status === 'assigned') {
            data_assigned.value = data_assigned.value.filter(item => item.id !== current_rent_application_id.value);
        } else if (current_data && current_data.status === 'delayed') {
            data_delayed.value = data_delayed.value.filter(item => item.id !== current_rent_application_id.value);
        }

        message.success(msg);
    })
}

const returnEquipment = () => {
    loading.value = true;
    let formData = new FormData();
    for (let item of formState.return_photos.returned_url) {
        formData.append('returned_url[]', item.originFileObj)
    }
    api.post("/equipment/back/" + current_rent_application_id.value, formData, config).then(res => {
        let {msg} = res.data;
        loading.value = false;
        visibleReturn.value = false;
        let current_data = data_using.value.find(item => item.id === current_rent_application_id.value);
        if (current_data && current_data.status === 'assigned') {
            data_assigned.value = data_assigned.value.filter(item => item.id !== current_rent_application_id.value);
        } else if (current_data && current_data.status === 'delay-applying') {
            data_delay_applying.value = data_delay_applying.value.filter(item => item.id !== current_rent_application_id.value);
        } else if (current_data && current_data.status === 'delayed') {
            data_delayed.value = data_delayed.value.filter(item => item.id !== current_rent_application_id.value);
        }
        data_using.value = data_using.value.filter(item => item.id !== current_rent_application_id.value);
        formState.return_photos.returned_url = [];
        current_rent_application_id.value = null;
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
    api.post("/equipment/report/" + current_rent_application_id.value, formData, config).then(res => {
        let {msg} = res.data;
        loading.value = false;
        visibleReport.value = false;
        let current_data = data_using.value.find(item => item.id === current_rent_application_id.value);
        if (current_data && current_data.status === 'assigned') {
            data_assigned.value = data_assigned.value.filter(item => item.id !== current_rent_application_id.value);
        } else if (current_data && current_data.status === 'delay-applying') {
            data_delay_applying.value = data_delay_applying.value.filter(item => item.id !== current_rent_application_id.value);
        } else if (current_data && current_data.status === 'delayed') {
            data_delayed.value = data_delayed.value.filter(item => item.id !== current_rent_application_id.value);
        }
        data_using.value = data_using.value.filter(item => item.id !== current_rent_application_id.value);
        formState.report.damaged_url = [];
        current_rent_application_id.value = null;
        message.success(msg);
    }).catch(err => {
        let {msg} = err.response.data;
        loading.value = false;
        message.error(msg);
    });
}

const visiblePhotos = ref(false)
const showPhotos = id => {
    visiblePhotos.value = true;
};
const handleCancel = () => {
    visibleReturn.value = false;
    visibleDelay.value = false;
    visibleReport.value = false;
    visiblePhotos.value = false;
};

const images = ref([]);

const spinning = ref(false);
const loading = ref(false);

const listUsingApplications = () => {
    spinning.value = true;
    api.get("/equipment/my/using").then((res) => {
        let {data} = res.data;
        data_using.value = data;
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
        data_assigned.value = data;
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
        data_returned.value = data;
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
        data_applying.value = data;
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
        data_delay_applying.value = data;
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
        data_delayed.value = data;
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
        data_returned.value = data;
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
        data_missed.value = data;
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
        data_damaged.value = data;
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
    return data_using.value.slice(startIdx, endIdx);
});

const currentAssignedPageData = computed(() => {
    const startIdx = (currentAssignedPage.value - 1) * 5;
    const endIdx = startIdx + 5;
    return data_assigned.value.slice(startIdx, endIdx);
});

const currentDelayApplyingPageData = computed(() => {
    const startIdx = (currentDelayApplyingPage.value - 1) * 5;
    const endIdx = startIdx + 5;
    return data_delay_applying.value.slice(startIdx, endIdx);
});

const currentDelayedPageData = computed(() => {
    const startIdx = (currentDelayedPage.value - 1) * 5;
    const endIdx = startIdx + 5;
    return data_delayed.value.slice(startIdx, endIdx);
});

const currentApplyingPageData = computed(() => {
    const startIdx = (currentApplyingPage.value - 1) * 5;
    const endIdx = startIdx + 5;
    return data_applying.value.slice(startIdx, endIdx);
});

const currentRejectedPageData = computed(() => {
    const startIdx = (currentRejectedPage.value - 1) * 5;
    const endIdx = startIdx + 5;
    return data_reject.value.slice(startIdx, endIdx);
});

const currentReturnedPageData = computed(() => {
    const startIdx = (currentReturnedPage.value - 1) * 5;
    const endIdx = startIdx + 5;
    return data_returned.value.slice(startIdx, endIdx);
});

const currentDamagedPageData = computed(() => {
    const startIdx = (currentDamagedPage.value - 1) * 5;
    const endIdx = startIdx + 5;
    return data_damaged.value.slice(startIdx, endIdx);
});

const currentMissedPageData = computed(() => {
    const startIdx = (currentMissedPage.value - 1) * 5;
    const endIdx = startIdx + 5;
    return data_missed.value.slice(startIdx, endIdx);
});


onMounted(() => {
    listUsingApplications();
})

</script>

<template>
    <a-layout-content :style="{margin: '16px', height: '100%'}">
        <h2>
            我的设备
        </h2>
        <a-tabs v-model:activeKey="activeKey" @update:activeKey="handleTabChange" type="card">
            <a-tab-pane key="using" tab="使用中">
                <a-tabs v-model:activeKey="activeKey2" @update:activeKey="handleTabChange" type="card" >
                    <a-tab-pane key="all" tab="全部">
                        <a-spin :spinning="spinning" tip="Loading...">
                            <a-descriptions-item v-if="data_using.length === 0">
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
                                              :total="data_using.length" v-if="data_using.length !== 0"/>
                            </a-space>
                        </a-spin>
                    </a-tab-pane>
                    <a-tab-pane key="assigned" tab="正常使用">
                        <a-spin :spinning="spinning" tip="Loading...">
                            <a-descriptions-item v-if="data_assigned.length === 0">
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
                                              :total="data_assigned.length" v-if="data_assigned.length !== 0"/>
                            </a-space>
                        </a-spin>
                    </a-tab-pane>
                    <a-tab-pane key="delay-applying" tab="申请延期中">
                        <a-spin :spinning="spinning" tip="Loading...">
                            <a-descriptions-item v-if="data_delay_applying.length === 0">
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
                                              :total="data_delay_applying.length" v-if="data_delay_applying.length !== 0"/>
                            </a-space>
                        </a-spin>
                    </a-tab-pane>
                    <a-tab-pane key="delayed" tab="已延期">
                        <a-spin :spinning="spinning" tip="Loading...">
                            <a-descriptions-item v-if="data_delayed.length === 0">
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
                                              :total="data_delayed.length" v-if="data_delayed.length !== 0"/>
                            </a-space>
                        </a-spin>
                    </a-tab-pane>
                </a-tabs>
            </a-tab-pane>
            <a-tab-pane key="applying" tab="待审核">
                <a-spin :spinning="spinning" tip="Loading...">
                    <a-descriptions-item v-if="data_applying.length === 0">
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
                                      :total="data_applying.length" v-if="data_applying.length !== 0"/>
                    </a-space>
                </a-spin>
            </a-tab-pane>
            <a-tab-pane key="rejected" tab="已驳回">
                <a-spin :spinning="spinning" tip="Loading...">
                    <a-descriptions-item v-if="data_reject.length === 0">
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
                                      :total="data_reject.length" v-if="data_reject.length !== 0"/>
                    </a-space>
                </a-spin>
            </a-tab-pane>
            <a-tab-pane key="returned" tab="已归还">
                <a-spin :spinning="spinning" tip="Loading...">
                    <a-descriptions-item v-if="data_returned.length === 0">
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
                            <a-descriptions-item label="申请人学籍号">{{ item.apply_uid }}</a-descriptions-item>
                            <a-descriptions-item label="申请人姓名">{{ item.apply_name }}</a-descriptions-item>
                            <a-descriptions-item label="审批人学籍号">{{ item.audit_uid }}</a-descriptions-item>
                            <a-descriptions-item label="审批人姓名">{{ item.audit_name }}</a-descriptions-item>
                            <a-descriptions-item label="审批时间">{{ item.audit_time }}</a-descriptions-item>
                            <a-descriptions-item label="归还时间">{{ item.returned_time }}</a-descriptions-item>
                            <a-descriptions-item label="操作">
                                <a-row style="gap: 5px;">
                                    <a-col>
                                        <a-button type="primary" style="padding-top: 5px; box-sizing: border-box;"
                                                  @click="showPhotos(item.id)">查看照片
                                        </a-button>
                                    </a-col>
                                </a-row>
                            </a-descriptions-item>
                        </a-descriptions>
                        <a-pagination align="center" style="margin-top: 8px;" v-model:current="currentReturnedPage" simple pageSize="5"
                                      :total="data_returned.length" v-if="data_returned.length !== 0"/>
                    </a-space>
                </a-spin>
            </a-tab-pane>
            <a-tab-pane key="reported" tab="异常报告">
                <a-tabs  v-model:activeKey="activeKey3" @update:activeKey="handleTabChange" type="card">
                    <a-tab-pane key="damaged" tab="报损坏">
                        <a-spin :spinning="spinning" tip="Loading...">
                            <a-descriptions-item v-if="data_damaged.length === 0">
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
                                                          @click="showPhotos(item.id)">查看照片
                                                </a-button>
                                            </a-col>
                                        </a-row>
                                    </a-descriptions-item>

                                </a-descriptions>
                                <a-pagination align="center" style="margin-top: 8px;" v-model:current="currentDamagedPage" simple pageSize="5"
                                              :total="data_damaged.length" v-if="data_damaged.length !== 0"/>
                            </a-space>
                        </a-spin>
                    </a-tab-pane>
                    <a-tab-pane key="missed" tab="报丢失">
                        <a-spin :spinning="spinning" tip="Loading...">
                            <a-descriptions-item v-if="data_missed.length === 0">
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
                                    <a-descriptions-item label="操作">
                                        <a-row style="gap: 5px;">
                                            <a-col>
                                                <a-button type="primary" style="padding-top: 5px; box-sizing: border-box;"
                                                          @click="showPhotos(item.id)">查看照片
                                                </a-button>
                                            </a-col>
                                        </a-row>
                                    </a-descriptions-item>

                                </a-descriptions>
                                <a-pagination align="center" style="margin-top: 8px;" v-model:current="currentMissedPage" simple pageSize="5"
                                              :total="data_missed.length" v-if="data_missed.length !== 0"/>
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
        <a-modal v-model:visible="visiblePhotos">
            <a-image-preview-group>
                <a-image v-for="i in images" :width="200" :src="i.url"/>
            </a-image-preview-group>
            <template #footer>
                <a-button type="primary" @click="handleCancel">OK</a-button>
            </template>
        </a-modal>

    </a-layout-content>
</template>

<style scoped>

</style>