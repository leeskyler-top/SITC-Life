<script setup>
import {reactive, ref, onMounted, createVNode, computed} from 'vue';
import {ExclamationCircleOutlined, SearchOutlined, HomeOutlined} from '@ant-design/icons-vue';
import {Empty, message, Modal, Table} from "ant-design-vue";
import api from "@/api";
import moment from "moment/moment";

const isShow = ref(true);
const is_admin = ref(localStorage.is_admin === 'true');
const showAddScheduleModal = ref(false);

function handleResize(event) {
  // 页面宽度小于525px时，不显示表格
  if (document.documentElement.clientWidth < 979) {
    isShow.value = false;
  } else {
    isShow.value = true;
  }
}

onMounted(() => {
  handleResize();
  listSchedules();
  listUsers();
});

window.addEventListener('resize', handleResize);


const scheduleData = ref([]);
const checkInData = ref([]);
const currentCheckIn = ref();
const spinning = ref(false);
const loading = ref(false);
const visibleCheckIn = ref(false);
const visibleCurrentCheckIn = ref(false);
const visibleCheckInEdit = ref(false);
const visibleCreateCheckIn = ref(false);
const activeKey = ref('schedules');

const handleTabChange = (key) => {
  // 根据切换的标签 key 执行相应的操作，节流，节省请求次数。
  if (key === 'schedules') {
    listSchedules();
  } else if (key === 'checkins') {
    listCheckIns();
  }
}
const scheduleTypes = ["放学", "午间", "晚间", "早间", "其它"];

const scheduleForm = reactive({
  "schedule_name": "日常值班",
  "schedule_start_time": "",
  "schedule_type": "放学",
});

const listSchedules = () => {
  spinning.value = true;
  api.get("/schedule").then((res) => {
    let {msg, data} = res.data;
    message.success(msg);

    // 按 schedule_start_time 倒序排列
    scheduleData.value = data.sort((a, b) => {
      return moment(b.schedule_start_time).diff(moment(a.schedule_start_time)); // 使用 moment 处理时间比较
    });

    spinning.value = false;
  }).catch((err) => {
    let {msg} = err.response.data;
    message.error(msg);
    spinning.value = false;
  });
};

const listCheckIns = () => {
  spinning.value = true;
  api.get("/checkin").then((res) => {
    let {msg, data} = res.data;
    message.success(msg);
    data = data.map(item => {
      if (item.is_main_check_in === true) {
        item.is_main_check_in = '是';
      } else {
        item.is_main_check_in = '否';
      }
      if (item.need_check_schedule_time === true) {
        item.need_check_schedule_time = '是';
      } else {
        item.need_check_schedule_time = '否';
      }
      return item;
    })
    // 按 schedule_start_time 倒序排列
    checkInData.value = data.sort((a, b) => {
      return moment(b.check_in_start_time).diff(moment(a.check_in_start_time)); // 使用 moment 处理时间比较
    });

    spinning.value = false;
  }).catch((err) => {
    let {msg} = err.response.data;
    message.error(msg);
    spinning.value = false;
  });
}

const changeSchedule = () => {
  api.patch("/schedule/" + currentId.value, formState).then((res) => {
    let {msg, data} = res.data;
    Object.assign(scheduleData.value.find(schedule => schedule.id === currentId.value), data)
    visible.value = false;
    message.success(msg);
  }).catch((err) => {
    let {msg} = err.response.data;
    message.error(msg);
  });
}


const dataSource = ref(scheduleData);
const state = reactive({
  searchText: '',
  searchedColumn: '',
});

const searchInput = ref();

const scheduleColumns = [
  {
    title: '计划ID',
    dataIndex: 'id',
    width: '3%',
    customFilterDropdown: true,
    sorter: (a, b) => a.id - b.id,
    onFilter: (value, record) =>
        record.id.toString().toLowerCase().includes(value.toLowerCase())
  },
  {
    title: '计划名称',
    dataIndex: 'schedule_name',
    width: '20%',
    customFilterDropdown: true,
    onFilter: (value, record) =>
        record.schedule_name.toString().toLowerCase().includes(value.toLowerCase()),
  },
  {
    title: '计划开始时间',
    dataIndex: 'schedule_start_time',
    width: '20%',
    customFilterDropdown: true,
    sorter: (a, b) => (new Date(a.schedule_start_time).getTime()) - (new Date(b.schedule_start_time).getTime()),
    onFilter: (value, record) =>
        record.schedule_start_time.toString().toLowerCase().includes(value.toLowerCase())
  },
  {
    title: '计划类型',
    dataIndex: 'schedule_type',
    width: '10%',
    customFilterDropdown: true,
    onFilter: (value, record) =>
        record.schedule_type.toString().toLowerCase().includes(value.toLowerCase())
  },
  {
    title: '操作',
    width: '10%',
    dataIndex: 'operation',
    fixed: 'right'
  }
];

