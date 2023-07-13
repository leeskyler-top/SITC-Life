<template>
    <a-layout-content
            :style="{margin: '16px'}"
    >
        <h2>用户管理</h2>
        <div style="padding: 8px; background-color: #FFFFFF" v-if="isShow">
            <a-spin :spinning="spinning" tip="Loading...">
                <a-row justify="end">
                    <router-link to="/user/add">
                        <a-button type="primary" style="margin: 8px; " ghost>添加用户</a-button>
                    </router-link>
                </a-row>

                <a-table :columns="columns" :data-source="dataSource" bordered>
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
                          <a @click="showModal(record.id)">编辑</a>
                      </span>
                                <span>
                          <a @click="showConfirm(record.id)">重置密码</a>
                      </span>
                                <span>
                        <a-popconfirm title="确定删除此用户？" @confirm="deleteUser(record.id)"><a
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
        <a-modal v-model:visible="visible" title="修改用户信息">
            <a-form
                    :model="formState"
                    name="validate_other"
                    v-bind="formItemLayout"
            >
                <a-form-item name="uid" label="学籍号" :rules="[{ required: true }]">
                    <a-input v-model:value="formState.uid"/>
                </a-form-item>
                <a-form-item name="name" label="姓名" :rules="[{ required: true }]">
                    <a-input v-model:value="formState.name"/>
                </a-form-item>
                <a-form-item name="department" label="系部" :rules="[{ required: true }]">
                    <a-input v-model:value="formState.department"/>
                </a-form-item>
                <a-form-item name="classname" label="班级" :rules="[{ required: true }]">
                    <a-input v-model:value="formState.classname"/>
                </a-form-item>
                <a-form-item
                        name="is_admin"
                        label="角色"
                        has-feedback
                        :rules="[{ required: true, message: '请选择角色' }]"
                        style="padding-top: 8px;"
                >
                    <a-select v-model:value="formState.is_admin" placeholder="选择角色">
                        <a-select-option value="0">普通用户</a-select-option>
                        <a-select-option value="1">管理员</a-select-option>
                    </a-select>
                </a-form-item>
                <a-form-item name="note" label="备注">
                    <a-textarea v-model:value="formState.note"/>
                </a-form-item>
            </a-form>
            <template #footer>
                <a-button type="primary" @click="handleCancel">关闭</a-button>
                <a-button type="primary" danger @click="changeUser">变更</a-button>
            </template>
        </a-modal>
        <a-modal v-model:visible="visiblePassword" title="重置密码">
            <a-card>
                <p>用户id：<span>{{ current_user.id }}</span></p>
                <p>学籍号：<span>{{ current_user.uid }}</span></p>
                <p>姓名：<span>{{ current_user.name }}</span></p>
                <p>班级：<span>{{ current_user.classname }}</span></p>
                <p>系部：<span>{{ current_user.department }}</span></p>
            </a-card>
            <a-card>
                <p>密码已重置，密码为: {{ new_password }}</p>
            </a-card>
            <template #footer>
                <a-button type="primary" @click="handleCancel">关闭</a-button>
            </template>
        </a-modal>
    </a-layout-content>

</template>
<script setup>
import {reactive, ref, onMounted, createVNode} from 'vue';
import {ExclamationCircleOutlined, SearchOutlined} from '@ant-design/icons-vue';
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
    listUsers();
});

window.addEventListener('resize', handleResize);


const myData = ref([]);
const spinning = ref(false);

const listUsers = () => {
    spinning.value = true;
    api.get("/user").then((res) => {
        spinning.value = false;
        let {data} = res.data;
        data = data.map(item => {
            if (item.is_admin === '1') {
                item.is_admin = '管理员';
            } else {
                item.is_admin = '用户';
            }
            return item;
        })
        myData.value = data;
    }).catch((err) => {
        let {msg} = err.response.data;
        message.error(msg);
    });
}

