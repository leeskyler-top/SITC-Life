<script setup>
import {reactive, ref, unref, onMounted, createVNode, computed} from 'vue';
import {cloneDeep} from 'lodash-es';
import {
    CheckOutlined,
    EditOutlined,
    ExclamationCircleOutlined,
    PlusOutlined,
    SearchOutlined
} from '@ant-design/icons-vue';
import {message, Modal, Table} from "ant-design-vue";
import api from "@/api";
import my_config from "@/my_config";

const image_base_url = my_config.images_admin_base_url;
const token = ref(localStorage.token);

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
    listActivities();
});

window.addEventListener('resize', handleResize);

const jsonToCsv = (jsonData, name) => {
    let csvRows = [];
    let headers = Object.keys(jsonData[0]);
    csvRows.push(headers.join(','));

    for (let row of jsonData) {
        let values = headers.map(header => {
            let escapeQuotes = ('' + row[header]).replace(/"/g, '\\"');
            return `"${escapeQuotes}"`;
        });
        csvRows.push(values.join(','));
    }

    let csvContent = csvRows.join('\n'); // Join rows with newline character

    let urlObject = window.URL || window.webkitURL || window;
    let export_blob = new Blob([csvContent], { type: 'text/csv' }); // Specify content type
    let save_link = document.createElementNS("http://www.w3.org/1999/xhtml", "a");
    save_link.href = urlObject.createObjectURL(export_blob);
    save_link.download = name;
    save_link.click();

    return csvRows;
};

const getCurrentCheckInInfo = () => {
    let date = new Date();
    jsonToCsv(info.value.sort(v1 => v1.status === 'unsigned'), date.toString() + '签到情况.csv')
}

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

const handleCloseUser = (op) => {
    visibleUsers.value = false;
    if (op === 'F') {
        formState.checkIn.user_id = [];
    }
}

const data_checkins = ref([]);

const spinning = ref(false);
const loading = ref(false);

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

const info = ref([]);
const visibleInfo = ref(false);

const currentCheckInInfoId = ref();
const showInfo = id => {
    visibleInfo.value = true;
    currentCheckInInfoId.value = id;
    info.value = data_checkins.value.find(item => item.id === id).checkInUsers;
    info.value.sort(v1 => v1.status === 'unsigned');
}

const currentInfoPage = ref(1);

const currentInfoPageData = computed(() => {
    const startIdx = (currentInfoPage.value - 1) * 5;
    const endIdx = startIdx + 5;
    return info.value.slice(startIdx, endIdx);
});

const visibleEdit = ref(false);
const edit = id => {
    let currentCheckIn = data_checkins.value.find(item => item.id === id);
    formState.checkIn.activity_id = currentCheckIn.activity_id;
    formState.checkIn.title = currentCheckIn.title;
    formState.checkIn.start_time = currentCheckIn.start_time;
    formState.checkIn.end_time = currentCheckIn.end_time;
    visibleEdit.value = true;
    currentCheckInId.value = id;
}

const visiblePhotos = ref(false);

const images = ref([]);
const showPhotos = id => {
    visiblePhotos.value = true;
    images.value = JSON.parse(data_checkins.value.find(item => item.id === currentCheckInInfoId.value).checkInUsers.find(item => item.id === id).image_url);
}

const visibleAdd = ref(false);

const showAdd = () => {
    visibleAdd.value = true;
}

const visibleUsers = ref(false);

const showUsers = () => {
    visibleUsers.value = true;
    usersData.value = activitiesData.value.find(item => item.id === formState.checkIn.activity_id).users;
}

const formState = reactive({
    checkIn: {
        activity_id: null,
        title: null,
        start_time: null,
        end_time: null,
        user_id: []
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
    visibleEdit.value = false;
    visibleAdd.value = false;
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
            revokeCheckIn(id)
        }
    });
}

