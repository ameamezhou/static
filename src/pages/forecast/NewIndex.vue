<template>
  <Tabs value="name1">
    <TabPane label="录入新指标" name="name1">
      <Form :model="formIndex" :label-width="80" :rules="validateRules">
        <FormItem label="指标名" prop="name">
          <Input v-model="formIndex.name" placeholder="请输入指标名"></Input>
        </FormItem>
        <FormItem label="指标类型">
          <RadioGroup v-model="formIndex.type">
            <Radio label="kv">KV</Radio>
            <Radio label="mod">MOD模块</Radio>
            <Radio label="cgi">CGI</Radio>
          </RadioGroup>
        </FormItem>
        <FormItem label="LPath" v-if="formIndex.type==='mod'" :key="formIndex.type" prop="lpath">
          <Select
              v-model="formIndex.lpath"
              filterable
              remote
              :remote-method="debouncedGetModule"
              :loading="loadingModule"
          >
            <Option v-for="item in modules" :key="item" :value="item">{{ item }}</Option>
          </Select>
        </FormItem>
        <FormItem label="LPath" v-if="formIndex.type==='kv'" :key="formIndex.type" prop="lpath">
          <Input v-model="formIndex.lpath" placeholder="请输入KVid"></Input>
        </FormItem>
        <div v-else-if="formIndex.type==='cgi'" :key="formIndex.type">
          <FormItem label="产品" prop="product">
            <Input v-model="formIndex.product" placeholder="请输入cgi所属产品" prop="cgis.product"></Input><p style="height: 3px"></p>
          </FormItem>
          <FormItem label="cgi" prop="cgi">
            <Input v-model="formIndex.cgi" placeholder="请输入cgi" prop="cgis.cgi"></Input>
          </FormItem>
        </div>
        <FormItem label="监控KName" prop="kname">
          <Input v-model="formIndex.kname" placeholder="请输入KName"></Input>
        </FormItem>
        <FormItem label="指标等级">
          <RadioGroup v-model="formIndex.level">
            <Radio label="1">一级指标</Radio>
            <Radio label="2">二级指标</Radio>
          </RadioGroup><p style="height: 3px"></p>
        </FormItem>
        <FormItem label="指标数值等级">
          <RadioGroup v-model="formIndex.datalevel">
            <Radio label="MIN">分钟级</Radio>
            <Radio label="HOUR">小时级</Radio>
          </RadioGroup><p style="height: 3px"></p>
          <span>默认选分钟级</span>
        </FormItem>
        <FormItem>
          <Button type="primary" @click="sendIndexInfo">Submit</Button>
          <Button style="margin-left: 8px" @click="cancel">Cancel</Button>
        </FormItem>
      </Form>
    </TabPane>
    <TabPane label="模块指标绑定" name="name2">