const changeUser = () => {
    api.patch("/user/" + current_id.value, formState).then((res) => {
        let {msg} = res.data;
        let current_user = myData.value.find(item => item.id === current_id.value)
        Object.assign(current_user, formState);
        visible.value = false;
        message.success(msg);
    }).catch((err) => {
        let {msg} = err.response.data;
        message.error(msg);
    });
}


const dataSource = ref(myData);
const state = reactive({
    searchText: '',
    searchedColumn: '',
});

const searchInput = ref();

const columns = [
    {
        title: '学籍号',
        dataIndex: 'uid',
        width: '20%',
        customFilterDropdown: true,
        onFilter: (value, record) =>
            record.uid.toString().toLowerCase().includes(value.toLowerCase()),
    },
    {
        title: '姓名',
        dataIndex: 'name',
        width: '20%',
        customFilterDropdown: true,
        onFilter: (value, record) =>
            record.name.toString().toLowerCase().includes(value.toLowerCase()),
    },
    {
        title: '班级',
        dataIndex: 'classname',
        width: '6%',
        customFilterDropdown: true,
        onFilter: (value, record) =>
            record.classname.toString().toLowerCase().includes(value.toLowerCase())
    },
    {
        title: '系部',
        dataIndex: 'department',
        width: '10%',
        customFilterDropdown: true,
        onFilter: (value, record) =>
            record.department.toString().toLowerCase().includes(value.toLowerCase())
    },
    {
        title: '角色',
        dataIndex: 'is_admin',
        width: '7%',
        customFilterDropdown: true,
        onFilter: (value, record) =>
            record.is_admin.toString().toLowerCase().includes(value.toLowerCase())
    },
    {
        title: '创建时间',
        dataIndex: 'created_at',
        width: '20%',
        customFilterDropdown: true,
        onFilter: (value, record) =>
            record.created_at.toString().toLowerCase().includes(value.toLowerCase())
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
const deleteUser = id => {
    api.delete("/user/" + id).then((res) => {
        let {msg} = res.data;
        message.success(msg);
        myData.value = myData.value.filter(user => user.id !== id);
    }).catch((err) => {
        let {msg} = err.response.data;
        message.error(msg);
    });
};

const visible = ref(false);
const visiblePassword = ref(false);

const current_id = ref();

const showModal = id => {
    let user = myData.value.find(i => i.id === id);
    current_id.value = id;
    if (user) {
        if (user.is_admin === "管理员") {
            formState.is_admin = '1';
        } else {
            formState.is_admin = '0';
        }
        formState.uid = user.uid;
        formState.name = user.name;
        formState.department = user.department;
        formState.classname = user.classname;
        formState.note = user.note;
    }
    visible.value = true;
}

const new_password = ref();
const resetPwd = id => {
    api.get("/user/pwd/reset/" + id).then((res) => {
        let {msg, data} = res.data;
        new_password.value = data.password;
        showPassword(id);
    }).catch((err) => {
        let {msg} = err.response.data;
        message.error(msg);
    });
}
const current_user = ref();
const showPassword = id => {
    let user = myData.value.find(i => i.id === id);
    current_user.value = user;
    visiblePassword.value = true;
}

const showConfirm = (id) => {
    Modal.confirm({
        title: '确认操作',
        icon: createVNode(ExclamationCircleOutlined),
        content: '确定重置密码？',
        okText: '确认',
        cancelText: '取消',
        onOk() {
            resetPwd(id)
        }
    });
}
const formItemLayout = {
    labelCol: {
        span: 6,
    },
    wrapperCol: {
        span: 14,
    },
};
const formState = reactive({
    uid: "",
    name: "",
    classname: "",
    department: "",
    note: "",
    is_admin: "0"
});

const handleCancel = () => {
    visible.value = false;
    visiblePassword.value = false;
};

</script>
<style scoped>
.editable-row-operations a {
    margin-right: 8px;
}
</style>