<script setup>
import {reactive, ref, onMounted, createVNode, watch} from 'vue';
import {cloneDeep} from 'lodash-es';
import {
    CheckOutlined,
    EditOutlined,
    ExclamationCircleOutlined,
    PlusOutlined,
    SearchOutlined
} from '@ant-design/icons-vue';
import {message, Modal} from "ant-design-vue";
import api from "@/api";

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
});

window.addEventListener('resize', handleResize);

const state = reactive({
    searchText: '',
    searchedColumn: '',
});

const searchInput = ref();

const columns = [
    {
        title: '签到名称',
        dataIndex: 'title',
        width: '25%',
        customFilterDropdown: true,
        onFilter: (value, record) =>
            record.title.toString().toLowerCase().includes(value.toLowerCase()),
    },
    {
        title: '活动标题',
        dataIndex: 'activity_title',
        width: '25%',
        customFilterDropdown: true,
        onFilter: (value, record) =>
            record.activity_title.toString().toLowerCase().includes(value.toLowerCase()),
    },
    {
        title: '状态',
        dataIndex: 'status',
        width: '8%',
        customFilterDropdown: true,
        onFilter: (value, record) =>
            record.status.toString().toLowerCase().includes(value.toLowerCase()),
    },
    {
        title: '开始时间',
        dataIndex: 'start_time',
        width: '12%',
        customFilterDropdown: true,
        onFilter: (value, record) =>
            record.start_time.toString().toLowerCase().includes(value.toLowerCase()),
    },
    {
        title: '结束时间',
        dataIndex: 'end_time',
        width: '12%',
        customFilterDropdown: true,
        onFilter: (value, record) =>
            record.end_time.toString().toLowerCase().includes(value.toLowerCase()),
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
    clearFilters({confirm: true});
    state.searchText = '';
};

const data_checkins = ref([]);

const spinning = ref(false);

const listCheckIns = () => {
    spinning.value = true;
    api.get("/checkin").then(res => {
        spinning.value = false;
        let {data} = res.data
        data = data.map(item => {
            if (item.status === 'waiting') {
                item.status = '未开始';
            } else if (item.status === 'started') {
                item.status = '正在进行';
            } else if (item.status === 'ended') {
                item.status = '已结束';
            }
            return item;
        })
        data_checkins.value = data;
    }).catch(err => {
        let {msg} = err.response.data;
        spinning.value = false;
        message.error(msg);
    })
}

onMounted(() => {
    listCheckIns();
});
const deleteCheckIns = id => {
    spinning.value = true;
    api.delete("/checkin/" + id).then(res => {
        data_checkins.value = data_checkins.value.filter(item => item.id !== id);
        spinning.value = false;
        let {data, msg} = res.data;
        message.success(msg);
    }).catch(err => {
        spinning.value = false;
        let {msg} = err.response.data;
        message.error(msg);
    });
};

const visibleInfo = ref(false);

const showInfo = id => {
    visibleInfo.value = true;
}

const visibleEdit = ref(false);
const edit = id => {
    visibleEdit.value = true;
}

const visiblePhotos = ref(false);

const showPhotos = id => {
    visiblePhotos.value = true;
}

const visibleAdd = ref(false);

const showAdd = () => {
    visibleAdd.value = true;
}

const visibleUsers = ref(false);

const showUsers = () => {
    visibleUsers.value = true;
}

const formState = reactive({
    checkIn: {
        activity_id: '',
        name: '',
        start_datetime: '',
        end_datetime: '',
    }
});
const validateMessages = {
    required: '${label} 必填!',
    types: {
        email: '${label} 非法邮箱格式',
    },
};
const handleCancel = () => {
    visibleInfo.value = false;
};

const handlePhotosCancel = () => {
    visiblePhotos.value = false;
}

const showConfirm = (id) => {
    Modal.confirm({
        title: '确认操作',
        icon: createVNode(ExclamationCircleOutlined),
        content: '是否判定此签到无效并驳回？',
        okText: '确认',
        cancelText: '取消',
        onOk() {

        }
    });
}


const treeData = [{
    title: '活动用户',
    key: '0-0',
    children: [],
}];
const expandedKeys = ref(['0-0-0', '0-0-1']);
const selectedKeys = ref(['0-0-0', '0-0-1']);
const checkedKeys = ref(['0-0-0', '0-0-1']);
watch(expandedKeys, () => {
    console.log('expandedKeys', expandedKeys);
});
watch(selectedKeys, () => {
    console.log('selectedKeys', selectedKeys);
});
watch(checkedKeys, () => {
    console.log('checkedKeys', checkedKeys);
});

</script>
<template>
    <a-layout-content
            :style="{margin: '16px'}"
    >
        <h2>签到管理</h2>
        <div style="padding: 8px; background-color: #FFFFFF" v-if="isShow">
            <a-spin :spinning="spinning" tip="Loading...">
                <a-row justify="end">
                    <a-button type="primary" style="margin: 8px; " ghost @click="showAdd">新建签到</a-button>
                </a-row>
                <a-table :columns="columns" :data-source="data_checkins" bordered>
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
                        <template v-if="['uid', 'name', 'classname', 'department'].includes(column.dataIndex)">
                            <div>
                                {{ text }}
                            </div>
                        </template>

                        <template v-else-if="column.dataIndex === 'operation'">
                            <div class="editable-row-operations">
                            <span>
                                <a @click="edit(record.id)">编辑</a>
                            </span>
                                <span>
                                <a @click="showInfo(record.id)">详情</a>
                            </span>
                                <span>
                                <a-popconfirm
                                    v-if="data_checkins.length"
                                    title="是否删除?"
                                    @confirm="deleteCheckIns(record.id)"
                                ><a style="color:red;">删除</a>
                                </a-popconfirm>
                            </span>
                            </div>
                        </template>
                    </template>
                </a-table>
            </a-spin>
        </div>
        <a-modal v-model:visible="visibleInfo" title="签到情况">
            <a-card>
                <a-descriptions v-for="item in data" title="姓名"
                                layout="vertical">

                    <a-descriptions-item label="签到时间">2023-06-03 21:09</a-descriptions-item>
                    <a-descriptions-item label="签到状态">demo</a-descriptions-item>
                    <a-descriptions-item label="操作" style="display:flex; gap: 4px;">
                        <a-button type="primary" style="padding-top: 5px; box-sizing: border-box;" danger
                                  @click="showConfirm(item.id)">驳回
                        </a-button>
                        <a-button type="primary" style="padding-top: 5px; box-sizing: border-box; margin-left: 5px;"
                                  @click="showPhotos(item.id)">查看照片
                        </a-button>
                    </a-descriptions-item>
                </a-descriptions>
            </a-card>
        </a-modal>
        <a-modal v-model:visible="visibleAdd" title="新建签到">

            <a-form
                    :model="formState.checkIn"
                    name="validate_other"
                    :validate-messages="validateMessages"
                    style="max-width: 500px;"

            >
                <a-form-item
                        name="activity_id"
                        label="选择活动"
                        has-feedback
                        :rules="[{ required: true, message: '请选择一个有效活动' }]"
                >
                    <a-select v-model:value="formState.checkIn.activity_id" placeholder="选择需要绑定的活动">
                        <a-select-option value="1">Demo 1</a-select-option>
                        <a-select-option value="2">Demo 2</a-select-option>
                    </a-select>
                </a-form-item>
                <a-form-item name="name" label="签到名称" :rules="[{ required: true }]">
                    <a-input v-model:value="formState.checkIn.name"/>
                </a-form-item>
                <a-form-item has-feedback
                             :rules="[{ required: true, message: '请选择日期' }]" name="start_datetime"
                             label="开始时间">
                    <a-date-picker
                            v-model:value="formState.checkIn.start_datetime"
                            show-time
                            format="YYYY-MM-DD HH:mm:ss"
                            value-format="YYYY-MM-DD HH:mm:ss"
                            placeholder="不得早于当前时间"
                    />
                </a-form-item>
                <a-form-item has-feedback
                             :rules="[{ required: true, message: '请选择日期' }]" name="end_datetime" label="结束时间">
                    <a-date-picker
                            v-model:value="formState.checkIn.end_datetime"
                            show-time
                            format="YYYY-MM-DD HH:mm:ss"
                            value-format="YYYY-MM-DD HH:mm:ss"
                            placeholder="不得早于当前时间"
                    />
                </a-form-item>
                <a-form-item label="签到用户">
                    <a-button @click="showUsers">
                        添加活动内的用户
                    </a-button>
                </a-form-item>
                <template #footer>
                    <a-button type="primary" @click="handleCancel">关闭</a-button>
                    <a-button type="primary" danger>变更</a-button>
                </template>
            </a-form>
        </a-modal>
        <a-modal v-model:visible="visibleEdit" title="编辑">

            <a-form
                    :model="formState.checkIn"
                    name="validate_other"
                    :validate-messages="validateMessages"
                    style="max-width: 500px;"

            >
                <a-form-item
                        name="activity_id"
                        label="已绑定的活动"
                        has-feedback
                >
                    <a-select v-model:value="formState.checkIn.activity_id" placeholder="绑定的活动" disabled>
                        <a-select-option value="1">Demo 1</a-select-option>
                        <a-select-option value="2">Demo 2</a-select-option>
                    </a-select>
                </a-form-item>
                <a-form-item name="name" label="签到名称" :rules="[{ required: true }]">
                    <a-input v-model:value="formState.checkIn.name"/>
                </a-form-item>
                <a-form-item has-feedback
                             :rules="[{ required: true, message: '请选择日期' }]" name="start_datetime"
                             label="开始时间">
                    <a-date-picker
                            v-model:value="formState.checkIn.start_datetime"
                            show-time
                            format="YYYY-MM-DD HH:mm:ss"
                            value-format="YYYY-MM-DD HH:mm:ss"
                            placeholder="不得早于当前时间"
                    />
                </a-form-item>
                <a-form-item has-feedback
                             :rules="[{ required: true, message: '请选择日期' }]" name="end_datetime" label="结束时间">
                    <a-date-picker
                            v-model:value="formState.checkIn.end_datetime"
                            show-time
                            format="YYYY-MM-DD HH:mm:ss"
                            value-format="YYYY-MM-DD HH:mm:ss"
                            placeholder="不得早于当前时间"
                    />
                </a-form-item>

                <template #footer>
                    <a-button type="primary" @click="handleCancel">关闭</a-button>
                    <a-button type="primary" danger>变更</a-button>
                </template>
            </a-form>
        </a-modal>
        <a-modal v-model:visible="visiblePhotos">
            <a-image-preview-group>
                <a-image :width="200" src="https://aliyuncdn.antdv.com/vue.png"/>
                <a-image :width="200" src="https://aliyuncdn.antdv.com/logo.png"/>
            </a-image-preview-group>
            <template #footer>
                <a-button type="primary" @click="handlePhotosCancel">OK</a-button>
            </template>
        </a-modal>
        <a-modal title="活动用户列表" v-model:visible="visibleUsers">
            <a-tree
                v-model:expandedKeys="expandedKeys"
                v-model:selectedKeys="selectedKeys"
                v-model:checkedKeys="checkedKeys"
                checkable
                :tree-data="treeData"
            >
                <template #title="{ title, key }">
                    <span v-if="key === '0-0-1-0'" style="color: #1890ff">{{ title }}</span>
                    <template v-else>{{ title }}</template>
                </template>
            </a-tree>
        </a-modal>
        <div style="padding: 8px; background-color: #FFFFFF" v-if="isShow === false">
            管理员相关功能不支持宽度小于525px的设备显示，建议使用电脑端操作。
        </div>

    </a-layout-content>

</template>

<style scoped>
.editable-row-operations a {
    margin-right: 8px;
}
</style>