<!--      table  筛选  提交  -->
      <div>
        <Form>
          <FormItem label="所属产品">
            <Select v-model="border" style="width:200px">
              <Option value="全部" key="全部">全部</Option>
              <Option v-for="item in borderlist" :value="item" :key="item">{{ item }}</Option>
            </Select>
          </FormItem>
          <FormItem label="所属分类">
            <Select v-model="classifyBorder" style="width:200px">
              <Option value="全部" key="全部">全部</Option>
              <Option v-for="item in classifyBorderlist" :value="item" :key="item">{{ item }}</Option>
            </Select>
          </FormItem>
        </Form>
        <Row>
          <Col span="3">
            <Select
                v-model="people"
                placeholder="负责人"
                filterable
                clearable
                remote
                :remote-method="debouncedGetPeople"
                :loading="loadingPeople"
            >
              <Option v-for="item in peoples" :key="item" :value="item">{{ item }}</Option>
            </Select>
          </Col>
          <Col span="5"></Col>
          <Col span="8">
            <Button type="info" @click="oneInsert=true">一键填充</Button>
          </Col>
          <Col span="8">
            <Button type="success" @click="postTableData()">提交绑定</Button>
          </Col>
        </Row>
        <br><br>
        <Table :columns="columns" :data="data" :loading="loading" ref="table">
          <template slot-scope="{ row, index }" slot="newFirstIndex">
            <Select
                v-model="row.firstIndex"
                filterable
                remote
                :remote-method="debouncedGetfirstIndex"
                :key="index"
                :onchange="firstChange(row, index)"
            >
              <Option v-for="item in firstList" :key="item" :value="item">{{ item }}</Option>
            </Select>
          </template>
          <template slot-scope="{ row, index }" slot="newSecondIndex">
            <Select
                v-model="row.secondIndex"
                filterable
                remote
                :remote-method="debouncedGetsecondIndex"
                :key="index"
                :onchange="secondChange(row, index)"
            >
              <Option v-for="item in secondList" :key="item" :value="item">{{ item }}</Option>
            </Select>
          </template>
          <template slot-scope="{ row, index }" slot="action">
            <div class="dataTable">
              <Button type="primary" size="small" style="margin-right: 5px" @click="response(index)">单行提交</Button>
            </div>
          </template>
        </Table>
        <Row>
            <Page
                class="dataTable"
                :page-size="pagesize"
                :total="total"
                :current.sync="current"
                @on-change="getTableData"
                @on-page-size-change="handleSizeChange"
                :page-size-opts="[50, 100, 200, 400]"
                show-total
                show-sizer
            />
        </Row>
        <Modal
            v-model="oneInsert"
            title="一键填充当页指标"
            width="800px"
            @on-ok="insert"
            @on-cancel="cancel">
          <Form :label-width="80" :rules="bindRules">
            <FormItem label="一级指标" prop="firstIndex">
              <Select
                  v-model="formBind.firstIndex"
                  filterable
                  remote
                  :remote-method="debouncedGetfirstIndex"
              >
                <Option v-for="item in firstList" :key="item" :value="item">{{ item }}</Option>
              </Select>
            </FormItem>
            <FormItem label="二级指标" prop="secondIndex">
              <Select
                  v-model="formBind.secondIndex"
                  filterable
                  remote
                  :remote-method="debouncedGetsecondIndex"
              >
                <Option v-for="item in secondList" :key="item" :value="item">{{ item }}</Option>
              </Select>
            </FormItem>
          </Form>
        </Modal>
        <Modal
            v-model="oneSubmit"
            title="提示">
          <p>正在提交 请请稍后... </p>
        </Modal>
      </div>
    </TabPane>
    <TabPane label="指标情况列表" name="name3">
      <Form :model="formTableIndex" :label-width="80">
        <FormItem label="指标等级">
          <RadioGroup v-model="formTableIndex.indexLevel">
            <Radio label="0">全部</Radio>
            <Radio label="1">一级指标</Radio>
            <Radio label="2">二级指标</Radio>
          </RadioGroup>
        </FormItem>
        <FormItem label="指标类型">
          <RadioGroup v-model="formTableIndex.indexType">
            <Radio label="all">全部</Radio>
            <Radio label="kv">KV</Radio>
            <Radio label="mod">MOD</Radio>
            <Radio label="cgi">CGI</Radio>
          </RadioGroup>
        </FormItem>
        <FormItem label="搜索">
          <Input
              v-model="indexSearchKey"
              placeholder="指标名"
              style="width: 330px"
              :search="true"
              @on-search="formTableIndex.indexKey = indexSearchKey"
          />
        </FormItem>
        <Row>
          <Col span="24">
            <Table border
                   class="dataTable"
                   :columns="indexTableCol"
                   :data="indexTableData"
                   :loading="indexLoading">
              <template slot-scope="{ row }" slot="name">
                <strong>{{ row.name }}</strong>
              </template>
            </Table>
            <Page
                class="dataTable"
                :page-size="indexPageSize"
                :total="indexTotal"
                :current.sync="indexCurrent"
                @on-change="getIndexList"
                @on-page-size-change="indexShowSizeChange"
                show-total
                show-sizer
            />
          </Col>
        </Row>
      </Form>
      <p style="height: 100px;"></p>
      <Form :label-width="80">
        <FormItem label="搜索">
          <Input
              v-model="ModuleSearchKey"
              placeholder="模块名"
              style="width: 330px"
              :search="true"
          />
        </FormItem>
        <Row>
          <Col span="24">
            <Table border
                   class="dataTable"
                   :columns="indexModuleTableCol"
                   :data="indexModuleTableData"
                   :loading="indexModuleLoading">
              <template slot-scope="{ row }" slot="name">
                <strong>{{ row.name }}</strong>
              </template>
            </Table>
            <Page
                class="dataTable"
                :page-size="indexModulePageSize"
                :total="indexModuleTotal"
                :current.sync="indexModuleCurrent"
                @on-change="getIndexModuleList"
                @on-page-size-change="indexModuleShowSizeChange"
                show-total
                show-sizer
            />
          </Col>
        </Row>
      </Form>
    </TabPane>
  </Tabs>