const checkInColumns = [
  {
    title: '签到ID',
    dataIndex: 'id',
    width: '2%',
    customFilterDropdown: true,
    sorter: (a, b) => a.id - b.id,
    onFilter: (value, record) =>
        record.id.toString().toLowerCase().includes(value.toLowerCase())
  },
  {
    title: '签到名称',
    dataIndex: ['name'],
    width: '15%',
    customFilterDropdown: true,
    onFilter: (value, record) =>
        record.name.toString().toLowerCase().includes(value.toLowerCase()),
  },
  {
    title: '签到开始时间',
    dataIndex: ['check_in_start_time'],
    width: '10%',
    customFilterDropdown: true,
    sorter: (a, b) => (new Date(a.check_in_start_time).getTime()) - (new Date(b.check_in_start_time).getTime()),
    onFilter: (value, record) =>
        record.check_in_start_time.toString().toLowerCase().includes(value.toLowerCase())
  },
  {
    title: '签到结束类型',
    dataIndex: ['check_in_end_time'],
    width: '10%',
    customFilterDropdown: true,
    sorter: (a, b) => (new Date(a.check_in_end_time).getTime()) - (new Date(b.check_in_end_time).getTime()),
    onFilter: (value, record) =>
        record.check_in_end_time.toString().toLowerCase().includes(value.toLowerCase())
  },
  {
    title: '主签到',
    dataIndex: ['is_main_check_in'],
    width: '3%',
    customFilterDropdown: true,
    onFilter: (value, record) =>
        record.is_main_check_in.toString().toLowerCase().includes(value.toLowerCase())
  },
  {
    title: '计划ID',
    dataIndex: 'schedule_id',
    width: '2%',
    customFilterDropdown: true,
    sorter: (a, b) => a.schedule_id - b.schedule_id,
    onFilter: (value, record) =>
        record.schedule_id.toString().toLowerCase().includes(value.toLowerCase())
  },
  {
    title: '计划名称',
    dataIndex: ['schedule', 'schedule_name'],
    width: '15%',
    customFilterDropdown: true,
    onFilter: (value, record) =>
        record.schedule_name.toString().toLowerCase().includes(value.toLowerCase()),
  },
  {
    title: '计划开始时间',
    dataIndex: ['schedule', 'schedule_start_time'],
    width: '10%',
    customFilterDropdown: true,
    sorter: (a, b) => (new Date(a.schedule.schedule_start_time).getTime()) - (new Date(b.schedule.schedule_start_time).getTime()),
    onFilter: (value, record) =>
        record.schedule_start_time.toString().toLowerCase().includes(value.toLowerCase())
  },
  {
    title: '计划类型',
    dataIndex: ['schedule', 'schedule_type'],
    width: '5%',
    customFilterDropdown: true,
    onFilter: (value, record) =>
        record.schedule_type.toString().toLowerCase().includes(value.toLowerCase())
  },
  {
    title: '检查计划时间',
    dataIndex: ['need_check_schedule_time'],
    width: '3%',
    customFilterDropdown: true,
    onFilter: (value, record) =>
        record.need_check_schedule_time.toString().toLowerCase().includes(value.toLowerCase())
  },
  {
    title: '操作',
    width: '11%',
    dataIndex: 'operation',
    fixed: 'right'
  }
]

const handleSearch = (selectedKeys, confirm, dataIndex) => {
  confirm();
  state.searchText = selectedKeys[0];
  state.searchedColumn = dataIndex;
};

const handleReset = clearFilters => {
  clearFilters({confirm: true});
  state.searchText = '';
};
const deleteSchedule = id => {
  api.delete("/schedule/" + id).then((res) => {
    let {msg} = res.data;
    message.success(msg);
    scheduleData.value = scheduleData.value.filter(schedule => schedule.id !== id);
  }).catch((err) => {
    let {msg} = err.response.data;
    message.error(msg);
  });
};

const visible = ref(false);
const visiblePassword = ref(false);

const currentId = ref();
const currentCheckInId = ref();

