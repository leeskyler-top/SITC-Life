<script setup>
import {reactive, ref, onMounted, computed} from 'vue';
import {SearchOutlined} from '@ant-design/icons-vue';
import {Empty, message} from "ant-design-vue";
import api from "@/api";
import my_config from "@/my_config";

const isShow = ref(true);

function handleResize(event) {
    // 页面宽度小于525px时，不显示表格
    if (document.documentElement.clientWidth < 525) {
        isShow.value = false;
    } else {
        isShow.value = true;
    }
}

onMounted(() => {
    handleResize();
    listAllEquipmentApplications();
});

window.addEventListener('resize', handleResize);


const myData = ref([]);
const delayed_data = ref([]);
const state = reactive({
    searchText: '',
    searchedColumn: '',
});

const spinning = ref(false);

const listAllEquipmentApplications = () => {
    spinning.value = true;
    api.get("/equipment/list/rent-history").then((res) => {
        let {data} = res.data;
        myData.value = data;
        spinning.value = false;
    }).catch((err) => {
        let {msg} = err.response.data;
        spinning.value = false;
        message.error(msg);
    });
}

const listDelayApplicationsByERID = id => {
    spinning.value = true;
    api.get("/equipment/list/delay-application/search/" + id).then((res) => {
        let {data} = res.data;
        delayed_data.value = data;
        spinning.value = false;
    }).catch((err) => {
        let {msg} = err.response.data;
        spinning.value = false;
        message.error(msg);
    });
}

const currentDelayedApplicationsPage = ref(1);

const currentDelayedApplicationsPageData = computed(() => {
    const startIdx = (currentDelayedApplicationsPage.value - 1) * 5;
    const endIdx = startIdx + 5;
    return delayed_data.value.slice(startIdx, endIdx);
});

const searchInput = ref('');
const columns = [
    {
        title: '固定资产编号',
        dataIndex: 'equipment_fixed_assets_num',
        width: '10%',
        customFilterDropdown: true,
        onFilter: (value, record) =>
            record.fixed_assets_num.toString().toLowerCase().includes(value.toLowerCase()),
    },
    {
        title: '设备名称',
        dataIndex: 'equipment_name',
        width: '10%',
        customFilterDropdown: true,
        onFilter: (value, record) =>
            record.name.toString().toLowerCase().includes(value.toLowerCase()),
    },

    {
        title: '设备型号',
        dataIndex: 'equipment_model',
        width: '10%',
        customFilterDropdown: true,
        onFilter: (value, record) =>
            record.name.toString().toLowerCase().includes(value.toLowerCase()),
    },

    {
        title: '申请人学籍号',
        dataIndex: 'user_uid',
        width: '5%',
        customFilterDropdown: true,
        onFilter: (value, record) =>
            record.user_uid.toString().toLowerCase().includes(value.toLowerCase()),
    },
    {
        title: '申请人姓名',
        dataIndex: 'user_name',
        width: '5%',
        customFilterDropdown: true,
        onFilter: (value, record) =>
            record.user_name.toString().toLowerCase().includes(value.toLowerCase()),
    },
    {
        title: '审批人学籍号',
        dataIndex: 'audit_uid',
        width: '5%',
        customFilterDropdown: true,
        onFilter: (value, record) =>
            record.audit_uid.toString().toLowerCase().includes(value.toLowerCase()),
    },
    {
        title: '审批人姓名',
        dataIndex: 'audit_name',
        width: '5%',
        customFilterDropdown: true,
        onFilter: (value, record) =>
            record.audit_name.toString().toLowerCase().includes(value.toLowerCase()),
    },
    {
        title: '承诺归还时间',
        dataIndex: 'apply_time',
        width: '8%',
        customFilterDropdown: true,
        onFilter: (value, record) =>
            record.apply_time.toString().toLowerCase().includes(value.toLowerCase()),
    },
    {
        title: '审批时间',
        dataIndex: 'audit_time',
        width: '8%',
        customFilterDropdown: true,
        onFilter: (value, record) =>
            record.audit_time.toString().toLowerCase().includes(value.toLowerCase()),
    },
    {
        title: '状态',
        dataIndex: 'status',
        width: '5%',
        customFilterDropdown: true,
        onFilter: (value, record) =>
            record.status.toString().toLowerCase().includes(value.toLowerCase()),
    },
    {
        title: '操作',
        dataIndex: 'operation',
        width: '12%',
    },
];

const handleSearch = (selectedKeys, confirm, dataIndex) => {
    confirm();
    state.searchText = selectedKeys[0];
    state.searchedColumn = dataIndex;
};

const handleReset = clearFilters => {
    clearFilters({confirm: true});
    state.searchText = '';
};

