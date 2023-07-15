<script setup>
import { ref } from 'vue';
const activeKey = ref([]);
const text = `A dog is a type of domesticated animal.Known for its loyalty and faithfulness,it can be found as a welcome guest in many households across the world.`;
</script>

<template>

    <a-layout-content
            :style="{margin: '16px'}"
    >
        <h2>
            工作台
        </h2>
        <a-row type="flex" justify="space-around" align="middle" :gutter="[8,8]">
            <a-col :lg="{span: 8}" :md="{span: 24}" :sm="{span: 24}" :xs="{span: 24}">
                <a-card title="用户资料" :style="{minHeight: '220px'}">
                    <template #extra><router-link to="/user/detail">详情</router-link></template>
                    <p>查看账户详细信息。</p>
                    <p>修改账户密码。</p>
                </a-card>
            </a-col>
            <a-col :lg="{span: 8}" :md="{span: 24}" :sm="{span: 24}" :xs="{span: 24}">
                <a-card title="签到打卡" :style="{minHeight: '220px'}">
                    <template #extra><router-link to="/checkin/list">详情</router-link></template>
                    <p>选择相应活动进行打卡。</p>
                    <p>打卡时请按照情况填写表单。</p>
                </a-card>
            </a-col>
            <a-col :lg="{span: 8}" :md="{span: 24}" :sm="{span: 24}" :xs="{span: 24}">
                <a-card title="设备借用与归还" :style="{minHeight: '220px'}">
                    <template #extra><router-link to="/equipment/my">详情</router-link></template>
                    <p>需要使用设备，请发起申请。</p>
                    <p>设备使用完毕请及时归还。</p>
                    <p>损坏、丢失需要上报！</p>
                </a-card>
            </a-col>
        </a-row>
    </a-layout-content>
    <a-layout-content :style="{margin: '16px'}">
        <h2>
            通知
        </h2>
        <a-row type="flex" justify="space-around" align="middle">
            <a-col :lg="{span: 24}" :md="{span: 24}" :sm="{span: 24}" :xs="{span: 24}">
                <a-card title="活动招募" :lg="{margin: '16px', minHeight: '220px'}"
                        :md="{margin: '16px', minHeight: '220px'}" :sm="{margin: '0', minHeight: '220px'}"
                        :xs="{margin: '0', minHeight: '220px'}">
                    <template #extra><router-link to="/activity/list">more</router-link></template>
                    <a-collapse v-model:activeKey="activeKey">
                        <a-collapse-panel key="1" header="This is panel header 1">
                            <p>{{ text }}</p>
                        </a-collapse-panel>
                        <a-collapse-panel key="2" header="This is panel header 2">
                            <p>{{ text }}</p>
                        </a-collapse-panel>
                        <a-collapse-panel key="3" header="This is panel header 3">
                            <p>{{ text }}</p>
                        </a-collapse-panel>
                        <a-collapse-panel key="4" header="This is panel header 4">
                            <p>{{ text }}</p>
                        </a-collapse-panel>
                        <a-collapse-panel key="5" header="This is panel header 5">
                            <p>{{ text }}</p>
                        </a-collapse-panel>
                    </a-collapse>
                    <a-pagination align="center" v-model:current="current" simple :total="50" pageSize="5"  style="margin-top: 16px;"/>
                </a-card>
            </a-col>
        </a-row>
    </a-layout-content>


</template>

<style>

</style>