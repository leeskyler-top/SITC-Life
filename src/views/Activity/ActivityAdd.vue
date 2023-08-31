<script setup>
import {reactive, ref, computed, onMounted} from "vue";
import {MinusCircleOutlined, PlusOutlined, SearchOutlined, HomeOutlined} from "@ant-design/icons-vue";
import {debounce} from 'lodash-es';
import api from "@/api";
import {message, Table} from "ant-design-vue";


const formItemLayout = {
    labelCol: {
        span: 6,
    },
    wrapperCol: {
        span: 14,
    },
};

const formState = reactive({
    activity: {
        title: null,
        note: null,
        type: 'ase',
        place: null,
        start_time: null,
        end_time: null,
        user_id: [],
    },
    checkIn: {
        activity_id: null,
        title: null,
        start_time: null,
        end_time: null,
    }
});

const validateMessages = {
    required: '${label} 必填!',
    types: {
        email: '${label} 非法邮箱格式',
    },
};

const state = reactive({
    data: [],
});

const checkInSwitcher = ref(false);

const spinning = ref(false);

const users = ref([]);
const listUsers = () => {
    spinning.value = true;
    api.get("/user").then((res) => {
        spinning.value = false;
        let {data} = res.data;
        users.value = data.map(user => {
            user.key = user.id; // Adding 'key' field for each user
            return user;
        });
    }).catch((err) => {
        let {msg} = err.response.data;
        message.error(msg);
    });
}

onMounted(() => {
    listUsers()
});

const loading = ref(false);
const addActivity = () => {
    loading.value = true;
    api.post("/activity", formState.activity).then((res) => {
        let {msg, data} = res.data;
        message.success(msg);
        if (checkInSwitcher.value) {
            let currentUsers = formState.activity.user_id;
            let activity_id = data.id;
            addCheckIn(currentUsers, activity_id);
        }
        loading.value = false;
        formState.activity.title = null;
        formState.activity.note = null;
        formState.activity.place = null;
        formState.activity.start_time = null;
        formState.activity.end_time = null;
        formState.activity.user_id = [];
        // state.value = [];
    }).catch((err) => {
        let {msg} = err.response.data;
        loading.value = false;
        message.error(msg);
    });
}

const addCheckIn = (currentUsers, activity_id) => {
    message.info("正在尝试生成签到")
    formState.checkIn.user_id = currentUsers;
    formState.checkIn.activity_id = activity_id;
    api.post("/checkin", formState.checkIn).then(res => {
        let {msg} = res.data;
        formState.checkIn.user_id = [];
        formState.checkIn.activity_id = null;
        formState.checkIn.title = null;
        formState.checkIn.start_time = null;
        formState.checkIn.end_time = null;
        checkInSwitcher.value = false;
        message.success(msg);
    }).catch(err => {
        let {msg} = err.response.data;
        checkInSwitcher.value = false;
        message.error(msg);
    })
}

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

const visibleUsers = ref(false);

const showUsers = () => {
    visibleUsers.value = true;
}

const columns = [
    {
        title: '学籍号',
        dataIndex: 'uid',
        width: '25%',
        customFilterDropdown: true,
        onFilter: (value, record) =>
            record.uid.toString().toLowerCase().includes(value.toLowerCase()),
    },
    {
        title: '系部',
        dataIndex: 'department',
        width: '25%',
        customFilterDropdown: true,
        onFilter: (value, record) =>
            record.department.toString().toLowerCase().includes(value.toLowerCase()),
    },
    {
        title: '班级',
        dataIndex: 'classname',
        width: '25%',
        customFilterDropdown: true,
        onFilter: (value, record) =>
            record.classname.toString().toLowerCase().includes(value.toLowerCase()),
    },
    {
        title: '姓名',
        dataIndex: 'name',
        width: '25%',
        customFilterDropdown: true,
        onFilter: (value, record) =>
            record.name.toString().toLowerCase().includes(value.toLowerCase()),
    },
];

const handleCloseUser = (op) => {
    visibleUsers.value = false;
    if (op === 'F') {
        formState.activity.user_id = [];
    }
}

const onSelectChange = changableRowKeys => {
    formState.activity.user_id = changableRowKeys;
};

const rowSelection = computed(() => {
    return {
        selectedRowKeys: formState.activity.user_id,
        onChange: onSelectChange,
        hideDefaultSelections: true,
        selections: [Table.SELECTION_ALL, Table.SELECTION_INVERT, Table.SELECTION_NONE],
    };
});

</script>