const visiblePhotos = ref(false)
const visibleDelayedHistory = ref(false)
const images = ref([]);
const showPhotos = (id, status) => {
    visiblePhotos.value = true;
    if (status === 'applying' || status === 'rejected' || status === 'delayed' || status === 'delay-applying' || status === 'assigned') {
        images.value = JSON.parse(myData.value.find(i => i.id === id).assigned_url);
    } else if (status === 'returned') {
        images.value = JSON.parse(myData.value.find(i => i.id === id).returned_url);
    } else if (status === 'damaged') {
        images.value = JSON.parse(myData.value.find(i => i.id === id).damaged_url);
    }
};
const image_base_url = my_config.images_base_url;
const showDelayedHistory = id => {
    visibleDelayedHistory.value = true;
    listDelayApplicationsByERID(id);
};


const handleCancel = () => {
    visiblePhotos.value = false;
    visibleDelayedHistory.value = false;
};

</script>
<template>
    <a-layout-content
            :style="{margin: '16px'}"
    >
        <h2>所有设备出借历史</h2>
        <a-spin :spinning="spinning">
            <div style="padding: 8px; background-color: #FFFFFF" v-if="isShow">
                <a-table bordered :data-source="myData" :columns="columns">
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
                                <template #icon>
                                    <search-outlined/>
                                </template>
                                Search
                            </a-button>
                            <a-button size="small" style="width: 90px" @click="handleReset(clearFilters)">
                                Reset
                            </a-button>
                        </div>
                    </template>
                    <template #bodyCell="{ column, text, record }">
                        <template
                                v-if="['equipment_fixed_assets_num' ,'equipment_name' ,'equipment_model' ,'created_at' ,'apply_time' ,'user_uid' ,'user_name' ,'audit_uid' ,'audit_name', 'audit_time'].includes(column.dataIndex)">
                            <div>
                                {{ text }}
                            </div>
                        </template>
                        <template
                            v-if="['status'].includes(column.dataIndex)">
                                <span v-if="text === 'applying'">申请中</span>
                                <span v-else-if="text === 'assigned'">使用中</span>
                                <span v-else-if="text === 'rejected'">被拒</span>
                                <span v-else-if="text === 'returned'">已归还</span>
                                <span v-else-if="text === 'damaged'">已损毁</span>
                                <span v-else-if="text === 'delay-applying'">已申请延期</span>
                                <span v-else-if="text === 'delay-applying'">已延期</span>
                        </template>
                        <template v-else-if="column.dataIndex === 'operation'">
                            <div class="editable-row-operations">
                             <span>
                               <a @click="showPhotos(record.id, record.status)">查看图片</a>
                            </span>
                                <span>
                               <a @click="showDelayedHistory(record.id)">延期历史</a>
                            </span>
                            </div>
                        </template>
                    </template>
                </a-table>
            </div>
        </a-spin>
        <div style="padding: 8px; background-color: #FFFFFF" v-if="isShow === false">
            管理员相关功能不支持宽度小于525px的设备显示，建议使用电脑端操作。
        </div>
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
                             :src="image_base_url + i"/>
                </a-image-preview-group>
            </a-spin>
            <template #footer>
                <a-button type="primary" @click="handleCancel">OK</a-button>
            </template>
        </a-modal>
        <a-modal v-model:visible="visibleDelayedHistory" title="查看延期历史">
            <a-spin :spinning="spinning" style="width: 100%;">
                <a-descriptions-item v-if="delayed_data.length === 0">
                    <div style="height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center;">
                        <a-empty :image="Empty.PRESENTED_IMAGE_SIMPLE" style="width: 100%;  "/>
                    </div>
                </a-descriptions-item>
                <a-space direction="vertical" :size="5" style="height: 100%">

                    <a-descriptions v-for="item in currentDelayedApplicationsPageData" title="延期申请"
                                    style="background-color: #FFFFFF; padding: 16px; box-sizing: border-box;" layout="vertical">
                        <a-descriptions-item label="承诺归还时间">{{
                                item.apply_time
                            }}
                        </a-descriptions-item>
                        <a-descriptions-item label="延期理由">{{
                                item.reason
                            }}
                        </a-descriptions-item>
                        <a-descriptions-item label="审批人学籍号">{{
                                item.audit_uid
                            }}
                        </a-descriptions-item>
                        <a-descriptions-item label="审批人姓名">{{
                                item.audit_name
                            }}
                        </a-descriptions-item>
                        <a-descriptions-item label="审批时间">{{
                                item.equipment_application_audit_time
                            }}
                        </a-descriptions-item>
                        <a-descriptions-item label="状态">
                            <span v-if="item.status === 'delay-applying'">延期申请</span>
                            <span v-if="item.status === 'delayed'">已延期</span>
                            <span v-if="item.status === 'rejected'">已拒绝</span>
                        </a-descriptions-item>
                    </a-descriptions>
                    <a-pagination align="center" style="margin-top: 8px;"
                                  v-model:current="currentDelayedApplicationsPage" simple pageSize="5"
                                  :total="delayed_data.length" v-if="delayed_data.length !== 0"/>
                </a-space>
            </a-spin>

            <template #footer>
                <a-button type="primary" @click="handleCancel">OK</a-button>
            </template>
        </a-modal>

    </a-layout-content>

</template>

<style scoped>
.editable-row-operations a {
    margin-right: 8px;
}
</style>