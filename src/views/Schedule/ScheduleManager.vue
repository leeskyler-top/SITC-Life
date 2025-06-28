<script setup>
import {ref, onMounted, computed, createVNode, reactive} from 'vue';
import {Button, Modal, Select, DatePicker, Form, message, Spin, Badge, notification, Table} from 'ant-design-vue';
import {ExclamationCircleOutlined, HomeOutlined, SearchOutlined} from '@ant-design/icons-vue';
import moment from 'moment';
import api from "@/api";

const spinning = ref(false);
const schedules = ref([]);
const showAddScheduleModal = ref(false);
const is_admin = ref(localStorage.is_admin === 'true');
const scheduleForm = reactive({
  "schedule_name": "日常值班",
  "schedule_start_time": "",
  "schedule_type": "放学",
});
const checkInUserForm = reactive({
  "checkin_ids": [],
  "user_ids": [],
})
const loadingSchedules = ref(true);
const batchEditMode = ref(false);  // Flag for batch edit mode
const scheduleIdList = ref([]);       // List of selected schedule IDs
const visibleUsers = ref(false);       // Control visibility of users modal

const currentMonth = ref(moment());
const selectedYear = ref(moment().year());
const selectedMonth = ref(moment().month());

const showMainCheckIn = ref(false);
const showScheduleStartTime = ref(false);

const scheduleTypes = ["放学", "午间", "晚间", "早间", "其它"];

const typeColors = {
  "放学": "warning",
  "午间": "success",
  "晚间": "processing",
  "早间": "default",
  "其它": "error"
};

const dayNames = ["日", "一", "二", "三", "四", "五", "六"];

const years = Array.from({length: 100}, (_, i) => moment().year() - 25 + i);
const months = moment.months();

const daysInMonth = computed(() => {
  const startOfMonth = currentMonth.value.clone().startOf('month');
  const endOfMonth = currentMonth.value.clone().endOf('month');
  const days = [];
  for (let day = startOfMonth; day.isBefore(endOfMonth) || day.isSame(endOfMonth, 'day'); day.add(1, 'days')) {
    days.push(day.clone());
  }
  return days;
});

const emptyDaysStart = computed(() => {
  const startOfMonth = currentMonth.value.clone().startOf('month');
  const emptyDays = startOfMonth.day(); // 星期几，0是周日
  return emptyDays;
});

const users = ref([]);

const onSelectChange = changableRowKeys => {
  checkInUserForm.user_ids = changableRowKeys;
};

const rowSelection = computed(() => {
  return {
    selectedRowKeys: checkInUserForm.user_ids,
    onChange: onSelectChange,
    hideDefaultSelections: true,
    selections: [Table.SELECTION_ALL, Table.SELECTION_INVERT, Table.SELECTION_NONE],
  };
});

