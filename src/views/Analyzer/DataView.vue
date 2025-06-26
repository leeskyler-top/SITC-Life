<script setup>
import {onMounted, computed, ref, watchEffect, reactive} from 'vue';
import {message} from "ant-design-vue";
import {
  HomeOutlined, SearchOutlined
} from '@ant-design/icons-vue';
import api from "@/api";
import ECharts from 'vue-echarts';
import {use} from 'echarts/core';
import {PieChart, BarChart, LineChart} from 'echarts/charts';
import {TitleComponent, TooltipComponent, LegendComponent, GridComponent} from 'echarts/components';
import {CanvasRenderer} from 'echarts/renderers';

use([PieChart, BarChart, LineChart, TitleComponent, TooltipComponent, LegendComponent, CanvasRenderer, GridComponent]);

const myData = ref({});
const checkInData = ref({});
const spinning = ref(false);
const dataLoaded = ref(false);  // 用于标志数据是否加载完成
const chartType = ref('pie'); // 默认是饼图
// Fetch statistical data
const getCount = () => {
  spinning.value = true;
  api.get("/user/count").then(res => {
    spinning.value = false;
    myData.value = res.data.data;
    dataLoaded.value = true;  // 数据加载完成
    message.success("统计完成");
  }).catch(err => {
    spinning.value = false;
    message.error(err.response.data.msg);
  });
};

onMounted(() => {
  getCount();
  handleResize();
});

