<template>
  <div>
    <Form :model="formItem" :label-width="80">
      <FormItem label="开始时间">
        <Row>
          <Col span="20">
            <DatePicker type="year" placeholder="Select year" v-model="formItem.startime"></DatePicker>
          </Col>
          <Col span="4">
<!--            <download-excel-->
<!--                class = "export-excel-wrapper"-->
<!--                :data = "json_data"-->
<!--                :fields = "json_fields"-->
<!--                name = "远程诊断报告导出.xls">-->
<!--              &lt;!&ndash; 上面可以自定义自己的样式，还可以引用其他组件button &ndash;&gt;-->
<!--              <Button type="primary" size="small" @click="test">导出EXCEL</Button>-->
<!--            </download-excel>-->
            <Button type="info" @click="goTable()">查看产品-小组预算</Button>
          </Col>
        </Row>
      </FormItem>
      <FormItem label="截止时间">
        <DatePicker type="year" placeholder="Select year" v-model="formItem.stoptime"></DatePicker>
      </FormItem>
      <FormItem label="所属产品">
        <RadioGroup v-model="border" type="button">
          <Radio label="全部" style="width: 160px"></Radio>
          <Radio v-for="item in borderlist" :label="item" :key="item" style="width: 160px"></Radio>
        </RadioGroup>
      </FormItem>
      <FormItem label="所属分类">
        <RadioGroup v-model="classifyBorder" type="button">
          <Radio label="全部" style="width: 160px"></Radio>
          <Radio v-for="item in classifyBorderlist" :label="item" :key="item" style="width: 160px"></Radio>
        </RadioGroup>
      </FormItem>
      <FormItem label="所属小组">
        <RadioGroup v-model="groupBorder" type="button">
          <Radio label="全部" style="width: 160px"></Radio>
          <Radio v-for="item in groupBorderlist" :label="item" :key="item" style="width: 160px"></Radio>
        </RadioGroup>
      </FormItem>
      <FormItem label="搜索">
        <Row>
          <Col span="6">
            <Select
                v-model="formItem.module"
                placeholder="模块名"
                filterable
                clearable
                remote
                :remote-method="debouncedGetModule"
                :loading="loadingModule"
            >
              <Option v-for="item in modules" :key="item" :value="item">{{ item }}</Option>
            </Select>
          </Col>
          <Col span="4"></Col>
          <Col span="6">
            <Select
                v-model="formItem.people"
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
        </Row>
      </FormItem>
      <FormItem>
        <Table border :columns="columns1" :data="stockdata">
          <template slot-scope="{ row }" slot="name">
            <strong>{{ row.name }}</strong>
          </template>
          <template slot-scope="{ row, index }" slot="action">
            <div class="dataTable">
              <Button type="primary" size="small" style="margin-right: 5px" @click="response(index)">View</Button>
            </div>
          </template>
        </Table>
      </FormItem>
      <FormItem>
        <Row>
          <Col :span="16"></Col>
          <Col>
            <Page
                class="dataTable"
                :page-size="pagesize"
                :total="total"
                :current.sync="current"
                @on-change="getForecastModuleData"
                @on-page-size-change="handleSizeChange"
                show-total
                show-sizer
            />
          </Col>
        </Row>
      </FormItem>
    </Form>
    <Modal
        v-model="modal"
        title="模块流水信息"
        width="900px"
        @on-ok="ok"
        @on-cancel="cancel">
      <Table :columns="flowcolumns" :data="flowdata"></Table>
    </Modal>
  </div>
</template>

<script>
import apiUrl from "utils/api";
import request from "utils/request";
import _ from "lodash";

