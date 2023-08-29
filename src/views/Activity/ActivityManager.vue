<script setup>
import {reactive, ref, onMounted, watch, computed, createVNode} from 'vue';
import {cloneDeep, debounce} from 'lodash-es';
import {ExclamationCircleOutlined, PlusOutlined, SearchOutlined} from '@ant-design/icons-vue';
import {Empty, message, Modal} from "ant-design-vue";
import api from "@/api";
import my_config from "@/my_config";

const isShow = ref(true);
const token = ref(localStorage.token);

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
    fetching: false
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
    currentActivityId.value = id;
    let currentActivity = myData.value.find(item => item.id === currentActivityId.value)
    formState.activity.title = currentActivity.title;
    formState.activity.type = currentActivity.type;
    formState.activity.place = currentActivity.place;
    formState.activity.note = currentActivity.note;
    formState.activity.start_time = currentActivity.start_time;
    formState.activity.end_time = currentActivity.end_time;
    formState.activity.type = currentActivity.type;
    formState.activity.is_enrolling = currentActivity.is_enrolling;
};

const loading = ref(false);
const visibleCheckIn = ref(false);
const showCheckIn = id => {
    visibleCheckIn.value = true;
    listCheckIns(id);
};
const handleCancel = () => {
    visibleCheckIn.value = false;
    visibleInfo.value = false;
    visiblePhotos.value = false;
};

const handleCancelAddUser = () => {
    visibleAddUsers.value = false;
};

const handleCancelUsers = () => {
    visiblePeople.value = false;
}
const visiblePhotos = ref(false)
const showPhotos = id => {
    visiblePhotos.value = true;
    images.value = JSON.parse(dataCheckIns.value.find(item => item.id === activeKey.value * 1).checkInUsers.find(item => item.id === id).image_url);
};

const handleCancelPhotos = () => {
    visiblePhotos.value = false;
    images.value = [];
};

const visiblePeople = ref(false);

const activityUsers = ref([]);
const showPeople = () => {
    activityUsers.value = [];
    visiblePeople.value = true;
    usersSpinning.value = true;
    api.get("/activity/" + currentActivityId.value).then(res => {
        usersSpinning.value = false;
        let {msg, data} = res.data;
        activityUsers.value = data.users;
        message.success(msg);
    }).catch((err) => {
        let {msg} = err.response.data;
        usersSpinning.value = false;
        message.error(msg);
    });
}

const currentActivityUserPage = ref(1);
const currentActivityUserPageData = computed(() => {
    const startIdx = (currentActivityUserPage.value - 1) * 5;
    const endIdx = startIdx + 5;
    return activityUsers.value.slice(startIdx, endIdx);
});

const visibleAddUsers = ref(false);
const showAddUsers = id => {
    visibleAddUsers.value = true;
};

const visibleEdit = ref(false);
const currentCheckInId = ref();
const showEdit = (id) => {
    visibleEdit.value = true;
    currentCheckInId.value = id;
    formState.checkIn.start_time = dataCheckIns.value.find(item => item.id === activeKey.value * 1).start_time;
    formState.checkIn.end_time = dataCheckIns.value.find(item => item.id === activeKey.value * 1).end_time;
};

const handleCancelEdit = () => {
    visibleEdit.value = false;
    currentCheckInId.value = null;
    formState.checkIn.start_time = null;
    formState.checkIn.end_time = null;
};

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
        place: null,
        type: null,
        start_time: null,
        end_time: null,
        is_enrolling: '1',
        add_to_checkin: null
    },
    checkIn: {
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
let lastFetchId = 0;

const spinning = ref(false)
const usersSpinning = ref(false)
const checkInsSpinning = ref(false)

const users = ref([]);
const images = ref([]);
const fetchUser = value => {
    api.post("/activity/search/users/" + currentActivityId.value, {
        info: value
    }).then(res => {
        let {data} = res.data;
        users.value = data.map(i => ({
            label: `${i.uid} - ${i.name}`,
            value: `${i.id}`,
        }));
    }).catch(err => {
        let {msg} = err.response.data;
        message.error(msg);
    });
}

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
    spinning.value = true;
    api.delete("/activity/" + id).then((res) => {
        let {msg} = res.data;
        message.success(msg);
        spinning.value = false;
        myData.value = myData.value.filter(activity => activity.id !== id);
    }).catch((err) => {
        let {msg} = err.response.data;
        message.error(msg);
    });
}