const showModal = id => {
  let schedule = scheduleData.value.find(i => i.id === id);
  currentId.value = id;
  if (schedule) {
    formState.schedule_name = schedule.schedule_name;
    formState.schedule_start_time = schedule.schedule_start_time;
    formState.schedule_type = schedule.schedule_type;
  }
  visible.value = true;
}

const checkin = reactive({
  "name": null,
  "check_in_start_time": null,
  "check_in_end_time": null,
  "need_check_schedule_time": null
})

const showCheckInEdit = (id, op = null) => {
  currentCheckInId.value = id;
  let current_check_in
  if (op === 'currentCheckIn') {
    current_check_in = checkInData.value.find(checkin => checkin.id === currentCheckInId.value)
  } else {
    current_check_in = scheduleData.value.find(schedule => schedule.id === currentId.value).check_ins.find(checkin => checkin.id === currentCheckInId.value)
  }
  if (current_check_in) {
    checkin.name = current_check_in.name
    checkin.check_in_start_time = current_check_in.check_in_start_time
    checkin.check_in_end_time = current_check_in.check_in_end_time
    checkin.need_check_schedule_time = current_check_in.need_check_schedule_time
  }
  visibleCheckInEdit.value = true;

}

const handleCancelEdit = (id) => {
  visibleCheckInEdit.value = false;
  currentCheckIn.value = {};
  checkin.name = null
  checkin.check_in_start_time = null
  checkin.check_in_end_time = null
  checkin.need_check_schedule_time = null
}

const changeCheckIn = () => {
  loading.value = true;
  api.patch("/checkin/" + currentCheckInId.value, checkin).then(res => {
    let {msg, data} = res.data;
    console.log(data)
    if (currentCheckIn.value?.id === currentCheckInId.value) {
      let currentSchedule = checkInData.value.find(checkin => checkin.id === currentCheckInId.value).schedule;
      Object.assign(checkInData.value.find(checkin => checkin.id === currentCheckInId.value), data);
      checkInData.value.find(checkin => checkin.id === currentCheckInId.value).schedule = currentSchedule;
    } else {
      Object.assign(scheduleData.value.find(schedule => schedule.id === currentId.value).check_ins.find(checkin => checkin.id === currentCheckInId.value), data)
    }
    currentCheckIn.value = checkInData.value.find(checkin => checkin.id === currentCheckInId.value);
    checkInData.value.find(checkin => checkin.id === currentCheckInId.value).is_main_check_in === true ? checkInData.value.find(checkin => checkin.id === currentCheckInId.value).is_main_check_in = "是" : checkInData.value.find(checkin => checkin.id === currentCheckInId.value).is_main_check_in = "否"
    checkInData.value.find(checkin => checkin.id === currentCheckInId.value).need_check_schedule_time === true ? checkInData.value.find(checkin => checkin.id === currentCheckInId.value).need_check_schedule_time = "是" : checkInData.value.find(checkin => checkin.id === currentCheckInId.value).need_check_schedule_time = "否"
    loading.value = false;
    visibleCheckInEdit.value = false;
    checkin.name = null;
    checkin.check_in_start_time = null;
    checkin.check_in_end_time = null;
    checkin.need_check_schedule_time = null;
    message.success(msg)
  }).catch(err => {
    let {msg} = err.response.data;
    loading.value = false;
    message.error(msg)
  })
}

const visiblePeople = ref(false); // 控制用户选择模态框的可见性
const usersSpinning = ref(false); // 控制加载状态
const user_ids = ref([]); // 存储选中的用户


// 获取需要显示的用户
const fetchCheckInUsers = () => {
  const schedule = scheduleData.value.find(s => s.id === currentId.value);
  if (schedule) {
    const checkIn = schedule.check_ins.find(checkIn => checkIn.is_main_check_in);
    if (checkIn) {
      // 设置 user_ids 为当前 checkIn 的用户列表
      user_ids.value = checkIn.check_in_users.map(checkInUser => checkInUser.user.id);
    }
  }
};

const current_users = ref([])

const showPeople = () => {
  fetchCheckInUsers(); // 获取并设置用户
  visiblePeople.value = true; // 显示用户选择模态框

  // 重新整合用户，确保选中的用户在最前面
  const selectedUserIds = new Set(user_ids.value);
  current_users.value = users.value
  // 对用户列表进行排序
  current_users.value.sort((a, b) => {
    if (selectedUserIds.has(a.id) && !selectedUserIds.has(b.id)) {
      return -1; // a 在前
    } else if (!selectedUserIds.has(a.id) && selectedUserIds.has(b.id)) {
      return 1; // b 在前
    }
    return 0; // 其他情况不改变顺序
  });

  usersSpinning.value = true; // 开始加载状态
};

