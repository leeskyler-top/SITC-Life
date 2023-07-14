<script setup>
import {onMounted, reactive, ref} from "vue";
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



const current = ref(1);

const deleteEquipment = id => {

};

const lostEquipment = id => {

};

const brokeEquipment = id => {

};


const formState = reactive({
    delayForm: {
        reason: '',
        apply_time: ''
    },
    report: {
        type: 'damaged',
        damaged_url: ''
    },
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

const visibleReturned = ref(false);

const showReturned = (id) => {
    visibleReturned.value = true;
}

const visibleDelay = ref(false);

const showDelay = (id) => {
    visibleDelay.value = true;
}

const visibleReport = ref(false);

const showReport = (id) => {
    visibleReport.value = true;
}

const visiblePhotos = ref(false)
const showPhotos = id => {
    visiblePhotos.value = true;
};
const handleCancel = () => {
    visiblereturned.value = false;
    visibleDelay.value = false;
    visibleReport.value = false;
    visiblePhotos.value = false;
};

const images = ref([]);

const spinning = ref(false);

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

// setInterval(() => {
//     console.log('activeKey' + activeKey.value);
//     console.log('activeKey2' + activeKey2.value);
//     console.log('activeKey3' + activeKey3.value);
// }, 1000)
const handleTabChange = (key) => {
    // 根据切换的标签 key 执行相应的操作，节流，节省请求次数。
    console.log('activeKey' + activeKey.value);
    console.log('activeKey2' + activeKey2.value);
    console.log('activeKey3' + activeKey3.value);

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
    } else if (key === 'missed' || key === 'reported') {
        listMissedApplications();
    } else if (key === 'damaged') {
        listDamagedApplications();
    }
};


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
                        <a-spin :spinning="spinning">
                            <a-descriptions-item v-if="data_using.length === 0">
                                <div style="height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center;">
                                    <a-empty :image="Empty.PRESENTED_IMAGE_SIMPLE" style="width: 100%;  "/>
                                </div>
                            </a-descriptions-item>
                            <a-space direction="vertical" :size="5" style="height: 100%">

                                <a-descriptions v-for="item in data_using" title="借条"
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
                                                <a-button type="primary" style="padding-top: 5px; box-sizing: border-box;" @click="showReturned(1)">归还申报</a-button>
                                            </a-col>
                                            <a-col v-if="item.status !== 'delay-applying'">
                                                <a-button type="primary" style="padding-top: 5px; box-sizing: border-box;" @click="showDelay(1)">延期申报</a-button>
                                            </a-col>
                                            <a-col>
                                                <a-button danger style="padding-top: 5px; box-sizing: border-box;" @click="showReport(1)">异常报告</a-button>
                                            </a-col>
                                        </a-row>
                                    </a-descriptions-item>

                                </a-descriptions>
                                <a-pagination align="center" style="margin-top: 8px;" v-model:current="current" simple pageSize="5"
                                              :total="data_using.length" v-if="data_using.length !== 0"/>
                            </a-space>
                        </a-spin>
                    </a-tab-pane>
                    <a-tab-pane key="assigned" tab="正常使用">
                        <a-spin :spinning="spinning">
                            <a-descriptions-item v-if="data_assigned.length === 0">
                                <div style="height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center;">
                                    <a-empty :image="Empty.PRESENTED_IMAGE_SIMPLE" style="width: 100%;  "/>
                                </div>
                            </a-descriptions-item>
                            <a-space direction="vertical" :size="5" style="height: 100%">

                                <a-descriptions v-for="item in data_assigned" title="借条"
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
                                                <a-button type="primary" style="padding-top: 5px; box-sizing: border-box;" @click="showReturned(1)">归还申报</a-button>
                                            </a-col>
                                            <a-col>
                                                <a-button type="primary" style="padding-top: 5px; box-sizing: border-box;" @click="showDelay(1)">延期申报</a-button>
                                            </a-col>
                                            <a-col>
                                                <a-button danger style="padding-top: 5px; box-sizing: border-box;" @click="showReport(1)">异常报告</a-button>
                                            </a-col>
                                        </a-row>
                                    </a-descriptions-item>

                                </a-descriptions>
                                <a-pagination align="center" style="margin-top: 8px;" v-model:current="current" simple pageSize="5"
                                              :total="data_assigned.length" v-if="data_assigned.length !== 0"/>
                            </a-space>
                        </a-spin>
                    </a-tab-pane>
                    <a-tab-pane key="delay-applying" tab="申请延期中">
                        <a-spin :spinning="spinning">
                            <a-descriptions-item v-if="data_delay_applying.length === 0">
                                <div style="height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center;">
                                    <a-empty :image="Empty.PRESENTED_IMAGE_SIMPLE" style="width: 100%;  "/>
                                </div>
                            </a-descriptions-item>
                            <a-space direction="vertical" :size="5" style="height: 100%">

                                <a-descriptions v-for="item in data_delay_applying" title="借条"
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
                                                <a-button type="primary" style="padding-top: 5px; box-sizing: border-box;" @click="showReturned(1)">归还申报</a-button>
                                            </a-col>
                                            <a-col>
                                                <a-button danger style="padding-top: 5px; box-sizing: border-box;" @click="showReport(1)">异常报告</a-button>
                                            </a-col>
                                        </a-row>
                                    </a-descriptions-item>

                                </a-descriptions>
                                <a-pagination align="center" style="margin-top: 8px;" v-model:current="current" simple pageSize="5"
                                              :total="data_delay_applying.length" v-if="data_delay_applying.length !== 0"/>
                            </a-space>
                        </a-spin>
                    </a-tab-pane>
                    <a-tab-pane key="delayed" tab="已延期">
                        <a-spin :spinning="spinning">
                            <a-descriptions-item v-if="data_delayed.length === 0">
                                <div style="height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center;">
                                    <a-empty :image="Empty.PRESENTED_IMAGE_SIMPLE" style="width: 100%;  "/>
                                </div>
                            </a-descriptions-item>
                            <a-space direction="vertical" :size="5" style="height: 100%">

                                <a-descriptions v-for="item in data_delayed" title="借条"
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
                                                <a-button type="primary" style="padding-top: 5px; box-sizing: border-box;" @click="showReturned(1)">归还申报</a-button>
                                            </a-col>
                                            <a-col>
                                                <a-button type="primary" style="padding-top: 5px; box-sizing: border-box;" @click="showDelay(1)">延期申报</a-button>
                                            </a-col>
                                            <a-col>
                                                <a-button danger style="padding-top: 5px; box-sizing: border-box;" @click="showReport(1)">异常报告</a-button>
                                            </a-col>
                                        </a-row>
                                    </a-descriptions-item>

                                </a-descriptions>
                                <a-pagination align="center" style="margin-top: 8px;" v-model:current="current" simple pageSize="5"
                                              :total="data_delayed.length" v-if="data_delayed.length !== 0"/>
                            </a-space>
                        </a-spin>
                    </a-tab-pane>
                </a-tabs>
            </a-tab-pane>
            <a-tab-pane key="applying" tab="待审核">
                <a-spin :spinning="spinning">
                    <a-descriptions-item v-if="data_applying.length === 0">
                        <div style="height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center;">
                            <a-empty :image="Empty.PRESENTED_IMAGE_SIMPLE" style="width: 100%;  "/>
                        </div>
                    </a-descriptions-item>
                    <a-space direction="vertical" :size="5" style="height: 100%">

                        <a-descriptions v-for="item in data_applying" title="审核信息"
                                        style="background-color: #FFFFFF; padding: 16px; box-sizing: border-box;">
                            <a-descriptions-item label="固定资产编号">{{ item.equipment_fixed_assets_num }}</a-descriptions-item>
                            <a-descriptions-item label="设备名称">{{ item.equipment_name }}</a-descriptions-item>
                            <a-descriptions-item label="设备型号">{{ item.equipment_model }}</a-descriptions-item>
                            <a-descriptions-item label="申请时间">{{ item.created_at }}</a-descriptions-item>
                            <a-descriptions-item label="承诺归还时间">{{ item.apply_time }}</a-descriptions-item>
                            <a-descriptions-item label="状态">{{ item.status }}</a-descriptions-item>

                        </a-descriptions>
                        <a-pagination align="center" style="margin-top: 8px;" v-model:current="current" simple pageSize="5"
                                      :total="data_applying.length" v-if="data_applying.length !== 0"/>
                    </a-space>
                </a-spin>
            </a-tab-pane>
            <a-tab-pane key="rejected" tab="已驳回">
                <a-spin :spinning="spinning">
                    <a-descriptions-item v-if="data_reject.length === 0">
                        <div style="height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center;">
                            <a-empty :image="Empty.PRESENTED_IMAGE_SIMPLE" style="width: 100%;  "/>
                        </div>
                    </a-descriptions-item>
                    <a-space direction="vertical" :size="5" style="height: 100%">

                        <a-descriptions v-for="item in data_reject" title="驳回通知"
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
                        <a-pagination align="center" style="margin-top: 8px;" v-model:current="current" simple pageSize="5"
                                      :total="data_reject.length" v-if="data_reject.length !== 0"/>
                    </a-space>
                </a-spin>
            </a-tab-pane>
            <a-tab-pane key="returned" tab="已归还">
                <a-spin :spinning="spinning">
                    <a-descriptions-item v-if="data_returned.length === 0">
                        <div style="height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center;">
                            <a-empty :image="Empty.PRESENTED_IMAGE_SIMPLE" style="width: 100%;  "/>
                        </div>
                    </a-descriptions-item>
                    <a-space direction="vertical" :size="5" style="height: 100%">

                        <a-descriptions v-for="item in data_returned" title="归还情况"
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
                            <a-space direction="vertical" :size="5" style="height: 100%">

                                <a-descriptions v-for="item in data_reject" title="驳回通知"
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
                                <a-pagination align="center" style="margin-top: 8px;" v-model:current="current" simple pageSize="5"
                                              :total="data_reject.length" v-if="data_reject.length !== 0"/>
                            </a-space>
                        </a-descriptions>
                        <a-pagination align="center" style="margin-top: 8px;" v-model:current="current" simple pageSize="5"
                                      :total="data_returned.length" v-if="data_returned.length !== 0"/>
                    </a-space>
                </a-spin>
            </a-tab-pane>
            <a-tab-pane key="reported" tab="异常报告">
                <a-tabs  v-model:activeKey="activeKey3" @update:activeKey="handleTabChange" type="card">
                    <a-tab-pane key="damaged" tab="报损坏">
                        <a-spin :spinning="spinning">
                            <a-descriptions-item v-if="data_damaged.length === 0">
                                <div style="height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center;">
                                    <a-empty :image="Empty.PRESENTED_IMAGE_SIMPLE" style="width: 100%;  "/>
                                </div>
                            </a-descriptions-item>
                            <a-space direction="vertical" :size="5" style="height: 100%">

                                <a-descriptions v-for="item in data_damaged" title="损坏情况"
                                                style="background-color: #FFFFFF; padding: 16px; box-sizing: border-box;">
                                    <a-descriptions-item label="设备ID">{{ item.equipment_fixed_assets_num }}</a-descriptions-item>
                                    <a-descriptions-item label="设备名称">{{ item.equipment_name }}</a-descriptions-item>
                                    <a-descriptions-item label="设备型号">{{ item.equipment_model }}</a-descriptions-item>
                                    <a-descriptions-item label="申请人学籍号">{{ item.apply_uid }}</a-descriptions-item>
                                    <a-descriptions-item label="申请人姓名">{{ item.apply_name }}</a-descriptions-item>
                                    <a-descriptions-item label="审批人学籍号">{{ item.audit_uid }}</a-descriptions-item>
                                    <a-descriptions-item label="审批人姓名">{{ item.audit_name }}</a-descriptions-item>
                                    <a-descriptions-item label="审批时间">{{ item.audit_time }}</a-descriptions-item>
                                    <a-descriptions-item label="报告时间">{{ item.report_time }}</a-descriptions-item>
                                    <a-descriptions-item label="情况">{{ item.type }}</a-descriptions-item>
                                    <a-descriptions-item label="操作" v-if="item.type === '损坏'">
                                        <a-row style="gap: 5px;">
                                            <a-col>
                                                <a-button type="primary" style="padding-top: 5px; box-sizing: border-box;"
                                                          @click="showPhotos(item.id)">查看照片
                                                </a-button>
                                            </a-col>
                                        </a-row>
                                    </a-descriptions-item>

                                </a-descriptions>
                                <a-pagination align="center" style="margin-top: 8px;" v-model:current="current" simple pageSize="5"
                                              :total="data_damaged.length" v-if="data_damaged.length !== 0"/>
                            </a-space>
                        </a-spin>
                    </a-tab-pane>
                    <a-tab-pane key="missed" tab="报丢失">
                        <a-spin :spinning="spinning">
                            <a-descriptions-item v-if="data_missed.length === 0">
                                <div style="height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center;">
                                    <a-empty :image="Empty.PRESENTED_IMAGE_SIMPLE" style="width: 100%;  "/>
                                </div>
                            </a-descriptions-item>
                            <a-space direction="vertical" :size="5" style="height: 100%">

                                <a-descriptions v-for="item in data_missed" title="丢失记录"
                                                style="background-color: #FFFFFF; padding: 16px; box-sizing: border-box;">
                                    <a-descriptions-item label="设备ID">{{ item.equipment_fixed_assets_num }}</a-descriptions-item>
                                    <a-descriptions-item label="设备名称">{{ item.equipment_name }}</a-descriptions-item>
                                    <a-descriptions-item label="设备型号">{{ item.equipment_model }}</a-descriptions-item>
                                    <a-descriptions-item label="申请人学籍号">{{ item.apply_uid }}</a-descriptions-item>
                                    <a-descriptions-item label="申请人姓名">{{ item.apply_name }}</a-descriptions-item>
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
                                <a-pagination align="center" style="margin-top: 8px;" v-model:current="current" simple pageSize="5"
                                              :total="data_missed.length" v-if="data_missed.length !== 0"/>
                            </a-space>
                        </a-spin>
                    </a-tab-pane>
                </a-tabs>
            </a-tab-pane>

        </a-tabs>


        <a-modal v-model:visible="visiblereturned" title="归还实物照片登记">
            <a-form
                    :model="formState"
                    name="validate_other"
                    v-bind="formItemLayout"
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
                    <a-button type="primary" html-type="submit">上传并归还</a-button>
                </a-form-item>
            </a-form>
            <template #footer>
                <a-button type="primary" danger @click="handleCancel">取消</a-button>
            </template>
        </a-modal>
        <a-modal v-model:visible="visibleDelay" title="延期申报">
            <a-form :model="formState.delayForm">
                <a-form-item :name="['delayForm', 'reason']" label="理由">
                    <a-textarea v-model:value="formState.delayForm.reason" />
                </a-form-item>
                <a-form-item has-feedreturned
                             :rules="[{ required: true, message: '请选择日期' }]"   name="apply_time" label="承诺归还时间" v-bind="config">
                    <a-date-picker
                        v-model:value="formState.delayForm.apply_time"
                        show-time
                        format="YYYY-MM-DD HH:mm:ss"
                        value-format="YYYY-MM-DD HH:mm:ss"
                        placeholder="不得早于当前时间"
                    />
                </a-form-item>
            </a-form>
        </a-modal>
        <a-modal v-model:visible="visibleReport" title="异常报告">
            <a-form :model="formState.report">
                <a-form-item
                    name="type"
                    label="类型"
                    has-feedreturned
                    :rules="[{ required: true, message: '请选择类型' }]"
                >
                    <a-select v-model:value="formState.report.type" placeholder="选择类型">
                        <a-select-option value="damaged">损坏</a-select-option>
                        <a-select-option value="missed">丢失</a-select-option>
                    </a-select>
                </a-form-item>

                <a-form-item name="situation" label="情况" :rules="[{ required: true, message: '请说明情况' }]">
                    <a-textarea v-model:value="formState.report.situation" />
                </a-form-item>

                <div v-if="true">
                    <a-form-item name="upload" label="Upload" extra="至少上传一张图片，最多两张" :rules="[{ required: true, message: '至少上传一张图片' }]">
                        <a-upload
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
                </div>
            </a-form>
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