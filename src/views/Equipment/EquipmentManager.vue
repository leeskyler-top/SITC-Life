<script setup>
import {computed, defineComponent, onMounted, reactive, ref} from 'vue';
import {CheckOutlined, EditOutlined, PlusOutlined, SearchOutlined, UploadOutlined} from '@ant-design/icons-vue';
import {cloneDeep} from 'lodash-es';
import api from "@/api";
import {message} from "ant-design-vue";

/*
    屏幕宽度判断
 */
const isShow = ref(true);

function handleResize(event) {
    // 页面宽度小于525px时，不显示表格
    if (document.documentElement.clientWidth < 525) {
        isShow.value = false;
    } else {
        isShow.value = true;
    }
}

const formState = reactive({
    equipment: {
        fixed_assets_num: null,
        name: null,
        model: null,
        status: null,
        user_id: null,
        apply_time: null,
    },
});
const assignedStatusDisable = ref(false)
const statusOptions = ref([
    {
        value: 'unassigned',
        label: '空闲'
    },

    {
        value: 'assigned',
        label: '出借',
        disabled: assignedStatusDisable.value
    },
    {
        value: 'damaged',
        label: '损坏'
    },
    {
        value: 'missed',
        label: '丢失'
    },
    {
        value: 'scrapped',
        label: '报废'
    },
]);

const spinning = ref(false);
const loading = ref(false);

const listUsers = () => {
    spinning.value = true;
    api.get("/user").then((res) => {
        spinning.value = false;
        let {data} = res.data;
        users.value = data;
    }).catch((err) => {
        let {msg} = err.response.data;
        message.error(msg);
    });
}
const listEquipments = () => {
    spinning.value = true;
    api.get("/equipment").then((res) => {
        let {data} = res.data;
        spinning.value = false;
        data = data.map(item => {
            if (item.status === 'unassigned') {
                item.status = '空闲';
            } else if (item.status === 'assigned') {
                item.status = '出借';
            } else if (item.status === 'scrapped') {
                item.status = '报废';
            } else if (item.status === 'damaged') {
                item.status = '损坏';
            } else if (item.status === 'missed') {
                item.status = '丢失';
            }
            return item;
        })
        myData.value = data;
    }).catch((err) => {
        let {msg} = err.response.data;
        spinning.value = false;
        message.error(msg);
    });
}

const now = new Date();
// 禁用早于当前日期的日期
const disabledDate = (date) => {
    return date && date.valueOf() < now.valueOf();
};

onMounted(() => {
    handleResize();
    listEquipments();
});

window.addEventListener('resize', handleResize);

const columns = [
    {
        title: '固定资产编号',
        dataIndex: 'fixed_assets_num',
        width: '20%',
        customFilterDropdown: true,
        onFilter: (value, record) =>
            record.fixed_assets_num.toString().toLowerCase().includes(value.toLowerCase()),
    },
    {
        title: '设备名称',
        dataIndex: 'name',
        width: '20%',
        customFilterDropdown: true,
        onFilter: (value, record) =>
            record.name.toString().toLowerCase().includes(value.toLowerCase()),
    },
    {
        title: '设备型号',
        dataIndex: 'model',
        width: '20%',
        customFilterDropdown: true,
        onFilter: (value, record) =>
            record.model.toString().toLowerCase().includes(value.toLowerCase()),
    },
    {
        title: '状态',
        dataIndex: 'status',
        width: '20%',
        customFilterDropdown: true,
        onFilter: (value, record) =>
            record.status.toString().toLowerCase().includes(value.toLowerCase()),
    },
    {
        title: '操作',
        dataIndex: 'operation',
    }
];

const state = reactive({
    searchText: '',
    searchedColumn: '',
});

const handleSearch = (selectedKeys, confirm, dataIndex) => {
    confirm();
    state.searchText = selectedKeys[0];
    state.searchedColumn = dataIndex;
};

const handleReset = clearFilters => {
    clearFilters({confirm: true});
    state.searchText = '';
};

