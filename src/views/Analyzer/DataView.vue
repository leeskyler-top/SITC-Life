<script setup>
import {onMounted, computed, ref, watchEffect, reactive} from 'vue';
import {message} from "ant-design-vue";
import {HomeOutlined, SearchOutlined} from '@ant-design/icons-vue';
import api from "@/api";
import ECharts from 'vue-echarts';
import {use} from 'echarts/core';
import {PieChart, BarChart, LineChart} from 'echarts/charts';
import {
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent,
  ToolboxComponent,
  DataZoomComponent
} from 'echarts/components';
import {CanvasRenderer} from 'echarts/renderers';

use([
  PieChart, BarChart, LineChart,
  TitleComponent, TooltipComponent,
  LegendComponent, CanvasRenderer,
  GridComponent, ToolboxComponent,
  DataZoomComponent
]);

// 数据状态
const myData = ref({});
const checkInData = ref({});
const spinning = ref(false);

// 加载状态分开管理
const userDataLoaded = ref(false);
const checkInDataLoaded = ref(false);

// 图表类型和选项
const chartType = ref('pie');
const genderChartOption = ref({});
const CYLCChartOption = ref({});
const departmentChartOption = ref({});
const gradeChartOption = ref({});
const departmentChartOptions = ref({barChart: null, pieChart: null});
const leaveTrendChartOption = ref({});

// 表单和标签页
const attendanceForm = reactive({
  "start_time": null,
  "end_time": null,
});
const activeKey = ref('userData');
const isShow = ref(true);

// 获取用户统计数据
const getCount = () => {
  spinning.value = true;
  api.get("/user/count").then(res => {
    myData.value = res.data.data;
    userDataLoaded.value = true;
    message.success("统计完成");
  }).catch(err => {
    message.error(err.response.data.msg);
  }).finally(() => {
    spinning.value = false;
  });
};

// 获取考勤统计数据
const attendanceStats = () => {
  if (!attendanceForm.start_time || !attendanceForm.end_time) {
    message.warning("请选择开始和结束时间");
    return;
  }

  spinning.value = true;
  checkInDataLoaded.value = false;
  api.post("/checkin/attendance/stats", attendanceForm).then(res => {
    checkInData.value = res.data.data;
    checkInDataLoaded.value = true;
    message.success(res.data.msg);
  }).catch(err => {
    message.error(err.response.data.msg);
  }).finally(() => {
    spinning.value = false;
  });
};

// 初始化 - 只加载用户数据
onMounted(() => {
  getCount();
  handleResize();
  window.addEventListener('resize', handleResize);
});

