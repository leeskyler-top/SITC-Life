<script setup>
import {reactive, ref, onMounted, createVNode, computed} from 'vue';
import {ExclamationCircleOutlined, SearchOutlined, HomeOutlined} from '@ant-design/icons-vue';
import {message, Modal} from "ant-design-vue";
import api from "@/api";

const isShow = ref(true);

function handleResize(event) {
  // 页面宽度小于525px时，不显示表格
  if (document.documentElement.clientWidth < 979) {
    isShow.value = false;
  } else {
    isShow.value = true;
  }
}

const userData = ref();
const listMyInfo = () => {
  spinning.value = true;
  api.get("/user/my").then((res) => {
    spinning.value = false;
    let {data} = res.data;
    userData.value = data;
  }).catch((err) => {
    let {msg} = err.response.data;
    message.error(msg);
  });
}

onMounted(() => {
  handleResize();
  listMyInfo();
  listTemplates();
});

window.addEventListener('resize', handleResize);


const myData = ref([]);
const spinning = ref(false);

const listTemplates = () => {
  spinning.value = true;
  api.get("/template").then((res) => {
    spinning.value = false;
    let {data} = res.data;
    myData.value = data;
  }).catch((err) => {
    let {msg} = err.response.data;
    message.error(msg);
  });
}

const addTemplate = () => {
  spinning.value = true;
  api.post("/template", formState).then((res) => {
    spinning.value = false;
    let {data, msg} = res.data;
    myData.value.push(data)
    visibleCreate.value = false;
    message.success(msg)
  }).catch((err) => {
    let {msg} = err.response.data;
    spinning.value = false;
    message.error(msg);
  });
}

const changeRoom = () => {
  api.patch("/template/" + currentId.value, formState).then((res) => {
    let {msg} = res.data;
    let currentRoom = myData.value.find(item => item.id === currentId.value)
    Object.assign(currentRoom, formState);
    visible.value = false;
    message.success(msg);
  }).catch((err) => {
    let {msg} = err.response.data;
    message.error(msg);
  });
}


const dataSource = ref(myData);
const state = reactive({
  searchText: '',
  searchedColumn: '',
});

const searchInput = ref();

const columns = [
  {
    title: '模板ID',
    dataIndex: 'id',
    width: '6%',
    customFilterDropdown: true,
    onFilter: (value, record) =>
        record.id.toString().toLowerCase().includes(value.toLowerCase()),
  },
  {
    title: '楼栋',
    dataIndex: 'building',
    width: '10%',
    customFilterDropdown: true,
    onFilter: (value, record) =>
        record.building.toString().toLowerCase().includes(value.toLowerCase()),
  },
  {
    title: '房间',
    dataIndex: 'room',
    width: '10%',
    customFilterDropdown: true,
    onFilter: (value, record) =>
        record.room.toString().toLowerCase().includes(value.toLowerCase())
  },
  {
    title: '班级',
    dataIndex: 'classname',
    width: '10%',
    customFilterDropdown: true,
    onFilter: (value, record) =>
        record.classname.toString().toLowerCase().includes(value.toLowerCase())
  },
  {
    title: '操作',
    width: '4%',
    dataIndex: 'operation',
    fixed: 'right'
  }
];

const handleSearch = (selectedKeys, confirm, dataIndex) => {
  confirm();
  state.searchText = selectedKeys[0];
  state.searchedColumn = dataIndex;
};

const handleReset = clearFilters => {
  clearFilters({confirm: true});
  state.searchText = '';
};

const deleteRoom = id => {
  api.delete("/template/" + id).then((res) => {
    let {msg} = res.data;
    message.success(msg);
    myData.value = myData.value.filter(room => room.id !== id);
  }).catch((err) => {
    let {msg} = err.response.data;
    message.error(msg);
  });
};

const downloadTemplate = () => {
  api.get("/template/download").then((res) => {
    let {msg} = res.data;
    const blob = new Blob([res.data], {
      type: "text/csv"
    })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a");
    link.href = url;
    link.download = "template.csv";  // Specify the filename for download

    // Trigger the download by clicking the link
    link.click();

    // Revoke the object URL after download
    URL.revokeObjectURL(url);

    // Show success message
    message.success(msg);
    myData.value = myData.value.filter(room => room.id !== id);
  }).catch((err) => {
    let {msg} = err.response.data;
    message.error(msg);
  });
};

const emptyTemplate = () => {
  api.delete("/template").then((res) => {
    let {msg} = res.data;
    message.success(msg);
    myData.value = []
  }).catch((err) => {
    let {msg} = err.response.data;
    message.error(msg);
  });
}

const visible = ref(false);
const visibleCreate = ref(false);

const currentId = ref();

const showModal = id => {
  let room = myData.value.find(i => i.id === id);
  currentId.value = id;
  if (room) {
    formState.building = room.building;
    formState.room = room.room;
    formState.classname = room.classname;
  }
  visible.value = true;
}

