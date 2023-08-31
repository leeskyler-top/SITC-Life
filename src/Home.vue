<script setup>
import {computed, onMounted, ref} from 'vue';
import {Empty, message} from "ant-design-vue";
import {AuditOutlined, AppstoreAddOutlined, OrderedListOutlined, UnorderedListOutlined, SettingOutlined, ProfileOutlined, ContainerOutlined, CloudUploadOutlined, UserAddOutlined, InfoCircleOutlined, HistoryOutlined} from '@ant-design/icons-vue';
import api from "@/api";

const activeKey = ref([]);
const messages = ref([]);
const spinning = ref(false)
const isShow = ref(true);

const is_admin = ref(localStorage.is_admin);

function handleResize(event) {
    // 页面宽度小于525px时，不显示表格
    if (document.documentElement.clientWidth < 720) {
        isShow.value = false;
    } else {
        isShow.value = true;
    }
}

onMounted(() => {
    handleResize();
});

window.addEventListener('resize', handleResize);

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
            :style="{margin: '16px'}" v-if="isShow"
    >
        <h2>
            工作台
        </h2>
        <a-row type="flex" justify="space-around" align="middle" :gutter="[8,8]">
            <a-col :lg="{span: 8}" :md="{span: 24}" :sm="{span: 24}" :xs="{span: 24}">
                <a-card title="用户资料" :style="{minHeight: '220px'}">
                    <template #extra>
                        <router-link to="/user/detail">详情</router-link>
                    </template>
                    <p>查看账户详细信息。</p>
                    <p>修改账户密码。</p>
                </a-card>
            </a-col>
            <a-col :lg="{span: 8}" :md="{span: 24}" :sm="{span: 24}" :xs="{span: 24}">
                <a-card title="签到打卡" :style="{minHeight: '220px'}">
                    <template #extra>
                        <router-link to="/checkin/list">详情</router-link>
                    </template>
                    <p>选择相应活动进行打卡。</p>
                    <p>打卡时请按照情况填写表单。</p>
                </a-card>
            </a-col>
            <a-col :lg="{span: 8}" :md="{span: 24}" :sm="{span: 24}" :xs="{span: 24}">
                <a-card title="设备借用与归还" :style="{minHeight: '220px'}">
                    <template #extra>
                        <router-link to="/equipment/my">详情</router-link>
                    </template>
                    <p>需要使用设备，请发起申请。</p>
                    <p>设备使用完毕请及时归还。</p>
                    <p>损坏、丢失需要上报！</p>
                </a-card>
            </a-col>
        </a-row>
    </a-layout-content>
    <a-layout-content style="margin-top: 24px;" v-if="!isShow">
        <a-row type="flex" justify="space-around" align="middle" :gutter="[8,8]">
            <a-col :lg="{span: 8}" :md="{span: 24}" :sm="{span: 24}" :xs="{span: 24}">
                <a-card title="用户" :style="{minHeight: '220px'}">
                    <a-row :gutter="[24,24]">
                        <a-col align="middle" :span="is_admin === '1' ? 6 : 24">
                            <router-link to="/user/detail">
                                <a-button shape="circle" size="large">
                                    <template #icon>
                                        <InfoCircleOutlined />
                                    </template>

                                </a-button>
                                <p style="padding-top: 6px; font-size: 12px; color: #333333;">用户资料</p>
                            </router-link>
                        </a-col>
                        <a-col align="middle" :span="6" v-if="is_admin === '1'">
                            <router-link to="/user/manager">
                                <a-button shape="circle" size="large">
                                    <template #icon>
                                        <SettingOutlined />
                                    </template>

                                </a-button>
                                <p style="padding-top: 6px; font-size: 12px; color: #333333;">用户管理</p>
                            </router-link>
                        </a-col>

                        <a-col align="middle" :span="6" v-if="is_admin === '1'">
                            <router-link to="/user/add">
                                <a-button shape="circle" size="large">
                                    <template #icon>
                                        <UserAddOutlined />
                                    </template>

                                </a-button>
                                <p style="padding-top: 6px; font-size: 12px; color: #333333;">添加用户</p>
                            </router-link>
                        </a-col>

                        <a-col align="middle" :span="6" v-if="is_admin === '1'">
                            <router-link to="/user/batch">
                                <a-button shape="circle" size="large">
                                    <template #icon>
                                        <CloudUploadOutlined />
                                    </template>

                                </a-button>
                                <p style="padding-top: 6px; font-size: 12px; color: #333333;">批量添加用户</p>
                            </router-link>
                        </a-col>
                    </a-row>

                </a-card>
            </a-col>
            <a-col :lg="{span: 8}" :md="{span: 24}" :sm="{span: 24}" :xs="{span: 24}">
                <a-card title="签到打卡" :style="{minHeight: '220px'}">
                    <a-row :gutter="[24,24]">
                        <a-col align="middle" :span="is_admin === '1' ? 12 : 24 ">
                            <router-link to="/checkin/list">
                                <a-button shape="circle" size="large">
                                    <template #icon>
                                        <OrderedListOutlined />
                                    </template>

                                </a-button>
                                <p style="padding-top: 6px; font-size: 12px; color: #333333;">签到列表</p>
                            </router-link>
                        </a-col>
                        <a-col align="middle" :span="12" v-if="is_admin === '1'">
                            <router-link to="/checkin/manager">
                                <a-button shape="circle" size="large">
                                    <template #icon>
                                        <SettingOutlined />
                                    </template>

                                </a-button>
                                <p style="padding-top: 6px; font-size: 12px; color: #333333;">签到管理</p>
                            </router-link>
                        </a-col>
                    </a-row>
                </a-card>
            </a-col>
            <a-col :lg="{span: 8}" :md="{span: 24}" :sm="{span: 24}" :xs="{span: 24}">
                <a-card title="设备" :style="{minHeight: '220px'}">
                    <a-row :gutter="[24,24]">
                        <a-col align="middle" :span="is_admin === '1' ? 6 : 12">
                            <router-link to="/equipment/my">
                                <a-button shape="circle" size="large">
                                    <template #icon>
                                        <ProfileOutlined />
                                    </template>

                                </a-button>
                                <p style="padding-top: 6px; font-size: 12px; color: #333333;">我的设备</p>
                            </router-link>
                        </a-col>
                        <a-col align="middle" :span="is_admin === '1' ? 6 : 12">
                            <router-link to="/equipment/apply">
                                <a-button shape="circle" size="large">
                                    <template #icon>
                                        <ContainerOutlined />
                                    </template>

                                </a-button>
                                <p style="padding-top: 6px; font-size: 12px; color: #333333;">设备借用申请</p>
                            </router-link>
                        </a-col>
                        <a-col align="middle" :span="6" v-if="is_admin === '1'">
                            <router-link to="/equipment/manager">
                                <a-button shape="circle" size="large">
                                    <template #icon>
                                        <SettingOutlined />
                                    </template>

                                </a-button>
                                <p style="padding-top: 6px; font-size: 12px; color: #333333;">设备管理</p>
                            </router-link>
                        </a-col>
                        <a-col align="middle" :span="6" v-if="is_admin === '1'">
                            <router-link to="/equipment/audit">
                                <a-button shape="circle" size="large">
                                    <template #icon>
                                        <AuditOutlined></AuditOutlined>
                                    </template>

                                </a-button>
                                <p style="padding-top: 6px; font-size: 12px; color: #333333;">设备申请审核</p>
                            </router-link>
                        </a-col>
                        <a-col align="middle" :span="6">
                            <router-link to="/equipment/history" v-if="is_admin === '1'">
                                <a-button shape="circle" size="large">
                                    <template #icon>
                                        <UnorderedListOutlined />
                                    </template>

                                </a-button>
                                <p style="padding-top: 6px; font-size: 12px; color: #333333;">设备出借记录</p>
                            </router-link>
                        </a-col>
                        <a-col align="middle" :span="6">
                            <router-link to="/equipment/add" v-if="is_admin === '1'">
                                <a-button shape="circle" size="large">
                                    <template #icon>
                                        <AppstoreAddOutlined />
                                    </template>

                                </a-button>
                                <p style="padding-top: 6px; font-size: 12px; color: #333333;">添加设备</p>
                            </router-link>
                        </a-col>
                        <a-col align="middle" :span="6">
                            <router-link to="/equipment/batch" v-if="is_admin === '1'">
                                <a-button shape="circle" size="large">
                                    <template #icon>
                                        <CloudUploadOutlined />
                                    </template>

                                </a-button>
                                <p style="padding-top: 6px; font-size: 12px; color: #333333;">批量添加设备</p>
                            </router-link>
                        </a-col>
                    </a-row>
                </a-card>
            </a-col>
            <a-col :lg="{span: 8}" :md="{span: 24}" :sm="{span: 24}" :xs="{span: 24}">
                <a-card title="活动" :style="{minHeight: '220px'}">
                    <a-row :gutter="[24,24]">
                        <a-col align="middle" :span="is_admin === '1' ? 6 : 24">
                            <router-link to="/activity/list">
                                <a-button shape="circle" size="large">
                                    <template #icon>
                                        <OrderedListOutlined />
                                    </template>

                                </a-button>
                                <p style="padding-top: 6px; font-size: 12px; color: #333333;">活动列表</p>
                            </router-link>
                        </a-col>
                        <a-col align="middle" :span="6">
                            <router-link to="/activity/manager" v-if="is_admin === '1'">
                                <a-button shape="circle" size="large">
                                    <template #icon>
                                        <SettingOutlined />
                                    </template>

                                </a-button>
                                <p style="padding-top: 6px; font-size: 12px; color: #333333;">活动管理</p>
                            </router-link>
                        </a-col>
                        <a-col align="middle" :span="6" v-if="is_admin === '1'">
                            <router-link to="/activity/add">
                                <a-button shape="circle" size="large">
                                    <template #icon>
                                        <AppstoreAddOutlined />
                                    </template>

                                </a-button>
                                <p style="padding-top: 6px; font-size: 12px; color: #333333;">活动添加</p>
                            </router-link>
                        </a-col>
                        <a-col align="middle" :span="6" v-if="is_admin === '1'">
                            <router-link to="/activity/enrollment">
                                <a-button shape="circle" size="large">
                                    <template #icon>
                                        <AuditOutlined />
                                    </template>

                                </a-button>
                                <p style="padding-top: 6px; font-size: 12px; color: #333333;">报名审批</p>
                            </router-link>
                        </a-col>
                    </a-row>
                </a-card>
            </a-col>
            <a-col v-if="is_admin === '1'" :lg="{span: 8}" :md="{span: 24}" :sm="{span: 24}" :xs="{span: 24}">
                <a-card title="安全审计" :style="{minHeight: '220px'}">
                    <a-row :gutter="[24,24]">
                        <a-col align="middle" :span="24">
                            <router-link to="/security/history">
                                <a-button shape="circle" size="large">
                                    <template #icon>
                                        <HistoryOutlined />
                                    </template>

                                </a-button>
                                <p style="padding-top: 6px; font-size: 12px; color: #333333;">API访问历史</p>
                            </router-link>
                        </a-col>
                    </a-row>
                </a-card>
            </a-col>
        </a-row>
    </a-layout-content>
    <a-layout-content :style="isShow ? {margin: '16px'} : {margin: '4px'}">
        <a-row type="flex" justify="space-around" align="middle">
            <a-col :lg="{span: 24}" :md="{span: 24}" :sm="{span: 24}" :xs="{span: 24}">
                <a-card title="通知与公告" :lg="{margin: '16px', minHeight: '220px'}"
                        :md="{margin: '16px', minHeight: '220px'}" :sm="{margin: '0', minHeight: '220px'}"
                        :xs="{margin: '0', minHeight: '220px'}">
                    <template #extra><a @click.prevent="readAllMsg">全部已读</a></template>
                    <a-spin :spinning="spinning" tip="Loading...">
                        <a-descriptions-item v-if="messages.length === 0">
                            <div style="height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center;">
                                <a-empty :image="Empty.PRESENTED_IMAGE_SIMPLE" style="width: 100%;  "/>
                            </div>
                        </a-descriptions-item>
                        <a-collapse v-model:activeKey="activeKey">
                            <a-collapse-panel v-for="item in currentMsgPageData" :key="item.id" :header="item.title"
                                              :style="item.status === 'unread' ? { fontWeight: 'bold' } : {}"
                                              @click="readMsg(item.id)">
                                <p>{{ item.msg }}</p>
                            </a-collapse-panel>
                        </a-collapse>
                    </a-spin>
                    <a-pagination align="center" v-model:current="currentMsgPage" simple :total="messages.length"
                                  pageSize="10" :disabled="messages.length === 0" style="margin-top: 16px;"/>

                </a-card>
            </a-col>
        </a-row>
    </a-layout-content>


</template>

<style>

</style>