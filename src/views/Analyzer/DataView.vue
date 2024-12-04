<script setup>
import {onMounted, computed, ref, watchEffect, reactive} from 'vue';
import {message} from "ant-design-vue";
import {
  HomeOutlined
} from '@ant-design/icons-vue';
import api from "@/api";
import ECharts from 'vue-echarts';
import {use} from 'echarts/core';
import {PieChart, BarChart, LineChart} from 'echarts/charts';
import {TitleComponent, TooltipComponent, LegendComponent, GridComponent } from 'echarts/components';
import {CanvasRenderer} from 'echarts/renderers';

use([PieChart, BarChart, LineChart, TitleComponent, TooltipComponent, LegendComponent, CanvasRenderer, GridComponent ]);

const myData = ref({});
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
});

// 使用 watchEffect 确保 myData 更新时重新计算 option
watchEffect(() => {
  if (dataLoaded.value) {
    // 只有数据加载完成后，才会更新图表选项

    // 性别数据情况
    genderChartOption.value = {
      title: { text: '性别情况', left: 'center' },
      tooltip: { trigger: 'item' },
      legend: { orient: 'vertical', left: 'left' },
      series: [{
        name: '性别',
        type: chartType.value,  // 根据 chartType 动态切换图表类型
        radius: chartType.value === 'pie' ? '50%' : undefined,  // 仅在饼图时设置半径
        data: [
          { name: '男生', value: myData.value.Male_Count },
          { name: '女生', value: myData.value.Female_Count }
        ],
        emphasis: {
          itemStyle: { shadowBlur: 10, shadowOffsetX: 0, shadowColor: 'rgba(0, 0, 0, 0.5)' }
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
      title: { text: '团员人数情况', left: 'center' },
      tooltip: { trigger: 'item' },
      legend: { orient: 'vertical', left: 'left' },
      series: [{
        name: '团员数据情况',
        type: chartType.value,  // 根据 chartType 动态切换图表类型
        radius: chartType.value === 'pie' ? '50%' : undefined,  // 仅在饼图时设置半径
        data: [
          { name: '团员', value: myData.value.CYLC_Count },
          { name: '群众', value: myData.value.PublicPeople_Count }
        ],
        emphasis: {
          itemStyle: { shadowBlur: 10, shadowOffsetX: 0, shadowColor: 'rgba(0, 0, 0, 0.5)' }
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
      title: { text: '系部人数情况', left: 'center' },
      tooltip: { trigger: 'item' },
      legend: { orient: 'vertical', left: 'left' },
      series: [{
        name: '系部数据情况',
        type: chartType.value,  // 根据 chartType 动态切换图表类型
        radius: chartType.value === 'pie' ? '50%' : undefined,  // 仅在饼图时设置半径
        data: [
          { name: '信息技术系', value: myData.value.Information_Count },
          { name: '智能制造系', value: myData.value.Manufacting_Count },
          { name: '商务管理系', value: myData.value.Bussiness_Count },
          { name: '材料与检测系', value: myData.value.Material_Count },
          { name: '公共基础部', value: myData.value.Public_Count }
        ],
        emphasis: {
          itemStyle: { shadowBlur: 10, shadowOffsetX: 0, shadowColor: 'rgba(0, 0, 0, 0.5)' }
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
      title: { text: '年级人数情况', left: 'center' },
      tooltip: { trigger: 'item' },
      legend: { orient: 'vertical', left: 'left' },
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

</script>

<template>
  <a-layout-content :style="{ margin: '16px' }">
    <a-spin :spinning="spinning">
      <div style="margin-bottom: 16px; width: 100%">
        <a-row justify="space-between">
          <div>
            <a-button @click="switchChartType('pie')" type="primary" ghost>饼图</a-button>
            <a-button style="margin-left: 8px;" @click="switchChartType('bar')" type="primary" ghost>柱状图</a-button>
            <a-button style="margin-left: 8px;" @click="switchChartType('line')" type="primary" ghost>折线图</a-button>
          </div>
          <h2>
            <router-link to="/"><HomeOutlined/> 首页</router-link>
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
  </a-layout-content>
</template>


<style>

</style>