// 切换用户选择
const onSelectChange = (changableRowKeys) => {
  user_ids.value = changableRowKeys; // 更新选中的用户
};

// 行选中配置
const rowSelection = computed(() => {
  return {
    selectedRowKeys: user_ids.value,
    onChange: onSelectChange,
    hideDefaultSelections: true,
    selections: [Table.SELECTION_ALL, Table.SELECTION_INVERT, Table.SELECTION_NONE],
  };
});

const handleCloseUser = (confirm) => {
  if (confirm === 'T') {
    // 该部分逻辑与之前相同
    const schedule = scheduleData.value.find(s => s.id === currentId.value);
    let checkIn = schedule?.check_ins?.find(checkIn => checkIn.is_main_check_in);

    // Sending the API request to assign users
    api.post('/checkin/assign/' + checkIn?.id, {
      "user_ids": user_ids.value
    }).then(res => {
      message.success('已执行排班，并通知了对方');
      openNotification("排班系统执行情况", res.data.msg);
      fetchSchedules(); // 刷新排班数据
    }).catch(err => {
      const {msg} = err.response.data;
      message.error(msg); // Handle error appropriately
    });
  }
  visiblePeople.value = false; // 关闭用户选择模态框
  user_ids.value = [];         // 清空选中的用户
};

// 在模态框显示时加载用户
const handleModalOpen = (id) => {
  currentId.value = id;  // 当前 ID 保存
  showPeople();          // 显示选择用户的模态框
};

// 用于响应用户界面变化
const handleCheckboxChange = (id) => {
  if (user_ids.value.includes(id)) {
    user_ids.value = user_ids.value.filter(item => item !== id); // 移除用户
  } else {
    user_ids.value.push(id); // 添加用户
  }
};


const user_columns = [
  {
    title: '学籍号',
    dataIndex: 'studentId',
    width: '25%',
    customFilterDropdown: true,
    onFilter: (value, record) =>
        record.studentId.toString().toLowerCase().includes(value.toLowerCase()),
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
    width: '20%',
    customFilterDropdown: true,
    onFilter: (value, record) =>
        record.name.toString().toLowerCase().includes(value.toLowerCase()),
  },
  {
    title: '住宿',
    dataIndex: 'resident',
    width: '5%',
    customFilterDropdown: true,
    onFilter: (value, record) =>
        record.resident.toString().toLowerCase().includes(value.toLowerCase()),
  }
];

const users = ref();

// 获取用户列表
const listUsers = () => {
  spinning.value = true;
  api.get("/user").then((res) => {
    spinning.value = false;
    let {data} = res.data;
    users.value = data;
  }).catch((err) => {
    let {msg} = err.response.data;
    message.error(msg);
  });
}

const revokeCheckIn = (id) => {
  loading.value = true;
  api.get("/checkin/cancel/" + id).then(res => {
    let {msg, data} = res.data;
    console.log(currentCheckInId.value)
    Object.assign(scheduleData.value.find(schedule => schedule.id === currentId.value).check_ins.find(checkin => checkin.id === currentCheckInId.value).check_in_users.find(checkInUser => checkInUser.id === id), data);
    loading.value = false;
    message.success(msg);
  }).catch(err => {
    let {msg} = err.response.data;
    loading.value = false;
    message.error(msg);
  })
}

const changeRecord = (id, op) => {
  let time
  if (op === 'fixRecord') {
    time = scheduleData.value.find(schedule => schedule.id === currentId.value).check_ins.find(checkin => checkin.id === currentCheckInId.value).check_in_start_time
  } else {
    let date = new Date();
    time = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')} ${date.getHours()}:${date.getUTCMinutes().toString().padStart(2, '0')}:${date.getUTCSeconds().toString().padStart(2, '0')}`;
  }
  loading.value = true;
  api.post("/checkin/change_record/" + id, {
    'check_in_time': time
  }).then(res => {
    let {msg, data} = res.data;
    loading.value = false;
    Object.assign(scheduleData.value.find(schedule => schedule.id === currentId.value).check_ins.find(checkin => checkin.id === currentCheckInId.value).check_in_users.find(checkInUser => checkInUser.id === id), data);
    message.success(msg);
  }).catch(err => {
    let {msg} = err.response.data;
    loading.value = false;
    message.error(msg);
  })
}

