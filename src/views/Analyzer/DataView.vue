<script setup>
import {onMounted, computed, ref, watchEffect, reactive} from 'vue';
import { message } from "ant-design-vue";
import {
  HomeOutlined
} from '@ant-design/icons-vue';
import api from "@/api";
import ECharts from 'vue-echarts';
import { use } from 'echarts/core';
import { PieChart } from 'echarts/charts';
import { TitleComponent, TooltipComponent, LegendComponent } from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';

use([PieChart, TitleComponent, TooltipComponent, LegendComponent, CanvasRenderer]);

const myData = ref({});
const spinning = ref(false);
const dataLoaded = ref(false);  // 用于标志数据是否加载完成

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
    genderChartOption.value = {
      title: { text: '男女占比', left: 'center' },
      tooltip: { trigger: 'item' },
      legend: { orient: 'vertical', left: 'left' },
      series: [{
        name: '性别',
        type: 'pie',
        radius: '50%',
        data: [
          { name: '男生', value: myData.value.Male_Count },
          { name: '女生', value: myData.value.Female_Count }
        ],
        emphasis: {
          itemStyle: { shadowBlur: 10, shadowOffsetX: 0, shadowColor: 'rgba(0, 0, 0, 0.5)' }
        },
        label: {
          formatter: '{b}: {d}%'
        }
      }]
    };

    CYLCChartOption.value = {
      title: { text: '团员占比', left: 'center' },
      tooltip: { trigger: 'item' },
      legend: { orient: 'vertical', left: 'left' },
      series: [{
        name: '团员占比',
        type: 'pie',
        radius: '50%',
        data: [
          { name: '团员', value: myData.value.CYLC_Count },
          { name: '群众', value: myData.value.PublicPeople_Count }
        ],
        emphasis: {
          itemStyle: { shadowBlur: 10, shadowOffsetX: 0, shadowColor: 'rgba(0, 0, 0, 0.5)' }
        },
        label: {
          formatter: '{b}: {d}%'
        }
      }]
    };

    departmentChartOption.value = {
      title: { text: '系部占比', left: 'center' },
      tooltip: { trigger: 'item' },
      legend: { orient: 'vertical', left: 'left' },
      series: [{
        name: '系部占比',
        type: 'pie',
        radius: '50%',
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
          formatter: '{b}: {d}%'
        }
      }]
    };
  }
});

// ECharts 数据配置（用于模板绑定）
const genderChartOption = ref({});
const CYLCChartOption = ref({});
const departmentChartOption = ref({});


</script>

<template>
  <a-layout-content :style="{ margin: '16px' }">
    <a-spin :spinning="spinning">
      <h2 style="display: flex; justify-content: space-between;">
        <span>男女占比</span>
        <span>
          <router-link to="/"><HomeOutlined /> 首页</router-link>
        </span>
      </h2>

      <!-- 使用 v-if 控制图表渲染 -->
      <div v-if="dataLoaded && myData.Male_Count !== undefined && myData.Female_Count !== undefined" style="width: 100%; height: 100%; display: flex; justify-content: center; align-items: center;">
        <div style="width: 80%; height: 400px;">
          <ECharts :option="genderChartOption" style="width: 100%; height: 100%" />
        </div>
      </div>

      <h2 style="display: flex; justify-content: space-between;">
        <span>团员占比</span>
      </h2>

      <!-- 使用 v-if 控制图表渲染 -->
      <div v-if="dataLoaded && myData.CYLC_Count !== undefined && myData.PublicPeople_Count !== undefined" style="width: 100%; height: 100%; display: flex; justify-content: center; align-items: center;">
        <div style="width: 80%; height: 400px;">
          <ECharts :option="CYLCChartOption" style="width: 100%; height: 100%" />
        </div>
      </div>

      <h2 style="display: flex; justify-content: space-between;">
        <span>系部占比</span>
      </h2>

      <!-- 使用 v-if 控制图表渲染 -->
      <div v-if="dataLoaded && myData.Information_Count !== undefined" style="width: 100%; height: 100%; display: flex; justify-content: center; align-items: center;">
        <div style="width: 80%; height: 400px;">
          <ECharts :option="departmentChartOption" style="width: 100%; height: 100%" />
        </div>
      </div>
    </a-spin>
  </a-layout-content>
</template>


<style>

</style>