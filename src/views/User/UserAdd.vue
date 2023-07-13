<script setup>
import {reactive, ref} from "vue";
import api from "@/api";
import {message} from "ant-design-vue";

const formItemLayout = {
    labelCol: {
        span: 6,
    },
    wrapperCol: {
        span: 14,
    },
};
const formState = reactive({
    uid: '',
    name: '',
    is_admin: '0',
    email: '',
    password: '',
    department: '',
    classname: '',
    note: '',
});
const validateMessages = {
    required: '${label} 必填!',
    types: {
        email: '${label} 非法邮箱格式',
    },
};
const loading = ref(false)
const addUser = () => {
    loading.value = true;
    api.post("/user", formState).then((res) => {
        loading.value = false;
        let {msg} = res.data;
        message.success(msg);
        formState.uid = '';
        formState.name = '';
        formState.is_admin = '0';
        formState.email = '';
        formState.password = '';
        formState.department = '';
        formState.classname = '';
        formState.note = '';
    }).catch((err) => {
        let {msg} = err.response.data;
        loading.value = false;
        message.error(msg);
    });
}
</script>

<template>
    <a-layout-content
            :style="{margin: '16px'}"
    >
        <h2>
            用户添加
        </h2>
        <a-row>
            <a-col :span="24" style="padding: 24px; background-color: #FFFFFF">
                <a-form
                        :model="formState"
                        name="validate_other"
                        v-bind="formItemLayout"
                        :validate-messages="validateMessages"
                        @submit="addUser"
                        style="max-width: 500px;"

                >
                    <a-form-item
                            name="is_admin"
                            label="选择一个角色"
                            has-feedback
                            :rules="[{ required: true, message: '请选择角色' }]"
                    >
                        <a-select v-model:value="formState.is_admin" placeholder="选择用户角色">
                            <a-select-option value="0">用户(User)</a-select-option>
                            <a-select-option value="1">管理员(Admin)</a-select-option>
                        </a-select>
                    </a-form-item>
                    <a-form-item name="uid" label="学籍号" :rules="[{ required: true }]">
                        <a-input v-model:value="formState.uid"/>
                    </a-form-item>
                    <a-form-item name="name" label="姓名" :rules="[{ required: true }]">
                        <a-input v-model:value="formState.name"/>
                    </a-form-item>
                    <a-form-item name="email" label="账户(邮箱)" :rules="[{ required: true, type: 'email' }]">
                        <a-input v-model:value="formState.email"/>
                    </a-form-item>
                    <a-form-item name="email" label="密码" :rules="[{ required: true, type: 'email' }]">
                        <a-input v-model:value="formState.password" type="password"/>
                    </a-form-item>
                    <a-form-item name="department" label="系部" :rules="[{ required: true }]">
                        <a-input v-model:value="formState.department"/>
                    </a-form-item>
                    <a-form-item name="classname" label="班级" :rules="[{ required: true }]">
                        <a-input v-model:value="formState.classname"/>
                    </a-form-item>
                    <a-form-item name="notes" label="备注" :rules="[{ required: false }]">
                        <a-input v-model:value="formState.note"/>
                    </a-form-item>
                    <a-form-item :wrapper-col="{ span: 12, offset: 6 }">
                        <a-button type="primary" html-type="submit" :loading="loading">提交</a-button>
                    </a-form-item>
                </a-form>
            </a-col>
        </a-row>

    </a-layout-content>
</template>

<style scoped>

</style>