const showConfirm = (id, op) => {
  if (op === "revokeUser") {
    currentCheckInId.value = id[0]
    Modal.confirm({
      title: '确认操作',
      icon: createVNode(ExclamationCircleOutlined),
      content: '是否判定此签到无效并驳回？',
      okText: '确认',
      cancelText: '取消',
      onOk() {
        revokeCheckIn(id[1])
      }
    });
  } else if (op === "openCheckIn") {
    visibleCheckIn.value = true;
    currentId.value = id;
  } else if (op === "openCurrentCheckIn") {
    visibleCurrentCheckIn.value = true;
    currentCheckIn.value = checkInData.value.find(checkin => checkin.id === id);
    currentCheckIn.value.is_main_check_in === "是" ? currentCheckIn.value.is_main_check_in = true : currentCheckIn.value.is_main_check_in = "否"
    currentCheckIn.value.need_check_schedule_time === "是" ? currentCheckIn.value.need_check_schedule_time = true : currentCheckIn.value.need_check_schedule_time = "否"
  } else if (op === "checkIn") {
    currentCheckInId.value = id[0]
    Modal.confirm({
      title: '确认操作',
      icon: createVNode(ExclamationCircleOutlined),
      content: '协助签到？',
      okText: '确认',
      cancelText: '取消',
      onOk() {
        changeRecord(id[1], op)
      }
    })
  } else if (op === 'fixRecord') {
    currentCheckInId.value = id[0]
    Modal.confirm({
      title: '确认操作',
      icon: createVNode(ExclamationCircleOutlined),
      content: '确定补签？',
      okText: '确认',
      cancelText: '取消',
      onOk() {
        changeRecord(id[1], op)
      }
    })
  }
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
  schedule_name: "",
  schedule_start_time: "",
  schedule_type: "放学",
});

const handleCancel = () => {
  visible.value = false;
  visibleCheckIn.value = false;
  visibleCurrentCheckIn.value = false;
  visibleCreateCheckIn.value = false;
};

const scroll = computed(() => {
  if (isShow.value === true) {
    return false
  } else {
    return {x: 900}
  }
})

</script>