// 使用 watchEffect 确保 myData 更新时重新计算 option
watchEffect(() => {
  if (dataLoaded.value) {
    // 只有数据加载完成后，才会更新图表选项

    // 性别数据情况
    genderChartOption.value = {
      title: {text: '性别情况', left: 'center'},
      tooltip: {trigger: 'item'},
      legend: {orient: 'vertical', left: 'left'},
      series: [{
        name: '性别',
        type: chartType.value,  // 根据 chartType 动态切换图表类型
        radius: chartType.value === 'pie' ? '50%' : undefined,  // 仅在饼图时设置半径
        data: [
          {name: '男生', value: myData.value.Male_Count},
          {name: '女生', value: myData.value.Female_Count}
        ],
        emphasis: {
          itemStyle: {shadowBlur: 10, shadowOffsetX: 0, shadowColor: 'rgba(0, 0, 0, 0.5)'}
        },
        label: {
          formatter: chartType.value === 'pie' ? '{b}: {d}%' : undefined  // 仅饼图显示百分比
        }
      }],
      xAxis: chartType.value === 'bar' || chartType.value === 'line' ? {
        type: 'category',
        data: ['男生', '女生']
      } : undefined,  // 仅柱状图和折线图有 xAxis
      yAxis: chartType.value === 'bar' || chartType.value === 'line' ? {
        type: 'value'
      } : undefined  // 仅柱状图和折线图有 yAxis
    };

    // 团员数据情况
    CYLCChartOption.value = {
      title: {text: '团员人数情况', left: 'center'},
      tooltip: {trigger: 'item'},
      legend: {orient: 'vertical', left: 'left'},
      series: [{
        name: '团员数据情况',
        type: chartType.value,  // 根据 chartType 动态切换图表类型
        radius: chartType.value === 'pie' ? '50%' : undefined,  // 仅在饼图时设置半径
        data: [
          {name: '团员', value: myData.value.CYLC_Count},
          {name: '群众', value: myData.value.PublicPeople_Count}
        ],
        emphasis: {
          itemStyle: {shadowBlur: 10, shadowOffsetX: 0, shadowColor: 'rgba(0, 0, 0, 0.5)'}
        },
        label: {
          formatter: chartType.value === 'pie' ? '{b}: {d}%' : undefined  // 仅饼图显示百分比
        }
      }],
      xAxis: chartType.value === 'bar' || chartType.value === 'line' ? {
        type: 'category',
        data: ['团员', '群众']
      } : undefined,  // 仅柱状图和折线图有 xAxis
      yAxis: chartType.value === 'bar' || chartType.value === 'line' ? {
        type: 'value'
      } : undefined  // 仅柱状图和折线图有 yAxis
    };

    // 系部数据情况
    departmentChartOption.value = {
      title: {text: '系部人数情况', left: 'center'},
      tooltip: {trigger: 'item'},
      legend: {orient: 'vertical', left: 'left'},
      series: [{
        name: '系部数据情况',
        type: chartType.value,  // 根据 chartType 动态切换图表类型
        radius: chartType.value === 'pie' ? '50%' : undefined,  // 仅在饼图时设置半径
        data: [
          {name: '信息技术系', value: myData.value.Information_Count},
          {name: '智能制造系', value: myData.value.Manufacturing_Count},
          {name: '商务管理系', value: myData.value.Business_Count},
          {name: '材料与检测系', value: myData.value.Material_Count},
          {name: '公共基础部', value: myData.value.Public_Count}
        ],
        emphasis: {
          itemStyle: {shadowBlur: 10, shadowOffsetX: 0, shadowColor: 'rgba(0, 0, 0, 0.5)'}
        },
        label: {
          formatter: chartType.value === 'pie' ? '{b}: {d}%' : undefined  // 仅饼图显示百分比
        }
      }],
      xAxis: chartType.value === 'bar' || chartType.value === 'line' ? {
        type: 'category',
        data: ['信息技术系', '智能制造系', '商务管理系', '材料与检测系', '公共基础部']
      } : undefined,  // 仅柱状图和折线图有 xAxis
      yAxis: chartType.value === 'bar' || chartType.value === 'line' ? {
        type: 'value'
      } : undefined  // 仅柱状图和折线图有 yAxis
    };

    // 年级数据情况
    gradeChartOption.value = {
      title: {text: '年级人数情况', left: 'center'},
      tooltip: {trigger: 'item'},
      legend: {orient: 'vertical', left: 'left'},
      series: [{
        name: '年级数据情况',
        type: chartType.value,  // 根据 chartType 动态切换图表类型
        radius: chartType.value === 'pie' ? '50%' : undefined,  // 仅在饼图时设置半径
        data: myData.value.Grade_Count,
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        }
      }],
      xAxis: chartType.value === 'bar' || chartType.value === 'line' ? {
        type: 'category',
        data: myData.value.Grade_Count.map(item => item.name) // 年级名称
      } : undefined,  // 仅柱状图和折线图有 xAxis
      yAxis: chartType.value === 'bar' || chartType.value === 'line' ? {
        type: 'value'
      } : undefined  // 仅柱状图和折线图有 yAxis
    };
  }
});

// ECharts 数据配置（用于模板绑定）
const genderChartOption = ref({});
const CYLCChartOption = ref({});
const departmentChartOption = ref({});
const gradeChartOption = ref({});

// 切换图表类型
const switchChartType = (type) => {
  chartType.value = type;
};

const activeKey = ref('userData');

const handleTabChange = (key) => {
  activeKey.value = key;
};

const handleReset = clearFilters => {
  clearFilters({confirm: true});
  state.searchText = '';
};

const handleSearch = (selectedKeys, confirm, dataIndex) => {
  confirm();
  state.searchText = selectedKeys[0];
  state.searchedColumn = dataIndex;
};

const scroll = computed(() => {
  if (isShow.value === true) {
    return false
  } else {
    return {x: 1000}
  }
})