// 响应式图表配置 - 用户数据
watchEffect(() => {
  if (userDataLoaded.value) {
    // 性别数据情况
    genderChartOption.value = {
      title: {text: '性别情况', left: 'center'},
      tooltip: {trigger: 'item'},
      legend: {orient: 'vertical', left: 'left'},
      series: [{
        name: '性别',
        type: chartType.value,
        radius: chartType.value === 'pie' ? '50%' : undefined,
        data: [
          {name: '男生', value: myData.value.Male_Count || 0},
          {name: '女生', value: myData.value.Female_Count || 0}
        ],
        emphasis: {
          itemStyle: {shadowBlur: 10, shadowOffsetX: 0, shadowColor: 'rgba(0, 0, 0, 0.5)'}
        },
        label: {
          formatter: chartType.value === 'pie' ? '{b}: {d}%' : undefined
        }
      }],
      xAxis: (chartType.value === 'bar' || chartType.value === 'line') ? {
        type: 'category',
        data: ['男生', '女生']
      } : undefined,
      yAxis: (chartType.value === 'bar' || chartType.value === 'line') ? {
        type: 'value'
      } : undefined
    };

    // 团员数据情况
    CYLCChartOption.value = {
      title: {text: '团员人数情况', left: 'center'},
      tooltip: {trigger: 'item'},
      legend: {orient: 'vertical', left: 'left'},
      series: [{
        name: '团员数据情况',
        type: chartType.value,
        radius: chartType.value === 'pie' ? '50%' : undefined,
        data: [
          {name: '团员', value: myData.value.CYLC_Count || 0},
          {name: '群众', value: myData.value.PublicPeople_Count || 0}
        ],
        emphasis: {
          itemStyle: {shadowBlur: 10, shadowOffsetX: 0, shadowColor: 'rgba(0, 0, 0, 0.5)'}
        },
        label: {
          formatter: chartType.value === 'pie' ? '{b}: {d}%' : undefined
        }
      }],
      xAxis: (chartType.value === 'bar' || chartType.value === 'line') ? {
        type: 'category',
        data: ['团员', '群众']
      } : undefined,
      yAxis: (chartType.value === 'bar' || chartType.value === 'line') ? {
        type: 'value'
      } : undefined
    };

    // 系部数据情况
    departmentChartOption.value = {
      title: {
        text: '部门考勤情况',
        left: 'center',
        top: '0',  // 标题置顶
        padding: [15, 0, 0, 0]  // 标题内边距
      }, tooltip: {trigger: 'item'},
      legend: {
        orient: 'vertical', left: 'left', padding: [15, 0, 0, 0]  // 图例内边距
      },
      series: [{
        name: '系部数据情况',
        type: chartType.value,
        radius: chartType.value === 'pie' ? '50%' : undefined,
        data: [
          {name: '信息技术系', value: myData.value.Information_Count || 0},
          {name: '智能制造系', value: myData.value.Manufacturing_Count || 0},
          {name: '商务管理系', value: myData.value.Business_Count || 0},
          {name: '材料与检测系', value: myData.value.Material_Count || 0},
          {name: '公共基础部', value: myData.value.Public_Count || 0}
        ],
        emphasis: {
          itemStyle: {shadowBlur: 10, shadowOffsetX: 0, shadowColor: 'rgba(0, 0, 0, 0.5)'}
        },
        label: {
          formatter: chartType.value === 'pie' ? '{b}: {d}%' : undefined
        }
      }],
      grid: {
        top: '80',  // 主内容区域下移
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
      },
      xAxis: (chartType.value === 'bar' || chartType.value === 'line') ? {
        type: 'category',
        data: ['信息技术系', '智能制造系', '商务管理系', '材料与检测系', '公共基础部']
      } : undefined,
      yAxis: (chartType.value === 'bar' || chartType.value === 'line') ? {
        type: 'value'
      } : undefined
    };

    // 年级数据情况
    gradeChartOption.value = {
      title: {text: '年级人数情况', left: 'center'},
      tooltip: {trigger: 'item'},
      legend: {orient: 'vertical', left: 'left'},
      series: [{
        name: '年级数据情况',
        type: chartType.value,
        radius: chartType.value === 'pie' ? '50%' : undefined,
        data: myData.value.Grade_Count || [],
        emphasis: {
          itemStyle: {shadowBlur: 10, shadowOffsetX: 0, shadowColor: 'rgba(0, 0, 0, 0.5)'}
        },
        label: {
          formatter: chartType.value === 'pie' ? '{b}: {d}%' : undefined
        }
      }],
      xAxis: (chartType.value === 'bar' || chartType.value === 'line') ? {
        type: 'category',
        data: (myData.value.Grade_Count || []).map(item => item.name)
      } : undefined,
      yAxis: (chartType.value === 'bar' || chartType.value === 'line') ? {
        type: 'value'
      } : undefined
    };
  }
});

