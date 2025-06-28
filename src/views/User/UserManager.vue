<script setup>
import {reactive, ref, onMounted, createVNode, computed} from 'vue';
import {ExclamationCircleOutlined, SearchOutlined, HomeOutlined, CopyOutlined} from '@ant-design/icons-vue';
import {message, Modal} from "ant-design-vue";
import api from "@/api";
import {useClipboard} from "@vueuse/core";

const isShow = ref(true);

const is_admin = ref(localStorage.is_admin === 'true');

function handleResize(event) {
  // 页面宽度小于525px时，不显示表格
  if (document.documentElement.clientWidth < 979) {
    isShow.value = false;
  } else {
    isShow.value = true;
  }
}

onMounted(() => {
  handleResize();
  listUsers();
});

window.addEventListener('resize', handleResize);


const myData = ref([]);
const spinning = ref(false);

const listUsers = () => {
  spinning.value = true;
  api.get("/user").then((res) => {
    spinning.value = false;
    let {data} = res.data;
    data = data.map(item => {
      if (item.is_admin === true) {
        item.is_admin = '是';
      } else {
        item.is_admin = '否';
      }
      if (item.resident === true) {
        item.resident = '是';
      } else {
        item.resident = '否';
      }
      return item;
    })
    myData.value = data;
  }).catch((err) => {
    let {msg} = err.response.data;
    message.error(msg);
  });
}