export default {
  name: "ModuleForecast",
  data () {
    return {
      indeterminate: true,
      checkAll: false,
      formItem: {
        startime: '',
        stoptime: '',
        sKey: '',
        module: '',
        people: '',
      },
      modules: [],
      peoples: [],
      columns1: [
        {
          title: '模块名',
          key: 'moduleName',
          // fixed: 'left',
          minWidth: 180,
          render: (h, params) => {
            return h('span', {
              props: {
                type: 'primary',
                size: 'small'
              },
              style: {
                marginRight: '5px'
              },
              on: {
                click: () => {
                  this.moduleChart(params.index)
                }
              }
            }, params.row.moduleName)
          }
        },
        {
          title: '产品',
          key: 'moduleProduct',
          minWidth: 150
        },
        {
          title: '分类',
          key: 'moduleClassify',
          minWidth: 150
        },
        {
          title: '开发负责人',
          key: 'devPrinciple',
          minWidth: 150
        },
        {
          title: '运维负责人',
          key: 'opsPrinciple',
          minWidth: 150
        },
        {
          title: '主力机型',
          key: 'mainMachine',
          minWidth: 150
        },
        {
          title: '当前机器数',
          key: 'nowMachine',
          minWidth: 150
        },
        {
          title: '预测指标',
          key: 'foreIndex',
          minWidth: 150
        },
        {
          title: '当前资源',
          key: 'nowResource',
          minWidth: 150
        },
        {
          title: '剩余资源',
          key: 'surResource',
          minWidth: 150
        },
        {
          title: '预算更新时间',
          key: 'foreTime',
          minWidth: 150
        },
        {
          title: '预算截止时间',
          key: 'endTime',
          minWidth: 150
        },
        {
          title: '预算详情',
          slot: 'action',
          width: 100,
          align: 'center'
        },
      ],
      stockdata: [],
      searchKey: '',
      total: 0,
      current: 1,
      pagesize: 10,
      border: '全部',
      borderlist: [],
      modal: false,
      loading: true,
      flowdata: [],
      flowcolumns: [
        {
          title: '模块名',
          key: 'module',
          minWidth: 180
        },
        {
          title: '单号',
          key: 'tableID',
          minWidth: 180
        },
        {
          title: '操作类型',
          key: 'operatype',
          minWidth: 100
        },
        {
          title: '指标',
          key: 'specify',
          minWidth: 120
        },
        {
          title: '数值',
          key: 'chanum',
          minWidth: 100
        },
        {
          title: '操作时间',
          key: 'operatime',
          minWidth: 150
        },
        {
          title: '生效时间',
          key: 'starttime',
          minWidth: 150
        }
      ],
      groupBorder: '全部',
      groupBorderlist: [],
      classifyBorder: '全部',
      classifyBorderlist: [],
      loadingModule: false,
      loadingPeople: false,
      json_fields: {
        "头部-诊断名称": "name",    //常规字段
        "头部-联系电话": "phone.mobile", //支持嵌套属性
        "头部-损坏区域代码": {
          field: "phone.landline",
          //自定义回调函数
          callback: value => {
            return `损坏区域代码 - ${value}`;
          }
        }
      },
      json_data: [
        {
          name: "损坏的组件一",
          city: "New York",
          country: "United States",
          birthdate: "1978-03-15",
          phone: {
            mobile: "1-541-754-3010",
            landline: "(541) 754-3010"
          }
        },
        {
          name: "损坏的组件二",
          city: "Athens",
          country: "Greece",
          birthdate: "1987-11-23",
          phone: {
            mobile: "+1 855 275 5071",
            landline: "(2741) 2621-244"
          }
        }
      ],
      json_meta: [
        [
          {
            " key ": " charset ",
            " value ": " utf- 8 "
          }
        ]
      ]
    }
  },
  mounted(){
    this.getProductType()
    this.getGroupType()
    this.getClassifyType()
    const startTime = new Date()
    startTime.setFullYear(startTime.getFullYear()-1)
    const stopTime = new Date()
    this.formItem.startime = startTime
    this.formItem.stoptime = stopTime
    this.getForecastModuleData()
  },
  methods: {
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
    getForecastModuleData(){
      var params = new URLSearchParams();

      params.append("page", this.current);
      params.append("pagesize", this.pagesize);
      params.append("startime", this.formItem.startime.getFullYear());
      params.append("stoptime", this.formItem.stoptime.getFullYear());

      if (this.formItem.people) {
        params.append("key", this.formItem.people);
      }
      if (this.formItem.module) {
        params.append("module", this.formItem.module);
      }

      if (this.border !== "全部"){
        params.append("product", this.border)
      }

      if (this.groupBorder !== "全部"){
        params.append("group", this.groupBorder)
      }

      if (this.classifyBorder !== "全部"){
        params.append("classify", this.classifyBorder)
      }

      let url;
      url = apiUrl.list.stock;

      request({
        method: "get",
        url,
        params,
      })
          .then((resp) => {
            this.stockdata = resp.result;
            this.total = resp.total
          })
          .finally(() => (this.loading = false));
    },
    getGroupType(){
      var params = new URLSearchParams();
      params.append("logicKey", "groups")
      request({
        method: "get",
        url: apiUrl.list.productype,
        params,
      })
          .then((resp) => {
            this.groupBorderlist = resp.result;
          })
    },
    getClassifyType(){
      var params = new URLSearchParams();
      params.append("logicKey", "classify")
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
    getProductType(){
      request({
        method: "get",
        url: apiUrl.list.productype,
      })
          .then((resp) => {
            this.borderlist = resp.result;
          })
    },
    response(index){
      this.modal = true
      console.log(index)
      var params = new URLSearchParams();

      params.append("startime", this.stockdata[index].foreTime);
      params.append("stoptime", this.stockdata[index].endTime);
      params.append("module", this.stockdata[index].moduleName)
      params.append("logicKey", "flow")

      let url;
      url = apiUrl.list.productype;

      request({
        method: "get",
        url,
        params,
      })
          .then((resp) => {
            this.flowdata = resp.result
          })
          .finally(() => (this.loading = false));
    },
    handleSizeChange(size) {
      this.pagesize = size;
      this.current = 1;
      this.getForecastModuleData();
    },
    ok () {

    },
    cancel () {

    },
    moduleChart(index){
      this.$router.push(
          {
            path: 'charts/' + this.stockdata[index].moduleName
          }
      )
    },
    test(){
      for (const k in this.columns1){
        if (this.columns1[k].key) {
          this.json_fields[this.columns1[k].title] = this.columns1[k].key
        }
      }
    },
    goTable(){
      this.$router.push(
          {
            path: 'product'
          }
      )
    }
  },
  watch: {
    border: {
      deep: true,
      handler: function () {
        this.getForecastModuleData()
        this.getClassifyType()
      }
    },
    classifyBorder: {
      deep: true,
      handler: function () {
        this.getForecastModuleData()
      }
    },
    groupBorder: {
      deep: true,
      handler: function () {
        this.getForecastModuleData()
      }
    },
    formItem: {
      deep: true,
      handler: function () {
        const startTime = new Date()
        startTime.setFullYear(startTime.getFullYear() - 1)
        const stopTime = new Date()
        if (this.formItem.startime.getFullYear() > this.formItem.stoptime.getFullYear()) {
          this.$Message.warning('开始时间要小于截止时间');
          this.formItem.startime = startTime
          this.formItem.stoptime = stopTime
          return
        }
        this.getForecastModuleData()
      }
    },
  }
}
</script>

<style scoped>

</style>