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

onMounted(() => {
  handleResize();
  listApiHistories();
});

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
    title: '历史ID',
    dataIndex: 'id',
    width: '5%',
    customFilterDropdown: true,
    sorter: (a, b) => a.id - b.id,
    onFilter: (value, record) =>
        record.id.toString().toLowerCase().includes(value.toLowerCase()),
  },
  {
    title: '工号/学籍号',
    dataIndex: ['user', 'studentId'],
    width: '8%',
    customFilterDropdown: true,
    onFilter: (value, record) =>
        record.user.studentId.toString().toLowerCase().includes(value.toLowerCase()),
  },
  {
    title: '系部',
    dataIndex: ['user', 'department'],
    width: '8%',
    customFilterDropdown: true,
    onFilter: (value, record) =>
        record.user.department.toString().toLowerCase().includes(value.toLowerCase()),
  },
  {
    title: '班级',
    dataIndex: ['user', 'classname'],
    width: '5%',
    customFilterDropdown: true,
    onFilter: (value, record) =>
        record.user.classname.toString().toLowerCase().includes(value.toLowerCase()),
  },
  {
    title: '姓名',
    dataIndex: ['user', 'name'],
    width: '6%',
    customFilterDropdown: true,
    onFilter: (value, record) =>
        record.user.name.toString().toLowerCase().includes(value.toLowerCase()),
  },
  {
    title: '访问URL',
    dataIndex: 'url',
    width: '25%',
    customFilterDropdown: true,
    onFilter: (value, record) =>
        record.url.toString().toLowerCase().includes(value.toLowerCase()),
  },
  {
    title: '方式',
    dataIndex: 'method',
    width: '5%',
    customFilterDropdown: true,
    onFilter: (value, record) =>
        record.method.toString().toLowerCase().includes(value.toLowerCase()),
  },
  {
    title: '访问时间',
    dataIndex: 'created_at',
    width: '12%',
    customFilterDropdown: true,
    onFilter: (value, record) =>
        record.created_at.toString().toLowerCase().includes(value.toLowerCase()),
  },
];

const spinning = ref(false);

const apiData = ref([]);
const listApiHistories = () => {
  spinning.value = true;
  api.get("/security-history").then((res) => {
    let {data} = res.data;
    apiData.value = data;
    spinning.value = false;
  }).catch((err) => {
    let {msg} = err.response.data;
    spinning.value = false;
    message.error(msg);
  });
}

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
      <span>安全审计-接口访问历史</span><span style=" margin-bottom: 4px;"><router-link to="/"><HomeOutlined/> 首页</router-link></span>
    </h2>

    <div style="padding: 8px; background-color: #FFFFFF">
      <a-spin :spinning="spinning" tip="Loading...">
        <a-table bordered :data-source="apiData" :columns="columns" :scroll="scroll">
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