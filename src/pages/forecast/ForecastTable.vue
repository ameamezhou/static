<template>
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
      <Col span="1"></Col>
      <Col span="4">
        <Button @click="switchModel" type="dashed"><Icon type="ios-swap"></Icon>
          <span v-if="model === 1">分页模式</span>
          <span v-else-if="model === 2">粗暴模式</span>
        </Button>
      </Col>
      <Col span="4">
<!--        <download-excel-->
<!--            :data="tableData"-->
<!--            :fields="jsonFields"-->
<!--            name="模块预算样表.xls"-->
<!--        >-->
<!--          <Button><Icon type="ios-download-outline"></Icon> 下载数据</Button>-->
<!--        </download-excel>-->

            <download-excel
                class = "export-excel-wrapper"
                :data = "tableData"
                :fields = "jsonFields"
                name = "模块预算样表.xls">
              <!-- 上面可以自定义自己的样式，还可以引用其他组件button -->
              <Button type="primary" size="small" @click="exportData">导出EXCEL</Button>
            </download-excel>
      </Col>
      <Col span="4">
        <Button type="success" @click="postTableData()">提交预测</Button>
      </Col>
      <Col span="4">
        <Button type="info" @click="oneInsert=true">一键填充</Button>
      </Col>
      <Poptip placement="left" width="500">
        <Button type="primary">公式解释</Button>
        <template #content>
          <div class="api" v-for="formular in formularContent" :key="formular.name">
            <p>{{formular.name}} : {{formular.remark}}</p>
          </div>
        </template>
      </Poptip>
    </Row>
    <br><br>
    <Table :columns="tableColumns" :data="tableData" :loading="loading" ref="table">
      <template slot-scope="{ row, index }" slot="theYear">
        <div>
          <InputNumber
              :max="100"
              v-model="row.increase"
              :onchange="increaseChange(row, index)"
              :key="index"
              :active-change="false"
              :formatter="value => `${value}%`"
              :parser="value => value.replace('%', '')" />
        </div>
      </template>
      <template slot-scope="{ row, index }" slot="test">
        <div
            style="width: 25px"
            @mouseenter="enter(index)"
            @mouseleave="leave"
            @mousemove="move"> {{ row.machineNum }}
        </div>
      </template>
      <template slot-scope="{ row, index }" slot="nextYear">
        <div>
          <InputNumber
              :max="200"
              v-model="row.nextIncrease"
              :onchange="increaseChange(row, index)"
              :key="index"
              :active-change="false"
              :formatter="value => `${value}%`"
              :parser="value => value.replace('%', '')" />
        </div>
      </template>
      <template slot-scope="{ row, index }" slot="formular">
        <Select v-model="row.formular" size="small" style="width:100px" :key="index" :onchange="selectChange(row, index)">
          <Option v-for="item in formularContent" :value="item.value" :key="item.value"  style="width: 100px">
            {{ item.name }}
          </Option>
        </Select>
      </template>
      <template slot-scope="{ row, index }" slot="action">
        <div class="dataTable">
          <Button type="primary" size="small" style="margin-right: 5px" @click="response(index)">单行提交</Button>
        </div>
      </template>
    </Table>
    <Row>
      <Col :span="16"></Col>
      <Col v-if="model === 1">
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
      </Col>
    </Row>
    <Modal
        v-model="oneInsert"
        title="一键填充当页涨幅和公式"
        width="800px"
        @on-ok="insert"
        @on-cancel="cancel">
      <Row>
        <Col span="8">
          <span>今年涨幅: </span>
          <InputNumber
              :max="100"
              v-model="oneKeyIncrease"
              :formatter="value => `${value}%`"
              :parser="value => value.replace('%', '')" />
        </Col>
        <Col span="8">
          <span>明年涨幅: </span>
          <InputNumber
              :max="100"
              v-model="oneKeyNextIncrease"
              :formatter="value => `${value}%`"
              :parser="value => value.replace('%', '')" />
        </Col>
        <Col span="8">
          <span>公式选择: </span>
          <Select v-model="oneKeyFormula" style="width:100px">
            <Option v-for="item in formularContent" :value="item.value" :key="item.value"  style="width: 100px">
              {{ item.name }}
            </Option>
          </Select>
        </Col>
      </Row>
      <div  style="margin-top: 30px">
      <div v-for="formular in formularContent" :key="formular.name">
        <p>{{formular.name}} : {{formular.remark}}</p>
      </div>
      </div>
    </Modal>
    <Modal
        v-model="modelRemind"
        title="粗暴模式提醒"
        width="800px"
        @on-ok="cubaoOk"
        @on-cancel="cubaoCancel">
      <p>提示:</p>
      <p>粗暴模式下数据量较大，操作后请耐心等待数据加载</p>
      <p>数据量大时影响返回，建议使用分页模式，建议选择每400条数据进行一次预测</p>
    </Modal>
    <div v-show="popUpShow" class="suspend" :style="positionStyle">
      {{displayText}}
      <div id="first" style="height: 270px;width: 360px">
        设备数量图
      </div>
    </div>
    <div style="height: 20px"></div>
    <Table :columns="gatherColumns" :data="gatherData" ref="gather" v-show="gatherShow"></Table>
    <Modal
        v-model="oneSubmit"
        title="提示">
      <p>正在提交 请请稍后... </p>
    </Modal>
  </div>
