<script setup>
import {reactive, ref, onMounted, watch, createVNode} from 'vue';
import {cloneDeep, debounce} from 'lodash-es';
import {ExclamationCircleOutlined, PlusOutlined, SearchOutlined} from '@ant-design/icons-vue';
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

const activeKey = ref([]);

const myData = ref([]);

const state = reactive({
    searchText: '',
    searchedColumn: '',
    data: [],
    value: [],
    fetching: false,
});

const searchInput = ref();

const columns = [
    {
        title: '活动标题',
        dataIndex: 'title',
        width: '30%',
        customFilterDropdown: true,
        onFilter: (value, record) =>
            record.title.toString().toLowerCase().includes(value.toLowerCase()),
    },
    {
        title: '类型',
        dataIndex: 'type',
        width: '10%',
        customFilterDropdown: true,
        onFilter: (value, record) =>
            record.type.toString().toLowerCase().includes(value.toLowerCase()),
    },
    {
        title: '地点',
        dataIndex: 'place',
        width: '15%',
        customFilterDropdown: true,
        onFilter: (value, record) =>
            record.place.toString().toLowerCase().includes(value.toLowerCase()),
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

const now = new Date();
// 禁用早于当前日期的日期
const disabledDate = (date) => {
    return date && date.valueOf() < now.valueOf();
};
const handleSearch = (selectedKeys, confirm, dataIndex) => {
    confirm();
    state.searchText = selectedKeys[0];
    state.searchedColumn = dataIndex;
};

const handleReset = clearFilters => {
    clearFilters({confirm: true});
    state.searchText = '';
};

const visibleInfo = ref(false);
const showInfo = id => {
    visibleInfo.value = true;
    current_activity_id.value = id;
    let current_activity = myData.value.find(item => item.id === current_activity_id.value)
    formState.activity.title = current_activity.title;
    formState.activity.type = current_activity.type;
    formState.activity.place = current_activity.place;
    formState.activity.note = current_activity.note;
    formState.activity.start_time = current_activity.start_time;
    formState.activity.end_time = current_activity.end_time;
    formState.activity.type = current_activity.type;
};

const loading = ref(false);
const visible = ref(false);
const showModal = id => {
    visible.value = true;
};
const handleCancel = () => {
    visible.value = false;
    visibleInfo.value = false;
    visiblePhotos.value = false;
    visibleAddUsers.value = false;
};

const changeNote = () => {

}

const visiblePhotos = ref(false)
const showPhotos = id => {
    visiblePhotos.value = true;
};
const visiblePeople = ref(false);

const showPeople = id => {
    visiblePeople.value = true;
}
const hidePhotos = () => {
    visiblePhotos.value = false;
}

const visibleAddUsers = ref(false);
const showAddUsers = id => {
    visibleAddUsers.value = true;
}

const formItemLayout = {
    labelCol: {
        span: 6,
    },
    wrapperCol: {
        span: 14,
    },
};

const editUser = () => {

};

const formState = reactive({
    activity: {
        title: null,
        note: null,
        place: null,
        type: null,
        start_time: null,
        end_time: null,
    },
});
setInterval(() => console.log(formState.activity), 1000)
const validateMessages = {
    required: '${label} 必填!',
    types: {
        email: '${label} 非法邮箱格式',
    },
};
let lastFetchId = 0;

const spinning = ref(false)

const fetchUser = debounce(value => {
    console.log('fetching user', value);
    lastFetchId += 1;
    const fetchId = lastFetchId;
    state.data = [];
    state.fetching = true;
    fetch('https://randomuser.me/api/?results=5').then(response => response.json()).then(body => {
        if (fetchId !== lastFetchId) {
            // for fetch callback order
            return;
        }
        const data = body.results.map(user => ({
            label: `${user.name.first} ${user.name.last}`,
            value: user.login.username,
        }));
        state.data = data;
        state.fetching = false;
    });
}, 300);

const listActivities = () => {
    spinning.value = true;
    api.get("/activity").then((res) => {
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
        myData.value = data;
    }).catch((err) => {
        let {msg} = err.response.data;
        spinning.value = false;
        message.error(msg);
    });
}

const deleteActivity = id => {
    api.delete("/activity/" + id).then((res) => {
        let {msg} = res.data;
        message.success(msg);
        myData.value = myData.value.filter(activity => activity.id !== id);
    }).catch((err) => {
        let {msg} = err.response.data;
        message.error(msg);
    });
}

const current_activity_id = ref();
const changeActivityInfo = () => {
    loading.value = true;
    api.patch("/activity/" + current_activity_id.value, formState.activity).then((res) => {
        let {msg} = res.data;
        let current_activity = myData.value.find(item => item.id === current_activity_id.value)
        if (formState.activity.type === 'assignment') {
            formState.activity.type = '指派';
        } else if (formState.activity.type === 'self-enrollment') {
            formState.activity.type = '自主报名';
        } else if (formState.activity.type === 'ase') {
            formState.activity.type = '自主报名与指派';
        }
        loading.value = false;
        Object.assign(current_activity, formState.activity);
        visibleInfo.value = false;
        message.success(msg);
    }).catch((err) => {
        let {msg} = err.response.data;
        loading.value = false;
        message.error(msg);
    });
}

onMounted(() => {
    listActivities();
});

watch(state.value, () => {
    state.data = [];
    state.fetching = false;
});

const showConfirm = (op, id) => {
    if (op === "refuse") {
        Modal.confirm({
            title: '确认操作',
            icon: createVNode(ExclamationCircleOutlined),
            content: '是否判定此签到无效并驳回？',
            okText: '确认',
            cancelText: '取消',
            onOk() {

            }
        });
    } else if (op === "deleteCheckIn") {
        Modal.confirm({
            title: '确认操作',
            icon: createVNode(ExclamationCircleOutlined),
            content: '确认删除此签到？ 操作不可逆！',
            okText: '确认',
            cancelText: '取消',
            onOk() {

            }
        });
    } else if (op === "deleteUser") {
        Modal.confirm({
            title: '确认操作',
            icon: createVNode(ExclamationCircleOutlined),
            content: '确认将此人从活动人员中移除？',
            okText: '确认',
            cancelText: '取消',
            onOk() {

            }
        });
    }
}

</script>
<template>
    <a-layout-content
            :style="{margin: '16px'}"
    >
        <h2>活动管理</h2>
        <div style="padding: 8px; background-color: #FFFFFF" v-if="isShow">
            <a-spin :spinning="spinning" tip="Loading...">
                <a-row justify="end">
                    <router-link to="/activity/add">
                        <a-button type="primary" style="margin: 8px; " ghost>添加活动</a-button>
                    </router-link>
                </a-row>
                <a-table :columns="columns" :data-source="myData" bordered>
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
                                v-if="['title', 'type', 'place', 'start_datetime', 'end_datetime'].includes(column.dataIndex)">
                            <div>
                                {{ text }}
                            </div>
                        </template>
                        <template v-else-if="column.dataIndex === 'operation'">
                            <div class="editable-row-operations">
                      <span>
                          <a @click="showInfo(record.id)">编辑</a>
                      </span>
                                <span>
                          <a @click="showPeople(record.id)">活动人员</a>
                      </span>
                                <span>
                          <a @click="showModal(record.id)">签到管理</a>
                      </span>
                                <span>
                        <a-popconfirm title="Sure to delete?" @confirm="deleteActivity(record.id)"><a
                                style="color: red">删除</a></a-popconfirm>
                      </span>
                            </div>
                        </template>
                    </template>
                </a-table>
            </a-spin>
        </div>
        <div style="padding: 8px; background-color: #FFFFFF" v-if="isShow === false">
            管理员相关功能不支持宽度小于525px的设备显示，建议使用电脑端操作。
        </div>
        <a-modal v-model:visible="visible" title="签到管理">
            <template #footer>
                <a-button type="primary" @click="handleCancel">关闭</a-button>
            </template>
            <a-collapse v-model:activeKey="activeKey" accordion>
                <a-collapse-panel key="1" header="demo demo">
                    <a-card>
                        <p>签到开始时间: 2023-06-02 21:42</p>
                        <p>签到结束时间: 2023-06-02 21:50</p>
                        <div>
                            <a-button type="primary" style="padding-top: 5px; box-sizing: border-box;">变更结束时间
                            </a-button>
                            <a-button type="primary" style="padding-top: 5px; box-sizing: border-box; margin-left: 4px;"
                                      danger @click="showConfirm('deleteCheckIn')">删除签到
                            </a-button>
                        </div>
                    </a-card>
                    <a-card>
                        <a-descriptions v-for="item in data" title="姓名"
                                        layout="vertical">

                            <a-descriptions-item label="签到时间">2023-06-03 21:09</a-descriptions-item>
                            <a-descriptions-item label="签到状态">demo</a-descriptions-item>
                            <a-descriptions-item label="操作" style="display:flex; gap: 4px;">
                                <a-button type="primary" style="padding-top: 5px; box-sizing: border-box;" danger
                                          @click="showConfirm('refuse')">驳回
                                </a-button>
                                <a-button type="primary"
                                          style="padding-top: 5px; box-sizing: border-box; margin-left: 5px;"
                                          @click="showPhotos(item.id)">查看照片
                                </a-button>
                            </a-descriptions-item>
                        </a-descriptions>
                    </a-card>
                </a-collapse-panel>
            </a-collapse>
        </a-modal>
        <a-modal v-model:visible="visibleInfo" title="变更活动信息">

            <a-form
                    :model="formState"
                    name="validate_other"
                    v-bind="formItemLayout"
                    :validate-messages="validateMessages"
                    style="max-width: 500px;"

            >
                <a-form-item :name="['activity', 'title']" label="活动标题" :rules="[{ required: true }]">
                    <a-input v-model:value="formState.activity.title"/>
                </a-form-item>
                <a-form-item :name="['activity', 'note']" label="需求" :rules="[{ required: true }]">
                    <a-textarea v-model:value="formState.activity.note"/>
                </a-form-item>
                <a-form-item :name="['activity', 'place']" label="地点" :rules="[{ required: true }]">
                    <a-input v-model:value="formState.activity.place"/>
                </a-form-item>
                <a-form-item
                        :name="['activity', 'type']"
                        label="发布类型"
                        has-feedback
                        :rules="[{ required: true, message: '请选择发布方式' }]"
                >
                    <a-select v-model:value="formState.activity.type" placeholder="选择一个发布类型" value="self-enrollment" disabled>
                        <a-select-option value="assignment">指派</a-select-option>
                        <a-select-option value="self-enrollment">自主报名</a-select-option>
                        <a-select-option value="ase">自主报名与指派</a-select-option>
                    </a-select>
                </a-form-item>
                <div v-if="formState.activity.type === 'assignment' || formState.activity.type === 'ase'">
                    <a-form-item style="display: flex; align-items: center; justify-content: center;">
                        <a-button type="dashed" block @click="editUser">
                            <PlusOutlined/>
                            Add user
                        </a-button>
                    </a-form-item>
                </div>
                <a-form-item has-feedback
                             :rules="[{ required: true, message: '请选择日期' }]"
                             v-model:value="formState.activity.start_time" :name="['activity', 'start_time']" label="开始时间">
                    <a-date-picker
                            v-model:value="formState.activity.start_time"
                            show-time
                            format="YYYY-MM-DD HH:mm:ss"
                            value-format="YYYY-MM-DD HH:mm:ss"
                            placeholder="不得早于当前时间"
                            :disabled-date="disabledDate"

                    />
                </a-form-item>
                <a-form-item has-feedback
                             :rules="[{ required: true, message: '请选择日期' }]"
                             v-model:value="formState.activity.end_time" :name="['activity', 'end_time']" label="结束时间">
                    <a-date-picker
                            v-model:value="formState.activity.end_time"
                            show-time
                            format="YYYY-MM-DD HH:mm:ss"
                            value-format="YYYY-MM-DD HH:mm:ss"
                            placeholder="不得早于当前时间"
                            :disabled-date="disabledDate"

                    />
                </a-form-item>
            </a-form>
            <template #footer>
                <a-button type="primary" @click="handleCancel">关闭</a-button>
                <a-button type="primary" @click="changeActivityInfo" html-type="submit" danger>变更</a-button>
            </template>
        </a-modal>
        <a-modal v-model:visible="visiblePeople" title="活动人员">
            <template #footer>
                <a-button type="primary" @click="handleCancel">关闭</a-button>
            </template>
            <a-card>
                <div>
                    <a-button type="primary" style="padding-top: 5px; box-sizing: border-box;" v-if="true"
                              @click="showAddUsers(1)" >新增人员
                    </a-button>
                    <a-button type="primary" style="padding-top: 5px; box-sizing: border-box; margin-left: 4px;"
                              v-if="true" danger>关闭报名
                    </a-button>
                </div>
            </a-card>
            <a-descriptions v-for="item in data" title="学籍号 系部 姓名"
                            layout="vertical" style="margin-top: 4px;">

                <a-descriptions-item label="报名（指派）时间">2023-06-03 21:09</a-descriptions-item>
                <a-descriptions-item label="操作" style="display:flex; gap: 4px;">
                    <a-button type="primary" style="padding-top: 5px; box-sizing: border-box;" danger
                              @click="showConfirm('deleteUser')">移除并通知
                    </a-button>
                </a-descriptions-item>
            </a-descriptions>
        </a-modal>
        <a-modal v-model:visible="visiblePhotos">
            <a-image-preview-group>
                <a-image :width="200" src="https://aliyuncdn.antdv.com/vue.png"/>
                <a-image :width="200" src="https://aliyuncdn.antdv.com/logo.png"/>
            </a-image-preview-group>
            <template #footer>
                <a-button type="primary" @click="hidePhotos">关闭</a-button>
            </template>
        </a-modal>
        <a-modal v-model:visible="visibleAddUsers" title="指派人员">
            <a-select
                    v-model:value="state.value"
                    mode="multiple"
                    label-in-value
                    placeholder="Select users"
                    style="width: 100%"
                    :filter-option="false"
                    :not-found-content="state.fetching ? undefined : null"
                    :options="state.data"
                    @search="fetchUser"
            >
                <template v-if="state.fetching" #notFoundContent>
                    <a-spin size="small"/>
                </template>
            </a-select>
        </a-modal>
    </a-layout-content>

</template>

<style scoped>
.editable-row-operations a {
    margin-right: 8px;
}
</style>