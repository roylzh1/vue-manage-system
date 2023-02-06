<template>
	<div>
		<div class="container">
			<div class="handle-box">
				<el-input v-model="query.name" placeholder="用户名" class="handle-input mr10"></el-input>
				<el-button type="primary" :icon="Search" @click="handleSearch">搜索</el-button>
			</div>
      <!--表头-->
			<el-table :data="tableData" border class="table" ref="multipleTable" header-cell-class-name="table-header">
				<el-table-column prop="id" label="ID" width="55" align="center"></el-table-column>
				<el-table-column prop="name" label="用户名"></el-table-column>
				<el-table-column prop="role" label="角色"></el-table-column>
				<el-table-column label="操作" width="250" align="center">
					<template #default="scope">
						<el-button text :icon="Edit" @click="handleEdit(scope.$index, scope.row)" v-permiss="15">
							添加角色
						</el-button>
						<el-button text :icon="Delete" class="red" @click="handleRemove(scope.$index, scope.row)" v-permiss="16">
							删除角色
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

		<!-- 添加角色弹出框 -->
		<el-dialog title="添加角色" v-model="editVisible" width="30%">
			<el-form label-width="70px">
				<el-form-item label="用户名">
					<div>{{form.name}}</div>
				</el-form-item>
				<el-form-item label="角色">
					<el-input v-model="form.role"></el-input>
				</el-form-item>
			</el-form>
			<template #footer>
				<span class="dialog-footer">
					<el-button @click="editVisible = false">取 消</el-button>
					<el-button type="primary" @click="saveEdit">确 定</el-button>
				</span>
			</template>
		</el-dialog>
    <!-- 删除角色弹出框 -->
		<el-dialog title="删除角色" v-model="removeVisible" width="30%">
			<el-form label-width="70px">
				<el-form-item label="用户名">
					<div>{{form.name}}</div>
				</el-form-item>
				<el-form-item label="角色">
					<el-input v-model="form.role"></el-input>
				</el-form-item>
			</el-form>
			<template #footer>
				<span class="dialog-footer">
					<el-button @click="removeVisible = false">取 消</el-button>
					<el-button type="primary" @click="saveRemove">确 定</el-button>
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
import router from '../router';

interface TableItem {
	id: number;
	name: string;
	role: string[];
}

const query = reactive({
	address: '',
	name: '',
	pageIndex: 1,
	pageSize: 5
});
let tableData = reactive<TableItem[]>([]);
let pageTotal = ref(1);
// 获取表格数据
onMounted(async()=>{
   let res = await service.get(`Admin/GetUserRole?pageIndex=${query.pageIndex}&pageSize=${query.pageSize}`);
  console.log(res.data.value)
  pageTotal.value = res.data.message * query.pageSize;//更新总页数
  const array = res.data.value
  array.forEach(user => {
    tableData.push({
      "id": user.userId,
     "name": user.userName,
      "role": user.role
    })
  });
})
// 查询操作
const handleSearch = async () => {
	let res = await service.get(`Admin/GetUserRoleByName?userName=${query.name}`);
	query.pageIndex = 1;
	ElMessage.success('搜索成功');
  const user = res.data.value
  console.log(user);
  tableData.splice(0, query.pageSize);
  tableData.push({
    "id": user.userId,
     "name": user.userName,
      "role": user.role
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

// 表格编辑时弹窗和保存
const editVisible = ref(false);
const removeVisible = ref(false);
//编辑表单
let form = reactive<TableItem>({});
let idx: number = -1;
const handleEdit = (index: number, row: any) => {
	idx = index;
	form.name = row.name;
	editVisible.value = true;
};
const handleRemove = (index: number, row: any) => {
	idx = index;
	form.name = row.name;
	removeVisible.value = true;
};
//添加角色
const saveEdit = async() => {
  try {
    let result = await service.post(`/Admin/AddRoleToUser?userName=${form.name}&roleName=${form.role}`);
	  editVisible.value = false;
    router.go(0);
	  ElMessage.success(`添加第 ${idx + 1} 行角色${form.role}成功`);
    form.role = '';
  } catch (error) {
    console.log(error)
    ElMessage.error(error.data);
  }
};
//删除角色 
const saveRemove = async() => {
  try {
    let result = await service.post(`/Admin/DeleteRoleFromUser?userName=${form.name}&roleName=${form.role}`);
	  editVisible.value = false;
    router.go(0);
	  ElMessage.success(`删除第 ${idx + 1} 行角色${form.role}成功`);
    form.role = '';
  } catch (error) {
    console.log(error)
    ElMessage.error(error.data);
  }
};
const changePage = async ()=>{
  let res = await service.get(`Admin/GetUserRole?pageIndex=${query.pageIndex}&pageSize=${query.pageSize}`);
  console.log(res.data.value)
  const array = res.data.value;
  tableData.splice(0, query.pageSize);
  array.forEach(user => {
    tableData.push({
      "id": user.userId,
     "name": user.userName,
      "role": user.role
    })
  });
}
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
