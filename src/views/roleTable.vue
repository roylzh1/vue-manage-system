<template>
	<div>
		<div class="container">
			<div class="handle-box">
				<el-button type="primary" :icon="Plus" @click="handleAddRole">新增</el-button>
			</div>
      <!--表头-->
			<el-table :data="tableData" border class="table" ref="multipleTable" header-cell-class-name="table-header">
				<el-table-column prop="id" label="ID" width="55" align="center"></el-table-column>
				<el-table-column prop="name" label="角色名"></el-table-column>
				<el-table-column label="操作" width="220" align="center">
					<template #default="scope">
						<el-button text :icon="Delete" class="red" @click="handleDelete(scope.$index, scope.row)" v-permiss="16" v-if="scope.row.id !=1 ">
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
				<el-form-item label="角色名">
					<el-input v-model="form.name"></el-input>
				</el-form-item>
			</el-form>
			<template #footer>
				<span class="dialog-footer">
					<el-button @click="editVisible = false">取 消</el-button>
					<el-button type="primary" @click="saveEdit">确 定</el-button>
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
let roleList : Array<string>= [];
const query = reactive({
	address: '',
	name: '',
	pageIndex: 1,
	pageSize: 5
});
let totalPage = 1;
let tableData = reactive<TableItem[]>([]);
let pageTotal = ref(4);
// 获取表格数据
onMounted(async()=>{
   let res = await service.get(`Admin/GetRole?pageIndex=${query.pageIndex}&pageSize=${query.pageSize}`);
  res.data.value.forEach(role => {
    roleList.push(role.name);
  });
  pageTotal.value = res.data.message * query.pageSize;//更新总页数
  const array = res.data.value
  array.forEach(role => {
    tableData.push({
      "id": role.id,
     "name": role.name,
    })
  });
})
// 查询操作
const handleSearch = () => {
	query.pageIndex = 1;
};
const handleAddRole = () => {
	editVisible.value = true;
}
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
  let res = await service.get(`Admin/GetRole?pageIndex=${query.pageIndex}&pageSize=${query.pageSize}`);
  console.log(res.data.value)
  const array = res.data.value;
  tableData.splice(0, query.pageSize);
  array.forEach(role => {
    tableData.push({
      "id": role.id,
     "name": role.name,
    })
  });
}
// 删除操作
const handleDelete = (index: number,row: any) => {
	// 二次确认删除
	ElMessageBox.confirm('确定要删除吗？', '提示', {
		type: 'warning'
	})
		.then( async () => {
      let result = await service.post(`/Admin/DeleteRole?roleName=${row.name}`);
      ElMessage.success('删除成功');
			tableData.splice(index, 1);
		})
		.catch((error) => {
      ElMessage.error(error.data);
    });
};

// 表格编辑时弹窗和保存
const editVisible = ref(false);
//编辑表单
let form = reactive({
  id: '',
	name: '',
});

const saveEdit = async() => {
  try {
    let result = await service.post(`/Admin/CreateRole?roleName=${form.name}`);
	  editVisible.value = false;
    router.go(0);
    ElMessage.success(`新增成功`);
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
