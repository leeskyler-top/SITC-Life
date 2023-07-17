<script setup>
import {createVNode, ref} from "vue";
import {Modal} from "ant-design-vue";
import {Empty} from "ant-design-vue";
import {ExclamationCircleOutlined} from "@ant-design/icons-vue";
import my_config from "@/my_config";

const data_applying = ref([]);
const data_delay_applying = ref([]);
const data_returned = ref([]);
const data_rejected = ref([]);
const data_damaged = ref([]);
const data_missed = ref([]);

const activeKey = ref('application');
const activeKey2 = ref('applying');
const activeKey3 = ref('applying');
const activeKey4 = ref('applying');

const current = ref(1);

const spinning = ref(false);

const visiblePhotos = ref(false)
const showPhotos = (id, key) => {
    visiblePhotos.value = true;
    if (key === 'returned') {
        images.value = JSON.parse(data_returned.value.find(i => i.id === id).returned_url);
    } else if (key === 'damaged') {
        images.value = JSON.parse(data_damaged.value.find(i => i.id === id).damaged_url);
    }
};
const image_base_url = my_config.images_base_url;

const handleCancel = () => {
    visiblePhotos.value = false;
};


const handleTabChange = (key) => {
    if (key === 'applying') {
        listApplyingApplications();
    } else if (key === 'rejected') {
        listRejectedApplications();
    } else if (key === 'delay-applying') {
        listDelayApplyingApplications();
    } else if (key === 'delayed') {
        listDelayedApplications();
    } else if (key === 'returned') {
        listReturnedApplications();
    } else if (key === 'damaged' || key === 'reported') {
        listDamagedApplications();
    } else if (key === 'missed') {
        listMissedApplications();
    }
};

const showConfirm = (id, op) => {
    if (op === "agree") {
        Modal.confirm({
            title: '确认操作',
            icon: createVNode(ExclamationCircleOutlined),
            content: '确定同意？',
            okText: '确认',
            cancelText: '取消',
            onOk() {

            }
        });
    } else if (op === "reject") {
        Modal.confirm({
            title: '确认操作',
            icon: createVNode(ExclamationCircleOutlined),
            content: '确认驳回？',
            okText: '确认',
            cancelText: '取消',
            onOk() {

            }
        });
    }
}

</script>