const myData = ref([]);
const users = ref([]);
const count = computed(() => myData.value.length + 1);
const visibleInfo = ref(false);

const current_equipment_id = ref();
const showInfo = id => {
    visibleInfo.value = true;
    current_equipment_id.value = id;
    let current_equipment = myData.value.find(item => item.id === current_equipment_id.value)
    formState.equipment.fixed_assets_num = current_equipment.fixed_assets_num;
    formState.equipment.name = current_equipment.name;
    formState.equipment.model = current_equipment.model;
    if (current_equipment.status === '空闲') {
        formState.equipment.status = 'unassigned';
        assignedStatusDisable.value = false;
    } else if (current_equipment.status === '出借') {
        formState.equipment.status = 'assigned';
        assignedStatusDisable.value = true;
    } else if (current_equipment.status === '报废') {
        formState.equipment.status = 'scrapped';
        assignedStatusDisable.value = false;
    } else if (current_equipment.status === '损坏') {
        formState.equipment.status = 'damaged';
        assignedStatusDisable.value = false;
    } else if (current_equipment.status === '丢失') {
        formState.equipment.status = 'missed';
        assignedStatusDisable.value = false;
    }
    listUsers();
}
const handleCancel = () => {
    visibleInfo.value = false;
};

const deleteEquipment = id => {
    api.delete("/equipment/" + id).then((res) => {
        let {msg} = res.data;
        message.success(msg);
        myData.value = myData.value.filter(equipment => equipment.id !== id);
    }).catch((err) => {
        let {msg} = err.response.data;
        message.error(msg);
    });
}


const changeEquipment = () => {
    loading.value = true;
    api.patch("/equipment/" + current_equipment_id.value, formState.equipment).then((res) => {
        let {msg} = res.data;
        let current_equipment = myData.value.find(item => item.id === current_equipment_id.value)
        if (formState.equipment.status === 'unassigned') {
            formState.equipment.status = '空闲';
        } else if (formState.equipment.status === 'assigned') {
            formState.equipment.status = '出借';
        } else if (formState.equipment.status === 'scrapped') {
            formState.equipment.status = '报废';
        } else if (formState.equipment.status === 'damaged') {
            formState.equipment.status = '损坏';
        } else if (formState.equipment.status === 'missed') {
            formState.equipment.status = '丢失';
        }
        loading.value = false;
        Object.assign(current_equipment, formState.equipment);
        visibleInfo.value = false;
        message.success(msg);
    }).catch((err) => {
        let {msg} = err.response.data;
        loading.value = false;
        message.error(msg);
    });
}

const validateMessages = {
    required: '${label} 必填!',
    types: {
        email: '${label} 非法邮箱格式',
    },
};