const currentActivityId = ref();
const changeActivityInfo = () => {
    loading.value = true;
    api.patch("/activity/" + currentActivityId.value, formState.activity).then((res) => {
        let {msg} = res.data;
        let currentActivity = myData.value.find(item => item.id === currentActivityId.value)
        if (formState.activity.type === 'assignment') {
            formState.activity.type = '指派';
        } else if (formState.activity.type === 'self-enrollment') {
            formState.activity.type = '自主报名';
        } else if (formState.activity.type === 'ase') {
            formState.activity.type = '自主报名与指派';
        }
        loading.value = false;
        Object.assign(currentActivity, formState.activity);
        visibleInfo.value = false;
        message.success(msg);
    }).catch((err) => {
        let {msg} = err.response.data;
        loading.value = false;
        message.error(msg);
    });
}
const changeActivityUsers = () => {
    usersSpinning.value = true;
    loading.value = true;
    visibleAddUsers.value = false;
    let formData = {
        user_id: [],
        add_to_checkin: null
    }
    for (let item of state.value) {
        formData.user_id.push(item.value)
    }
    formData.add_to_checkin = formState.activity.add_to_checkin;
    console.log(formData)
    api.patch("/activity/" + currentActivityId.value, formData).then((res) => {
        let {msg, data} = res.data;
        visibleInfo.value = false;
        activityUsers.value = data.users
        usersSpinning.value = false
        loading.value = false;
        formState.activity.add_to_checkin = null;
        message.success(msg);
    }).catch((err) => {
        let {msg} = err.response.data;
        usersSpinning.value = false;
        loading.value = false;
        message.error(msg);
    });
}

const removeUser = (user_id) => {
    usersSpinning.value = true;
    api.delete("/activity/remove/" + currentActivityId.value + '/' + user_id).then((res) => {
        let {msg} = res.data;
        usersSpinning.value = false;
        message.success(msg);
        activityUsers.value = activityUsers.value.filter(user => user.id !== user_id);
    }).catch((err) => {
        let {msg} = err.response.data;
        usersSpinning.value = false;
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

const shouldRenderOpenEnrollButton = computed(() => {
    // 获取当前活动的类型
    const currentActivity = myData.value.find(
        (activity) => activity.id === currentActivityId.value
    );
    return currentActivity.type !== "仅分配" && currentActivity.is_enrolling === '0';
});

const shouldRenderCloseEnrollButton = computed(() => {
    // 获取当前活动的类型
    const currentActivity = myData.value.find(
        (activity) => activity.id === currentActivityId.value
    );
    return currentActivity.type !== "仅分配" && currentActivity.is_enrolling === '1';
});

const shouldDisableEnrollButton = computed(() => {
    // 获取当前活动的类型
    const currentActivity = myData.value.find(
        (activity) => activity.id === currentActivityId.value
    );
    return currentActivity.type === "仅分配" || currentActivity.status !== 'waiting';
});

const shouldRenderAddUserButton = computed(() => {
    // 获取当前活动的类型
    const currentActivity = myData.value.find(
        (activity) => activity.id === currentActivityId.value
    );
    return currentActivity.type !== "仅自主报名";
});

const shouldRenderEnrollSelection = computed(() => {
    // 获取当前活动的类型
    const currentActivity = myData.value.find(
        (activity) => activity.id === currentActivityId.value
    );
    return currentActivity.type === "仅分配" || currentActivity.status !== 'waiting';
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
                revokeCheckIn(id)
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
                deleteCheckIn(id)
            }
        });
    } else if (op === "deleteUser", id) {
        Modal.confirm({
            title: '确认操作',
            icon: createVNode(ExclamationCircleOutlined),
            content: '确认将此人从活动人员中移除？',
            okText: '确认',
            cancelText: '取消',
            onOk() {
                removeUser(id);
            }
        });
    }
}
const openEnroll = () => {
    loading.value = true;
    api.patch("/activity/" + currentActivityId.value, {
        'is_enrolling': '1'
    }).then(res => {
        loading.value = false;
        const currentActivityIndex = myData.value.findIndex(
            (activity) => activity.id === currentActivityId.value
        );
        if (currentActivityIndex !== -1) {
            myData.value[currentActivityIndex].is_enrolling = '1';
        }
        message.success("活动已开始报名")
    }).catch(err => {
        loading.value = false;
        let {msg} = err.response.data;
        message.error(msg);
    })
}

