<template>
	<div>
		<div class="container">
			<div class="handle-box">
				<el-input v-model="query.name" placeholder="用户名" class="handle-input mr10"></el-input>
				<el-button type="primary" :icon="Search" @click="handleSearch">搜索</el-button>
				<el-button type="primary" :icon="Plus" @click="handleAddUser">新增</el-button>
			</div>
      <!--表头-->
			<el-table :data="tableData" border class="table" ref="multipleTable" header-cell-class-name="table-header">
				<el-table-column prop="id" label="ID" width="55" align="center"></el-table-column>
				<el-table-column prop="name" label="用户名"></el-table-column>
				<el-table-column prop="email" label="邮箱"></el-table-column>
        <!--
				<el-table-column label="头像(查看大图)" align="center">
					<template #default="scope">
						<el-image
							class="table-td-thumb"
							:src="scope.row.thumb"
							:z-index="10"
							:preview-src-list="[scope.row.thumb]"
							preview-teleported
						>
						</el-image>
					</template>
				</el-table-column>
        -->
				<el-table-column prop="phone" label="手机号"></el-table-column>
        <!--
				<el-table-column label="状态" align="center">
					<template #default="scope">
						<el-tag
							:type="scope.row.state === '成功' ? 'success' : scope.row.state === '失败' ? 'danger' : ''"
						>
							{{ scope.row.state }}
						</el-tag>
					</template>
				</el-table-column>
        -->
				<el-table-column label="操作" width="220" align="center">
					<template #default="scope">
						<el-button text :icon="Edit" @click="handleEdit(scope.$index, scope.row)" v-permiss="15">
							编辑
						</el-button>
						<el-button text :icon="Delete" class="red" @click="handleDelete(scope.$index)" v-permiss="16">
							删除
						</el-button>
					</template>
				</el-table-column>
			</el-table>
			<div class="pagination">
				<el-pagination
					background
					layout="prev, pager, next"
					:current-page="query.pageIndex"
					:page-size="query.pageSize"
					:total="pageTotal"
          @prev-click="prevClick"
          @next-click="nextClick"
					@current-change="handlePageChange"
				></el-pagination>
			</div>
		</div>

		<!-- 编辑弹出框 -->
		<el-dialog title="编辑" v-model="editVisible" width="30%">
			<el-form label-width="70px">
				<el-form-item label="用户名">
					<el-input v-model="form.name"></el-input>
				</el-form-item>
				<el-form-item label="邮箱">
					<el-input v-model="form.email"></el-input>
				</el-form-item>
        <el-form-item label="手机号">
					<el-input v-model="form.phone"></el-input>
				</el-form-item>
			</el-form>
			<template #footer>
				<span class="dialog-footer">
					<el-button @click="editVisible = false">取 消</el-button>
					<el-button type="primary" @click="saveEdit">确 定</el-button>
				</span>
			</template>
		</el-dialog>
    <!-- 新增弹出框 -->
    <el-dialog title="新增用户" v-model="addVisible" width="30%">
			<el-form label-width="70px">
				<el-form-item label="用户名">
					<el-input v-model="addForm.userName"></el-input>
				</el-form-item>
        <el-form-item label="密码">
					<el-input v-model="addForm.password"></el-input>
				</el-form-item>
        <el-form-item label="手机号">
					<el-input v-model="addForm.phoneNumber"></el-input>
				</el-form-item>
			</el-form>
			<template #footer>
				<span class="dialog-footer">
					<el-button @click="addVisible = false">取 消</el-button>
					<el-button type="primary" @click="addEdit">确 定</el-button>
				</span>
			</template>
		</el-dialog>
	</div>
</template>

<script setup lang="ts" name="basetable">
import { ref, reactive, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Delete, Edit, Search, Plus } from '@element-plus/icons-vue';
import { fetchData } from '../api/index';
import service from '../utils/request';
import { useRouter } from 'vue-router';