</script>
<template>
    <a-layout-content
            :style="{margin: '16px'}"
    >
        <h2>设备管理</h2>
        <div style="padding: 8px; background-color: #FFFFFF" v-if="isShow">
            <a-spin :spinning="spinning" tip="Loading...">
                <a-row justify="end">
                    <router-link to="/equipment/add">
                        <a-button type="primary" style="margin: 8px; " ghost>添加设备</a-button>
                    </router-link>
                </a-row>
                <a-table :columns="columns" :data-source="myData" bordered>
                    <template
                            #customFilterDropdown="{ setSelectedKeys, selectedKeys, confirm, clearFilters, column }"
                    >
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
                                    <search-outlined/>
                                </template>
                                Search
                            </a-button>
                            <a-button size="small" style="width: 90px" @click="handleReset(clearFilters)">
                                Reset
                            </a-button>
                        </div>
                    </template>
                    <template #bodyCell="{ column, text, record }">
                        <template v-if="['uid', 'name', 'classname', 'department'].includes(column.dataIndex)">
                            <div>
                                {{ text }}
                            </div>
                        </template>

                        <template v-else-if="column.dataIndex === 'operation'">
                            <div class="editable-row-operations">
                      <span>
                          <a @click="showInfo(record.id)">编辑</a>
                      </span>
                                <span>
                        <a-popconfirm title="确定删除此用户？" @confirm="deleteEquipment(record.id)"><a
                                style="color: red">删除</a></a-popconfirm>
                      </span>
                            </div>
                        </template>
                    </template>
                </a-table>
            </a-spin>
        </div>
        <div style="padding: 8px; background-color: #FFFFFF" v-if="isShow === false">
            管理员相关功能不支持宽度小于525px的设备显示，建议使用电脑端操作。
        </div>
        <a-modal v-model:visible="visibleInfo" title="变更活动信息">

            <a-spin :spinning="spinning" tip="Loading...">
                <a-form
                        :model="formState"
                        name="validate_other"
                        :validate-messages="validateMessages"
                        style="max-width: 500px;"

                >
                    <a-form-item :name="['equipment', 'fixed_assets_num']" label="固定资产编号"
                                 :rules="[{ required: true }]">
                        <a-input v-model:value="formState.equipment.fixed_assets_num"/>
                    </a-form-item>
                    <a-form-item :name="['equipment', 'name']" label="设备名称" :rules="[{ required: true }]">
                        <a-textarea v-model:value="formState.equipment.name"/>
                    </a-form-item>
                    <a-form-item :name="['equipment', 'model']" label="设备型号" :rules="[{ required: true }]">
                        <a-input v-model:value="formState.equipment.model"/>
                    </a-form-item>
                    <a-form-item
                            :name="['equipment', 'status']"
                            label="状态"
                            has-feedback
                            :rules="[{ required: true, message: '状态必选' }]"
                    >
                        <a-select placeholder="选择状态" v-model:value="formState.equipment.status" :options="statusOptions"></a-select>
                    </a-form-item>
                    <a-form-item
                            :name="['equipment', 'status']"
                            label="出借者"
                            has-feedback
                            :rules="[{ required: true, message: '状态' }]"
                            v-if="formState.equipment.status === 'assigned'">
                        <a-select v-model:value="formState.equipment.user_id" :disabled="assignedStatusDisable"
                                  placeholder="请选择用户"
                                  style="width: 200px">
                            <a-select-option v-for="item in users"  :value="item.id">{{ item.uid }} {{
                                item.name
                                }}
                            </a-select-option>
                        </a-select>
                    </a-form-item>
                    <a-form-item has-feedback
                                 :rules="[{ required: true, message: '请选择日期' }]"
                                 :name="['equipment', 'apply_time']"
                                 label="承诺归还时间" v-if="formState.equipment.status === 'assigned'">
                        <a-date-picker
                                v-model:value="formState.equipment.apply_time"
                                show-time
                                :disabled="assignedStatusDisable"
                                format="YYYY-MM-DD HH:mm:ss"
                                value-format="YYYY-MM-DD HH:mm:ss"
                                :disabled-date="disabledDate"
                                placeholder="不得早于当前时间"
                        />
                    </a-form-item>

                </a-form>
            </a-spin>
            <template #footer>
                <a-button type="primary" @click="handleCancel">关闭</a-button>
                <a-button type="primary" @click="changeEquipment" html-type="submit" :loading="loading" danger>变更
                </a-button>
            </template>
        </a-modal>

    </a-layout-content>

</template>

<style lang="less">
.editable-row-operations a {
  margin-right: 8px;
}

.editable-cell {
  position: relative;

  .editable-cell-input-wrapper,
  .editable-cell-text-wrapper {
    padding-right: 24px;
  }

  .editable-cell-text-wrapper {
    padding: 5px 24px 5px 5px;
  }

  .editable-cell-icon,
  .editable-cell-icon-check {
    position: absolute;
    right: 0;
    width: 20px;
    cursor: pointer;
  }

  .editable-cell-icon {
    margin-top: 4px;
    display: none;
  }

  .editable-cell-icon-check {
    line-height: 28px;
  }

  .editable-cell-icon:hover,
  .editable-cell-icon-check:hover {
    color: #108ee9;
  }

  .editable-add-btn {
    margin-bottom: 8px;
  }
}

.editable-cell:hover .editable-cell-icon {
  display: inline-block;
}
</style>