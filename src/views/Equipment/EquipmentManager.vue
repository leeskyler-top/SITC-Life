<script setup>
import {computed, defineComponent, onMounted, reactive, ref} from 'vue';
import {CheckOutlined, EditOutlined, PlusOutlined, UploadOutlined} from '@ant-design/icons-vue';
import {cloneDeep} from 'lodash-es';

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

onMounted(() => {
    handleResize();
});

window.addEventListener('resize', handleResize);

const columns = [
    {
        title: '固定资产编号',
        dataIndex: 'fixed_assets_num',
        width: '20%',
    },
    {
        title: '设备名称',
        dataIndex: 'name',
        width: '20%',
    },
    {
        title: '设备型号',
        dataIndex: 'model',
        width: '20%',
    },
    {
        title: '状态',
        dataIndex: 'status',
        width: '20%',
    },
    {
        title: '操作',
        dataIndex: 'operation',
    }
];
const dataSource = ref([
    {
        fixed_assets_num: 'TY20220800001',
        name: '惠普Z2工作站',
        model: 'Tower G5 ( Intel i9 10900K, Nvidia Quadro P2200, 32G, 1T SSD )',
        status: '出借',

    },
    {
        fixed_assets_num: 'TY20220800002',
        name: '惠普Z2工作站',
        model: 'Tower G5 ( Intel i9 10900K, Nvidia Quadro P2200, 32G, 1T SSD )',
        status: '空闲',
    },
    {
        fixed_assets_num: 'TY20220800003',
        name: '惠普Z2工作站',
        model: 'Tower G5 ( Intel i9 10900K, Nvidia Quadro P2200, 32G, 1T SSD )',
        status: '空闲',
    },
    {
        fixed_assets_num: 'TY20220800004',
        name: '惠普Z2工作站',
        model: 'Tower G5 ( Intel i9 10900K, Nvidia Quadro P2200, 32G, 1T SSD )',
        status: '空闲',
    },
    {
        fixed_assets_num: 'TY20220800005',
        name: '惠普Z2工作站',
        model: 'Tower G5 ( Intel i9 10900K, Nvidia Quadro P2200, 32G, 1T SSD )',
        status: '空闲',
    },
    {
        fixed_assets_num: 'TY20220800006',
        name: '惠普Z2工作站',
        model: 'Tower G5 ( Intel i9 10900K, Nvidia Quadro P2200, 32G, 1T SSD )',
        status: '空闲',
    },

    {
        fixed_assets_num: 'TY20220800007',
        name: '惠普Z2工作站',
        model: 'Tower G5 ( Intel i9 10900K, Nvidia Quadro P2200, 32G, 1T SSD )',
        status: '空闲',
    },
    {
        fixed_assets_num: 'TY20220800008',
        name: '惠普Z2工作站',
        model: 'Tower G5 ( Intel i9 10900K, Nvidia Quadro P2200, 32G, 1T SSD )',
        status: '空闲',
    },
    {
        fixed_assets_num: 'TY20220800009',
        name: '惠普Z2工作站',
        model: 'Tower G5 ( Intel i9 10900K, Nvidia Quadro P2200, 32G, 1T SSD )',
        status: '空闲',
    },
    {
        fixed_assets_num: 'TY20220800010',
        name: '惠普Z2工作站',
        model: 'Tower G5 ( Intel i9 10900K, Nvidia Quadro P2200, 32G, 1T SSD )',
        status: '空闲',
    },
    {
        fixed_assets_num: 'TY20220800011',
        name: '惠普Z2工作站',
        model: 'Tower G5 ( Intel i9 10900K, Nvidia Quadro P2200, 32G, 1T SSD )',
        status: '空闲',
    },
    {
        fixed_assets_num: 'TY20220800012',
        name: '惠普Z2工作站',
        model: 'Tower G5 ( Intel i9 10900K, Nvidia Quadro P2200, 32G, 1T SSD )',
        status: '空闲',
    },
]);
const count = computed(() => dataSource.value.length + 1);
const editableData = reactive({});

const visibleInfo = ref(false);
const showInfo = id => {
    visibleInfo.value = true;
}

const handleCancel = () => {
    visibleInfo.value = false;
};
const onDelete = key => {
    dataSource.value = dataSource.value.filter(item => item.key !== key);
};

