<script setup>
import {computed, onMounted, ref} from 'vue';
import {Empty, message} from "ant-design-vue";
import {
  OrderedListOutlined,
  SettingOutlined,
  CloudUploadOutlined,
  UserAddOutlined,
  InfoCircleOutlined,
  CalendarOutlined, CarryOutOutlined, BankOutlined, CloudServerOutlined, PieChartOutlined, UngroupOutlined, RollbackOutlined
} from '@ant-design/icons-vue';
import api from "@/api";

const activeKey = ref([]);
const messages = ref([]);
const spinning = ref(false)
const isShow = ref(true);

const is_admin = ref(localStorage.is_admin);
const user_position = ref(localStorage.user_position);

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
  api.get("/message/read").then(res => {
    let {msg} = res.data
    messages.value.forEach(msg => {
      msg.status = true;
    });
    message.success(msg);
  }).catch(err => {
    let {msg} = err.response.data;
    message.error(msg);
  })
}

const readMsg = (id) => {
  if (messages.value.find(msg => msg.id === id) && messages.value.find(msg => msg.id === id).status === false) {
    api.get("/message/read/" + id).then(res => {
      let updatedMsg = messages.value.find(msg => msg.id === id);
      updatedMsg.status = true;
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
          <p>在值班开始前请签到。</p>
        </a-card>
      </a-col>
      <a-col :lg="{span: 8}" :md="{span: 24}" :sm="{span: 24}" :xs="{span: 24}">
        <a-card title="获取当天共享链接" :style="{minHeight: '220px'}">
          <template #extra>
            <router-link to="/cloud/manager">详情</router-link>
          </template>
          <p>值班时拍下值日扣分点。</p>
          <p>每一个班级检查完成后，请上传照片。</p>
          <p>请在值日开始前获取共享链接。</p>
        </a-card>
      </a-col>
    </a-row>
  </a-layout-content>
  <a-layout-content style="margin-top: 24px;" v-if="!isShow">
    <a-row type="flex" justify="space-around" align="middle" :gutter="[8,8]">
      <a-col :lg="{span: 8}" :md="{span: 24}" :sm="{span: 24}" :xs="{span: 24}">
        <a-card title="用户" :style="{minHeight: '220px'}">
          <a-row :gutter="[24,24]">
            <a-col align="middle" :span="is_admin === 'true' ? 6 : 24">
              <router-link to="/user/detail">
                <a-button shape="circle" size="large">
                  <template #icon>
                    <InfoCircleOutlined/>
                  </template>

                </a-button>
                <p style="padding-top: 6px; font-size: 12px; color: #333333;">用户资料</p>
              </router-link>
            </a-col>
            <a-col align="middle" :span="6" v-if="is_admin === 'true'">
              <router-link to="/user/manager">
                <a-button shape="circle" size="large">
                  <template #icon>
                    <SettingOutlined/>
                  </template>

                </a-button>
                <p style="padding-top: 6px; font-size: 12px; color: #333333;">用户管理</p>
              </router-link>
            </a-col>

            <a-col align="middle" :span="6" v-if="is_admin === 'true'">
              <router-link to="/user/add">
                <a-button shape="circle" size="large">
                  <template #icon>
                    <UserAddOutlined/>
                  </template>

                </a-button>
                <p style="padding-top: 6px; font-size: 12px; color: #333333;">添加用户</p>
              </router-link>
            </a-col>

            <a-col align="middle" :span="6" v-if="is_admin === 'true'">
              <router-link to="/user/batch">
                <a-button shape="circle" size="large">
                  <template #icon>
                    <CloudUploadOutlined/>
                  </template>

                </a-button>
                <p style="padding-top: 6px; font-size: 12px; color: #333333;">批量添加用户</p>
              </router-link>
            </a-col>
          </a-row>

        </a-card>
      </a-col>
      <a-col :lg="{span: 8}" :md="{span: 24}" :sm="{span: 24}" :xs="{span: 24}">
        <a-card title="网盘管理" :style="{minHeight: '220px'}">
          <a-row :gutter="[24,24]">
            <a-col align="middle" :span="24">
              <router-link to="/cloud/manager">
                <a-button shape="circle" size="large">
                  <template #icon>
                    <cloud-server-outlined/>
                  </template>

                </a-button>
                <p style="padding-top: 6px; font-size: 12px; color: #333333;">网盘管理</p>
              </router-link>
            </a-col>
          </a-row>
        </a-card>
      </a-col>
      <a-col :lg="{span: 8}" :md="{span: 24}" :sm="{span: 24}" :xs="{span: 24}">
        <a-card title="考勤管理" :style="{minHeight: '220px'}">
          <a-row :gutter="[24,24]">
            <a-col align="middle" :span="12">
              <router-link to="/checkin/list">
                <a-button shape="circle" size="large">
                  <template #icon>
                    <OrderedListOutlined/>
                  </template>

                </a-button>
                <p style="padding-top: 6px; font-size: 12px; color: #333333;">签到列表</p>
              </router-link>
            </a-col>
            <a-col align="middle" :span="12">
              <router-link to="/checkin/asl">
                <a-button shape="circle" size="large">
                  <template #icon>
                    <RollbackOutlined />
                  </template>

                </a-button>
                <p style="padding-top: 6px; font-size: 12px; color: #333333;">请假管理</p>
              </router-link>
            </a-col>
          </a-row>
        </a-card>
      </a-col>
      <a-col :lg="{span: 8}" :md="{span: 24}" :sm="{span: 24}" :xs="{span: 24}">
        <a-card title="值班管理" :style="{minHeight: '220px'}">
          <a-row :gutter="[24,24]">
            <a-col align="middle" :span="['部长', '副部长', '部门负责人'].includes(user_position) || is_admin === 'true' ? 8 : 12">
              <router-link to="/schedule/manager">
                <a-button shape="circle" size="large">
                  <template #icon>
                    <CalendarOutlined />
                  </template>

                </a-button>
                <p style="padding-top: 6px; font-size: 12px; color: #333333;">值班管理</p>
              </router-link>
            </a-col>
            <a-col align="middle" :span="['部长', '副部长', '部门负责人'].includes(user_position) || is_admin === 'true' ? 8 : 12" v-if="['部长', '副部长', '部门负责人'].includes(user_position) || is_admin === 'true'">
              <router-link to="/schedule/list">
                <a-button shape="circle" size="large">
                  <template #icon>
                    <UngroupOutlined />
                  </template>

                </a-button>
                <p style="padding-top: 6px; font-size: 12px; color: #333333;">值班列表</p>
              </router-link>
            </a-col>
            <a-col align="middle" :span="['部长', '副部长', '部门负责人'].includes(user_position) || is_admin === 'true' ? 8 : 12" v-if="['部长', '副部长', '部门负责人'].includes(user_position) || is_admin === 'true'">
              <router-link to="/schedule/batch">
                <a-button shape="circle" size="large">
                  <template #icon>
                    <CloudUploadOutlined />
                  </template>

                </a-button>
                <p style="padding-top: 6px; font-size: 12px; color: #333333;">批量计划</p>
              </router-link>
            </a-col>
          </a-row>
        </a-card>
      </a-col>
      <a-col v-if="is_admin === 'true' || ['部长', '副部长', '部门负责人', '汇总负责人'].includes(user_position)" :lg="{span: 8}" :md="{span: 24}" :sm="{span: 24}" :xs="{span: 24}">
        <a-card title="学期与模板配置" :style="{minHeight: '220px'}">
          <a-row :gutter="[24,24]">
            <a-col align="middle" :span="8" v-if="is_admin === 'true' || ['部长', '副部长', '部门负责人'].includes(user_position)">
              <router-link to="/semester/manager">
                <a-button shape="circle" size="large">
                  <template #icon>
                    <carry-out-outlined />
                  </template>

                </a-button>
                <p style="padding-top: 6px; font-size: 12px; color: #333333;">学期配置</p>
              </router-link>
            </a-col>
            <a-col align="middle" :span="user_position === '汇总负责人' ? 24 : 8" v-if="is_admin === 'true' || ['部长', '副部长', '部门负责人', '汇总负责人'].includes(user_position)">
              <router-link to="/template/manager">
                <a-button shape="circle" size="large">
                  <template #icon>
                    <BankOutlined/>
                  </template>

                </a-button>
                <p style="padding-top: 6px; font-size: 12px; color: #333333;">模板管理</p>
              </router-link>
            </a-col>
            <a-col align="middle" :span="8" v-if="is_admin === 'true' || ['部长', '副部长', '部门负责人'].includes(user_position)">
              <router-link to="/template/batch">
                <a-button shape="circle" size="large">
                  <template #icon>
                    <CloudUploadOutlined/>
                  </template>
                </a-button>
                <p style="padding-top: 6px; font-size: 12px; color: #333333;">模板批量上传</p>
              </router-link>
            </a-col>
          </a-row>
        </a-card>
      </a-col>
      <a-col :lg="{span: 8}" :md="{span: 24}" :sm="{span: 24}" :xs="{span: 24}" v-if="is_admin === 'true' || ['部长', '副部长', '部门负责人'].includes(user_position)">
        <a-card title="数据统计" :style="{minHeight: '220px'}">
          <a-row :gutter="[24,24]">
            <a-col align="middle" :span="24 ">
              <router-link to="/analyzer/view">
                <a-button shape="circle" size="large">
                  <template #icon>
                    <PieChartOutlined/>
                  </template>

                </a-button>
                <p style="padding-top: 6px; font-size: 12px; color: #333333;">数据统计</p>
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
              <div
                  style="height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center;">
                <a-empty :image="Empty.PRESENTED_IMAGE_SIMPLE" style="width: 100%;  "/>
              </div>
            </a-descriptions-item>
            <a-collapse v-model:activeKey="activeKey">
              <a-collapse-panel v-for="item in currentMsgPageData" :key="item.id" :header="item.msg_title"
                                :style="item.status === false && item.msg_type === 'PRIVATE' ? { fontWeight: 'bold' } : {}"
                                @click.stop="readMsg(item.id)">
                <p>{{ item.msg_text }}</p>
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