interface TableItem {
	id: number;
	name: string;
	email: string;
	phone: string;
}
const router = useRouter();
//查询参数
const query = reactive({
	name: '',
	pageIndex: 1,
	pageSize: 5
});
let tableData = reactive<TableItem[]>([]);
let pageTotal = ref<number>(1);
// 获取表格数据
onMounted(async()=>{
   let res = await service.get(`Admin/GetUser?pageIndex=${query.pageIndex}&pageSize=${query.pageSize}`);
  console.log(res.data.message)
  pageTotal.value = res.data.message * query.pageSize;//更新总页数
  const array = res.data.value
  array.forEach(user => {
    tableData.push({
      "id": user.id,
     "name": user.userName,
     "email": user.email ?? '未填写',
     "phone": user.phoneNumber ?? '未填写',
    })
  });
})
// 查询操作
const handleSearch = async () => {
  let res = await service.post(`Admin/GetUserByName?userName=${query.name}`);
	query.pageIndex = 1;
	ElMessage.success('搜索成功');
  const user = res.data.value
  console.log(user);
  tableData.splice(0, query.pageSize);
  tableData.push({
    "id": user.id,
     "name": user.userName,
     "email": user.email ?? '未填写',
     "phone": user.phoneNumber ?? '未填写',
  });
};
const prevClick = async ()=>{
  query.pageIndex - 1; 
  await changePage();
}
const nextClick = async ()=>{
  query.pageIndex + 1; 
  await changePage();
}
// 分页导航
const handlePageChange = async (val: number) => {
	query.pageIndex = val;
	await changePage();
};
const changePage = async ()=>{
  let res = await service.get(`Admin/GetUser?pageIndex=${query.pageIndex}&pageSize=${query.pageSize}`);
  console.log(res.data.value)
  const array = res.data.value;
  tableData.splice(0, query.pageSize);
  array.forEach(user => {
    tableData.push({
      "id": user.id,
     "name": user.userName,
     "email": user.email ?? '未填写',
     "phone": user.phoneNumber ?? '未填写',
    })
  });
}
// 删除操作
const handleDelete = (index: number) => {
	// 二次确认删除
	ElMessageBox.confirm('确定要删除吗？', '提示', {
		type: 'warning'
	})
		.then(() => {
			ElMessage.success('删除成功');
			tableData.splice(index, 1);
		})
		.catch(() => {});
};

// 表格编辑时弹窗和保存
const editVisible = ref(false);
const addVisible = ref(false);
//编辑表单
let form = reactive({
  id: '',
	name: '',
	email: '',
  phone: '',
});
let addForm = reactive({
	userName: '',
  password: '',
  phoneNumber: '',
});
let idx: number = -1;
const handleEdit = (index: number, row: any) => {
	idx = index;
  form.id = row.id,
	form.name = row.name;
	form.email = row.email;
  form.phone = row.phone;
	editVisible.value = true;
};
const handleAddUser = async () => {
  form.userName = '';
	form.password = '';
  form.phoneNumber = '';
	addVisible.value = true;
}
const saveEdit = async() => {
  try {
    let result = await service.post('/Admin/UpdateUser',form);
	  editVisible.value = false;
	  ElMessage.success(`修改第 ${idx + 1} 行成功`);
	  tableData[idx].name = form.name;
	  tableData[idx].email = form.email;
    tableData[idx].phone = form.phone;
  } catch (error) {
    console.log(error)
    ElMessage.error(error.data);
  }
};
const addEdit = async() => {
  try {
    let result = await service.post('/Admin/CreateUser',addForm);
	  addVisible.value = false;
    router.go(0);
	  ElMessage.success(`新增用户 ${addForm.name} 成功`);
  } catch (error) {
    console.log(error)
    ElMessage.error(error.data);
  }
};
</script>

<style scoped>
.handle-box {
	margin-bottom: 20px;
}

.handle-select {
	width: 120px;
}

.handle-input {
	width: 300px;
}
.table {
	width: 100%;
	font-size: 14px;
}
.red {
	color: #F56C6C;
}
.mr10 {
	margin-right: 10px;
}
.table-td-thumb {
	display: block;
	margin: auto;
	width: 40px;
	height: 40px;
}
</style>