const columns = [
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

const userData = ref([])

const listMyInfo = () => {
  spinning.value = true;
  api.get("/user/my").then((res) => {
    spinning.value = false;
    let {data} = res.data;
    if (data.is_admin === true) {
      data.is_admin = '是';
    } else {
      data.is_admin = '否';
    }
    if (data.resident === true) {
      data.resident = '是';
    } else {
      data.resident = '否';
    }
    if (['部长', '副部长', '部门负责人'].includes(data.position) || data.is_admin === '是') {
      listUsers();
    }
    userData.value = data;
  }).catch((err) => {
    let {msg} = err.response.data;
    message.error(msg);
  });
}


// 获取排班数据
const fetchSchedules = () => {
  loadingSchedules.value = true;
  api.get("/schedule").then((res) => {
    let {msg, data} = res.data;
    message.success(msg);
    schedules.value = data;
    loadingSchedules.value = false;
  }).catch((err) => {
    let {msg} = err.response.data;
    message.error(msg);
    loadingSchedules.value = false;
  });
};

const listUsers = () => {
  spinning.value = true;
  api.get("/user").then((res) => {
    spinning.value = false;
    let {data} = res.data;
    data = data.map(item => {
      if (item.is_admin === true) {
        item.is_admin = '是';
      } else {
        item.is_admin = '否';
      }
      if (item.resident === true) {
        item.resident = '是';
      } else {
        item.resident = '否';
      }
      return item;
    })
    users.value = data;
  }).catch((err) => {
    let {msg} = err.response.data;
    message.error(msg);
  });
}

// 获取指定月份的排班数据，带缓存，只在数据变更或时间跨度太大时才重新拉数据
const getScheduleData = (date) => {
  return schedules.value.filter(schedule => moment(schedule.schedule_start_time).isSame(date, 'day'));
};

const availableSchedules = computed(() => {
  const filteredDateRange = daysInMonth.value;

  return filteredDateRange.map(date => {
    return {
      date: date.format('YYYY-MM-DD'),
      schedules: getScheduleData(date),
    };
  });
});

// 改变年份
const changeYear = (year) => {
  selectedYear.value = year;
  updateMonth();
};

// 改变月份
const changeMonth = (month) => {
  selectedMonth.value = month;
  updateMonth();
};

// 更新月份
const updateMonth = () => {
  currentMonth.value = moment().year(selectedYear.value).month(selectedMonth.value);
};

// 上个月
const prevMonth = () => {
  currentMonth.value = currentMonth.value.clone().subtract(1, 'month');
  selectedYear.value = currentMonth.value.year();
  selectedMonth.value = currentMonth.value.month();
};

// 下个月
const nextMonth = () => {
  currentMonth.value = currentMonth.value.clone().add(1, 'month');
  selectedYear.value = currentMonth.value.year();
  selectedMonth.value = currentMonth.value.month();
};

onMounted(() => {
  listMyInfo();
  fetchSchedules();
});

const isUserOnDuty = (date) => {
  return schedules.value.some(schedule => {
    return schedule.check_ins.some(checkIn => {
      return checkIn.is_main_check_in && checkIn.check_in_users.some(checkInUser => {
        return checkInUser.user.studentId === userData.value.studentId &&
            moment(schedule.schedule_start_time).isSame(date, 'day'); // 确保是同一天
      });
    });
  });
};


// Go to user selection
const goToUserSelection = () => {
  if (scheduleIdList.value.length === 0) {
    message.warning("请至少选择一个排班计划进行编辑");
    return;
  }
  visibleUsers.value = true; // Show the user selection modal
};

// Handle user selection
const handleCloseUser = (confirm) => {
  if (confirm === 'T') {
    // 根据 scheduleIdList 生成 check_in_ids
    const checkInIds = [];

    scheduleIdList.value.forEach(scheduleId => {
      const schedule = schedules.value.find(s => s.id === scheduleId);
      if (schedule) {
        // 添加每个 schedule 的 check_ins 中 is_main_check_in 为 true 的 id
        const checkIn = schedule.check_ins.find(checkIn => checkIn.is_main_check_in);
        checkInIds.push(checkIn.id);
      }
    });

    // 更新 checkInUserForm
    checkInUserForm.checkin_ids = checkInIds;

    // 发送 API 请求
    api.post('/checkin/assign', checkInUserForm).then(res => {
      message.success('已执行排班，并通知了对方');
      openNotification("排班系统执行情况", res.data.msg)
      fetchSchedules();
    }).catch(err => {
      const {msg} = err.response.data;
      message.error(msg); // Handle error appropriately
    });
  }

  visibleUsers.value = false;
  checkInUserForm.user_ids = [];  // 清空选中的用户
  scheduleIdList.value = [];       // 清空选中的排班 ID
  batchEditMode.value = false;
};
const handleCheckboxChange = (id) => {
  if (scheduleIdList.value.includes(id)) {
    // 如果数组中存在该id，则移除
    scheduleIdList.value = scheduleIdList.value.filter(item => item !== id);
  } else {
    // 否则，将其添加到数组中
    scheduleIdList.value.push(id);
  }
};

const state = reactive({})

const handleSearch = (selectedKeys, confirm, dataIndex) => {
  confirm();
  state.searchText = selectedKeys[0];
  state.searchedColumn = dataIndex;
};

const handleReset = clearFilters => {
  clearFilters({confirm: true});
  state.searchText = '';
};

const openNotification = (title, message) => {
  notification.open({
    message: title,
    description: message,
    duration: 0,
  });
};

const createSchedule = () => {
  showAddScheduleModal.value = false;
  api.post("/schedule", scheduleForm).then(res => {
    let {msg, data} = res.data
    schedules.value.push(data)
    message.success(msg)
  }).catch(err => {
    let {msg} = err.response.data
    message.error(msg)
  });
}

const deleteSchedules = async () => {
  Modal.confirm({
    title: '确认操作',
    icon: createVNode(ExclamationCircleOutlined),
    content: '确定删除这些值班计划？',
    okText: '确认',
    cancelText: '取消',
    async onOk() {
      batchEditMode.value = false; // 关闭批量编辑模式
      try {
        const deletePromises = scheduleIdList.value.map(scheduleId => {
          return api.delete("/schedule/" + scheduleId);
        });

        const results = await Promise.all(deletePromises);

        results.forEach((res, index) => {

          // 更新 schedules 只在请求成功时
          const deletedScheduleId = scheduleIdList.value[index]; // 获取当前删除的排班 ID
          schedules.value = schedules.value.filter(schedule => schedule.id !== deletedScheduleId);

        });
        message.success("已执行删除值班计划")

        // 清空选中的排班 ID
        scheduleIdList.value = [];
      } catch (err) {
        console.log(err);
        const {msg} = err.response.data;
        openNotification("删除失败", msg); // 使用通知组件
      }
    },
  });
};


</script>

<template>
  <a-layout-content style="margin: 16px;">
    <h2 style="display: flex; justify-content: space-between;">
      <span>排班管理</span>
      <span style="margin-bottom: 4px;">
        <router-link to="/"><HomeOutlined/> 首页</router-link>
      </span>
    </h2>
    <div style="padding: 8px; min-height: 500px">
      <a-row justify="end"
             v-if="['部长', '副部长', '部门负责人'].includes(userData?.position) || is_admin === true">
        <a-button v-if="!batchEditMode" type="primary" style="margin: 8px" @click="showAddScheduleModal = true" ghost>
          添加值班计划
        </a-button>
        <a-button v-if="!batchEditMode" type="primary" style="margin: 8px" @click="batchEditMode = true">批量编辑
        </a-button>
        <a-button v-if="batchEditMode" type="primary" style="margin: 8px" @click="deleteSchedules" danger>
          删除值班
        </a-button>
        <a-button v-if="batchEditMode" type="primary" style="margin: 8px" @click="goToUserSelection">批量排班</a-button>
        <a-button v-if="batchEditMode" type="primary" style="margin: 8px" @click="batchEditMode = false" ghost>
          取消选择
        </a-button>
      </a-row>


      <a-spin :spinning="loadingSchedules">
        <div class="calendar-header">
          <a-button @click="prevMonth">《</a-button>
          <a-select v-model:value="selectedYear" @change="changeYear">
            <a-select-option v-for="year in years" :key="year" :value="year">{{ year }}</a-select-option>
          </a-select>
          <a-select v-model:value="selectedMonth" @change="changeMonth">
            <a-select-option v-for="(month, index) in months" :key="index" :value="index">{{ month }}</a-select-option>
          </a-select>
          <a-button @click="nextMonth">》</a-button>
        </div>
        <div class="main-checkin-switch" style="display:flex; align-items: center; justify-content: center;">
          <a-switch v-model:checked="showMainCheckIn" style="margin-bottom: 8px;" checked-children="显示人员"
                    un-checked-children="隐藏人员"/>
          <a-switch v-model:checked="showScheduleStartTime" style="margin-bottom: 8px; margin-left: 6px;"
                    checked-children="显示值班时间" un-checked-children="隐藏计划时间"/>
        </div>
        <div class="calendar-grid">
          <div class="day-name" v-for="day in dayNames" :key="day">{{ day }}</div>
          <div class="day-cell" v-for="day in emptyDaysStart" :key="day"></div>
          <div class="day-cell"
               v-for="date in daysInMonth"
               :key="date.format('YYYY-MM-DD')"
               :class="{'red-background': isUserOnDuty(date)}"> <!-- 使用 isUserOnDuty 方法 -->
            <div class="date-number">{{ date.date() }}</div>
            <ul class="events">
              <li v-for="schedule in getScheduleData(date)" :key="schedule.id">
                <a-row justify="start">
                  <a-col v-if="batchEditMode">
                    <a-checkbox
                        :checked="scheduleIdList.includes(schedule.id)"
                        @change="handleCheckboxChange(schedule.id)"
                    >
                      <a-badge
                          :status="typeColors[schedule.schedule_type]"
                          :text="`${schedule.schedule_name} (${schedule.schedule_type})`"
                      />
                      <div v-if="showScheduleStartTime">
                        {{ schedule.schedule_start_time }}
                      </div>
                      <div v-if="showMainCheckIn">
                        <div v-for="checkIn in schedule.check_ins" :key="checkIn.id">
                          <div v-if="checkIn.is_main_check_in">
                  <span v-for="checkInUser in checkIn.check_in_users" :key="checkInUser.id">
                    {{ checkInUser.user.studentId }} - {{ checkInUser.user.name }}<br/>
                  </span>
                          </div>
                        </div>
                      </div>
                    </a-checkbox>
                  </a-col>
                  <a-col v-else>
                    <a-badge
                        :status="typeColors[schedule.schedule_type]"
                        :text="`${schedule.schedule_name} (${schedule.schedule_type})`"
                    />
                    <div v-if="showScheduleStartTime">
                      {{ schedule.schedule_start_time }}
                    </div>
                    <div v-if="showMainCheckIn">
                      <div v-for="checkIn in schedule.check_ins" :key="checkIn.id">
                        <div v-if="checkIn.is_main_check_in">
                <span v-for="checkInUser in checkIn.check_in_users" :key="checkInUser.id">
                  {{ checkInUser.user.studentId }} - {{ checkInUser.user.name }}<br/>
                </span>
                        </div>
                      </div>
                    </div>
                  </a-col>
                </a-row>
              </li>
            </ul>
          </div>
        </div>
      </a-spin>
    </div>

    <a-modal
        title="添加值班计划"
        v-model:open="showAddScheduleModal"
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
        <a-button type="primary" danger @click="createSchedule" :disabled="!scheduleForm.schedule_start_time || !scheduleForm.schedule_name">变更</a-button>
      </template>
    </a-modal>
    <!-- User Selection Modal -->
    <a-modal title="用户列表" v-model:open="visibleUsers">
      <a-card>
        <p style="font-size: 18px;">⚠ 警告：全选按钮只会选择当前页的内容！</p>
        <p style="font-size: 18px;">如需全选请使用下拉框内的“Select all data”功能。</p>
      </a-card>
      <a-table :row-selection="rowSelection" :columns="columns" :data-source="users" :row-key="record => record.id">
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
            <a-button size="small" style="width: 90px" @click="handleReset(clearFilters)">Reset</a-button>
          </div>
        </template>
        <template #bodyCell="{ column, text, record }">
          <template v-if="['studentId', 'name', 'classname', 'department', 'resident'].includes(column.dataIndex)">
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
  </a-layout-content>
</template>

<style scoped>
.calendar-header {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 16px;
}

.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  overflow-x: auto; /* 使日历可横向滚动 */
  white-space: nowrap; /* 防止内容换行 */
  max-width: 100%; /* 可选：限制最大宽度 */
}

.day-name {
  font-weight: bold;
  text-align: center;
  padding: 8px 0;
}

.day-cell {
  border: 1px solid #e8e8e8;
  padding: 8px;
  min-height: 100px;
}

.date-number {
  font-weight: bold;
  margin-bottom: 8px;
}

.events {
  list-style: none;
  padding: 0;
  margin: 0;
}

.events .ant-badge-status {
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
  width: 100%;
  font-size: 12px;
}

.red-background {
  background-color: rgba(255, 0, 0, 0.5); /* 红色半透明背景 */
  padding: 4px; /* 添加一些内边距 */
  border-radius: 3px; /* 圆角 */
}

</style>