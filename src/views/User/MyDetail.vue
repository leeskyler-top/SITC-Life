<script setup>
import {onMounted, reactive, ref} from 'vue';
import {
    InfoCircleOutlined,
    LockOutlined
} from '@ant-design/icons-vue';
import api from "@/api";
import {message} from "ant-design-vue";


const formRef = ref();
const formState = reactive({
    pass: '',
    checkPass: '',
});
let checkAge = async (_rule, value) => {
    if (!value) {
        return Promise.reject('Please input the age');
    }
    if (!Number.isInteger(value)) {
        return Promise.reject('Please input digits');
    } else {
        if (value < 18) {
            return Promise.reject('Age must be greater than 18');
        } else {
            return Promise.resolve();
        }
    }
};
let validatePass = async (_rule, value) => {
    if (value === '') {
        return Promise.reject('Please input the password');
    } else {
        if (formState.checkPass !== '') {
            formRef.value.validateFields('checkPass');
        }
        return Promise.resolve();
    }
};
let validatePass2 = async (_rule, value) => {
    if (value === '') {
        return Promise.reject('Please input the password again');
    } else if (value !== formState.pass) {
        return Promise.reject("Two inputs don't match!");
    } else {
        return Promise.resolve();
    }
};
const rules = {
    pass: [{
        required: true,
        validator: validatePass,
        trigger: 'change',
    }],
    checkPass: [{
        validator: validatePass2,
        trigger: 'change',
    }],
    age: [{
        validator: checkAge,
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
const handleFinish = values => {
    console.log(values, formState);
};
const handleFinishFailed = errors => {
    console.log(errors);
};
const resetForm = () => {
    formRef.value.resetFields();
};
const handleValidate = (...args) => {
    console.log(args);
};
const menu = ref("myInfo");

function changeMenu(op) {
    menu.value = op;
}

const myData = ref({});

const listMyInfo = () => {
    api.get("/user/my").then((res) => {
        let {data, msg} = res.data;
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
                <a-menu
                    v-model:openKeys="openKeys"
                    v-model:selectedKeys="selectedKeys"
                    mode="vertical"
                    @click="handleClick"
                >
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
                <a-descriptions title="用户详情" bordered>
                    <a-descriptions-item label="姓名">{{  myData.name  }}</a-descriptions-item>
                    <a-descriptions-item label="工号/学籍号">{{  myData.uid  }}</a-descriptions-item>
                    <a-descriptions-item label="系部">{{  myData.department  }}</a-descriptions-item>
                    <a-descriptions-item label="班级">{{  myData.classname  }}</a-descriptions-item>
                    <a-descriptions-item label="账户类型">{{  myData.is_admin  }}</a-descriptions-item>
                    <a-descriptions-item label="创建时间">{{  myData.created_at  }}</a-descriptions-item>
                    <a-descriptions-item label="备注" :span="2">{{  myData.note  }}</a-descriptions-item>
                </a-descriptions>
            </a-col>
            <a-col v-if="menu === 'changePwd'" :lg="{span: 16}" :md="{span: 24}" :sm="{span: 24}" :xs="{span: 24}"
                   style=" padding: 0 16px;">
                <h2 class="ant-descriptions-title"> 密码更改 </h2>
                <a-form
                    ref="formRef"
                    name="custom-validation"
                    :model="formState"
                    :rules="rules"
                    v-bind="layout"
                    layout="vertical"
                >
                    <a-form-item has-feedback label="旧密码" name="original_password" style="padding-top: 4px;">
                        <a-input v-model:value="formState.pass" type="password" autocomplete="off" />
                    </a-form-item>
                    <a-form-item has-feedback label="新密码" name="new_password">
                        <a-input v-model:value="formState.checkPass" type="password" autocomplete="off" />
                    </a-form-item>
                    <a-form-item has-feedback label="确认密码" name="repeat_password">
                        <a-input v-model:value="formState.checkPass" type="password" autocomplete="off" />
                    </a-form-item>
                    <a-form-item :wrapper-col="{ span: 14, offset: 4 }">
                        <a-button type="primary" html-type="submit">Submit</a-button>
                        <a-button style="margin-left: 10px" @click="resetForm">Reset</a-button>
                    </a-form-item>
                </a-form>

            </a-col>
        </a-row>
    </a-layout-content>

</template>

<style>

</style>