const columns = [
  {
    title: '学籍号',
    dataIndex: ['studentId'],
    width: '8%',
    customFilterDropdown: true,
    onFilter: (value, record) =>
        record.studentId.toString().toLowerCase().includes(value.toLowerCase()),
  },
  {
    title: '系部',
    dataIndex: ['department'],
    width: '8%',
    customFilterDropdown: true,
    onFilter: (value, record) =>
        record.department.toString().toLowerCase().includes(value.toLowerCase())
  },
  {
    title: '班级',
    dataIndex: ['classname'],
    width: '8%',
    customFilterDropdown: true,
    onFilter: (value, record) =>
        record.classname.toString().toLowerCase().includes(value.toLowerCase())
  },
  {
    title: '姓名',
    dataIndex: ['name'],
    width: '8%',
    customFilterDropdown: true,
    onFilter: (value, record) =>
        record.name.toString().toLowerCase().includes(value.toLowerCase()),
  },
  {
    title: '批准的病假次数',
    dataIndex: ['approved_sick_leaves'],
    width: '10%',
    customFilterDropdown: true,
    sorter: (a, b) => a.approved_sick_leaves - b.approved_sick_leaves,
    onFilter: (value, record) =>
        record.approved_sick_leaves.toString().toLowerCase().includes(value.toLowerCase()),
  },
  {
    title: '批准的事假次数',
    dataIndex: ['approved_ordinary_leaves'],
    width: '10%',
    customFilterDropdown: true,
    sorter: (a, b) => a.approved_ordinary_leaves - b.approved_ordinary_leaves,
    onFilter: (value, record) =>
        record.approved_ordinary_leaves.toString().toLowerCase().includes(value.toLowerCase()),
  },
  {
    title: '出勤次数（含迟到）',
    dataIndex: ['attendance_count'],
    width: '10%',
    customFilterDropdown: true,
    sorter: (a, b) => a.attendance_count - b.attendance_count,
    onFilter: (value, record) =>
        record.attendance_count.toString().toLowerCase().includes(value.toLowerCase()),
  },
  {
    title: '旷班次数',
    dataIndex: ['absence_count'],
    width: '10%',
    customFilterDropdown: true,
    sorter: (a, b) => a.absence_count - b.absence_count,
    onFilter: (value, record) =>
        record.absence_count.toString().toLowerCase().includes(value.toLowerCase()),
  },
  {
    title: '迟到次数',
    dataIndex: ['late_count'],
    width: '10%',
    customFilterDropdown: true,
    sorter: (a, b) => a.late_count - b.late_count,
    onFilter: (value, record) =>
        record.late_count.toString().toLowerCase().includes(value.toLowerCase()),
  },
  {
    title: '应出勤次数',
    dataIndex: ['schedule_count'],
    width: '10%',
    customFilterDropdown: true,
    sorter: (a, b) => a.schedule_count - b.schedule_count,
    onFilter: (value, record) =>
        record.schedule_count.toString().toLowerCase().includes(value.toLowerCase()),
  },
  {
    title: '出勤率',
    dataIndex: ['attendance_rate'],
    width: '10%',
    customFilterDropdown: true,
    sorter: (a, b) => a.attendance_rate - b.attendance_rate,
    onFilter: (value, record) =>
        record.attendance_rate.toString().toLowerCase().includes(value.toLowerCase()),
  },
  {
    title: '旷班率',
    dataIndex: ['absence_rate'],
    width: '10%',
    customFilterDropdown: true,
    sorter: (a, b) => a.absence_rate - b.absence_rate,
    onFilter: (value, record) =>
        record.absence_rate.toString().toLowerCase().includes(value.toLowerCase()),
  },
];

const attendanceForm = reactive({
  "start_time": null,
  "end_time": null,
})

const attendanceStats = () => {
  spinning.value = true;
  api.post("/checkin/attendance/stats", attendanceForm).then(res => {
    let {msg, data} = res.data;
    checkInData.value = data;
    spinning.value = false;
    message.success(msg)
  }).catch(err => {
    let {msg} = err.response.data;
    spinning.value = false;
    message.error(msg)
  })
}

const isShow = ref(true);

function handleResize(event) {
  // 页面宽度小于525px时，不显示表格
  if (document.documentElement.clientWidth < 979) {
    isShow.value = false;
  } else {
    isShow.value = true;
  }
}


</script>