<template>
    <a-layout-content :style="{margin: '16px', height: '100%'}">
        <h2>
            设备申请审核
        </h2>
        <a-tabs v-model:activeKey="activeKey" type="card">
            <a-tab-pane key="application" tab="设备申请">
                <a-tabs v-model:activeKey="activeKey2" @update:activeKey="handleTabChange" type="card">
                    <a-tab-pane key="applying" tab="待审核">
                        <a-spin :spinning="spinning" tip="Loading...">
                            <a-descriptions-item v-if="data_applying.length === 0">
                                <div style="height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center;">
                                    <a-empty :image="Empty.PRESENTED_IMAGE_SIMPLE" style="width: 100%;  "/>
                                </div>
                            </a-descriptions-item>
                            <a-space direction="vertical" :size="5" style="height: 100%">

                                <a-descriptions v-for="item in currentApplyingPageData" title="设备申请"
                                                style="background-color: #FFFFFF; padding: 16px; box-sizing: border-box;">
                                    <a-descriptions-item label="固定资产编号">{{ item.equipment_fixed_assets_num }}</a-descriptions-item>
                                    <a-descriptions-item label="设备名称">{{ item.equipment_name }}</a-descriptions-item>
                                    <a-descriptions-item label="设备型号">{{ item.equipment_model }}</a-descriptions-item>
                                    <a-descriptions-item label="申请时间">{{ item.created_at }}</a-descriptions-item>
                                    <a-descriptions-item label="承诺归还时间">{{ item.apply_time }}</a-descriptions-item>
                                    <a-descriptions-item label="使用人学籍号">{{ item.user_uid }}</a-descriptions-item>
                                    <a-descriptions-item label="使用人姓名">{{ item.user_name }}</a-descriptions-item>
                                    <a-descriptions-item label="审批人学籍号">{{ item.audit_uid }}</a-descriptions-item>
                                    <a-descriptions-item label="审批人姓名">{{ item.audit_name }}</a-descriptions-item>
                                    <a-descriptions-item label="审批人时间">{{ item.audit_time }}</a-descriptions-item>
                                    <a-descriptions-item label="状态">{{ item.status }}</a-descriptions-item>
                                    <a-descriptions-item label="操作">
                                        <a-row style="gap: 5px;">
                                            <a-col>
                                                <a-button type="primary" style="padding-top: 5px; box-sizing: border-box;" danger @click="showConfirm(item.id, 'reject')">拒绝</a-button>
                                            </a-col>
                                            <a-col>
                                                <a-button type="primary" style="padding-top: 5px; box-sizing: border-box;" @click="showConfirm(item.id, 'agree')">同意</a-button>
                                            </a-col>
                                            <a-col>
                                                <a-button type="primary" style="padding-top: 5px; box-sizing: border-box;"
                                                          @click="showPhotos(item.id, 'applying')">查看照片
                                                </a-button>
                                            </a-col>
                                        </a-row>
                                    </a-descriptions-item>

                                </a-descriptions>
                                <a-pagination align="center" style="margin-top: 8px;" v-model:current="currentApplyingPage" simple pageSize="5"
                                              :total="data_applying.length" v-if="data_applying.length !== 0"/>
                            </a-space>
                        </a-spin>
                    </a-tab-pane>
                    <a-tab-pane key="delayed" tab="已拒绝">
                        <a-spin :spinning="spinning" tip="Loading...">
                            <a-descriptions-item v-if="data_rejected.length === 0">
                                <div style="height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center;">
                                    <a-empty :image="Empty.PRESENTED_IMAGE_SIMPLE" style="width: 100%;  "/>
                                </div>
                            </a-descriptions-item>
                            <a-space direction="vertical" :size="5" style="height: 100%">

                                <a-descriptions v-for="item in currentRejectedPageData" title="借条"
                                                style="background-color: #FFFFFF; padding: 16px; box-sizing: border-box;">
                                    <a-descriptions-item label="固定资产编号">{{ item.equipment_fixed_assets_num }}</a-descriptions-item>
                                    <a-descriptions-item label="设备名称">{{ item.equipment_name }}</a-descriptions-item>
                                    <a-descriptions-item label="设备型号">{{ item.equipment_model }}</a-descriptions-item>
                                    <a-descriptions-item label="申请时间">{{ item.created_at }}</a-descriptions-item>
                                    <a-descriptions-item label="承诺归还时间">{{ item.apply_time }}</a-descriptions-item>
                                    <a-descriptions-item label="使用人学籍号">{{ item.user_uid }}</a-descriptions-item>
                                    <a-descriptions-item label="使用人姓名">{{ item.user_name }}</a-descriptions-item>
                                    <a-descriptions-item label="审批人学籍号">{{ item.audit_uid }}</a-descriptions-item>
                                    <a-descriptions-item label="审批人姓名">{{ item.audit_name }}</a-descriptions-item>
                                    <a-descriptions-item label="审批人时间">{{ item.audit_time }}</a-descriptions-item>
                                    <a-descriptions-item label="状态">{{ item.status }}</a-descriptions-item>
                                    <a-descriptions-item label="操作">
                                        <a-row style="gap: 5px;">
                                            <a-col>
                                                <a-button type="primary" style="padding-top: 5px; box-sizing: border-box;"
                                                          @click="showPhotos(item.id, 'applying')">查看照片
                                                </a-button>
                                            </a-col>
                                        </a-row>
                                    </a-descriptions-item>

                                </a-descriptions>
                                <a-pagination align="center" style="margin-top: 8px;" v-model:current="currentRejectedPage" simple pageSize="5"
                                              :total="data_rejected.length" v-if="data_rejected.length !== 0"/>
                            </a-space>
                        </a-spin>
                    </a-tab-pane>
                </a-tabs>
            </a-tab-pane>
            <a-tab-pane key="delay-applying" tab="延期申请">
                <a-tabs v-model:activeKey="activeKey3" @update:activeKey="handleTabChange" type="card">
                    <a-tab-pane key="delay-applying" tab="使用中">
                        <a-spin :spinning="spinning" tip="Loading...">
                            <a-descriptions-item v-if="data_delay_applying.length === 0">
                                <div style="height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center;">
                                    <a-empty :image="Empty.PRESENTED_IMAGE_SIMPLE" style="width: 100%;  "/>
                                </div>
                            </a-descriptions-item>
                            <a-space direction="vertical" :size="5" style="height: 100%">

                                <a-descriptions v-for="item in currentDelayApplyingPageData" title="延期申请"
                                                style="background-color: #FFFFFF; padding: 16px; box-sizing: border-box;">
                                    <a-descriptions-item label="固定资产编号">{{ item.equipment_fixed_assets_num }}</a-descriptions-item>
                                    <a-descriptions-item label="设备名称">{{ item.equipment_name }}</a-descriptions-item>
                                    <a-descriptions-item label="设备型号">{{ item.equipment_model }}</a-descriptions-item>
                                    <a-descriptions-item label="申请时间">{{ item.created_at }}</a-descriptions-item>
                                    <a-descriptions-item label="承诺归还时间">{{ item.apply_time }}</a-descriptions-item>
                                    <a-descriptions-item label="使用人学籍号">{{ item.user_uid }}</a-descriptions-item>
                                    <a-descriptions-item label="使用人姓名">{{ item.user_name }}</a-descriptions-item>
                                    <a-descriptions-item label="审批人学籍号">{{ item.audit_uid }}</a-descriptions-item>
                                    <a-descriptions-item label="审批人姓名">{{ item.audit_name }}</a-descriptions-item>
                                    <a-descriptions-item label="审批人时间">{{ item.audit_time }}</a-descriptions-item>
                                    <a-descriptions-item label="状态">{{ item.status }}</a-descriptions-item>
                                    <a-descriptions-item label="操作">
                                        <a-row style="gap: 5px;">
                                            <a-col>
                                                <a-button danger style="padding-top: 5px; box-sizing: border-box;" @click="showConfirm(item.id , 'reject')">拒绝</a-button>
                                            </a-col>
                                            <a-col>
                                                <a-button type="primary" style="padding-top: 5px; box-sizing: border-box;" @click="showReturn(item.id, 'agree')">同意</a-button>
                                            </a-col>
                                        </a-row>
                                    </a-descriptions-item>

                                </a-descriptions>
                                <a-pagination align="center" style="margin-top: 8px;" v-model:current="currentDelayApplyingPage" simple pageSize="5"
                                              :total="data_delay_applying.length" v-if="data_delay_applying.length !== 0"/>
                            </a-space>
                        </a-spin>
                    </a-tab-pane>
                    <a-tab-pane key="delay-agreed" tab="已同意">
                        <a-spin :spinning="spinning" tip="Loading...">
                            <a-descriptions-item v-if="data_delay_agreed.length === 0">
                                <div style="height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center;">
                                    <a-empty :image="Empty.PRESENTED_IMAGE_SIMPLE" style="width: 100%;  "/>
                                </div>
                            </a-descriptions-item>
                            <a-space direction="vertical" :size="5" style="height: 100%">

                                <a-descriptions v-for="item in currentDelayAgreedApplicationPageData" title="延期申请"
                                                style="background-color: #FFFFFF; padding: 16px; box-sizing: border-box;">
                                    <a-descriptions-item label="固定资产编号">{{ item.equipment_fixed_assets_num }}</a-descriptions-item>
                                    <a-descriptions-item label="设备名称">{{ item.equipment_name }}</a-descriptions-item>
                                    <a-descriptions-item label="设备型号">{{ item.equipment_model }}</a-descriptions-item>
                                    <a-descriptions-item label="申请时间">{{ item.created_at }}</a-descriptions-item>
                                    <a-descriptions-item label="承诺归还时间">{{ item.apply_time }}</a-descriptions-item>
                                    <a-descriptions-item label="使用人学籍号">{{ item.user_uid }}</a-descriptions-item>
                                    <a-descriptions-item label="使用人姓名">{{ item.user_name }}</a-descriptions-item>
                                    <a-descriptions-item label="审批人学籍号">{{ item.audit_uid }}</a-descriptions-item>
                                    <a-descriptions-item label="审批人姓名">{{ item.audit_name }}</a-descriptions-item>
                                    <a-descriptions-item label="审批人时间">{{ item.audit_time }}</a-descriptions-item>
                                    <a-descriptions-item label="状态">{{ item.status }}</a-descriptions-item>
                                    <a-descriptions-item label="操作">
                                        <a-row style="gap: 5px;">
                                            <a-col>
                                                <a-button danger style="padding-top: 5px; box-sizing: border-box;" @click="showConfirm(item.id , 'reject')">拒绝</a-button>
                                            </a-col>
                                            <a-col>
                                                <a-button type="primary" style="padding-top: 5px; box-sizing: border-box;" @click="showReturn(item.id, 'agree')">同意</a-button>
                                            </a-col>
                                        </a-row>
                                    </a-descriptions-item>

                                </a-descriptions>
                                <a-pagination align="center" style="margin-top: 8px;" v-model:current="currentDelayAgreedApplicationPage" simple pageSize="5"
                                              :total="data_delay_agreed.length" v-if="data_delay_agreed.length !== 0"/>
                            </a-space>
                        </a-spin>
                    </a-tab-pane>
                    <a-tab-pane key="delay-rejected" tab="已拒绝">
                        <a-spin :spinning="spinning" tip="Loading...">
                            <a-descriptions-item v-if="data_delay_applying.length === 0">
                                <div style="height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center;">
                                    <a-empty :image="Empty.PRESENTED_IMAGE_SIMPLE" style="width: 100%;  "/>
                                </div>
                            </a-descriptions-item>
                            <a-space direction="vertical" :size="5" style="height: 100%">

                                <a-descriptions v-for="item in currentRejectedDelayPageData" title="延期申请"
                                                style="background-color: #FFFFFF; padding: 16px; box-sizing: border-box;">
                                    <a-descriptions-item label="固定资产编号">{{ item.equipment_fixed_assets_num }}</a-descriptions-item>
                                    <a-descriptions-item label="设备名称">{{ item.equipment_name }}</a-descriptions-item>
                                    <a-descriptions-item label="设备型号">{{ item.equipment_model }}</a-descriptions-item>
                                    <a-descriptions-item label="申请时间">{{ item.created_at }}</a-descriptions-item>
                                    <a-descriptions-item label="承诺归还时间">{{ item.apply_time }}</a-descriptions-item>
                                    <a-descriptions-item label="使用人学籍号">{{ item.user_uid }}</a-descriptions-item>
                                    <a-descriptions-item label="使用人姓名">{{ item.user_name }}</a-descriptions-item>
                                    <a-descriptions-item label="审批人学籍号">{{ item.audit_uid }}</a-descriptions-item>
                                    <a-descriptions-item label="审批人姓名">{{ item.audit_name }}</a-descriptions-item>
                                    <a-descriptions-item label="审批人时间">{{ item.audit_time }}</a-descriptions-item>
                                    <a-descriptions-item label="状态">{{ item.status }}</a-descriptions-item>
                                    <a-descriptions-item label="操作">
                                        <a-row style="gap: 5px;">
                                            <a-col>
                                                <a-button danger style="padding-top: 5px; box-sizing: border-box;" @click="showConfirm(item.id , 'reject')">拒绝</a-button>
                                            </a-col>
                                            <a-col>
                                                <a-button type="primary" style="padding-top: 5px; box-sizing: border-box;" @click="showReturn(item.id, 'agree')">同意</a-button>
                                            </a-col>
                                        </a-row>
                                    </a-descriptions-item>

                                </a-descriptions>
                                <a-pagination align="center" style="margin-top: 8px;" v-model:current="currentRejectedDelayPage" simple pageSize="5"
                                              :total="data_delay_applying.length" v-if="data_delay_applying.length !== 0"/>
                            </a-space>
                        </a-spin>
                    </a-tab-pane>
                </a-tabs>
            </a-tab-pane>
            <a-tab-pane key="returned" tab="归还查看">
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
                            <a-descriptions-item label="使用人学籍号">{{ item.user_uid }}</a-descriptions-item>
                            <a-descriptions-item label="使用人姓名">{{ item.user_name }}</a-descriptions-item>
                            <a-descriptions-item label="审批人学籍号">{{ item.audit_uid }}</a-descriptions-item>
                            <a-descriptions-item label="审批人姓名">{{ item.audit_name }}</a-descriptions-item>
                            <a-descriptions-item label="审批时间">{{ item.audit_time }}</a-descriptions-item>
                            <a-descriptions-item label="承诺归还时间">{{ item.apply_time }}</a-descriptions-item>
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
                                      :total="data_returned.length" v-if="data_returned.length !== 0"/>
                    </a-space>
                </a-spin>
            </a-tab-pane>
            <a-tab-pane key="reported" tab="异常报告">
                <a-tabs  v-model:activeKey="activeKey4" @update:activeKey="handleTabChange" type="card">
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
                                                <a-button type="primary" style="padding-top: 5px; box-sizing: border-box;"
                                                          @click="showPhotos(item.id, 'damaged')">查看照片
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
                                    <a-descriptions-item label="使用人学籍号">{{ item.user_uid }}</a-descriptions-item>
                                    <a-descriptions-item label="使用人姓名">{{ item.user_name }}</a-descriptions-item>
                                    <a-descriptions-item label="审批人学籍号">{{ item.audit_uid }}</a-descriptions-item>
                                    <a-descriptions-item label="审批人姓名">{{ item.audit_name }}</a-descriptions-item>
                                    <a-descriptions-item label="审批时间">{{ item.audit_time }}</a-descriptions-item>
                                    <a-descriptions-item label="报告时间">{{ item.report_time }}</a-descriptions-item>
                                    <a-descriptions-item label="情况">{{ item.type }}</a-descriptions-item>

                                </a-descriptions>
                                <a-pagination align="center" style="margin-top: 8px;" v-model:current="currentMissedPage" simple pageSize="5"
                                              :total="data_missed.length" v-if="data_missed.length !== 0"/>
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
                    <a-image v-for="i in images" :width="200" fallback="data:image/png;base64,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"
                             :src="image_base_url + i" />
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