<template>
  <a-layout-content
      :style="{margin: '16px'}"
  >
    <h2 style="display: flex; justify-content: space-between;">
      <span>值班计划列表</span><span style=" margin-bottom: 4px;"><router-link to="/"><HomeOutlined/> 首页</router-link></span>
    </h2>
    <div style="padding: 8px; background-color: #FFFFFF">

      <a-tabs v-model:activeKey="activeKey" @update:activeKey="handleTabChange" type="card">
        <a-tab-pane key="schedules" tab="值班计划">
          <a-row justify="end">
            <a-button type="primary" style="margin: 8px" @click="showAddScheduleModal = true" ghost>
              添加值班计划
            </a-button>
            <router-link to="/schedule/batch">
              <a-button type="primary" style="margin: 8px" v-if="is_admin">
                批量添加值班计划
              </a-button>
            </router-link>
          </a-row>
          <a-spin :spinning="spinning" tip="Loading...">
            <a-table :columns="scheduleColumns" :data-source="dataSource" :scroll="scroll" bordered>
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
                    v-if="['id', 'schedule_name', 'schedule_start_time', 'schedule_type'].includes(column.dataIndex)">
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
                          <a @click="showConfirm(record.id, 'openCheckIn')">查看签到</a>
                      </span>
                    <span>
                        <a-popconfirm title="确定删除此值班计划？" @confirm="deleteSchedule(record.id)"><a
                            style="color: red">删除</a></a-popconfirm>
                      </span>
                  </div>
                </template>
              </template>
            </a-table>
          </a-spin>
        </a-tab-pane>
        <a-tab-pane key="checkins" tab="所有签到">
          <a-row justify="end">
            <a-button type="primary" style="margin: 8px" @click="showAddScheduleModal = true" ghost>
              添加子签到
            </a-button>
          </a-row>
          <a-spin :spinning="spinning" tip="Loading...">
            <a-table :columns="checkInColumns" :data-source="checkInData" :scroll="scroll" bordered>
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
                    v-if="['name', 'check_in_start_time', 'check_in_end_time', 'is_main_check_in', 'schedule_name', 'schedule_start_time', 'schedule_type', 'need_check_schedule_time'].includes(column.dataIndex)">
                  <div>
                    {{ text }}
                  </div>
                </template>
                <template v-else-if="column.dataIndex === 'operation'">
                  <div class="editable-row-operations">
                    <span>
                          <a @click="showConfirm(record.id, 'openCurrentCheckIn')">编辑</a>
                      </span>
                    <span>
                          <a @click="showModal(record.schedule_id)">查看值班</a>
                      </span>
                    <span>
                        <a-popconfirm title="确定删除此值班计划？" @confirm="deleteSchedule(record.id)"><a
                            style="color: red">删除</a></a-popconfirm>
                      </span>
                  </div>
                </template>
              </template>
            </a-table>
          </a-spin>
        </a-tab-pane>
      </a-tabs>

    </div>

    <a-modal title="用户列表" v-model:visible="visiblePeople">
      <a-table
          :row-selection="rowSelection"
          :columns="user_columns"
          :data-source="current_users"
          :row-key="record => record.id"
      >
      </a-table>
      <template #footer>
        <a-button type="primary" danger @click="handleCloseUser('F')">放弃选择</a-button>
        <a-button type="primary" @click="handleCloseUser('T')">保存</a-button>
      </template>
    </a-modal>

    <a-modal v-model:visible="visible" title="修改值班计划信息">
      <a-form
          :model="formState"
          name="validate_other"
          v-bind="formItemLayout"
      >
        <a-form-item name="schedule_name" label="值班计划名称" :rules="[{ required: true }]">
          <a-input v-model:value="formState.schedule_name"/>
        </a-form-item>

        <a-form-item
            name="schedule_start_time"
            label="计划开始时间"
            :rules="[{ required: true }]">
          <a-date-picker
              format="YYYY-MM-DD HH:mm:ss"
              show-time
              valueFormat="YYYY-MM-DD HH:mm:ss"
              v-model:value="formState.schedule_start_time"/>
        </a-form-item>

        <a-form-item
            name="schedule_type"
            label="性别"
            has-feedback
            :rules="[{ required: true, message: '请选择类型' }]"
        >
          <a-select v-model:value="formState.schedule_type" placeholder="选择性别">
            <a-select-option value="放学">放学</a-select-option>
            <a-select-option value="午间">午间</a-select-option>
            <a-select-option value="早间">早间</a-select-option>
            <a-select-option value="晚间">晚间</a-select-option>
            <a-select-option value="其它">其它</a-select-option>
          </a-select>
        </a-form-item>

        <a-form-item label="值班人员管理">
          <a-button @click="showPeople">编辑人员</a-button>
        </a-form-item>

      </a-form>
      <template #footer>
        <a-button type="primary" @click="handleCancel">关闭</a-button>
        <a-button type="primary" danger @click="changeSchedule">变更</a-button>
      </template>
    </a-modal>

    <a-modal
        title="添加值班计划"
        v-model:visible="showAddScheduleModal"
    >
      <a-form layout="vertical" :model="scheduleForm">
        <a-form-item label="值班计划名称" name="schedule_name" :rules="[{ required: true, message: '请填写值班名称' }]">
          <a-input v-model:value="scheduleForm.schedule_name" placeholder="日常值班"/>
        </a-form-item>
        <a-form-item label="计划开始时间" name="schedule_start_time"
                     :rules="[{ required: true, message: '请填写计划开始时间' }]">
          <a-date-picker
              v-model:value="scheduleForm.schedule_start_time"
              :disabled-date="(current) => current && current.isBefore(moment().startOf('day'))"
              format="YYYY-MM-DD HH:mm:ss"
              show-time
              valueFormat="YYYY-MM-DD HH:mm:ss"
          />
        </a-form-item>
        <a-form-item label="值班计划类型" name="schedule_type"
                     :rules="[{ required: true, message: '请选择值班计划类型' }]">
          <a-select v-model:value="scheduleForm.schedule_type">
            <a-select-option v-for="type in scheduleTypes" :key="type" :value="type">{{ type }}</a-select-option>
          </a-select>
        </a-form-item>

      </a-form>
      <template #footer>
        <a-button type="primary" @click="showAddScheduleModal = false">关闭</a-button>
        <a-button type="primary" danger @click="createSchedule">变更</a-button>
      </template>
    </a-modal>

    <!--    查看签到-->
    <a-modal v-model:visible="visibleCheckIn" title="签到管理">
      <template #footer>
        <a-button type="primary" @click="handleCancel">关闭</a-button>
      </template>
      <a-spin :spinning="loading" tip="Loading...">
        <a-collapse v-model:activeKey="activeKey" accordion>
          <a-collapse-panel v-for="checkIn in scheduleData.find(s => s.id === currentId).check_ins" :key="checkIn.id"
                            :header="checkIn.name">
            <a-card>
              <p>签到开始时间: {{ checkIn.check_in_start_time }}</p>
              <p>签到结束时间: {{ checkIn.check_in_end_time }}</p>
              <p>当前状态: {{ checkIn.status }}</p>
              <div>
                <a-button type="primary" @click="showCheckInEdit(checkIn.id)">签到控制</a-button>
                <a-button v-if="checkIn.is_main_check_in === false" type="primary" danger
                          @click="showConfirm('deleteCheckIn', checkIn.id)">删除签到
                </a-button>
              </div>
            </a-card>
            <a-card v-for="checkInUser in checkIn.check_in_users" :key="checkInUser.id">
              <a-descriptions bordered :title="checkInUser.user.studentId + '-' + checkInUser.user.name"
                              layout="vertical" size="small">
                <a-descriptions-item label="签到时间" :span="2" v-if="['迟到','正常'].includes(checkInUser.status)">
                  {{ checkInUser.check_in_time }}
                </a-descriptions-item>
                <a-descriptions-item label="签到状态">{{ checkInUser.status }}</a-descriptions-item>
                <a-descriptions-item label="操作" :span="4" style="display:flex; gap: 4px;"
                                     v-if="['迟到','正常', '未签到', '缺勤'].includes(checkInUser.status)">
                  <a-button type="primary" danger
                            size="small" :loading="loading"
                            @click="showConfirm([checkIn.id, checkInUser.id], 'revokeUser')"
                            v-if="['正常', '迟到'].includes(checkInUser.status)" ghost>驳回
                  </a-button>
                  <a-button type="primary"
                            size="small" :loading="loading"
                            @click="showConfirm([checkIn.id, checkInUser.id], 'fixRecord')"
                            style="margin-left: 3px;" v-if="['缺勤', '迟到'].includes(checkInUser.status)" ghost>补签
                  </a-button>
                  <a-button type="primary"
                            size="small" :loading="loading"
                            @click="showConfirm([checkIn.id, checkInUser.id], 'checkIn')"
                            style="margin-left: 3px;" v-if="['未签到'].includes(checkInUser.status)" ghost>协助签到
                  </a-button>
                </a-descriptions-item>

              </a-descriptions>
            </a-card>
          </a-collapse-panel>
        </a-collapse>
      </a-spin>
    </a-modal>
    <a-modal v-model:visible="visibleCurrentCheckIn" title="当前签到管理">
      <template #footer>
        <a-button type="primary" @click="handleCancel">关闭</a-button>
      </template>
      <a-spin :spinning="loading" tip="Loading...">
        <a-card>
          <h3>签到名称：{{ currentCheckIn.name }}</h3>
          <p>签到开始时间: {{ currentCheckIn.check_in_start_time }}</p>
          <p>签到结束时间: {{ currentCheckIn.check_in_end_time }}</p>
          <p>当前状态: {{ currentCheckIn.status }}</p>
          <div>
            <a-button type="primary" @click="showCheckInEdit(currentCheckIn.id, 'currentCheckIn')">签到控制</a-button>
            <a-button v-if="currentCheckIn.is_main_check_in === false" type="primary" danger
                      @click="showConfirm('deleteCheckIn', currentCheckIn.id)">删除签到
            </a-button>
          </div>
        </a-card>
        <a-card v-for="checkInUser in currentCheckIn.check_in_users" :key="checkInUser.id">
          <a-descriptions bordered :title="checkInUser.user.studentId + '-' + checkInUser.user.name"
                          layout="vertical" size="small">
            <a-descriptions-item label="签到时间" :span="2" v-if="['迟到','正常'].includes(checkInUser.status)">
              {{ checkInUser.check_in_time }}
            </a-descriptions-item>
            <a-descriptions-item label="签到状态">{{ checkInUser.status }}</a-descriptions-item>
            <a-descriptions-item label="操作" :span="4" style="display:flex; gap: 4px;"
                                 v-if="['迟到','正常', '未签到', '缺勤'].includes(checkInUser.status)">
              <a-button type="primary" danger
                        size="small" :loading="loading"
                        @click="showConfirm([currentCheckIn.id, checkInUser.id], 'revokeUser')"
                        v-if="['正常', '迟到'].includes(checkInUser.status)" ghost>驳回
              </a-button>
              <a-button type="primary"
                        size="small" :loading="loading"
                        @click="showConfirm([currentCheckIn.id, checkInUser.id], 'fixRecord')"
                        style="margin-left: 3px;" v-if="['缺勤', '迟到'].includes(checkInUser.status)" ghost>补签
              </a-button>
              <a-button type="primary"
                        size="small" :loading="loading"
                        @click="showConfirm([currentCheckIn.id, checkInUser.id], 'checkIn')"
                        style="margin-left: 3px;" v-if="['未签到'].includes(checkInUser.status)" ghost>协助签到
              </a-button>
            </a-descriptions-item>

          </a-descriptions>
        </a-card>
      </a-spin>
    </a-modal>

    <a-modal v-model:visible="visibleCheckInEdit" title="签到控制">

      <a-form
          :model="checkin"
          name="validate_other"
          style="max-width: 100%;"
      >
        <a-form-item name="name" label="签到名称">
          <a-input v-model:value="checkin.name"/>
        </a-form-item>
        <a-form-item has-feedback
                     :rules="[{ required: true, message: '请选择日期' }]" :name="['check_in_start_time']"
                     label="开始时间">
          <a-date-picker
              v-model:value="checkin.check_in_start_time"
              show-time
              format="YYYY-MM-DD HH:mm:ss"
              value-format="YYYY-MM-DD HH:mm:ss"
              placeholder="不得早于当前时间"
          />
        </a-form-item>
        <a-form-item has-feedback
                     :rules="[{ required: true, message: '请选择日期' }]" :name="['check_in_end_time']"
                     label="结束时间">
          <a-date-picker
              v-model:value="checkin.check_in_end_time"
              show-time
              format="YYYY-MM-DD HH:mm:ss"
              value-format="YYYY-MM-DD HH:mm:ss"
              placeholder="不得早于当前时间"
          />
        </a-form-item>
        <a-form-item
            name="need_check_schedule_time"
            label="检查计划开始时间"
            :rules="[{ required: true, message: '请选择日期' }]" :name="['check_in_end_time']"
        >
          <a-switch v-model:checked="checkin.need_check_schedule_time"/>
        </a-form-item>
      </a-form>
      <template #footer>
        <a-button type="primary" @click="handleCancelEdit">关闭</a-button>
        <a-button type="primary" danger :loading="loading" @click="changeCheckIn">变更</a-button>
      </template>
    </a-modal>

    <a-modal v-model:visible="visibleCreateCheckIn" title="添加子签到">

      <a-form
          :model="checkin"
          name="validate_other"
          style="max-width: 100%;"
      >
        <a-form-item name="name" label="签到名称">
          <a-input v-model:value="checkin.name"/>
        </a-form-item>
        <a-form-item has-feedback
                     :rules="[{ required: true, message: '请选择日期' }]" :name="['check_in_start_time']"
                     label="开始时间">
          <a-date-picker
              v-model:value="checkin.check_in_start_time"
              show-time
              format="YYYY-MM-DD HH:mm:ss"
              value-format="YYYY-MM-DD HH:mm:ss"
              placeholder="不得早于当前时间"
          />
        </a-form-item>
        <a-form-item has-feedback
                     :rules="[{ required: true, message: '请选择日期' }]" :name="['check_in_end_time']"
                     label="结束时间">
          <a-date-picker
              v-model:value="checkin.check_in_end_time"
              show-time
              format="YYYY-MM-DD HH:mm:ss"
              value-format="YYYY-MM-DD HH:mm:ss"
              placeholder="不得早于当前时间"
          />
        </a-form-item>
        <a-form-item
            name="need_check_schedule_time"
            label="检查计划开始时间"
            :rules="[{ required: true, message: '请选择日期' }]" :name="['check_in_end_time']"
        >
          <a-switch v-model:checked="checkin.need_check_schedule_time"/>
        </a-form-item>
        <a-form-item label="绑定签到人员">
          <a-button @click="showPeople">编辑人员</a-button>
        </a-form-item>

      </a-form>
      <template #footer>
        <a-button type="primary" @click="handleCancelEdit">关闭</a-button>
        <a-button type="primary" danger :loading="loading" @click="changeCheckIn">变更</a-button>
      </template>
    </a-modal>


  </a-layout-content>

</template>

<style scoped>
.editable-row-operations a {
  margin-right: 8px;
}
</style>