const closeEnroll = () => {
    loading.value = true;
    api.patch("/activity/" + currentActivityId.value, {
        'is_enrolling': '0'
    }).then(res => {
        loading.value = false;
        const currentActivityIndex = myData.value.findIndex(
            (activity) => activity.id === currentActivityId.value
        );
        if (currentActivityIndex !== -1) {
            myData.value[currentActivityIndex].is_enrolling = '0';
        }
        message.success("活动已停止报名")
    }).catch(err => {
        loading.value = false;
        let {msg} = err.response.data;
        message.error(msg);
    })
}

const dataCheckIns = ref([]);

const currentCheckInPage = ref(1);

const currentCheckInPageData = computed(() => {
    const startIdx = (currentCheckInPage.value - 1) * 5;
    const endIdx = startIdx + 5;
    return dataCheckIns.value.slice(startIdx, endIdx);
});
const listCheckIns = (id) => {
    checkInsSpinning.value = true;
    api.get("/checkin/activity/" + id).then(res => {
        checkInsSpinning.value = false;
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
        dataCheckIns.value = data;
    }).catch(err => {
        let {msg} = err.response.data;
        checkInsSpinning.value = false;
        message.error(msg);
    })
}

const deleteCheckIn = id => {
    spinning.value = true;
    api.delete("/checkin/" + id).then(res => {
        dataCheckIns.value = dataCheckIns.value.filter(item => item.id !== id);
        spinning.value = false;
        let {data, msg} = res.data;
        message.success(msg);
    }).catch(err => {
        spinning.value = false;
        let {msg} = err.response.data;
        message.error(msg);
    });
};

const revokeCheckIn = (id) => {
    loading.value = true;
    api.get("/checkin/revoke/" + id).then(res => {
        let {msg} = res.data;
        loading.value = false;
        let checkInToUpdate = dataCheckIns.value
            .find(item => item.id === activeKey.value * 1)
            .checkInUsers.find(item => item.id === id);

        if (checkInToUpdate) {
            checkInToUpdate.status = 'unsigned';
        }
        dataCheckIns.value = dataCheckIns.value.sort((v1, v2) => {
            if (v1.status === 'unsigned' && v2.status !== 'unsigned') {
                return -1;
            }
            if (v1.status !== 'unsigned' && v2.status === 'unsigned') {
                return 1;
            }
            return 0;
        });
        message.success(msg);
    }).catch(err => {
        let {msg} = err.response.data;
        loading.value = false;
        message.error(msg);
    })
}

