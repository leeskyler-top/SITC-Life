<script setup>
import {onMounted, reactive, ref} from 'vue';
import {
    InfoCircleOutlined,
    LockOutlined
} from '@ant-design/icons-vue';
import api from "@/api";
import {message} from "ant-design-vue";

const formState = reactive({
    origin_password: '',
    new_password: '',
    repeat_password: '',
});
let validatePass = async (_rule, value) => {
    if (value === '') {
        return Promise.reject('请再次输入密码');
    } else if (value !== formState.new_password) {
        return Promise.reject("两次密码不一致!");
    } else {
        return Promise.resolve();
    }
};
const rules = {
    origin_password: [{
        required: true,
        message: "请输入旧密码",
        trigger: 'change',
    }],
    new_password: [{
        required: true,
        message: "请输入新密码",
        trigger: 'change',
    }],
    repeat_password: [{
        required: true,
        validator: validatePass,
        trigger: 'change',
    }],
};
const layout = {
    labelCol: {
        span: 4,
    },
    wrapperCol: {
        span: 14,
    },
};
const menu = ref("myInfo");

function changeMenu(op) {
    menu.value = op;
}

const myData = ref({});
const spinning = ref(false);
const listMyInfo = () => {
    spinning.value = true;
    api.get("/user/my").then((res) => {
        spinning.value = false;
        let {data} = res.data;
        if (data.is_admin === '1') {
            data.is_admin = '管理员';
        } else {
            data.is_admin = '用户';
        }
        myData.value = data;
    }).catch((err) => {
        let {msg} = err.response.data;
        message.error(msg);
    });
}
const loading = ref(false);
const changePwd = () => {
    loading.value = true;
    api.post("/user/pwd/change", formState).then((res) => {
        loading.value = false;
        let {msg} = res.data;
        message.success(msg);
    }).catch((err) => {
        let {msg} = err.response.data;
        loading.value = false;
        message.error(msg);
    });
}

onMounted(() => {
    listMyInfo();
});


</script>
<template>
    <a-layout-content
            :style="{margin: '16px'}"
    >
        <h2>
            我的资料

        </h2>
        <a-row :style="{ background: '#fff', padding: '24px'}">

            <a-col :lg="{span: 8}" :md="{span: 24}" :sm="{span: 24}" :xs="{span: 24}" style="max-width: 200px;">
                <a-menu>
                    <a-menu-item key="1" @click="changeMenu('myInfo')">
                        <template #icon>
                            <info-circle-outlined/>
                        </template>
                        账户信息
                    </a-menu-item>
                    <a-menu-item key="2" @click="changeMenu('changePwd')">
                        <template #icon>
                            <lock-outlined/>
                        </template>
                        密码变更
                    </a-menu-item>
                </a-menu>
            </a-col>

            <a-col v-if="menu === 'myInfo'" :lg="{span: 16}" :md="{span: 24}" :sm="{span: 24}" :xs="{span: 24}"
                   style=" padding: 0 16px;">
                <a-spin :spinning="spinning" tip="Loading...">
                    <a-descriptions title="用户详情" bordered>
                        <a-descriptions-item label="姓名">{{ myData.name }}</a-descriptions-item>
                        <a-descriptions-item label="工号/学籍号">{{ myData.uid }}</a-descriptions-item>
                        <a-descriptions-item label="系部">{{ myData.department }}</a-descriptions-item>
                        <a-descriptions-item label="班级">{{ myData.classname }}</a-descriptions-item>
                        <a-descriptions-item label="账户类型">{{ myData.is_admin }}</a-descriptions-item>
                        <a-descriptions-item label="创建时间">{{ myData.created_at }}</a-descriptions-item>
                        <a-descriptions-item label="备注" :span="2">{{ myData.note }}</a-descriptions-item>
                    </a-descriptions>
                </a-spin>
            </a-col>
            <a-col v-if="menu === 'changePwd'" :lg="{span: 16}" :md="{span: 24}" :sm="{span: 24}" :xs="{span: 24}"
                   style=" padding: 0 16px;">
                <h2 class="ant-descriptions-title"> 密码更改 </h2>
                <a-form
                        name="custom-validation"
                        :model="formState"
                        :rules="rules"
                        v-bind="layout"
                        @submit="changePwd"
                        layout="vertical"
                >
                    <a-form-item has-feedback label="旧密码" name="origin_password" style="padding-top: 4px;">
                        <a-input v-model:value="formState.origin_password" type="password" autocomplete="off"/>
                    </a-form-item>
                    <a-form-item has-feedback label="新密码" name="new_password">
                        <a-input v-model:value="formState.new_password" type="password" autocomplete="off"/>
                    </a-form-item>
                    <a-form-item has-feedback label="确认密码" name="repeat_password">
                        <a-input v-model:value="formState.repeat_password" type="password" autocomplete="off"/>
                    </a-form-item>
                    <a-form-item>
                        <a-button type="primary" html-type="submit" :loading="loading">提交</a-button>
                    </a-form-item>
                </a-form>

            </a-col>
        </a-row>
    </a-layout-content>

</template>

<style>

</style>