// 响应式图表配置 - 考勤数据
watchEffect(() => {
  if (checkInDataLoaded.value && checkInData.value.department_data) {
    const deptData = checkInData.value.department_data;
    const normalAttendance = (deptData.total_attendance || 0) - (deptData.total_late || 0);

    // 部门考勤柱状图
    departmentChartOptions.value.barChart = {
      title: {
        text: '部门考勤情况',
        left: 'center',
        top: '0',  // 标题置顶
        padding: [15, 0, 0, 0]  // 标题内边距
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: {type: 'shadow'}
      },
      legend: {
        data: ['正常出勤', '迟到', '缺勤', '总值班'],
        top: '30',  // 图例下移
        padding: [15, 0, 0, 0]  // 图例内边距
      },
      grid: {
        top: '80',  // 主内容区域下移
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        data: ['考勤统计']
      },
      yAxis: {type: 'value'},
      series: [
        {
          name: '正常出勤',
          type: 'bar',
          stack: 'attendance',
          data: [normalAttendance],
          itemStyle: {color: '#67C23A'}
        },
        {
          name: '迟到',
          type: 'bar',
          stack: 'attendance',
          data: [deptData.total_late || 0],
          itemStyle: {color: '#E6A23C'}
        },
        {
          name: '缺勤',
          type: 'bar',
          stack: 'attendance',
          data: [deptData.total_absenteeism || 0],
          itemStyle: {color: '#F56C6C'}
        },
        {
          name: '总值班',
          type: 'bar',
          data: [deptData.total_schedule || 0],
          itemStyle: {color: '#409EFF'}
        }
      ]
    };

    // 部门考勤饼图
    departmentChartOptions.value.pieChart = {
      title: {text: '部门考勤占比', left: 'center'},
      tooltip: {trigger: 'item'},
      legend: {orient: 'vertical', left: 'left'},
      series: [{
        name: '考勤占比',
        type: 'pie',
        radius: '50%',
        data: [
          {value: normalAttendance, name: '正常出勤'},
          {value: deptData.total_late || 0, name: '迟到'},
          {value: (deptData.total_absenteeism - deptData.total_absenteeism_status) || 0, name: '请假'},
          {value: deptData.total_absenteeism_status || 0, name: '旷班'}
        ],
        label: {
          formatter: '{b}: {c}人次 ({d}%)', // 饼图标签显示格式
          color: '#333'
        },
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        }
      }]
    };

    // 月度请假趋势图
    if (checkInData.value.monthly_leave_stats) {
      const months = checkInData.value.monthly_leave_stats.map(item => item.month);
      const sickLeaves = checkInData.value.monthly_leave_stats.map(item => item.sick_leaves || 0);
      const ordinaryLeaves = checkInData.value.monthly_leave_stats.map(item => item.ordinary_leaves || 0);
      const officialLeaves = checkInData.value.monthly_leave_stats.map(item => item.official_leaves || 0);
      const competitionLeaves = checkInData.value.monthly_leave_stats.map(item => item.competition_leaves || 0);

      // 在月度请假趋势图配置前添加z-index计算逻辑
      const seriesData = [
        {name: '病假', data: sickLeaves, color: '#F56C6C'},
        {name: '事假', data: ordinaryLeaves, color: '#409EFF'},
        {name: '公务假', data: officialLeaves, color: '#ffd240'},
        {name: '符合要求的赛事或集训', data: competitionLeaves, color: '#53ff40'}
      ];

      // 计算每个系列的总值用于排序
      const seriesWithTotals = seriesData.map(series => ({
        ...series,
        total: series.data.reduce((sum, val) => sum + val, 0)
      }));

      // 在月度请假趋势图配置中替换原来的z-index计算部分：

      // 按总值升序排序，总值相同则按原始位置升序
      seriesWithTotals.sort((a, b) => {
        if (a.total !== b.total) {
          return a.total - b.total; // 先按总值升序
        }
        return seriesData.indexOf(a) - seriesData.indexOf(b); // 总值相同则按原始位置
      });

      // 分配z-index（值越小层级越高）
      let currentZ = 4; // 初始最高层级
      let prevTotal = null;
      let prevIndex = null;
      seriesWithTotals.forEach((series, sortedIndex) => {
        // 如果总值和原始位置都相同，则保持相同z-index
        if (prevTotal !== null &&
            series.total === prevTotal &&
            seriesData.indexOf(series) === prevIndex) {
          series.z = currentZ;
        } else {
          currentZ = 4 - sortedIndex; // 递减z-index
          series.z = currentZ;
        }
        prevTotal = series.total;
        prevIndex = seriesData.indexOf(series);
      });

      function hexToRgb(hex) {
        // 移除 # 号（如果存在）
        hex = hex.replace(/^#/, '');

        // 解析RGB值
        const r = parseInt(hex.slice(0, 2), 16);
        const g = parseInt(hex.slice(2, 4), 16);
        const b = parseInt(hex.slice(4, 6), 16);

        return [r, g, b];
      }

      leaveTrendChartOption.value = {
        title: {
          text: '月度请假趋势',
          left: 'center',
          top: '0',  // 标题置顶
          padding: [15, 0, 0, 0]  // 标题内边距
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: {type: 'cross'}
        },
        legend: {
          data: ['病假', '事假', '公务假', '符合要求的赛事或集训'],
          top: '30',  // 图例下移
          padding: [15, 0, 0, 0]  // 图例内边距
        },
        grid: {
          top: '80',  // 主内容区域下移
          left: '3%',
          right: '4%',
          bottom: '12%',
          containLabel: true
        },
        dataZoom: [
          {type: 'inside', start: 0, end: 100},
          {start: 0, end: 100}
        ],
        xAxis: {
          type: 'category',
          boundaryGap: false,
          data: months
        },
        yAxis: {type: 'value'},
        series: seriesWithTotals.map(series => ({
          name: series.name,
          type: 'line',
          stack: series.name.replace(/[\s\u4e00-\u9fa5]/g, ''), // 移除中文和空格作为stack名
          areaStyle: {
            color: `rgba(${hexToRgb(series.color).join(', ')}, 0.6)`
          },
          data: series.data,
          itemStyle: {color: series.color},
          lineStyle: {
            width: series.data.some(v => v > 0) ? 2 : 0
          },
          symbol: series.data.some(v => v > 0) ? 'circle' : 'none',
          emphasis: {
            lineStyle: {width: 3},
            areaStyle: {opacity: 0.9}
          },
          z: series.z // 动态分配的z-index
        }))
      };
    }
  }
});

