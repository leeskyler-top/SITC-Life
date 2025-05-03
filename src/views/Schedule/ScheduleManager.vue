<template>
  <div>
    <h2 style="display: flex; justify-content: space-between;">
      <span>排班管理</span>
      <span style="margin-bottom: 4px;">
        <router-link to="/"><HomeOutlined /> 首页</router-link>
      </span>
    </h2>
    <div style="padding: 8px; background-color: #FFFFFF; min-height: 500px">
      <a-row justify="end">
        <a-button type="primary" style="margin: 8px" @click="showAddScheduleModal = true" ghost>添加排班</a-button>
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
        <div class="calendar-grid">
          <div class="day-name" v-for="day in dayNames" :key="day">{{ day }}</div>
          <div class="day-cell" v-for="day in emptyDaysStart" :key="day"></div>
          <div class="day-cell" v-for="date in daysInMonth" :key="date.format('YYYY-MM-DD')">
            <div class="date-number">{{ date.date() }}</div>
            <ul class="events">
              <li v-for="event in getScheduleData(date)" :key="event.id">
                <a-badge :status="typeColors[event.schedule_type]" :text="`${event.schedule_name} (${event.schedule_type})`" />
              </li>
            </ul>
          </div>
        </div>
      </a-spin>
    </div>

    <a-modal
        title="添加排班"
        v-model:visible="showAddScheduleModal"
        @ok="addSchedule"
        @cancel="handleCancel"
    >
      <a-form layout="vertical">
        <a-form-item label="开始时间">
          <a-date-picker
              v-model:value="scheduleStartTime"
              :disabled-date="(current) => current && current.isBefore(moment().startOf('day'))"
              format="YYYY-MM-DD HH:mm:ss"
              show-time
          />
        </a-form-item>
        <a-form-item label="排班类型">
          <a-select v-model:value="scheduleType">
            <a-select-option v-for="type in scheduleTypes" :key="type" :value="type">{{ type }}</a-select-option>
          </a-select>
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { Button, Modal, Select, DatePicker, Form, message, Spin, Badge } from 'ant-design-vue';
import { HomeOutlined } from '@ant-design/icons-vue';
import moment from 'moment';
import api from "@/api";

const loading = ref(false);
const schedules = ref([]);
const showAddScheduleModal = ref(false);
const scheduleType = ref("放学");
const scheduleStartTime = ref(null);
const loadingSchedules = ref(true);

const currentMonth = ref(moment());
const selectedYear = ref(moment().year());
const selectedMonth = ref(moment().month());

const scheduleTypes = ["放学", "午间", "晚间", "早间", "其它"];

const typeColors = {
  "放学": "warning",
  "午间": "success",
  "晚间": "processing",
  "早间": "default",
  "其它": "error"
};

const dayNames = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

const years = Array.from({ length: 50 }, (_, i) => moment().year() - 25 + i);
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

// 获取排班数据
const fetchSchedules = () => {
  loadingSchedules.value = true;
  api.get("/schedule").then((res) => {
    let { msg, data } = res.data;
    message.success(msg);
    schedules.value = data;
    loadingSchedules.value = false;
  }).catch((err) => {
    let { msg } = err.response.data;
    message.error(msg);
    loadingSchedules.value = false;
  });
};

// 添加排班
const addSchedule = async () => {
  const startTime = scheduleStartTime.value.format('YYYY-MM-DD HH:mm:ss');
  if (scheduleStartTime.value.isBefore(moment().startOf('day'))) {
    message.error('选择的开始时间不能早于当前时间');
    return;
  }

  try {
    await api.post('/schedule', {
      schedule_start_time: startTime,
      schedule_type: scheduleType.value,
    });
    message.success('排班添加成功');
    showAddScheduleModal.value = false;
    fetchSchedules();
  } catch (error) {
    message.error('添加排班失败');
  }
};

const handleCancel = () => {
  showAddScheduleModal.value = false;
  scheduleStartTime.value = null;
  scheduleType.value = "放学";
};

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
  fetchSchedules();
});
</script>

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
</style>