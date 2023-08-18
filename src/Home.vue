<script setup>
import {computed, onMounted, ref} from 'vue';
import {message} from "ant-design-vue";
import api from "@/api";
const activeKey = ref([]);
const messages = ref([]);
const spinning = ref(false)
const getMyMsg = () => {
    spinning.value = true;
    api.get("/message").then(res => {
        spinning.value = false;
        let {data} = res.data
        messages.value = data;
    }).catch(err => {
        let {msg} = err.response.data;
        spinning.value = false;
        message.error(msg);
    })
}

const readAllMsg = () => {
    api.get("/message/read/").then(res => {
        let {msg} = res.data
        messages.value.forEach(msg => {
            msg.status = "read";
        });
        message.success(msg);
    }).catch(err => {
        let {msg} = err.response.data;
        message.error(msg);
    })
}

const readMsg = (id) => {
    if (messages.value.find(msg => msg.id === id) && messages.value.find(msg => msg.id === id).status === 'unread') {
        api.get("/message/read/" + id).then(res => {
            let updatedMsg = messages.value.find(msg => msg.id === id);
            updatedMsg.status = "read";
        }).catch(err => {
            let {msg} = err.response.data;
            message.error(msg);
        })
    }
}

const currentMsgPage = ref(1);
const currentMsgPageData = computed(() => {
    const startIdx = (currentMsgPage.value - 1) * 10;
    const endIdx = startIdx + 10;
    return messages.value.slice(startIdx, endIdx);
});
onMounted(() => {
    getMyMsg()
})
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
        <a-row type="flex" justify="space-around" align="middle">
            <a-col :lg="{span: 24}" :md="{span: 24}" :sm="{span: 24}" :xs="{span: 24}">
                <a-card title="通知与公告" :lg="{margin: '16px', minHeight: '220px'}"
                        :md="{margin: '16px', minHeight: '220px'}" :sm="{margin: '0', minHeight: '220px'}"
                        :xs="{margin: '0', minHeight: '220px'}">
                    <template #extra><a @click.prevent="readAllMsg">全部已读</a></template>
                    <a-spin :spinning="spinning" tip="Loading...">
                        <a-collapse v-model:activeKey="activeKey">
                            <a-collapse-panel v-for="item in currentMsgPageData" :key="item.id" :header="item.title" :style="item.status === 'unread' ? { fontWeight: 'bold' } : {}" @click="readMsg(item.id)">
                                <p>{{ item.msg }}</p>
                            </a-collapse-panel>
                        </a-collapse>
                    </a-spin>
                    <a-pagination align="center" v-model:current="currentMsgPage" simple :total="messages.length" pageSize="10"  style="margin-top: 16px;"/>

                </a-card>
            </a-col>
        </a-row>
    </a-layout-content>


</template>

<style>

</style>