const changeCheckIn = () => {
    loading.value = true;
    api.patch("/checkin/" + currentCheckInId.value, formState.checkIn).then(res => {
        let {msg} = res.data;
        let current_checkins = dataCheckIns.value.find(item => item.id === currentCheckInId.value)
        loading.value = false;
        visibleEdit.value = false;
        Object.assign(current_checkins, formState.checkIn);
        formState.checkIn.start_time = null;
        formState.checkIn.end_time = null;
        message.success(msg)
    }).catch(err => {
        let {msg} = err.response.data;
        loading.value = false;
        message.error(msg)
    })
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
                                    <a @click="showCheckIn(record.id)">签到管理</a>
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
        <a-modal v-model:visible="visibleCheckIn" title="签到管理">
            <template #footer>
                <a-button type="primary" @click="handleCancel">关闭</a-button>
            </template>
            <a-spin :spinning="checkInsSpinning" tip="Loading...">
                <a-descriptions-item v-if="dataCheckIns.length === 0">
                    <div style="height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center;">
                        <a-empty :image="Empty.PRESENTED_IMAGE_SIMPLE" style="width: 100%;  "/>
                    </div>
                </a-descriptions-item>
                <a-collapse v-model:activeKey="activeKey" accordion>
                    <a-collapse-panel v-for="item in currentCheckInPageData" :key="item.id" :header="item.title">
                        <a-card>
                            <p>签到开始时间: {{ item.start_time }}</p>
                            <p>签到结束时间: {{ item.end_time }}</p>
                            <p>当前状态: {{ item.status }}</p>
                            <div>
                                <a-button type="primary" style="padding-top: 5px; box-sizing: border-box;"
                                          @click="showEdit(item.id)">变更结束时间
                                </a-button>
                                <a-button type="primary"
                                          style="padding-top: 5px; box-sizing: border-box; margin-left: 4px;"
                                          danger @click="showConfirm('deleteCheckIn', item.id)">删除签到
                                </a-button>
                            </div>
                        </a-card>
                        <a-card>
                            <a-descriptions v-for="info in item.checkInUsers"
                                            :title="info.uid + '-' + info.department + '-' + info.name"
                                            layout="vertical">

                                <a-descriptions-item label="签到时间" v-if="info.status === 'signed'">{{
                                    info.updated_at
                                    }}
                                </a-descriptions-item>
                                <a-descriptions-item label="签到状态">{{ info.status }}</a-descriptions-item>
                                <a-descriptions-item label="操作" style="display:flex; gap: 4px;"
                                                     v-if="info.status === 'signed'">
                                    <a-button type="primary" style="padding-top: 5px; box-sizing: border-box;" danger
                                              :loading="loading" @click="showConfirm('refuse',info.id)">驳回
                                    </a-button>
                                    <a-button type="primary"
                                              style="padding-top: 5px; box-sizing: border-box; margin-left: 5px;"
                                              @click="showPhotos(info.id)">查看照片
                                    </a-button>
                                </a-descriptions-item>
                            </a-descriptions>
                        </a-card>
                    </a-collapse-panel>

                </a-collapse>
                <a-pagination align="center" style="margin-top: 8px;" v-model:current="currentCheckInPage" simple
                              pageSize="5"
                              :total="dataCheckIns.length" :disabled="dataCheckIns.length === 0"
                              v-if="dataCheckIns.length !== 0"/>
            </a-spin>
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
                    <a-select v-model:value="formState.activity.type" placeholder="选择一个发布类型"
                              value="self-enrollment" disabled>
                        <a-select-option value="assignment">指派</a-select-option>
                        <a-select-option value="self-enrollment">自主报名</a-select-option>
                        <a-select-option value="ase">自主报名与指派</a-select-option>
                    </a-select>
                </a-form-item>
                <a-form-item has-feedback
                             :rules="[{ required: true, message: '请选择日期' }]"
                             v-model:value="formState.activity.start_time" :name="['activity', 'start_time']"
                             label="开始时间">
                    <a-date-picker
                            v-model:value="formState.activity.start_time"
                            show-time
                            format="YYYY-MM-DD HH:mm:ss"
                            value-format="YYYY-MM-DD HH:mm:ss"
                    />
                </a-form-item>
                <a-form-item has-feedback
                             :rules="[{ required: true, message: '请选择日期' }]"
                             v-model:value="formState.activity.end_time" :name="['activity', 'end_time']"
                             label="结束时间">
                    <a-date-picker
                            v-model:value="formState.activity.end_time"
                            show-time
                            format="YYYY-MM-DD HH:mm:ss"
                            value-format="YYYY-MM-DD HH:mm:ss"
                            placeholder="不得早于当前时间"

                    />
                </a-form-item>
                <a-form-item
                        :name="['activity', 'is_enrolling']"
                        label="是否开启报名"
                        has-feedback
                        :rules="[{ required: true, message: '请选择是否开启报名' }]"
                >
                    <a-select v-model:value="formState.activity.is_enrolling" placeholder="选择一个状态"
                              value="1"
                              :disabled="shouldRenderEnrollSelection"
                    >
                        <a-select-option value="1">开启</a-select-option>
                        <a-select-option value="0">关闭</a-select-option>
                    </a-select>
                </a-form-item>
                <a-form-item label="活动组用户">
                    <a-button @click="showPeople">编辑用户</a-button>
                </a-form-item>
            </a-form>
            <template #footer>
                <a-button type="primary" @click="handleCancel">关闭</a-button>
                <a-button type="primary" @click="changeActivityInfo" :loading="loading" html-type="submit" danger>变更
                </a-button>
            </template>
        </a-modal>
        <a-modal v-model:visible="visiblePeople" title="活动人员">
            <a-spin :spinning="usersSpinning" tip="Loading...">
                <a-card>
                    <div>
                        <a-button type="primary" style="padding-top: 5px; box-sizing: border-box;"
                                  v-if="shouldRenderAddUserButton" @click="showAddUsers(1)">新增人员
                        </a-button>
                        <a-button type="primary" style="padding-top: 5px; box-sizing: border-box; margin-left: 4px;"
                                  @click="closeEnroll" v-if="shouldRenderCloseEnrollButton" :loading="loading"
                                  :disabled="shouldDisableEnrollButton" danger>关闭报名
                        </a-button>
                        <a-button type="primary" style="padding-top: 5px; box-sizing: border-box; margin-left: 4px;"
                                  @click="openEnroll" v-if="shouldRenderOpenEnrollButton" :loading="loading"
                                  :disabled="shouldDisableEnrollButton">打开报名
                        </a-button>
                    </div>
                </a-card>
                <a-descriptions-item v-if="activityUsers.length === 0">
                    <div style="height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center;">
                        <a-empty :image="Empty.PRESENTED_IMAGE_SIMPLE" style="width: 100%;  "/>
                    </div>
                </a-descriptions-item>
                <a-card v-for="item in currentActivityUserPageData">
                    <a-descriptions
                            :title="item.uid + '-' + item.department + '-' + item.name"
                            layout="vertical" style="padding-top: 6px;">

                        <a-descriptions-item label="" style="display:flex; gap: 4px;">
                            <a-button type="primary" style="padding-top: 5px; box-sizing: border-box;" danger
                                      :loading="loading" @click="showConfirm('deleteUser', item.id)">移除并通知
                            </a-button>
                        </a-descriptions-item>
                    </a-descriptions>
                </a-card>
                <a-pagination style="margin-top: 8px;" simple align="center" :total="activityUsers.length"
                              :disabled="activityUsers.length === 0" pageSize="5"
                              v-model:current="currentActivityUserPage"></a-pagination>
            </a-spin>
            <template #footer>
                <a-button type="primary" @click="handleCancelUsers">关闭</a-button>
            </template>
        </a-modal>
        <a-modal v-model:visible="visibleAddUsers" title="指派人员">
            <a-form
                :model="formState"
                :validate-messages="validateMessages"
            >
                <a-form-item label="签到组设置" :name="['activity', 'add_to_checkin']">
                    <a-select
                            v-model:value="formState.activity.add_to_checkin"
                            placeholder="签到设置"
                            style="width: 100%"
                    >
                        <a-select-option :value="0">忽略新添加的用户</a-select-option>
                        <a-select-option :value="1">将用户添加至未开始的签到组</a-select-option>
                    </a-select>
                </a-form-item>
                <a-form-item label="搜索与选择用户">
                    <a-select
                            v-model:value="state.value"
                            mode="multiple"
                            label-in-value
                            placeholder="搜索用户，输入*获取所有"
                            style="width: 100%"
                            :filter-option="false"
                            :not-found-content="state.fetching ? undefined : null"
                            :options="users"
                            @search="fetchUser"
                    >
                    </a-select>
                </a-form-item>
            </a-form>
            <template v-if="state.fetching" #notFoundContent>
                <a-spin size="small"/>
            </template>
            <template #footer>
                <a-button type="primary" @click="handleCancelAddUser">关闭</a-button>
                <a-button type="primary" @click="changeActivityUsers" html-type="submit" danger>变更</a-button>
            </template>
        </a-modal>
        <a-modal v-model:visible="visibleEdit" title="签到时间控制">

            <a-form
                    :model="formState"
                    name="validate_other"
                    :validate-messages="validateMessages"
                    style="max-width: 100%;"

            >
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
                <a-button type="primary" @click="handleCancelEdit">关闭</a-button>
                <a-button type="primary" danger :loading="loading" @click="changeCheckIn">变更</a-button>
            </template>
        </a-modal>
        <a-modal v-model:visible="visiblePhotos" title="查看打卡图片">
            <a-image-preview-group>
                <a-image v-for="item in images" :width="200"
                         fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMIAAADDCAYAAADQvc6UAAABRWlDQ1BJQ0MgUHJvZmlsZQAAKJFjYGASSSwoyGFhYGDIzSspCnJ3UoiIjFJgf8LAwSDCIMogwMCcmFxc4BgQ4ANUwgCjUcG3awyMIPqyLsis7PPOq3QdDFcvjV3jOD1boQVTPQrgSkktTgbSf4A4LbmgqISBgTEFyFYuLykAsTuAbJEioKOA7DkgdjqEvQHEToKwj4DVhAQ5A9k3gGyB5IxEoBmML4BsnSQk8XQkNtReEOBxcfXxUQg1Mjc0dyHgXNJBSWpFCYh2zi+oLMpMzyhRcASGUqqCZ16yno6CkYGRAQMDKMwhqj/fAIcloxgHQqxAjIHBEugw5sUIsSQpBobtQPdLciLEVJYzMPBHMDBsayhILEqEO4DxG0txmrERhM29nYGBddr//5/DGRjYNRkY/l7////39v///y4Dmn+LgeHANwDrkl1AuO+pmgAAADhlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAAqACAAQAAAABAAAAwqADAAQAAAABAAAAwwAAAAD9b/HnAAAHlklEQVR4Ae3dP3PTWBSGcbGzM6GCKqlIBRV0dHRJFarQ0eUT8LH4BnRU0NHR0UEFVdIlFRV7TzRksomPY8uykTk/zewQfKw/9znv4yvJynLv4uLiV2dBoDiBf4qP3/ARuCRABEFAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghgg0Aj8i0JO4OzsrPv69Wv+hi2qPHr0qNvf39+iI97soRIh4f3z58/u7du3SXX7Xt7Z2enevHmzfQe+oSN2apSAPj09TSrb+XKI/f379+08+A0cNRE2ANkupk+ACNPvkSPcAAEibACyXUyfABGm3yNHuAECRNgAZLuYPgEirKlHu7u7XdyytGwHAd8jjNyng4OD7vnz51dbPT8/7z58+NB9+/bt6jU/TI+AGWHEnrx48eJ/EsSmHzx40L18+fLyzxF3ZVMjEyDCiEDjMYZZS5wiPXnyZFbJaxMhQIQRGzHvWR7XCyOCXsOmiDAi1HmPMMQjDpbpEiDCiL358eNHurW/5SnWdIBbXiDCiA38/Pnzrce2YyZ4//59F3ePLNMl4PbpiL2J0L979+7yDtHDhw8vtzzvdGnEXdvUigSIsCLAWavHp/+qM0BcXMd/q25n1vF57TYBp0a3mUzilePj4+7k5KSLb6gt6ydAhPUzXnoPR0dHl79WGTNCfBnn1uvSCJdegQhLI1vvCk+fPu2ePXt2tZOYEV6/fn31dz+shwAR1sP1cqvLntbEN9MxA9xcYjsxS1jWR4AIa2Ibzx0tc44fYX/16lV6NDFLXH+YL32jwiACRBiEbf5KcXoTIsQSpzXx4N28Ja4BQoK7rgXiydbHjx/P25TaQAJEGAguWy0+2Q8PD6/Ki4R8EVl+bzBOnZY95fq9rj9zAkTI2SxdidBHqG9+skdw43borCXO/ZcJdraPWdv22uIEiLA4q7nvvCug8WTqzQveOH26fodo7g6uFe/a17W3+nFBAkRYENRdb1vkkz1CH9cPsVy/jrhr27PqMYvENYNlHAIesRiBYwRy0V+8iXP8+/fvX11Mr7L7ECueb/r48eMqm7FuI2BGWDEG8cm+7G3NEOfmdcTQw4h9/55lhm7DekRYKQPZF2ArbXTAyu4kDYB2YxUzwg0gi/41ztHnfQG26HbGel/crVrm7tNY+/1btkOEAZ2M05r4FB7r9GbAIdxaZYrHdOsgJ/wCEQY0J74TmOKnbxxT9n3FgGGWWsVdowHtjt9Nnvf7yQM2aZU/TIAIAxrw6dOnAWtZZcoEnBpNuTuObWMEiLAx1HY0ZQJEmHJ3HNvGCBBhY6jtaMoEiJB0Z29vL6ls58vxPcO8/zfrdo5qvKO+d3Fx8Wu8zf1dW4p/cPzLly/dtv9Ts/EbcvGAHhHyfBIhZ6NSiIBTo0LNNtScABFyNiqFCBChULMNNSdAhJyNSiECRCjUbEPNCRAhZ6NSiAARCjXbUHMCRMjZqBQiQIRCzTbUnAARcjYqhQgQoVCzDTUnQIScjUohAkQo1GxDzQkQIWejUogAEQo121BzAkTI2agUIkCEQs021JwAEXI2KoUIEKFQsw01J0CEnI1KIQJEKNRsQ80JECFno1KIABEKNdtQcwJEyNmoFCJAhELNNtScABFyNiqFCBChULMNNSdAhJyNSiECRCjUbEPNCRAhZ6NSiAARCjXbUHMCRMjZqBQiQIRCzTbUnAARcjYqhQgQoVCzDTUnQIScjUohAkQo1GxDzQkQIWejUogAEQo121BzAkTI2agUIkCEQs021JwAEXI2KoUIEKFQsw01J0CEnI1KIQJEKNRsQ80JECFno1KIABEKNdtQcwJEyNmoFCJAhELNNtScABFyNiqFCBChULMNNSdAhJyNSiECRCjUbEPNCRAhZ6NSiAARCjXbUHMCRMjZqBQiQIRCzTbUnAARcjYqhQgQoVCzDTUnQIScjUohAkQo1GxDzQkQIWejUogAEQo121BzAkTI2agUIkCEQs021JwAEXI2KoUIEKFQsw01J0CEnI1KIQJEKNRsQ80JECFno1KIABEKNdtQcwJEyNmoFCJAhELNNtScABFyNiqFCBChULMNNSdAhJyNSiEC/wGgKKC4YMA4TAAAAABJRU5ErkJggg=="
                         :src="my_config.images_admin_base_url + item + '?token=' + token"/>
            </a-image-preview-group>
            <template #footer>
                <a-button type="primary" @click="handleCancelPhotos">OK</a-button>
            </template>
        </a-modal>
    </a-layout-content>

</template>

<style scoped>
.editable-row-operations a {
    margin-right: 8px;
}
</style>