</template>

<script>
import * as echarts from 'echarts';
import apiUrl from "utils/api";
import request from "utils/request";
import _ from "lodash";

export default {
  name: "ForecastTable",
  data () {
    return {
      tableColumns: [
        {
          title: '模块名',
          key: 'module',
          fixed: 'left',
          minWidth: 200,
        },
        {
          title: '机器指标',
          key: 'target',
          minWidth: 150,
        },
        {
          title: '预测指标',
          key: 'foreTarget',
          minWidth: 150,
        },
        {
          title: '所属分类',
          key: 'classify',
          minWidth: 150,
        },
        {
          title: '属性',
          key: 'attribute',
          minWidth: 150,
        },
        {
          title: '部署情况',
          key: 'merge',
          minWidth: 150,
        },
        {
          title: '关联指标1',
          key: 'firstIndex',
          minWidth: 250,
        },
        {
          title: '关联指标2',
          key: 'secondIndex',
          minWidth: 250,
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
          title: '重要程度',
          key: 'importLevel',
          minWidth: 150,
        },
        {
          title: '当前水位',
          key: 'nowWater',
          minWidth: 150,
        },
        {
          title: '目标水位',
          key: 'muWater',
          minWidth: 150,
        },
        {
          title: '原机型',
          key: 'yuanMachine',
          minWidth: 250,
        },
        {
          title: '主力机型',
          key: 'mainMachine',
          minWidth: 250,
        },
        {
          title: '机型资源',
          key: 'machineCore',
          minWidth: 250,
        },
        {
          title: '当前机数',
          key: 'machineNum',
          slot: 'test',
          minWidth: 120,
        },
        {
          title: "今年涨幅比",
          slot: "theYear",
          key: 'increase',
          minWidth: 120,
        },
        {
          title: "明年涨幅比",
          slot: "nextYear",
          key: 'nextIncrease',
          minWidth: 120,
        },
        {
          title: "计算公式",
          slot: "formular",
          key: 'formular',
          minWidth: 150,
        },
        {
          title: "年底预计(旧)",
          key: 'oldYear',
          minWidth: 150,
        },
        {
          title: "年底预计资源(旧)",
          key: 'theYearCore',
          minWidth: 200,
        },
        {
          title: "年底预计(新)",
          key: 'theYear',
          minWidth: 150,
        },
        {
          title: "年底预计资源(新)",
          key: 'newYearCore',
          minWidth: 200,
        },
        {
          title: "预计机器差值",
          key: 'diffYear',
          minWidth: 150,
        },
        {
          title: "预计资源差值",
          key: 'diffYearCore',
          minWidth: 150,
        },
        {
          title: "明年增量",
          key: 'nextYear',
          minWidth: 100,
        },
        {
          title: "明年资源增量",
          key: 'nextYearCore',
          minWidth: 150,
        },
        {
          title: '单行操作',
          slot: 'action',
          width: 150,
          align: 'center'
        },
        {
          title: '合并部署模块',
          key: 'mergeModule',
          minWidth: 100,
          ellipsis: true,
        },
        {
          title: "公式描述",
          key: 'formulaExplain',
          ellipsis: true,
          minWidth: 100,
        },
      ],
      tableData: [],
      gatherColumns: [
        {
          title: '机器型号',
          key: 'machine',
          minWidth: 180,
        },
        {
          title: '年底增量',
          key: 'theYear',
          minWidth: 150,
        },
        {
          title: '明年增量',
          key: 'nextYear',
          minWidth: 150,
        },
      ],
      jsonFields: {
        "模块名": "module",
        "机器指标": "target",
        "预测指标": "foreTarget",
        "所属分类": "classify",
        "属性": "attribute",
        "部署情况": "merge",
        "关联指标1": "firstIndex",
        "关联指标2": "secondIndex",
        "开发负责人": "devPrincipal",
        "运维负责人": "ossPrincipal",
        "重要程度": "importLevel",
        "当前水位": "nowWater",
        "目标水位": "muWater",
        "原机型": "yuanMachine",
        "主力机型": "mainMachine",
        "机型资源": "machineCore",
        "当前机数": "machineNum",
        "今年涨幅比": "increase",
        "明年涨幅比": "nextIncrease",
        "计算公式": "formular",
        "年底预计(旧)": "oldYear",
        "年底预计资源(旧)": "theYearCore",
        "年底预计(新)": "theYear",
        "年底预计资源(新)": "newYearCore",
        "预计机器差值": "diffYear",
        "预计资源差值": "diffYearCore",
        "明年增量": "nextYear",
        "明年资源增量": "nextYearCore",
        "合并部署模块": "mergeModule",
        "公式描述": "formulaExplain",
      },
      gatherData: [],
      gatherShow: false,
      formularContent: [],
      border: '全部',
      borderlist: [],
      loading: false,
      loadingPeople: false,
      total: 0,
      current: 1,
      pagesize: 50,
      oneInsert: false,
      oneKeyFormula:0,
      oneKeyIncrease: 0,
      oneKeyNextIncrease: 0,
      people: "",
      peoples: [],
      model: 1,
      modelRemind: false,
      classifyBorder: '全部',
      classifyBorderlist: [],
      popUpShow: false,
      positionStyle: "",
      displayText:"",
      oneSubmit: false,
      tempMap: {}
    }
  },
  mounted() {
    this.getProductType()
    this.getFormularInfo()
    this.getTableData()
    this.getClassifyType()
  },
  methods: {
    /*鼠标移入事件*/
    enter(index) {
      this.popUpShow = true
      const params = new URLSearchParams();

      params.append("module", this.tableData[index].module)
      params.append("logicKey", "chart")

      let url;
      url = apiUrl.list.table;

      request({
        method: "get",
        url,
        params,
      })
          .then((resp) => {
            this.initCharts(resp)
          })
    },
    /*鼠标移出事件*/
    leave() {
      this.popUpShow = false;
    },
    /*鼠标移动事件处理*/
    move(event) {
      //获取鼠标相对于div的位置
      const x = event.pageX + 15 + "px";
      const y = event.pageY + 10 + "px";
      this.positionStyle = { top: y, left: x };
    },
    initCharts(resp) {
      this.chartFirst = echarts.init(document.getElementById('first'))

      this.chartFirst.setOption({
        title: {
          text: "近一年机器数变化情况"
        },
        tooltip: {},
        xAxis: {
          data: resp.result.timeList
        },
        yAxis: {},
        series: [
          {
            name: "机器数",
            type: 'line',
            data: resp.result.machineList,
          },
        ]
      });
    },
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
    getFormularInfo(){
      var params = new URLSearchParams();
      params.append("logicKey", "formular")
      request({
        method: "get",
        url: apiUrl.list.productype,
        params,
      })
          .then((resp) => {
            this.formularContent = resp.result;
          })
    },
    getTableData(){
      this.gatherShow = false
      this.loading = true
      const params = new URLSearchParams();
      params.append("page", this.current);
      params.append("pagesize", this.pagesize);
      if (this.border !== "全部"){
        params.append("product", this.border)
      }
      if (this.classifyBorder !== "全部"){
        params.append("classify", this.classifyBorder)
      }
      if (this.people !== "" && typeof(this.people) !== "undefined"){
        params.append("key", this.people)
      }

      if (this.model === 2) {
        params.append("logicKey", "cubao")
      }

      let url;
      url = apiUrl.list.table;

      request({
        method: "get",
        url,
        params,
      })
          .then((resp) => {
            this.tableData = resp.result;
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
    async postTableData(){
      const test = []
      const tempData = this.tableData
      const templen = this.tableData.length
      this.tempMap = {}
      const biao = (templen + 99) / 100 - 1
      this.loading = true
      for (var i = 0;i < biao; i ++){
        var j = (i+1)*100
        if (j > templen) {
          j = templen
        }
        const params = new URLSearchParams();
        params.append("logicKey", "submit")
        for (var a = i*100; a < j; a++) {
          params.append("moduleData", tempData[a].module)
          params.append("increaseL", tempData[a].increase)
          params.append("increaseNow", tempData[a].nextIncrease)
          params.append("formularList", tempData[a].formular)
        }
        let url;
        url = apiUrl.list.tablePost;

        var _result = await this.postData(params, url)
        test.push(..._result.tableResult)
        for (const k in _result.gatherResult) {
          if (typeof(this.tempMap[k]) !== "undefined"){
            this.tempMap[k][0] = this.tempMap[k][0] + _result.gatherResult[k][0]
            this.tempMap[k][1] = this.tempMap[k][1] + _result.gatherResult[k][1]
          } else {
            this.tempMap[k] = [_result.gatherResult[k][0], _result.gatherResult[k][1]]
          }
        }
      }
      this.tableData = test
      for (const key in this.tempMap) {
        this.gatherData.push({
          "machine": key,
          "theYear": this.tempMap[key][0],
          "nextYear": this.tempMap[key][1]
        })
      }
      this.loading = false
      this.gatherShow = true
    },
    async postData(params, url){
      const resp = await request({
        method: "post",
        url,
        params,
      })
      return resp.result
    },
    increaseChange (row, index){
      this.tableData[index].increase = row.increase
      this.tableData[index].nextIncrease = row.nextIncrease
    },
    selectChange (row, index){
      this.tableData[index].formular = row.formular
    },
    insert () {
      for (const v in this.tableData) {
        this.tableData[v].increase = this.oneKeyIncrease
        this.tableData[v].nextIncrease = this.oneKeyNextIncrease
        this.tableData[v].formular = this.oneKeyFormula
      }
    },
    cancel () {
      this.$Message.info('Clicked cancel');
    },
    cubaoOk () {
      this.modelRemind = false
      this.$Message.info('Clicked ok')
      this.tableData = []
      this.getTableData()
    },
    cubaoCancel () {
      this.modelRemind = false
      this.model = 1
      this.$Message.info('Clicked cancel');
    },
    exportData () {
      for (const v in this.tableData){
        var num = Number(v) + Number(2)
        if (this.tableData[v].formular === 1){
          this.tableData[v].theYear = "=MAX(MAX(ROUND(Q" + num + "*L" + num + "/M" + num + "*(1 + "+ "R" + num + "/100), 0), Q"+ num +"),3)"
          this.tableData[v].nextYear = "=MAX(ROUND(Q" + num + "*L" + num + "/M" + num + "*(1 + "+ "R" + num + "/100)" + "*(1 + "+ "S" + num + "/100), 0)-W" + num + ", 0)"
        } else if (this.tableData[v].formular === 2) {
          this.tableData[v].theYear = "=MAX(CEILING(ROUND(Q" + num + "*L" + num + "/M" + num + "*(1 + "+ "R" + num + "/100), 0), 3), Q"+ num +")"
          this.tableData[v].nextYear = "=MAX(CEILING(ROUND(Q" + num + "*L" + num + "/M" + num + "*(1 + "+ "R" + num + "/100)" + "*(1 +" + "S" + num + "/100), 0)-W" + num + ", 3), 0)"
        } else {
          this.tableData[v].theYear = "=MAX(CEILING(ROUND(Q" + num + "*L" + num + "/M" + num + "*(1 + "+ "R" + num + "/100), 0), 6), Q"+ num +")"
          this.tableData[v].nextYear = "=MAX(CEILING(ROUND(Q" + num + "*L" + num + "/M" + num + "*(1 + "+ "R" + num + "/100)" + "*(1 +" + "S" + num + "/100), 0)-W" + num + ", 6), 0)"
        }
        this.tableData[v].newYearCore = "=W" + num + "*P" + num
        this.tableData[v].diffYear = "=ROUND(Z" + num + "/P" + num+",0)"
        this.tableData[v].diffYearCore = "=X" + num + "-V"+ num
        this.tableData[v].nextYearCore = "=AA"+ num + "*P" + num
      }
      // this.$refs.table.exportCsv({
      //   filename: '模块预算样表',
      // });
      // if (this.gatherShow) {
      //   this.$refs.gather.exportCsv({
      //     filename: '汇总统计样表'
      //   })
      // }
    },
    switchModel (){
      if (this.model === 1) {
        this.model = 2
        this.modelRemind = true
      } else {

        this.tableData = []
        this.model = 1
        this.modelRemind = false
        this.getTableData()
      }
    },
    response(index){
      this.background('info', "数据提交 请稍后...")
      const params = new URLSearchParams();
      params.append("logicKey", "submit")
      params.append("moduleData", this.tableData[index].module)
      params.append("increaseL", this.tableData[index].increase)
      params.append("increaseNow", this.tableData[index].nextIncrease)
      params.append("formularList", this.tableData[index].formular)
      let url;
      url = apiUrl.list.tablePost;

      request({
        method: "get",
        url,
        params,
      })
          .then((resp) => {
            this.tableData.splice(index, 1, resp.result.tableResult[0])
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
  .suspend {
    position: fixed;
    max-width: 400px;
    padding: 10px;
    border: 1px solid #666;
    background: #ccc;
  }
</style>