// 切换图表类型
const switchChartType = (type) => {
  chartType.value = type;
};

const handleTabChange = (key) => {
  activeKey.value = key;
};

const handleResize = () => {
  isShow.value = document.documentElement.clientWidth >= 979;
};

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
    title: '缺勤次数',
    dataIndex: ['absence_count'],
    width: '10%',
    customFilterDropdown: true,
    sorter: (a, b) => a.absence_count - b.absence_count,
    onFilter: (value, record) =>
        record.absence_count.toString().toLowerCase().includes(value.toLowerCase()),
  },
  {
    title: '旷班次数',
    dataIndex: ['absenteeism_status_count'],
    width: '10%',
    customFilterDropdown: true,
    sorter: (a, b) => a.absenteeism_status_count - b.absenteeism_status_count,
    onFilter: (value, record) =>
        record.absenteeism_status_count.toString().toLowerCase().includes(value.toLowerCase()),
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
    customRender: ({text}) => {
      if (text === null || text === undefined) return '-';
      return Math.round(text * 100, 3) + '%';
    },
    sorter: (a, b) => a.attendance_rate - b.attendance_rate,
    onFilter: (value, record) =>
        record.attendance_rate.toString().toLowerCase().includes(value.toLowerCase()),
  },
  {
    title: '缺勤率',
    dataIndex: ['absence_rate'],
    width: '10%',
    customFilterDropdown: true,
    customRender: ({text}) => {
      if (text === null || text === undefined) return '-';
      return (Math.round(text * 1000) / 10).toFixed(3) + '%';
    },
    sorter: (a, b) => a.absence_rate - b.absence_rate,
    onFilter: (value, record) =>
        record.absence_rate.toString().toLowerCase().includes(value.toLowerCase()),
  },
  {
    title: '旷班率',
    dataIndex: ['absenteeism_status_rate'],
    width: '10%',
    customFilterDropdown: true,
    customRender: ({text}) => {
      if (text === null || text === undefined) return '-';
      return (Math.round(text * 1000) / 10).toFixed(3) + '%';
    },
    sorter: (a, b) => a.absenteeism_status_rate - b.absenteeism_status_rate,
    onFilter: (value, record) =>
        record.absenteeism_status_rate.toString().toLowerCase().includes(value.toLowerCase()),
  },
  {
    title: '迟到率',
    dataIndex: ['late_rate'],
    width: '10%',
    customFilterDropdown: true,
    customRender: ({text}) => {
      if (text === null || text === undefined) return '-';
      return (Math.round(text * 1000) / 10).toFixed(3) + '%';
    },
    sorter: (a, b) => a.late_rate - b.late_rate,
    onFilter: (value, record) =>
        record.late_rate.toString().toLowerCase().includes(value.toLowerCase()),
  }
];

const department_columns = [
  {
    title: '缺勤率',
    dataIndex: ['absenteeism_rate'],
    width: '8%',
    customRender: ({text}) => {
      if (text === null || text === undefined) return '-';
      return (Math.round(text * 1000) / 10).toFixed(3) + '%';
    }
  },
  {
    title: '旷班率',
    dataIndex: ['absenteeism_status_rate'],
    width: '8%',
    customRender: ({text}) => {
      if (text === null || text === undefined) return '-';
      return (Math.round(text * 1000) / 10).toFixed(3) + '%';
    }
  },
  {
    title: '出勤率',
    dataIndex: ['attendance_rate'],
    width: '8%',
    customRender: ({text}) => {
      if (text === null || text === undefined) return '-';
      return (Math.round(text * 1000) / 10).toFixed(3) + '%';
    }
  },
  {
    title: '迟到率',
    dataIndex: ['late_rate'],
    width: '8%',
    customRender: ({text}) => {
      if (text === null || text === undefined) return '-';
      return (Math.round(text * 1000) / 10).toFixed(3) + '%';
    }
  },
  {
    title: '部门缺勤人次',
    dataIndex: ['total_absenteeism'],
    width: '8%',
  },
  {
    title: '部门旷班人次',
    dataIndex: ['total_absenteeism_status'],
    width: '8%',
  },
  {
    title: '部门出勤人次（含迟到）',
    dataIndex: ['total_attendance'],
    width: '10%',
  },
  {
    title: '部门迟到人次',
    dataIndex: ['total_late'],
    width: '10%',
  },
  {
    title: '总值班人次',
    dataIndex: ['total_schedule'],
    width: '10%',
  },
  {
    title: '批准的事假次数',
    dataIndex: ['total_ordinary_leaves'],
    width: '10%',
  },
  {
    title: '批准的病假次数',
    dataIndex: ['total_sick_leaves'],
    width: '10%',
  }
];