const showCreateModal = () => {
  formState.building = "";
  formState.room = "";
  formState.classname = "";
  visibleCreate.value = true;
}

const showConfirm = () => {
  Modal.confirm({
    title: '确认操作',
    icon: createVNode(ExclamationCircleOutlined),
    content: '确定清空模板吗？操作不可逆！',
    okText: '确认',
    cancelText: '取消',
    onOk() {
      emptyTemplate()
    }
  });
}

const formItemLayout = {
  labelCol: {
    span: 6,
  },
  wrapperCol: {
    span: 14,
  },
};
const formState = reactive({
  building: "",
  room: "",
  classname: "",
});

const handleCancel = () => {
  visible.value = false;
  visibleCreate.value = false;
  visibleLink.value = false;
};

const rules = {
  building: [{
    required: true,
    message: "请输入楼栋",
    trigger: 'change',
  }],
  room: [{
    required: true,
    message: "请输入房间",
    trigger: 'change',
  }],
  classname: [{
    required: true,
    message: "请输入班级",
    trigger: 'change',
  }],
};

const scroll = computed(() => {
  if (isShow.value === true) {
    return false
  } else {
    return {x: 400}
  }
})

</script>

<template>
  <a-layout-content
      :style="{margin: '16px'}"
  >
    <h2 style="display: flex; justify-content: space-between;">
      <span>模板管理</span><span style=" margin-bottom: 4px;"><router-link to="/"><HomeOutlined/> 首页</router-link></span>
    </h2>
    <div style="padding: 8px; background-color: #FFFFFF">
      <a-spin :spinning="spinning" tip="Loading...">
        <a-row justify="end">
          <a-button type="primary" style="margin: 8px; " @click="showCreateModal" v-if="['部长', '副部长', '部门负责人', '汇总负责人'].includes(userData?.position) || userData?.is_admin === true" ghost>添加一个模板</a-button>
          <a-button type="primary" style="margin: 8px; " @click="downloadTemplate" :disabled="dataSource.length === 0" ghost>下载已有模板</a-button>
          <a-button type="primary" danger style="margin: 8px;" @click="showConfirm" v-if="userData?.is_admin === true" :disabled="dataSource.length === 0" ghost>清空所有模板</a-button>
        </a-row>

        <a-table :columns="columns" :data-source="dataSource" :scroll="scroll" bordered>
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
            <template v-if="['id', 'building', 'room', 'classname'].includes(column.dataIndex)">
              <div>
                {{ text }}
              </div>
            </template>

            <template v-else-if="column.dataIndex === 'operation'">
              <div class="editable-row-operations">
                      <span v-if="['部长', '副部长', '部门负责人'].includes(userData?.position) || userData?.is_admin === true">
                          <a @click="showModal(record.id)">编辑</a>
                      </span>

                       <span v-if="['部长', '副部长', '部门负责人'].includes(userData?.position) || userData?.is_admin === true">
                        <a-popconfirm title="确定删除此模板？" @confirm="deleteRoom(record.id)">
                          <a style="color: red">删除</a>
                        </a-popconfirm>
                      </span>
              </div>
            </template>
          </template>
        </a-table>
      </a-spin>
    </div>
    <a-modal v-model:open="visible" title="修改当前房间">
      <a-form
          :model="formState"
          name="validate_other"
          v-bind="formItemLayout"
      >
        <a-form-item name="building" label="楼栋" :rules="[{ required: true }]">
          <a-input v-model:value="formState.building"/>
        </a-form-item>
        <a-form-item name="room" label="房间" :rules="[{ required: true }]">
          <a-input v-model:value="formState.room"/>
        </a-form-item>
        <a-form-item name="classname" label="班级名称" :rules="[{ required: true }]">
          <a-input v-model:value="formState.classname"/>
        </a-form-item>


      </a-form>
      <template #footer>
        <a-button type="primary" @click="handleCancel">关闭</a-button>
        <a-button type="primary" danger @click="changeRoom">变更</a-button>
      </template>
    </a-modal>
    <a-modal v-model:open="visibleCreate" title="创建当前房间">
      <a-form
          :model="formState"
          name="validate_other"
          v-bind="formItemLayout"
          :rules="rules"
      >
        <a-form-item name="building" label="楼栋">
          <a-input v-model:value="formState.building"/>
        </a-form-item>
        <a-form-item name="room" label="房间">
          <a-input v-model:value="formState.room"/>
        </a-form-item>
        <a-form-item name="classname" label="班级名称">
          <a-input v-model:value="formState.classname"/>
        </a-form-item>


      </a-form>
      <template #footer>
        <a-button type="primary" @click="handleCancel">关闭</a-button>
        <a-button type="primary" danger @click="addTemplate" :disabled="!formState.building || !formState.room || !formState.classname">创建</a-button>
      </template>
    </a-modal>
  </a-layout-content>

</template>

<style scoped>
.editable-row-operations a {
  margin-right: 8px;
}
</style>