</template>

<script>
import apiUrl from "utils/api";
import request from "utils/request";
import _ from "lodash";

export default {
  name: "NewIndex",
  data () {
    return {
      formIndex: {
        name: '',
        lpath: '',
        type: 'kv',
        kname: '',
        product: '',
        cgi: '',
        level: '1',
        datalevel: 'MIN',
      },
      formBind: {
        firstIndex: '',
        secondIndex: ''
      },
      formTableIndex: {
        indexLevel: '0',
        indexType: 'all',
        indexKey: ''
      },
      indexTableCol: [
        {
          title: '指标名',
          key: 'indexName',
          fixed: 'left',
          minWidth: 200
        },
        {
          title: '指标等级',
          key: 'indexLevel',
          minWidth: 150
        },
        {
          title: '指标类型',
          key: 'indexType',
          minWidth: 150
        },
        {
          title: '指标lpath',
          key: 'indexLpath',
          minWidth: 200
        },
        {
          title: '指标kName',
          key: 'indexKName',
          minWidth: 200
        },
        {
          title: '数据级别',
          key: 'dataLevel',
          minWidth: 150
        }
      ],
      indexModuleTableCol: [
        {
          title: '模块名',
          key: 'moduleName',
          fixed: 'left',
          minWidth: 200
        },
        {
          title: '一级指标',
          key: 'indexFirst',
          minWidth: 200
        },
        {
          title: '二级指标',
          key: 'indexSecond',
          minWidth: 200
        }
      ],
      indexTableData: [],
      indexSearchKey: '',
      indexLoading: false,
      indexPageSize: 10,
      indexTotal: 0,
      indexCurrent: 1,
      indexModuleTableData: [],
      ModuleSearchKey: '',
      indexModuleLoading: false,
      indexModulePageSize: 10,
      indexModuleTotal: 0,
      indexModuleCurrent: 1,
      modules: [],
      firstList: [],
      secondList: [],
      loadingModule: false,
      loadingFirstIndex: false,
      loadingSecondIndex: false,
      increase: 1,
      validateRules: {
        name: [
          { required: true, message: 'The name cannot be empty', trigger: 'blur' },
        ],
        lpath: [{ required: true, message: "此项不为空", trigger: "blur" }],
        product: [
          {required: true, message: "请输入cgi所属产品", trigger: "blur"},
        ],
        cgi: [{required: true, message: "请输入cgi名", trigger: "blur"}],
        kname: [{required: true, message: "请输入kname", trigger: "blur"}]
      },
      bindRules: {
        modName: [
          { required: true, message: 'The name cannot be empty', trigger: 'blur' },
        ],
        firstIndex: [{ required: true, message: "此项不为空", trigger: "blur" }],
        secondIndex: [
          {required: true, message: "此项不为空", trigger: "blur"},
        ],
      },
      oneSubmit: false,
      loading: false,
      loadingPeople: false,
      oneInsert: false,
      border: '全部',
      borderlist: [],
      classifyBorder: '全部',
      classifyBorderlist: [],
      people: "",
      peoples: [],
      total: 0,
      current: 1,
      pagesize: 50,
      columns: [
        {
          title: '模块名',
          key: 'module',
          fixed: 'left',
          minWidth: 180,
        },
        {
          title: '所属分类',
          key: 'classify',
          minWidth: 150,
        },
        {
          title: '开发负责人',
          key: 'devPrincipal',
          minWidth: 150,
        },
        {
          title: '运维负责人',
          key: 'ossPrincipal',
          minWidth: 150,
        },
        {
          title: '关联一级指标',
          key: 'firstIndex',
          slot: 'newFirstIndex',
          minWidth: 250,
        },
        {
          title: '关联二级指标',
          key: 'secondIndex',
          slot: 'newSecondIndex',
          minWidth: 250,
        },
        {
          title: '单行操作',
          slot: 'action',
          width: 150,
          align: 'center'
        },
      ],
      data: []
    }
  },
  mounted(){
    this.getIndexList()
    this.getIndexModuleList()
    this.getProductType()
    this.getClassifyType()
    this.getTableData()
  },
  methods: {
    debouncedGetPeople: _.debounce(function (query) {
      this.getPeoples(query);
    }, 300),
    getPeoples(query) {
      let params = "";
      if (query !== "") {
        params = {
          key: query,
          logicKey: 'people'
        };
      }
      this.loadingPeople = true;
      request({
        method: "get",
        url: apiUrl.list.module,
        params,
      })
          .then((resp) => {
            this.peoples = resp.result;
          })
          .finally(() => {
            this.loadingPeople = false;
          });
    },
    getProductType(){
      var params = new URLSearchParams();
      params.append("logicKey", "tableproduct")
      request({
        method: "get",
        url: apiUrl.list.productype,
        params
      })
          .then((resp) => {
            this.borderlist = resp.result;
          })
    },
    getClassifyType(){
      var params = new URLSearchParams();
      params.append("logicKey", "classifyForecast")
      if (this.border !== "全部") {
        params.append("product", this.border)
      }
      request({
        method: "get",
        url: apiUrl.list.productype,
        params,
      })
          .then((resp) => {
            this.classifyBorderlist = resp.result;
          })
    },
    debouncedGetModule: _.debounce(function (query) {
      this.getModules(query);
    }, 300),
    getModules(query) {
      let params = "";
      if (query !== "") {
        params = {
          key: query,
        };
      }
      this.loadingModule = true;
      request({
        method: "get",
        url: apiUrl.list.module,
        params,
      })
          .then((resp) => {
            this.modules = resp.result;
          })
          .finally(() => {
            this.loadingModule = false;
          });
    },
    debouncedGetsecondIndex: _.debounce(function (query) {
      this.getSecondIndex(query);
    }, 300),
    getSecondIndex(query) {
      let params = "";
      if (query !== "") {
        params = {
          key: query,
          level: 2
        };
      }
      this.loadingModule = true;
      request({
        method: "get",
        url: apiUrl.list.getIndex,
        params,
      })
          .then((resp) => {
            this.secondList = resp.result;
          })
          .finally(() => {
            this.loadingSecondIndex = false;
          });
    },
    debouncedGetfirstIndex: _.debounce(function (query) {
      this.getFirstIndex(query);
    }, 300),
    getFirstIndex(query) {
      let params = "";
      if (query !== "") {
        params = {
          key: query,
          level: 1
        };
      }
      this.loadingModule = true;
      request({
        method: "get",
        url: apiUrl.list.getIndex,
        params,
      })
          .then((resp) => {
            this.firstList = resp.result;
          })
          .finally(() => {
            this.loadingFirstIndex = false;
          });
    },
    sendIndexInfo (){
      var params = new URLSearchParams();
      params.append("indexname", this.formIndex.name);
      params.append("indexlevel", parseInt(this.formIndex.level));
      params.append("indextype", this.formIndex.type);
      params.append("kname", this.formIndex.kname)
      params.append("datalevel", this.formIndex.datalevel)

      if (this.formIndex.type === "mod") {
        params.append("indexlpath", this.formIndex.lpath);
      } else if (this.formIndex.type === "kv") {
        params.append("indexlpath", this.formIndex.lpath);
      } else {
        params.append("indexlpath", "product="+this.formIndex.product+";cgi="+this.formIndex.cgi);
      }
      let url;
      url = apiUrl.list.newIndex;

      request({
        method: "post",
        url,
        params,
      })
          .then((resp) => {
            if (resp.code === 5000){
              this.$Message.error('插入失败，请联系管理员 @fairyzwang');
              setTimeout(() => {
                this.$router.go(0)
              }, 1000);
            }else if (resp.code === 4000){
              this.$Message.error('获取监控失败，请检查输入');
              setTimeout(() => {
                this.$router.go(0)
              }, 1000);
            }else if (resp.code === 200){
              this.$Message.success('录入成功');
              setTimeout(() => {
                this.$router.go(0)
              }, 1000);
            }else if (resp.code === 3000){
              this.$Message.error('录入的指标已经存在');
              setTimeout(() => {
                this.$router.go(0)
              }, 1000);
            }else {
              this.$Message.error('抛出异常，请联系管理员 @fairyzwang');
              setTimeout(() => {
                this.$router.go(0)
              }, 1000);
            }
          })
    },
    cancel(){
      setTimeout(() => {
        this.$router.go(0)
      }, 1000);
    },
    sendIndexBind (){
      var params = new URLSearchParams();
      params.append("firstindexname", this.formBind.firstIndex);
      params.append("secondindexname", this.formBind.secondIndex);
      params.append("modulename", this.formBind.modName);

      let url;
      url = apiUrl.list.bindIndex;

      request({
        method: "post",
        url,
        params,
      })
          .then((resp) => {
            if (resp.code === 5000){
              this.$Message.error('插入失败，请联系管理员 @fairyzwang');
              setTimeout(() => {
                this.$router.go(0)
              }, 1000);
            }else if (resp.code === 200){
              this.$Message.success('绑定成功');
              setTimeout(() => {
                this.$router.go(0)
              }, 1000);
            }else if (resp.code === 300){
              this.$Message.info('所需绑定的内容已经存在, 更新成功');
              setTimeout(() => {
                this.$router.go(0)
              }, 1000);
            }else {
              this.$Message.error('抛出异常，请联系管理员 @fairyzwang');
              setTimeout(() => {
                this.$router.go(0)
              }, 1000);
            }
          })
    },
    firstChange (row, index){
      this.data[index].newFirstIndex = row.newFirstIndex
    },
    secondChange (row, index){
      this.data[index].newSecondIndex = row.newSecondIndex
    },
    getIndexList(){
      var params = new URLSearchParams();
      params.append("page", this.indexCurrent);
      params.append("pagesize", this.indexPageSize);
      params.append("indexlevel", parseInt(this.formTableIndex.indexLevel));
      params.append("indextype", this.formTableIndex.indexType);

      if (this.formTableIndex.indexKey) {
        params.append("key", this.formTableIndex.indexKey);
      }

      let url;
      url = apiUrl.list.showIndex;

      this.indexLoading = true;

      request({
        method: "get",
        url,
        params,
      })
          .then((resp) => {
            this.indexTableData = resp.result;
            this.indexTotal = resp.total;
          })
          .finally(() => (this.indexLoading = false));
    },
    indexShowSizeChange(size) {
      this.indexPageSize = size;
      this.indexCurrent = 1;
      this.getIndexList();
    },
    getIndexModuleList(){
      var params = new URLSearchParams();
      params.append("page", this.indexModuleCurrent);
      params.append("pagesize", this.indexModulePageSize);

      if (this.ModuleSearchKey) {
        params.append("key", this.ModuleSearchKey);
      }

      let url;
      url = apiUrl.list.showIndexModule;

      this.indexLoading = true;

      request({
        method: "get",
        url,
        params,
      })
          .then((resp) => {
            this.indexModuleTableData = resp.result;
            this.indexModuleTotal = resp.total;
          })
          .finally(() => (this.indexLoading = false));
    },
    indexModuleShowSizeChange(size) {
      this.indexPageSize = size;
      this.indexCurrent = 1;
      this.getIndexList();
    },
    getTableData(){
      this.loading = true
      const params = new URLSearchParams();
      params.append("page", this.current);
      params.append("pagesize", this.pagesize);
      params.append("logicKey", "index");
      if (this.border !== "全部"){
        params.append("product", this.border)
      }
      if (this.classifyBorder !== "全部"){
        params.append("classify", this.classifyBorder)
      }
      if (this.people !== "" && typeof(this.people) !== "undefined"){
        params.append("key", this.people)
      }

      let url;
      url = apiUrl.list.table;

      request({
        method: "get",
        url,
        params,
      })
          .then((resp) => {
            this.data = resp.result;
            this.total = resp.total
            this.modelRemind = false
          })
          .finally(() => (this.loading = false));
    },
    handleSizeChange(size) {
      this.pagesize = size;
      this.current = 1;
      this.getTableData();
    },
    insert () {
      for (const v in this.data) {
        this.data[v].newFirstIndex = this.formBind.firstIndex
        this.data[v].newSecondIndex = this.formBind.secondIndex
      }
    },
    async postTableData(){
      const test = []
      const tempData = this.data
      const templen = this.data.length
      const biao = (templen + 99) / 100 - 1
      for (var i = 0;i < biao; i ++){
        var j = (i+1)*100
        if (j > templen) {
          j = templen
        }
        const params = new URLSearchParams();
        params.append("logicKey", "index")
        for (var a = i*100; a < j; a++) {
          params.append("moduleData", tempData[a].module)
          if (typeof(tempData[a].newFirstIndex) === "undefined"){
            params.append("increaseL", "")
          } else {
            params.append("increaseL", tempData[a].newFirstIndex)
          }

          if (typeof(tempData[a].newSecondIndex) === "undefined") {
            params.append("increaseNow", "")
          } else {
            params.append("increaseNow", tempData[a].newSecondIndex)
          }
        }
        let url;
        url = apiUrl.list.tablePost;

        var _result = await this.postData(params, url)
        test.push(..._result)
      }
      this.data = test
      this.loading = false
    },
    async postData(params, url){
      const resp = await request({
        method: "post",
        url,
        params,
      })
      return resp.result
    },
    response(index){
      this.background('info', "数据提交 请稍后...")
      const params = new URLSearchParams();
      params.append("logicKey", "index")
      params.append("moduleData", this.data[index].module)
      params.append("increaseL", this.data[index].newFirstIndex)
      params.append("increaseNow", this.data[index].newSecondIndex)
      let url;
      url = apiUrl.list.tablePost;

      request({
        method: "get",
        url,
        params,
      })
          .then((resp) => {
            this.data.splice(index, 1, resp.result[0])
            this.background('success', "数据更新成功 ~ ~")
          })
    },
    background (type, message) {
      this.$Message[type]({
        background: true,
        content: message
      });
    }
  },
  watch: {
    formTableIndex: {
      deep: true,
      handler: function () {
        this.indexCurrent = 1
        this.getIndexList();
      },
    },
    border: {
      deep: true,
      handler: function () {
        this.getTableData()
        this.getClassifyType()
      }
    },
    classifyBorder: {
      deep: true,
      handler: function () {
        this.getTableData()
      }
    },
    people: {
      deep: true,
      handler: function () {
        this.getTableData()
      }
    }
  }
}
</script>

<style scoped>

</style>