const formState = reactive({
    equipment: {
        fixed_assets_num: '',
        name: '',
        model: '',
        status: 'unassigned',
    },
});

const validateMessages = {
    required: '${label} 必填!',
    types: {
        email: '${label} 非法邮箱格式',
    },
};
const onFinish = values => {
    console.log('Success:', values);
};
const onFinishFailed = errorInfo => {
    console.log('Failed:', errorInfo);
};


</script>
<template>
    <a-layout-content
            :style="{margin: '16px'}"
    >
        <h2>设备管理</h2>
        <div style="padding: 8px; background-color: #FFFFFF" v-if="isShow">
            <a-row justify="end">
                <router-link to="/equipment/add">
                    <a-button type="primary" style="margin: 8px; " ghost>添加设备</a-button>
                </router-link>
            </a-row>
            <a-table bordered :data-source="dataSource" :columns="columns">
                <template #bodyCell="{ column, text, record }">
                    <template v-if="column.dataIndex === 'name'">
                        <div class="editable-cell">
                            <div class="editable-cell-text-wrapper">
                                {{ text || ' ' }}
                            </div>
                        </div>
                    </template>
                    <template v-if="column.dataIndex === 'operation'">
                        <div class="editable-row-operations">
                            <span>
                              <a @click="showInfo(record.key)">编辑</a>
                            </span>
                            <span>
                              <a-popconfirm
                                      v-if="dataSource.length"
                                      title="是否删除?"
                                      @confirm="onDelete(record.key)"
                              >
                                <a style="color:red;">删除</a>
                              </a-popconfirm>
                        </span>
                        </div>
                    </template>
                </template>
            </a-table>
        </div>
        <div style="padding: 8px; background-color: #FFFFFF" v-if="isShow === false">
            管理员相关功能不支持宽度小于525px的设备显示，建议使用电脑端操作。
        </div>
        <a-modal v-model:visible="visibleInfo" title="变更活动信息">

            <a-form
                    :model="formState.equipment"
                    name="validate_other"
                    v-bind="formItemLayout"
                    :validate-messages="validateMessages"
                    @finishFailed="onFinishFailed"
                    @finish="onFinish"
                    style="max-width: 500px;"

            >
                <a-form-item name="fixed_assets_num" label="固定资产编号" :rules="[{ required: true }]">
                    <a-input v-model:value="formState.equipment.fixed_assets_num"/>
                </a-form-item>
                <a-form-item name="name" label="设备名称" :rules="[{ required: true }]">
                    <a-textarea v-model:value="formState.equipment.name"/>
                </a-form-item>
                <a-form-item name="model" label="设备型号" :rules="[{ required: true }]">
                    <a-input v-model:value="formState.equipment.model"/>
                </a-form-item>
                <a-form-item
                        name="status"
                        label="状态"
                        has-feedback
                        :rules="[{ required: true, message: '状态' }]"
                >
                    <a-select placeholder="选择状态" v-model:value="formState.equipment.status">
                        <a-select-option value="unassigned">空闲</a-select-option>
                        <a-select-option value="assigned">出借</a-select-option>
                        <a-select-option value="damaged">损坏</a-select-option>
                    </a-select>
                </a-form-item>
                <a-form-item
                        name="person"
                        label="出借者"
                        has-feedback
                        :rules="[{ required: true, message: '状态' }]"
                        v-if="formState.equipment.status === 'assigned'">
                    <a-select v-model:value="formState.equipment.person" style="width: 200px" @change="handleChange">
                        <a-select-opt-group>
                            <template #label>
                                  <span>
                                    <user-outlined/>Manager
                                  </span>
                            </template>
                            <a-select-option value="jack">Jack</a-select-option>
                            <a-select-option value="lucy">Lucy</a-select-option>
                        </a-select-opt-group>
                        <a-select-opt-group label="Engineer">
                            <a-select-option value="Yiminghe">yiminghe</a-select-option>
                            <a-select-option value="Yiminghe1">yiminghe1</a-select-option>
                        </a-select-opt-group>
                    </a-select>
                </a-form-item>
            </a-form>
            <template #footer>
                <a-button type="primary" @click="handleCancel">关闭</a-button>
                <a-button type="primary" @click="changeNote" html-type="submit" danger>变更</a-button>
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