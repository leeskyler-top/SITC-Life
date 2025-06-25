<script setup>

import {reactive, ref, onMounted, computed} from 'vue';
import {HomeOutlined, SearchOutlined} from '@ant-design/icons-vue';
import {Empty, message} from "ant-design-vue";
import api from "@/api";
import my_config from "@/my_config";

const isShow = ref(true);

function handleResize(event) {
  // 页面宽度小于525px时，不显示表格
  if (document.documentElement.clientWidth < 1180) {
    isShow.value = false;
  } else {
    isShow.value = true;
  }
}

window.addEventListener('resize', handleResize);

const state = reactive({
  searchText: '',
  searchedColumn: '',
});

const handleSearch = (selectedKeys, confirm, dataIndex) => {
  confirm();
  state.searchText = selectedKeys[0];
  state.searchedColumn = dataIndex;
};

const handleReset = clearFilters => {
  clearFilters({confirm: true});
  state.searchText = '';
};


const columns = [
  {
    title: '请假ID',
    dataIndex: 'id',
    width: '6.75%',
    customFilterDropdown: true,
    sorter: (a, b) => a.id - b.id,
    onFilter: (value, record) =>
        record.id.toString().toLowerCase().includes(value.toLowerCase()),
  },
  {
    title: '工号/学籍号',
    dataIndex: ['check_in_user', 'user', 'studentId'],
    width: '6.75%',
    customFilterDropdown: true,
    onFilter: (value, record) =>
        record.check_in_user.user.studentId.toString().toLowerCase().includes(value.toLowerCase()),
  },
  {
    title: '姓名',
    dataIndex: ['check_in_user', 'user', 'name'],
    width: '6.75%',
    customFilterDropdown: true,
    onFilter: (value, record) =>
        record.check_in_user.user.name.toString().toLowerCase().includes(value.toLowerCase()),
  },
  {
    title: '值班ID',
    dataIndex: ['check_in_user', 'schedule', 'id'],
    width: '6.75%',
    customFilterDropdown: true,
    onFilter: (value, record) =>
        record.check_in_user.schedule.id.toString().toLowerCase().includes(value.toLowerCase()),
  },
  {
    title: '值班名称',
    dataIndex: ['check_in_user', 'schedule', 'schedule_name'],
    width: '6.75%',
    customFilterDropdown: true,
    onFilter: (value, record) =>
        record.check_in_user.chedule.chedule_name.toString().toLowerCase().includes(value.toLowerCase()),
  },
  {
    title: '值班开始时间',
    dataIndex: ['check_in_user', 'schedule', 'schedule_start_time'],
    width: '6.75%',
    customFilterDropdown: true,
    onFilter: (value, record) =>
        record.check_in_user.schedule.schedule_start_time.toString().toLowerCase().includes(value.toLowerCase()),
  },
  {
    title: '值班类型',
    dataIndex: ['check_in_user', 'schedule', 'schedule_type'],
    width: '6.75%',
    customFilterDropdown: true,
    onFilter: (value, record) =>
        record.check_in_user.schedule.schedule_type.toString().toLowerCase().includes(value.toLowerCase()),
  },
  {
    title: '签到ID',
    dataIndex: ['check_in_user', 'check_in', 'id'],
    width: '6.75%',
    customFilterDropdown: true,
    onFilter: (value, record) =>
        record.check_in_user.check_in.id.toString().toLowerCase().includes(value.toLowerCase()),
  },
  {
    title: '审批状态',
    dataIndex: ['check_in_user', 'status'],
    width: '6.75%',
    customFilterDropdown: true,
    onFilter: (value, record) =>
        record.check_in_user.status.toString().toLowerCase().includes(value.toLowerCase()),
  },
  {
    title: '请假类型',
    dataIndex: 'asl_type',
    width: '6.75%',
    customFilterDropdown: true,
    onFilter: (value, record) =>
        record.asl_type.status.toString().toLowerCase().includes(value.toLowerCase()),
  },
  {
    title: '申请时间',
    dataIndex: 'created_at',
    width: '6.75%',
    customFilterDropdown: true,
    sorter: (a, b) => (new Date(a.created_at).getTime()) - (new Date(b.created_at).getTime()),
    onFilter: (value, record) =>
        record.created_at.toString().toLowerCase().includes(value.toLowerCase()),
  },
  {
    title: '操作',
    width: '6.75%',
    dataIndex: 'operation',
    fixed: 'right'
  }
];

const spinning = ref(false);

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
    if (['部长', '副部长', '部门负责人'].includes(data.position) || data.is_admin === '是') {
      listASLApplications();
    } else {
      listMyASLApplications();
    }
    userData.value = data;
  }).catch((err) => {
    let {msg} = err.response.data;
    message.error(msg);
  });
}

const applicationsData = ref([]);
const userData = ref([]);
const listASLApplications = () => {
  spinning.value = true;
  api.get("/asl").then((res) => {
    let {data} = res.data;
    applicationsData.value = data;
    spinning.value = false;
  }).catch((err) => {
    let {msg} = err.response.data;
    spinning.value = false;
    message.error(msg);
  });
}

const listMyASLApplications = () => {
  spinning.value = true;
  api.get("/asl/my").then((res) => {
    let {data} = res.data;
    applicationsData.value = data;
    spinning.value = false;
  }).catch((err) => {
    let {msg} = err.response.data;
    spinning.value = false;
    message.error(msg);
  });
}

onMounted(() => {
  handleResize();
  listMyInfo();
});

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
      <span>请假管理</span><span style=" margin-bottom: 4px;"><router-link to="/"><HomeOutlined/> 首页</router-link></span>
    </h2>

    <div style="padding: 8px; background-color: #FFFFFF">
      <a-spin :spinning="spinning" tip="Loading...">
        <a-table bordered :data-source="applicationsData" :columns="columns" :scroll="scroll">
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
            <div>
              {{ text }}
            </div>
          </template>
        </a-table>
      </a-spin>
    </div>

  </a-layout-content>
</template>

<style scoped>

</style>