const changeUser = () => {
  api.patch("/user/" + currentId.value, formState).then((res) => {
    let {msg} = res.data;
    let currentUser = myData.value.find(item => item.id === currentId.value)
    if (formState.is_admin === true) {
      formState.is_admin = '是';
    } else {
      formState.is_admin = '否';
    }
    if (formState.resident === true) {
      formState.resident = '是';
    } else {
      formState.resident = '否';
    }
    Object.assign(currentUser, formState);
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
    title: '学籍号',
    dataIndex: 'studentId',
    width: '3%',
    customFilterDropdown: true,
    onFilter: (value, record) =>
        record.studentId.toString().toLowerCase().includes(value.toLowerCase()),
  },
  {
    title: '姓名',
    dataIndex: 'name',
    width: '3%',
    customFilterDropdown: true,
    onFilter: (value, record) =>
        record.name.toString().toLowerCase().includes(value.toLowerCase()),
  },
  {
    title: '班级',
    dataIndex: 'classname',
    width: '3%',
    customFilterDropdown: true,
    onFilter: (value, record) =>
        record.classname.toString().toLowerCase().includes(value.toLowerCase())
  },
  {
    title: '性别',
    dataIndex: 'gender',
    width: '2%',
    customFilterDropdown: true,
    onFilter: (value, record) =>
        record.gender.toString().toLowerCase().includes(value.toLowerCase())
  },
  {
    title: '系部',
    dataIndex: 'department',
    width: '7%',
    customFilterDropdown: true,
    onFilter: (value, record) =>
        record.department.toString().toLowerCase().includes(value.toLowerCase())
  },
  {
    title: '职务',
    dataIndex: 'position',
    width: '6%',
    customFilterDropdown: true,
    onFilter: (value, record) =>
        record.position.toString().toLowerCase().includes(value.toLowerCase())
  },
  {
    title: '手机',
    dataIndex: 'phone',
    width: '5%',
    customFilterDropdown: true,
    onFilter: (value, record) =>
        record.phone.toString().toLowerCase().includes(value.toLowerCase())
  },
  {
    title: '政治面貌',
    dataIndex: 'politicalLandscape',
    width: '7%',
    customFilterDropdown: true,
    onFilter: (value, record) =>
        record.politicalLandscape.toString().toLowerCase().includes(value.toLowerCase())
  },
  {
    title: '住宿',
    dataIndex: 'resident',
    width: '2%',
    customFilterDropdown: true,
    onFilter: (value, record) =>
        record.position.toString().toLowerCase().includes(value.toLowerCase())
  },
  {
    title: '管理员',
    dataIndex: 'is_admin',
    width: '3%',
    customFilterDropdown: true,
    onFilter: (value, record) =>
        record.is_admin.toString().toLowerCase().includes(value.toLowerCase())
  },
  {
    title: '入部时间',
    dataIndex: 'join_at',
    width: '8%',
    customFilterDropdown: true,
    sorter: (a, b) => (new Date(a.join_at).getTime()) - (new Date(b.join_at).getTime()),
    onFilter: (value, record) =>
        record.join_at.toString().toLowerCase().includes(value.toLowerCase())
  },
  {
    title: '操作',
    width: '9%',
    dataIndex: 'operation',
    fixed: 'right'
  }
];

const deleted_columns = [
  {
    title: '学籍号',
    dataIndex: 'studentId',
    width: '10%',
    customFilterDropdown: true,
    onFilter: (value, record) =>
        record.studentId.toString().toLowerCase().includes(value.toLowerCase()),
  },
  {
    title: '姓名',
    dataIndex: 'name',
    width: '10%',
    customFilterDropdown: true,
    onFilter: (value, record) =>
        record.name.toString().toLowerCase().includes(value.toLowerCase()),
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
    title: '入部时间',
    dataIndex: 'join_at',
    width: '10%',
    customFilterDropdown: true,
    onFilter: (value, record) =>
        record.join_at.toString().toLowerCase().includes(value.toLowerCase())
  },
  {
    title: '操作',
    width: '3%',
    dataIndex: 'operation',
    fixed: 'right'
  }
];

const deletedUsers = ref([]);

const showDeletedUsers = () => {
  listDeletedUsers();
  visibleDeletedUsers.value = true;
}

const listDeletedUsers = () => {
  api.get("/user/deleted").then(res => {
    let {msg, data} = res.data;
    deletedUsers.value = data;
    message.success(msg)
  }).catch((err) => {
    let {msg} = err.response.data;
    message.error(msg);
  });
}

const restoreUser = (user_id) => {
  api.patch("/user/restore/" + user_id).then(res => {
    let {msg} = res.data;
    deletedUsers.value = deletedUsers.value.filter(user => user.id !== user_id)
    message.success(msg)
  }).catch((err) => {
    let {msg} = err.response.data;
    message.error(msg);
  });
}


// 存在数据错误风险 暂不开放
const deleteUserPermanently = (user_id) => {
  api.delete("/user/deleted/delete" + user_id).then(res => {
    let {msg} = res.data;
    deletedUsers.value.filter(user => user.id !== user_id)
    message.success(msg)
  }).catch((err) => {
    let {msg} = err.response.data;
    message.error(msg);
  });
}

const handleSearch = (selectedKeys, confirm, dataIndex) => {
  confirm();
  state.searchText = selectedKeys[0];
  state.searchedColumn = dataIndex;
};

const handleReset = clearFilters => {
  clearFilters({confirm: true});
  state.searchText = '';
};
const deleteUser = id => {
  api.delete("/user/" + id).then((res) => {
    let {msg} = res.data;
    message.success(msg);
    myData.value = myData.value.filter(user => user.id !== id);
  }).catch((err) => {
    let {msg} = err.response.data;
    message.error(msg);
  });
};

const downloadUser = () => {
  api.get('/user/export', {
    responseType: 'blob'  // 设置响应类型为 blob
  })
      .then(response => {
        const url = window.URL.createObjectURL(new Blob([response.data]));

        // 创建一个 <a> 标签以触发下载
        const a = document.createElement('a');
        a.href = url;
        a.download = 'current_user_info.csv';
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
      })
      .catch(error => {
        console.error('下载 CSV 失败: ', error);
        message.error('下载 CSV 失败')
      });
}

const visible = ref(false);
const visiblePassword = ref(false);
const visibleDeletedUsers = ref(false);
const currentId = ref();

const showModal = id => {
  let user = myData.value.find(i => i.id === id);
  currentId.value = id;
  if (user) {
    if (user.is_admin === '是') {
      formState.is_admin = true;
    } else {
      formState.is_admin = false;
    }
    if (user.resident === '是') {
      formState.resident = true;
    } else {
      formState.resident = false;
    }
    formState.name = user.name;
    formState.department = user.department;
    formState.classname = user.classname;
    formState.gender = user.gender;
    formState.position = user.position;
    formState.phone = user.phone;
    formState.qq = user.qq;
    formState.politicalLandscape = user.politicalLandscape;
    formState.note = user.note;
    formState.join_at = user.join_at
  }
  visible.value = true;
}

const new_password = ref();
const resetPwd = id => {
  api.get("/user/pwd/reset/" + id).then((res) => {
    let {msg, data} = res.data;
    new_password.value = data.new_password;
    showPassword(id);
  }).catch((err) => {
    let {msg} = err.response.data;
    message.error(msg);
  });
}

const copyLink = (text, msg) => {
  const { copy, copied } = useClipboard({ source: text });
  copy();
  if (copied) {
    message.success("复制" + msg + "成功")
  }
}

const currentUser = ref();
const showPassword = id => {
  let user = myData.value.find(i => i.id === id);
  currentUser.value = user;
  visiblePassword.value = true;
}

const showConfirm = (id) => {
  Modal.confirm({
    title: '确认操作',
    icon: createVNode(ExclamationCircleOutlined),
    content: '确定重置密码？',
    okText: '确认',
    cancelText: '取消',
    onOk() {
      resetPwd(id)
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
  name: "",
  classname: "",
  department: "",
  gender: "",
  phone: "",
  qq: "",
  politicalLandscape: "",
  position: "",
  note: "",
  is_admin: "",
  resident: "",
  join_at: ""
});

const handleCancel = () => {
  visible.value = false;
  visiblePassword.value = false;
  visibleDeletedUsers.value = false;
};

const scroll = computed(() => {
  if (isShow.value === true) {
    return false
  } else {
    return {x: 1000}
  }
})

const disableChangeButton = computed(() => {
  return !formState.name || !formState.phone || !formState.classname || !formState.department || !formState.gender || !formState.join_at
})

</script>

<template>
  <a-layout-content
      :style="{margin: '16px'}"
  >
    <h2 style="display: flex; justify-content: space-between;">
      <span>用户管理</span><span style=" margin-bottom: 4px;"><router-link to="/"><HomeOutlined/> 首页</router-link></span>
    </h2>
    <div style="padding: 8px; background-color: #FFFFFF">
      <a-spin :spinning="spinning" tip="Loading...">
        <a-row justify="end">
          <router-link to="/user/add">
            <a-button type="primary" style="margin: 8px; " ghost v-if="is_admin">添加用户</a-button>
          </router-link>
          <a-button type="primary" style="margin: 8px; " @click="downloadUser" ghost v-if="is_admin">下载用户</a-button>
          <a-button type="primary" style="margin: 8px; " @click="showDeletedUsers" danger ghost v-if="is_admin">恢复用户</a-button>
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
            <template v-if="['studentId', 'name', 'classname', 'department'].includes(column.dataIndex)">
              <div>
                {{ text }}
              </div>
            </template>

            <template v-else-if="column.dataIndex === 'operation' && is_admin">
              <div class="editable-row-operations">
                      <span>
                          <a @click="showModal(record.id)">编辑</a>
                      </span>
                <span>
                          <a @click="showConfirm(record.id)">重置密码</a>
                      </span>
                <span>
                        <a-popconfirm title="确定删除此用户？" @confirm="deleteUser(record.id)" ><a
                            style="color: red">删除</a></a-popconfirm>
                      </span>
              </div>
            </template>
          </template>
        </a-table>
      </a-spin>
    </div>
    <a-modal v-model:open="visible" title="修改用户信息">
      <a-form
          :model="formState"
          name="validate_other"
          v-bind="formItemLayout"
      >
        <a-form-item name="name" label="姓名" :rules="[{ required: true }]">
          <a-input v-model:value="formState.name"/>
        </a-form-item>
        <a-form-item name="department" label="系部" :rules="[{ required: true }]">
          <a-select v-model:value="formState.department" placeholder="选择用户角色">
            <a-select-option value="信息技术系">信息技术系</a-select-option>
            <a-select-option value="智能制造系">智能制造系</a-select-option>
            <a-select-option value="材料与检测系">材料与检测系</a-select-option>
            <a-select-option value="商务管理系">商务管理系</a-select-option>
            <a-select-option value="公共基础部">公共基础部</a-select-option>
            <a-select-option value="校团委">校团委</a-select-option>
            <a-select-option value="其它">其它</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item name="classname" label="班级" :rules="[{ required: true }]">
          <a-input v-model:value="formState.classname"/>
        </a-form-item>
        <a-form-item
            name="gender"
            label="性别"
            has-feedback
            :rules="[{ required: true, message: '请选择性别' }]"
        >
          <a-select v-model:value="formState.gender" placeholder="选择性别">
            <a-select-option value="男">男</a-select-option>
            <a-select-option value="女">女</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item name="phone" label="手机" :rules="[{ required: true }]">
          <a-input v-model:value="formState.phone"/>
        </a-form-item>
        <a-form-item
            name="politicalLandscape"
            label="政治面貌"
            has-feedback
            :rules="[{ required: true, message: '请选择政治面貌' }]"
        >
          <a-select v-model:value="formState.politicalLandscape" placeholder="选择政治面貌">
            <a-select-option value="群众">群众</a-select-option>
            <a-select-option value="中国共产主义青年团团员">中国共产主义青年团团员</a-select-option>
            <a-select-option value="中国共产党正式党员">中国共产党正式党员</a-select-option>
            <a-select-option value="中国共产党预备党员">中国共产党预备党员</a-select-option>
            <a-select-option value="其它">其它</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item
            name="position"
            label="职务"
            has-feedback
            :rules="[{ required: true, message: '请选择政治面貌' }]"
        >
          <a-select v-model:value="formState.position" placeholder="请选择职务">
            <a-select-option value="正式部员">普通部员</a-select-option>
            <a-select-option value="实习部员">实习部员</a-select-option>
            <a-select-option value="实习汇总负责人">实习汇总负责人</a-select-option>
            <a-select-option value="汇总负责人">汇总负责人</a-select-option>
            <a-select-option value="部门负责人">部门负责人（锻炼岗）</a-select-option>
            <a-select-option value="副部长">副部长</a-select-option>
            <a-select-option value="部长">部长</a-select-option>
            <a-select-option value="其他人员">其他人员</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item name="qq" label="QQ">
          <a-input v-model:value="formState.qq"/>
        </a-form-item>
        <a-form-item
            name="is_admin"
            label="是否管理员"
            has-feedback
            :rules="[{ required: true, message: '请选择角色' }]"
            style="padding-top: 8px;"
        >
          <a-switch v-model:checked="formState.is_admin"></a-switch>
        </a-form-item>
        <a-form-item
            name="resident"
            label="是否住宿"
            has-feedback
            :rules="[{ required: true, message: '请选择是否住宿' }]"
            style="padding-top: 8px;"
        >
          <a-switch v-model:checked="formState.resident"></a-switch>
        </a-form-item>
        <a-form-item name="note" label="备注">
          <a-textarea v-model:value="formState.note"/>
        </a-form-item>
        <a-form-item name="join_at" label="加入部门时间" :rules="[{ required: true }]">
          <a-date-picker v-model:value="formState.join_at" placeholder="选择年-月-日" valueFormat="YYYY-MM-DD"/>
        </a-form-item>


      </a-form>
      <template #footer>
        <a-button type="primary" @click="handleCancel">关闭</a-button>
        <a-button type="primary" danger @click="changeUser" :disabled="disableChangeButton">变更</a-button>
      </template>
    </a-modal>
    <a-modal v-model:open="visiblePassword" title="重置密码">
      <a-card>
        <p>学籍号：<span>{{ currentUser.studentId }}</span></p>
        <p>姓名：<span>{{ currentUser.name }}</span></p>
        <p>班级：<span>{{ currentUser.classname }}</span></p>
        <p>系部：<span>{{ currentUser.department }}</span></p>
        <p>性别：<span>{{ currentUser.gender }}</span></p>
        <p>政治面貌：<span>{{ currentUser.politicalLandscape }}</span></p>
        <p>职务：<span>{{ currentUser.position }}</span></p>
      </a-card>
      <a-card>
        <p>密码已重置，请查看：</p>
        <a-input-group>
          <a-input-password v-model:value="new_password" style="width: 110px;" @click="copyLink(new_password, '新用户密码')" :readonly="true" />
          <a-tooltip title="复制新用户密码" @click="copyLink(new_password, '新用户密码')">
            <a-button>
              <template #icon><CopyOutlined /></template>
            </a-button>
          </a-tooltip>
        </a-input-group>
      </a-card>
      <template #footer>
        <a-button type="primary" @click="handleCancel">关闭</a-button>
      </template>
    </a-modal>

    <a-modal title="查询已删除账户" v-model:open="visibleDeletedUsers">
      <a-table :columns="deleted_columns" :data-source="deletedUsers" :scroll="scroll" bordered>
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
          <template v-if="['studentId', 'name', 'classname', 'department'].includes(column.dataIndex)">
            <div>
              {{ text }}
            </div>
          </template>

          <template v-else-if="column.dataIndex === 'operation'">
            <div class="editable-row-operations">
              <span>
                <a-button type="primary" @click="restoreUser(record.id)" size="small" ghost>恢复</a-button>
              </span>
            </div>
          </template>
        </template>
      </a-table>
      <template #footer>
        <a-button type="primary" danger @click="handleCancel">关闭</a-button>
      </template>
    </a-modal>

  </a-layout-content>

</template>

<style scoped>
.editable-row-operations a {
  margin-right: 8px;
}
</style>