const scroll = computed(() => {
  return isShow.value ? false : {x: 1000};
});
</script>

<template>
  <a-layout-content :style="{ margin: '16px' }">
    <a-tabs v-model:activeKey="activeKey" @update:activeKey="handleTabChange" type="card">
      <!-- 人员数据标签页 -->
      <a-tab-pane key="userData" tab="人员数据">
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

          <template v-if="userDataLoaded">
            <h2 style="display: flex; justify-content: space-between;">
              <span>团员数据情况</span>
            </h2>
            <div style="width: 100%; height: 400px; display: flex; justify-content: center; align-items: center;">
              <div style="width: 80%; height: 100%;">
                <ECharts :option="CYLCChartOption" style="width: 100%; height: 100%" autoresize/>
              </div>
            </div>

            <h2 style="display: flex; justify-content: space-between;">
              <span>系部数据情况</span>
            </h2>
            <div style="width: 100%; height: 400px; display: flex; justify-content: center; align-items: center;">
              <div style="width: 80%; height: 100%;">
                <ECharts :option="departmentChartOption" style="width: 100%; height: 100%" autoresize/>
              </div>
            </div>

            <h2 style="display: flex; justify-content: space-between;">
              <span>年级数据情况</span>
            </h2>
            <div style="width: 100%; height: 400px; display: flex; justify-content: center; align-items: center;">
              <div style="width: 80%; height: 100%;">
                <ECharts :option="gradeChartOption" style="width: 100%; height: 100%" autoresize/>
              </div>
            </div>

            <h2 style="display: flex; justify-content: space-between;">
              <span>性别数据情况</span>
            </h2>
            <div style="width: 100%; height: 400px; display: flex; justify-content: center; align-items: center;">
              <div style="width: 80%; height: 100%;">
                <ECharts :option="genderChartOption" style="width: 100%; height: 100%" autoresize/>
              </div>
            </div>
          </template>
        </a-spin>
      </a-tab-pane>

      <!-- 考勤数据标签页 -->
      <a-tab-pane key="checkInData" tab="考勤数据">
        <a-row justify="space-between">
          <h2>个人数据</h2>
          <h2>
            <router-link to="/">
              <HomeOutlined/>
              首页
            </router-link>
          </h2>
        </a-row>

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
            <a-button type="primary" @click="attendanceStats"
                      :disabled="!attendanceForm.end_time || !attendanceForm.start_time">
              查询
            </a-button>
          </a-form-item>
        </a-form>

        <a-spin :spinning="spinning">
          <template v-if="checkInDataLoaded">
            <a-table :columns="columns"
                     :data-source="checkInData.user_data || []"
                     :scroll="scroll"
                     bordered
                     style="margin-top: 16px;">
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
                      <SearchOutlined/>
                    </template>
                    Search
                  </a-button>
                  <a-button size="small" style="width: 90px" @click="handleReset(clearFilters)">
                    Reset
                  </a-button>
                </div>
              </template>
            </a-table>

            <h2 style="margin-top: 24px;">部门数据</h2>
            <a-table :columns="department_columns"
                     :data-source="checkInData.department_data ? [checkInData.department_data] : []"
                     bordered
                     :scroll="scroll"
                     style="margin-bottom: 24px;">
            </a-table>

            <a-row :gutter="24">
              <a-col :span="12">
                <div style="width: 100%; height: 400px;">
                  <ECharts :option="departmentChartOptions.barChart"
                           style="width: 100%; height: 100%"
                           autoresize/>
                </div>
              </a-col>
              <a-col :span="12">
                <div style="width: 100%; height: 400px;">
                  <ECharts :option="departmentChartOptions.pieChart"
                           style="width: 100%; height: 100%"
                           autoresize/>
                </div>
              </a-col>
            </a-row>

            <h2 style="margin-top: 24px;">月度请假趋势</h2>
            <div style="width: 100%; height: 500px;">
              <ECharts :option="leaveTrendChartOption"
                       style="width: 100%; height: 100%"
                       autoresize/>
            </div>
          </template>
        </a-spin>
      </a-tab-pane>
    </a-tabs>
  </a-layout-content>
</template>

<style>
/* 可以添加一些自定义样式 */
.echarts {
  width: 100%;
  height: 100%;
}
</style>