const columns_2 = [
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

const listActivities = () => {
    spinning.value = true;
    api.get("/activity")
        .then((res) => {
            let {data} = res.data;
            spinning.value = false;
            data = data.map(item => {
                // ... (your type transformation)
                item.users = item.users.map(user => {
                    user.key = user.id; // Adding 'key' field for each user
                    return user;
                });
                return item;
            });
            activitiesData.value = data;
        })
        .catch((err) => {
            let {msg} = err.response.data;
            spinning.value = false;
            message.error(msg);
        });
};
const activitiesData = ref([]);
const usersData = ref([]);

const onSelectChange = changableRowKeys => {
    formState.checkIn.user_id = changableRowKeys;
};
const rowSelection = computed(() => {
    return {
        selectedRowKeys: formState.checkIn.user_id,
        onChange: onSelectChange,
        hideDefaultSelections: true,
        selections: [Table.SELECTION_ALL, Table.SELECTION_INVERT, Table.SELECTION_NONE],
    };
});

let config = {
    headers: {
        'Content-Type': 'multipart/form-data',
    },
};
const addCheckIn = () => {
    loading.value = true;
    api.post("/checkin", formState.checkIn, config).then(res => {
        let {msg} = res.data;
        message.success(msg);
        loading.value = false;
        data_checkins.value.push(formState.checkIn);
        formState.checkIn.activity_id = null;
        formState.checkIn.title = null;
        formState.checkIn.start_time = null;
        formState.checkIn.end_time = null;
        formState.checkIn.user_id = null;
    }).catch(err => {
        let {msg} = err.response.data;
        loading.value = false;
        message.error(msg);
    })
}

const currentCheckInId = ref();
const changeCheckIn = () => {
    loading.value = true;
    api.patch("/checkin/" + currentCheckInId.value, formState.checkIn).then(res => {
        let {msg} = res.data;
        let current_checkins = data_checkins.value.find(item => item.id === currentCheckInId.value)
        loading.value = false;
        visibleEdit.value = false;
        Object.assign(current_checkins, formState.checkIn);
        formState.checkIn.activity_id = null;
        formState.checkIn.title = null;
        formState.checkIn.start_time = null;
        formState.checkIn.end_time = null;
        formState.checkIn.user_id = null;
        message.success(msg)
    }).catch(err => {
        let {msg} = err.response.data;
        loading.value = false;
        message.error(msg)
    })
}

const revokeCheckIn = (id) => {
    loading.value = true;
    api.get("/checkin/revoke/" + id).then(res => {
        let {msg} = res.data;
        loading.value = false;
        let checkInToUpdate = data_checkins.value
            .find(item => item.id === currentCheckInInfoId.value)
            .checkInUsers.find(item => item.id === id);

        if (checkInToUpdate) {
            checkInToUpdate.status = 'unsigned';
        }
        data_checkins.value = data_checkins.value.sort(v1 => v1.status === 'unsigned');
        message.success(msg);
    })
}

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
            <a-card v-for="item in currentInfoPageData">
                <a-descriptions :title="item.uid + '-' + item.department + '-' + item.name"
                                layout="vertical">

                    <a-descriptions-item label="签到时间" v-if="item.status === 'signed'">{{
                        item.updated_at
                        }}
                    </a-descriptions-item>
                    <a-descriptions-item label="签到状态">{{ item.status }}</a-descriptions-item>
                    <a-descriptions-item label="操作" style="display:flex; gap: 4px;" v-if="item.status === 'signed'">
                        <a-button type="primary" style="padding-top: 5px; box-sizing: border-box;" danger
                                  :loading="loading" @click="showConfirm(item.id)">驳回
                        </a-button>
                        <a-button type="primary" style="padding-top: 5px; box-sizing: border-box; margin-left: 5px;"
                                  @click="showPhotos(item.id)">查看照片
                        </a-button>
                    </a-descriptions-item>
                </a-descriptions>
            </a-card>
            <a-pagination align="center" style="margin-top: 8px;"
                          v-model:current="currentInfoPage" simple pageSize="5"
                          :total="info.length" v-if="info.length !== 0"/>
            <template #footer>
                <a-button type="primary" @click="getCurrentCheckInInfo">导出文件</a-button>
                <a-button type="primary" @click="handleCancel">关闭</a-button>
            </template>
        </a-modal>
        <a-modal v-model:visible="visibleAdd" title="新建签到" width="85%">
            <a-spin :spinning="spinning" tip="Loading...">
                <a-form
                        :model="formState"
                        name="validate_other"
                        :validate-messages="validateMessages"
                        style="max-width: 100%;"

                >
                    <a-form-item
                            :name="['checkIn','activity_id']"
                            label="选择活动"
                            has-feedback
                            :rules="[{ required: true, message: '请选择一个有效活动' }]"
                    >
                        <a-select v-model:value="formState.checkIn.activity_id" v-for="item in activitiesData"
                                  placeholder="绑定活动">
                            <a-select-option :value="item.id">{{ item.place }} - {{ item.title }} - {{
                                item.admin_name
                                }}
                            </a-select-option>
                        </a-select>
                    </a-form-item>
                    <a-form-item name="title" label="签到名称" :rules="[{ required: true }]">
                        <a-input v-model:value="formState.checkIn.title"/>
                    </a-form-item>
                    <a-form-item has-feedback
                                 :rules="[{ required: true, message: '请选择日期' }]" :name="['checkIn','start_time']"
                                 label="开始时间">
                        <a-date-picker
                                v-model:value="formState.checkIn.start_time"
                                show-time
                                format="YYYY-MM-DD HH:mm:ss"
                                value-format="YYYY-MM-DD HH:mm:ss"
                                placeholder="不得早于当前时间"
                        />
                    </a-form-item>
                    <a-form-item has-feedback
                                 :rules="[{ required: true, message: '请选择日期' }]" :name="['checkIn','end_time']"
                                 label="结束时间">
                        <a-date-picker
                                v-model:value="formState.checkIn.end_time"
                                show-time
                                format="YYYY-MM-DD HH:mm:ss"
                                value-format="YYYY-MM-DD HH:mm:ss"
                                placeholder="不得早于当前时间"
                        />
                    </a-form-item>
                    <a-form-item label="签到用户">
                        <a-button @click="showUsers" :disabled="!formState.checkIn.activity_id">
                            添加活动内的用户
                        </a-button>
                    </a-form-item>
                </a-form>
            </a-spin>
            <template #footer>
                <a-button type="primary" danger @click="handleCancel">关闭</a-button>
                <a-button type="primary" @click="addCheckIn" :loading="loading">新增签到</a-button>
            </template>
        </a-modal>
        <a-modal v-model:visible="visibleEdit" title="编辑" width="85%">

            <a-form
                    :model="formState"
                    name="validate_other"
                    :validate-messages="validateMessages"
                    style="max-width: 100%;"

            >
                <a-form-item
                        :name="['checkIn', 'activity_id']"
                        label="已绑定的活动"
                        has-feedback
                >
                    <a-select v-model:value="formState.checkIn.activity_id" placeholder="绑定的活动"
                              v-for="item in activitiesData" disabled>
                        <a-select-option :value="item.id">{{ item.place }} - {{ item.title }} - {{
                            item.admin_name
                            }}
                        </a-select-option>
                    </a-select>
                </a-form-item>
                <a-form-item :name="['checkIn', 'title']" label="签到名称" :rules="[{ required: true }]">
                    <a-input v-model:value="formState.checkIn.title"/>
                </a-form-item>
                <a-form-item has-feedback
                             :rules="[{ required: true, message: '请选择日期' }]" :name="['checkIn','start_time']"
                             label="开始时间">
                    <a-date-picker
                            v-model:value="formState.checkIn.start_time"
                            show-time
                            format="YYYY-MM-DD HH:mm:ss"
                            value-format="YYYY-MM-DD HH:mm:ss"
                            placeholder="不得早于当前时间"
                    />
                </a-form-item>
                <a-form-item has-feedback
                             :rules="[{ required: true, message: '请选择日期' }]" :name="['checkIn','end_time']"
                             label="结束时间">
                    <a-date-picker
                            v-model:value="formState.checkIn.end_time"
                            show-time
                            format="YYYY-MM-DD HH:mm:ss"
                            value-format="YYYY-MM-DD HH:mm:ss"
                            placeholder="不得早于当前时间"
                    />
                </a-form-item>
            </a-form>
            <template #footer>
                <a-button type="primary" @click="handleCancel">关闭</a-button>
                <a-button type="primary" danger :loading="loading" @click="changeCheckIn">变更</a-button>
            </template>
        </a-modal>
        <a-modal v-model:visible="visiblePhotos" title="查看打卡图片">
            <a-image-preview-group>
                <a-image v-for="item in images" :width="200"
                         fallback="data:image/png;base64,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"
                         :src="my_config.images_admin_base_url + item + '?token=' + token"/>
            </a-image-preview-group>
            <template #footer>
                <a-button type="primary" @click="handlePhotosCancel">OK</a-button>
            </template>
        </a-modal>
        <a-modal title="活动用户列表" v-model:visible="visibleUsers">
            <a-card>
                <p style="font-size: 18px;">⚠ 警告：全选按钮只会选择当前页的内容！</p>
                <p style="font-size: 18px;">如需全选请使用下拉框内的“Select all data”功能。</p>
            </a-card>
            <a-table :row-selection="rowSelection" :columns="columns_2" :data-source="usersData">
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