<template>
    <a-layout-content
            :style="{margin: '16px'}"
    >

        <h2 style="display: flex; justify-content: space-between;">
            <span>活动添加</span><span style=" margin-bottom: 4px;"><router-link to="/"><HomeOutlined /> 首页</router-link></span>
        </h2>
        <a-row>
            <a-col :span="24" style="padding: 24px; background-color: #FFFFFF">
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
                        <a-select v-model:value="formState.activity.type" placeholder="选择一个发布类型">
                            <a-select-option value="assignment">指派</a-select-option>
                            <a-select-option value="self-enrollment">自主报名</a-select-option>
                            <a-select-option value="ase">自主报名与指派</a-select-option>
                        </a-select>
                    </a-form-item>
                    <a-form-item v-if="formState.activity.type === 'assignment' || formState.activity.type === 'ase'" label="指派用户" >
                        <a-button @click="showUsers">选择用户</a-button>
                    </a-form-item>
                    <a-form-item has-feedback
                                 :rules="[{ required: true, message: '请选择日期' }]"
                                 :name="['activity','start_time']"
                                 label="开始时间">
                        <a-date-picker
                                v-model:value="formState.activity.start_time"
                                show-time
                                format="YYYY-MM-DD HH:mm:ss"
                                :disabled-date="disabledDate"
                                value-format="YYYY-MM-DD HH:mm:ss"
                                placeholder="不得早于当前时间"
                        />
                    </a-form-item>
                    <a-form-item has-feedback
                                 :rules="[{ required: true, message: '请选择日期' }]"
                                 :name="['activity','end_time']"
                                 label="结束时间">
                        <a-date-picker
                                v-model:value="formState.activity.end_time"
                                show-time
                                format="YYYY-MM-DD HH:mm:ss"
                                :disabled-date="disabledDate"
                                value-format="YYYY-MM-DD HH:mm:ss"
                                placeholder="不得早于当前时间"
                        />
                    </a-form-item>
                    <a-form-item name="switch" label="尝试生成签到">
                        <a-switch :disabled="formState.activity.type === 'self-enrollment' || formState.activity.user_id.length === 0" v-model:checked="checkInSwitcher"/>
                    </a-form-item>


                </a-form>
                <div v-if="checkInSwitcher">
                    <a-form
                            :model="formState"
                            name="validate_other"
                            v-bind="formItemLayout"
                            :validate-messages="validateMessages"
                            style="max-width: 500px;"

                    >
                        <a-form-item :name="['checkIn','title']" label="签到名称" :rules="[{ required: true }]">
                            <a-input v-model:value="formState.checkIn.title"/>
                        </a-form-item>
                        <a-form-item has-feedback
                                     :rules="[{ required: true, message: '请选择日期' }]"
                                     label="签到开始时间"
                                     :name="['checkIn','start_time']"
                                     :disabled="checkInSwitcher === false || formState.activity.type === 'self-enrollment'"
                        >

                            <a-date-picker
                                    v-model:value="formState.checkIn.start_time"
                                    show-time
                                    format="YYYY-MM-DD HH:mm:ss"
                                    value-format="YYYY-MM-DD HH:mm:ss"
                                    placeholder="不得早于当前时间"
                                    :disabled="checkInSwitcher === false || formState.activity.type === 'self-enrollment'"
                            />
                        </a-form-item>
                        <a-form-item has-feedback
                                     :rules="[{ required: true, message: '请选择日期' }]"
                                     label="签到结束时间"
                                     :name="['checkIn','end_time']"
                        >
                            <a-date-picker
                                    v-model:value="formState.checkIn.end_time"
                                    show-time
                                    format="YYYY-MM-DD HH:mm:ss"
                                    value-format="YYYY-MM-DD HH:mm:ss"
                                    placeholder="不得早于当前时间"
                                    :disabled="checkInSwitcher === false || formState.activity.type === 'self-enrollment'"
                            />
                        </a-form-item>

                    </a-form>
                </div>
                <a-form-item :wrapper-col="{ span: 12, offset: 2 }">
                    <a-button type="primary" :loading="loading" @click="addActivity" :disabled="!formState.activity.title || !formState.activity.start_time ||  !formState.activity.end_time || !formState.activity.place || (checkInSwitcher && !formState.checkIn.title) || (checkInSwitcher && !formState.checkIn.start_time) || (checkInSwitcher && !formState.checkIn.end_time)">提交</a-button>
                </a-form-item>
            </a-col>
        </a-row>
    </a-layout-content>
    <a-modal title="活动用户列表" v-model:visible="visibleUsers">
        <a-card>
            <p style="font-size: 18px;">⚠ 警告：全选按钮只会选择当前页的内容！</p>
            <p style="font-size: 18px;">如需全选请使用下拉框内的“Select all data”功能。</p>
        </a-card>
        <a-table :row-selection="rowSelection" :columns="columns" :data-source="users">
            <template #customFilterDropdown="{ setSelectedKeys, selectedKeys, confirm, clearFilters, column }">
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
            </template>
        </a-table>
        <template #footer>
            <a-button type="primary" danger @click="handleCloseUser('F')">放弃选择</a-button>
            <a-button type="primary" @click="handleCloseUser('T')">保存</a-button>
        </template>
    </a-modal>
</template>

<style scoped>

</style>