<template>
  <a-layout-content :style="{ margin: '16px' }">
    <a-tabs v-model:activeKey="activeKey" @update:activeKey="handleTabChange" type="card">
      <a-tab-pane key="userData"  tab="人员数据">
        <a-spin :spinning="spinning">
          <div style="margin-bottom: 16px; width: 100%">
            <a-row justify="space-between">
              <div>
                <a-button @click="switchChartType('pie')" type="primary" ghost>饼图</a-button>
                <a-button style="margin-left: 8px;" @click="switchChartType('bar')" type="primary" ghost>柱状图
                </a-button>
              </div>
              <h2>
                <router-link to="/">
                  <HomeOutlined/>
                  首页
                </router-link>
              </h2>
            </a-row>
          </div>


          <h2 style="display: flex; justify-content: space-between;">
            <span>团员数据情况</span>
          </h2>

          <!-- 使用 v-if 控制图表渲染 -->
          <div v-if="dataLoaded && myData.CYLC_Count !== undefined && myData.PublicPeople_Count !== undefined"
               style="width: 100%; height: 100%; display: flex; justify-content: center; align-items: center;">
            <div style="width: 80%; height: 400px;">
              <ECharts :option="CYLCChartOption" style="width: 100%; height: 100%"/>
            </div>
          </div>

          <h2 style="display: flex; justify-content: space-between;">
            <span>系部数据情况</span>
          </h2>

          <!-- 使用 v-if 控制图表渲染 -->
          <div v-if="dataLoaded && myData.Information_Count !== undefined"
               style="width: 100%; height: 100%; display: flex; justify-content: center; align-items: center;">
            <div style="width: 80%; height: 400px;">
              <ECharts :option="departmentChartOption" style="width: 100%; height: 100%"/>
            </div>
          </div>

          <h2 style="display: flex; justify-content: space-between;">
            <span>年级数据情况</span>
          </h2>
          <div v-if="dataLoaded && myData.Grade_Count !== undefined"
               style="width: 100%; height: 100%; display: flex; justify-content: center; align-items: center;">
            <div style="width: 80%; height: 400px;">
              <ECharts :option="gradeChartOption" style="width: 100%; height: 100%"/>
            </div>
          </div>

          <h2 style="display: flex; justify-content: space-between;">
            <span>性别数据情况</span>
          </h2>

          <!-- 使用 v-if 控制图表渲染 -->
          <div v-if="dataLoaded && myData.Male_Count !== undefined && myData.Female_Count !== undefined"
               style="width: 100%; height: 100%; display: flex; justify-content: center; align-items: center;">
            <div style="width: 80%; height: 400px;">
              <ECharts :option="genderChartOption" style="width: 100%; height: 100%"/>
            </div>
          </div>
        </a-spin>
      </a-tab-pane>
      <a-tab-pane key="checkInData"  tab="考勤数据">
        <a-form layout="inline">
          <a-form-item label="开始时间">
            <a-date-picker v-model:value="attendanceForm.start_time"
                           format="YYYY-MM-DD HH:mm:ss"
                           show-time
                           valueFormat="YYYY-MM-DD HH:mm:ss"/>
          </a-form-item>
          <a-form-item label="结束时间">
            <a-date-picker v-model:value="attendanceForm.end_time"
                           format="YYYY-MM-DD HH:mm:ss"
                           show-time
                           valueFormat="YYYY-MM-DD HH:mm:ss"/>
          </a-form-item>
          <a-form-item>
            <a-button type="primary" @click="attendanceStats">查询</a-button>
          </a-form-item>
        </a-form>

        <a-spin :spinning="spinning">
          <a-table :columns="columns" :data-source="checkInData.user_data" :scroll="scroll" bordered>
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
                  v-if="['studentId','department','classname','name','approved_sick_leaves','approved_competition_leaves','approved_ordinary_leaves','attendance_count','absence_count', 'late_count', 'schedule_count', 'attendance_rate', 'absence_rate'].includes(column.dataIndex)">
                <div>
                  {{ text }}
                </div>
              </template>
            </template>
          </a-table>

        </a-spin>
      </a-tab-pane>
    </a-tabs>
  </a-layout-content>
</template>


<style>

</style>