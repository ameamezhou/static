<template>
  <div>
    <Form :model="formItem" :label-width="80">
      <FormItem label="日期">
            <DatePicker type="date" placeholder="Select date" v-model="formItem.date"></DatePicker>
      </FormItem>
      <FormItem label="产品">
        <RadioGroup v-model="formItem.produce">
          <Radio label="all">全部</Radio>
          <Radio label="qy">qy</Radio>
          <Radio label="weread">weread</Radio>
          <Radio label="ww">ww</Radio>
          <Radio label="wwl">wwl</Radio>
        </RadioGroup>
      </FormItem>
      <FormItem label="级别">
        <RadioGroup v-model="formItem.mlevel">
          <Radio label="all">全部</Radio>
          <Radio label="核心">核心</Radio>
          <Radio label="重要">重要</Radio>
          <Radio label="普通">普通</Radio>
          <Radio label="离线">离线</Radio>
          <Radio label="待上线">待上线</Radio>
          <Radio label="待下线">待下线</Radio>
        </RadioGroup>
      </FormItem>
      <FormItem label="搜索">
        <Input
            v-model="searchKey"
            placeholder="模块名"
            style="width: 330px"
            :search="true"
            @on-search="formItem.skey = searchKey"
        />
      </FormItem>
      <Row>
        <Col span="24">
          <Table border
                 class="dataTable"
                 :columns="columns"
                 :data="tableData"
                 :loading="loading">
            <template slot-scope="{ row }" slot="name">
              <strong>{{ row.name }}</strong>
            </template>
            <template slot-scope="{ row, index }" slot="action">
              <div class="dataTable">
                <Button type="primary" size="small" style="margin-right: 5px" @click="response(index)">View</Button>
                <Button type="error" size="small" @click="remove(index)">Delete</Button>
              </div>
            </template>
          </Table>
          <Page
              class="dataTable"
              :page-size="pagesize"
              :total="total"
              :current.sync="current"
              @on-change="getList"
              @on-page-size-change="handleSizeChange"
              show-total
              show-sizer
          />
        </Col>
      </Row>
    </Form>
    <Modal
        v-model="forecast"
        title="Common Modal dialog box title"
        @on-ok="submit"
        @on-cancel="cancel">
      <Form :model="formForecast" :label-width="80">
        <FormItem label="模块名">
          <p>{{this.temp.module}}</p>
        </FormItem>
        <FormItem label="时间">
          <p>{{this.temp.time}}</p>
        </FormItem>
        <FormItem label="涨幅比(%)">
          <InputNumber :max="150" :min="1" v-model="increase"></InputNumber>
        </FormItem>
        <FormItem label="预测指标">
          <RadioGroup v-model="formForecast.target">
            <Radio label="cpu">CPU</Radio>
            <Radio label="mem">内存</Radio>
            <Radio label="disk">磁盘</Radio>
          </RadioGroup>
        </FormItem>
      </Form>
    </Modal>
  </div>
</template>

<script>
import apiUrl from "utils/api";
import request from "utils/request";

