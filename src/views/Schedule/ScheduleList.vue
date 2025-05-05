<script setup>
import {reactive, ref, onMounted, createVNode, computed} from 'vue';
import {ExclamationCircleOutlined, SearchOutlined, HomeOutlined} from '@ant-design/icons-vue';
import {Empty, message, Modal, Table} from "ant-design-vue";
import api from "@/api";
import moment from "moment/moment";

const isShow = ref(true);
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


const myData = ref([]);
const spinning = ref(false);
const loading = ref(false);
const visibleCheckIn = ref(false);
const activeKey = ref('');

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
    myData.value = data.sort((a, b) => {
      return moment(b.schedule_start_time).diff(moment(a.schedule_start_time)); // 使用 moment 处理时间比较
    });

    spinning.value = false;
  }).catch((err) => {
    let {msg} = err.response.data;
    message.error(msg);
    spinning.value = false;
  });
};
const changeSchedule = () => {
  api.patch("/schedule/" + currentId.value, formState).then((res) => {
    let {msg} = res.data;
    let currentSchedule = myData.value.find(item => item.id === currentId.value)
    Object.assign(currentSchedule, formState);
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
    title: '值班计划ID',
    dataIndex: 'id',
    width: '3%',
    customFilterDropdown: true,
    onFilter: (value, record) =>
        record.id.toString().toLowerCase().includes(value.toLowerCase()),
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
    myData.value = myData.value.filter(schedule => schedule.id !== id);
  }).catch((err) => {
    let {msg} = err.response.data;
    message.error(msg);
  });
};

const visible = ref(false);
const visiblePassword = ref(false);

const currentId = ref();

const showModal = id => {
  let schedule = myData.value.find(i => i.id === id);
  currentId.value = id;
  if (schedule) {
    formState.schedule_name = schedule.schedule_name;
    formState.schedule_start_time = schedule.schedule_start_time;
    formState.schedule_type = schedule.schedule_type;
  }
  visible.value = true;
}

const visiblePeople = ref(false); // 控制用户选择模态框的可见性
const usersSpinning = ref(false); // 控制加载状态
const user_ids = ref([]); // 存储选中的用户

// 获取需要显示的用户
const fetchCheckInUsers = () => {
  const schedule = myData.value.find(s => s.id === currentId.value);
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
    const schedule = myData.value.find(s => s.id === currentId.value);
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
    let {msg} = res.data;
    loading.value = false;
    message.success(msg);
  }).catch(err => {
    let {msg} = err.response.data;
    loading.value = false;
    message.error(msg);
  })
}

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
  } else if ("openCheckIn") {
    visibleCheckIn.value = true;
    currentId.value = id;
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
};

const scroll = computed(() => {
  if (isShow.value === true) {
    return false
  } else {
    return {x: 1500}
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
      <a-spin :spinning="spinning" tip="Loading...">
        <a-row justify="end">
          <a-button type="primary" style="margin: 8px" @click="showAddScheduleModal = true" ghost>
            添加值班计划
          </a-button>
          <router-link to="/schedule/batch">
            <a-button type="primary" style="margin: 8px">
              批量添加值班计划
            </a-button>
          </router-link>
        </a-row>

        <a-table :columns="columns" :data-source="dataSource" :scroll="scroll" bordered>
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
            <template v-if="['id', 'schedule_name', 'schedule_start_time', 'schedule_type'].includes(column.dataIndex)">
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
                          <a @click="showConfirm('openCheckIn', record.id)">查看签到</a>
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
          <a-collapse-panel v-for="checkIn in myData.find(s => s.id === currentId).check_ins" :key="checkIn.id" :header="checkIn.name">
            <a-card>
              <p>签到开始时间: {{ checkIn.check_in_start_time }}</p>
              <p>签到结束时间: {{ checkIn.check_in_end_time }}</p>
              <p>当前状态: {{ checkIn.status }}</p>
              <div>
                <a-button type="primary" @click="showEdit(checkIn.id)">变更结束时间</a-button>
                <a-button v-if="checkIn.is_main_check_in === false" type="primary" danger @click="showConfirm('deleteCheckIn', checkIn.id)">删除签到</a-button>
              </div>
            </a-card>
            <a-card v-for="checkInUser in checkIn.check_in_users" :key="checkInUser.id">
              <a-descriptions :title="checkInUser.user.studentId + '-' + checkInUser.user.name" layout="vertical">
                <a-descriptions-item label="签到时间" v-if="checkInUser.status === 'signed'">{{ checkInUser.check_in_time }}</a-descriptions-item>
                <a-descriptions-item label="签到状态">{{ checkInUser.status }}</a-descriptions-item>
              </a-descriptions>
            </a-card>
          </a-collapse-panel>
        </a-collapse>
      </a-spin>
    </a-modal>


  </a-layout-content>

</template>

<style scoped>
.editable-row-operations a {
  margin-right: 8px;
}
</style>