export default {
  name: "InsCapacity",
  data(){
    return {
      formItem: {
        produce: 'all',
        mlevel: 'all',
        checkbox: [],
        switch: true,
        date: '',
        skey: ''
      },
      searchKey: '',
      columns: [
        {
          title: '模块名',
          key: 'module',
          fixed: 'left',
          minWidth: 200
        },
        {
          title: '时间',
          key: 'time',
          minWidth: 200
        },
        {
          title: '所属产品',
          key: 'product',
          minWidth: 150
        },
        {
          title: '机器数',
          key: 'machine_num',
          minWidth: 150
        },
        {
          title: '机型',
          key: 'mtype',
          minWidth: 150
        },
        {
          title: '总核心数',
          key: 'core_num',
          minWidth: 150
        },
        {
          title: '总内存大小',
          key: 'mem_total',
          minWidth: 150
        },
        {
          title: '总磁盘大小',
          key: 'disk_total',
          minWidth: 150
        },
        {
          title: '模块等级',
          key: 'import_level',
          minWidth: 150
        },
        {
          title: '预测指标',
          key: 'forecast_key',
          minWidth: 150
        },
        {
          title: '预测指标数',
          key: 'forecast',
          minWidth: 150
        },
        {
          title: 'Action',
          slot: 'action',
          width: 150,
          align: 'center'
        }
      ],
      tableData: [],
      total: 0,
      current: 1,
      pagesize: 10,
      loading: false,
      sendDate: '',
      forecast: false,
      showForecast: false,
      forecastNum: 0,
      formForecast: {
        input: '',
        target: '',
      },
      temp: {
        module: '',
        time: '',
        index: 0,
        cpu: 0,
        mem: 0,
        disk: 0
      },
      increase: 0,
    }
  },
  computed:{},
  mounted() {
    this.addDate();
    this.getList();
  },
  methods:{
    getList(){
      var params = new URLSearchParams();
      this.getStrDate(this.formItem.date);
      params.append("page", this.current);
      params.append("pagesize", this.pagesize);
      params.append("date", this.sendDate);

      if (this.formItem.mlevel !== "all") {
        params.append("filterby", "Import_level:" + this.formItem.mlevel);
      }

      if (this.formItem.produce !== "all") {
        params.append("filterby", "product:" + this.formItem.produce);
      }

      if (this.formItem.skey) {
        params.append("key", this.formItem.skey);
      }

      let url;
      url = apiUrl.list.show;

      this.loading = true;

      request({
        method: "get",
        url,
        params,
      })
          .then((resp) => {
            this.tableData = resp.result;
            this.total = resp.total;
            // console.log(resp)
          })
          .finally(() => (this.loading = false));
    },
    remove (index) {
      this.data6.splice(index, 1);
    },
    submit(){
      // console.log(this.temp, this.formForecast.input, this.formForecast.target)
      var params = new URLSearchParams();
      params.append("module", this.temp.module);
      params.append("date", this.temp.time);
      params.append("increase", this.increase);
      if (this.formForecast.target === 'cpu') {
        params.append("dimension", "cpu = " + this.temp.cpu);
      }else if (this.formForecast.target == 'mem') {
        params.append("dimension", "mem = " + this.temp.mem);
      }else {
        params.append("dimension", "disk = " + this.temp.disk);
      }

      let url;
      url = apiUrl.list.forecast;

      this.loading = true;

      request({
        method: "get",
        url,
        params,
      })
          .then((resp) => {
            this.forecastNum = resp.result;
            this.tableData[this.temp.index].forecast = resp.result
            this.tableData[this.temp.index].forecast_key = this.formForecast.target
            // console.log(resp)
          })
          .finally(() => (this.loading = false));

    },
    cancel () {
      this.$Message.info('Clicked cancel');
    },
    addDate(){
      const nowDate = new Date();
      // const hour = new Date().getDay()
      // this.formItem.date = nowDate - hour
      const date = {
        year: nowDate.getFullYear(),
        month: nowDate.getMonth() + 1,
        date: nowDate.getDate(),
      }
      this.formItem.date = date.year + '-' + date.month + '-' + (date.date - 1)
    },
    handleSizeChange(size) {
      this.pagesize = size;
      this.current = 1;
      this.getList();
    },
    getStrDate(nowDate){
      const date = {
        year: nowDate.getFullYear(),
        month: nowDate.getMonth() + 1,
        date: nowDate.getDate(),
      }
      if (date.month < 10){
        if (date.date < 10){
          this.sendDate = date.year + '-0' + date.month + '-0' + date.date
        }else{
          this.sendDate = date.year + '-0' + date.month + '-' + date.date
        }
      }else{
        if (date.date < 10){
          this.sendDate = date.year + '-' + date.month + '-0' + date.date
        }else{
          this.sendDate = date.year + '-' + date.month + '-' + date.date
        }
      }
    },
    response(index){
      this.temp.module=this.tableData[index].module
      this.temp.time=this.tableData[index].time
      this.temp.index=index
      this.temp.cpu=this.tableData[index].core_num
      this.temp.mem=this.tableData[index].mem_total
      this.temp.disk=this.tableData[index].disk_total
      this.formForecast.target=this.tableData[index].forecast_key
      this.forecast=true
    }

  },
  watch: {
    formItem: {
      deep: true,
      handler: function () {
        this.current = 1
        this.getList();
      },
    },
  }
}
</script>

<style scoped>

</style>