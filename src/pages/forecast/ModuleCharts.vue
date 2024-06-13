<template>
  <div>
    <div style="margin-bottom: 20px">
      <button type="primary" @click="moduleChart">查看预测</button>
    </div>
    <div style="margin-top: 20px; margin-bottom: 30px">
      <Row>
        <Col span="3">查看时间范围: </Col>
        <Col>
          <RadioGroup v-model="ChartInt">
            <Radio label="3">三个月</Radio>
            <Radio label="6">半年</Radio>
            <Radio label="12">一年</Radio>
            <Radio label="99">全部</Radio>
          </RadioGroup>
        </Col>
      </Row>
    </div>
    <div>
      <div id="first" style="height: 600px;width: 1200px"></div><p style="height: 20px"></p>
      <div id="second" style="height: 600px;width: 1200px"></div><p style="height: 20px"></p>
      <div id="machine" style="height: 600px;width: 1200px"></div><p style="height: 20px"></p>
      <div id="cpu" style="height: 600px;width: 1200px"></div><p style="height: 20px"></p>
      <div id="mem" style="height: 600px;width: 1200px"></div><p style="height: 20px"></p>
      <div id="disk" style="height: 600px;width: 1200px"></div><p style="height: 20px"></p>
    </div>
    <Modal
        v-model="modal"
        title="提示 ~ ~ ~"
        @on-ok="ok"
        @on-cancel="cancel">
      <p>加载中 ~ ~ ~</p>
      <p>请稍后</p>
    </Modal>
  </div>
</template>

<script>
import * as echarts from 'echarts';
import apiUrl from "utils/api";
import request from "utils/request";

export default {
  name: "ModuleCharts",
  data(){
    return {
      chartFirst: null,
      chartSecond: null,
      chartMachine: null,
      chartCPU: null,
      chartMem: null,
      chartDisk: null,
      ChartInt: "6",
      modal: false
    }
  },
  mounted(){
    this.getChartsData(this.$route.params)
  },
  methods:{
    initCharts(resp) {
      this.chartFirst = echarts.init(document.getElementById('first'))

      this.chartFirst.setOption({
        title: {
          text: resp.index_first.indexName
        },
        tooltip: {},
        xAxis: {
          data: resp.index_first.timeslice
        },
        yAxis: {},
        series: [
          {
            name: resp.index_first.indexName,
            type: 'line',
            data: resp.index_first.dataListflo,
          }
        ]
      });

      this.chartSecond = echarts.init(document.getElementById('second'))

      this.chartSecond.setOption({
        title: {
          text: resp.index_second.indexName
        },
        tooltip: {},
        xAxis: {
          data: resp.index_second.timeslice,
        },
        yAxis: {},
        series: [
          {
            name: resp.index_second.indexName,
            type: 'line',
            data: resp.index_second.dataListflo,
          }
        ]
      });

      this.chartMachine = echarts.init(document.getElementById('machine'))

      this.chartMachine.setOption({
        title: {
          text: resp.index_machine.indexName
        },
        tooltip: {},
        xAxis: {
          data: resp.index_machine.timeslice,
        },
        yAxis: {},
        series: [
          {
            name: resp.index_machine.indexName,
            type: 'line',
            data: resp.index_machine.dataListflo,
          }
        ]
      });

      this.chartCPU = echarts.init(document.getElementById('cpu'))

      this.chartCPU.setOption({
        title: {
          text: resp.index_cpu.indexName
        },
        tooltip: {},
        xAxis: {
          data: resp.index_cpu.timeslice,
        },
        yAxis: {},
        series: [
          {
            name: resp.index_cpu.indexName,
            type: 'line',
            data: resp.index_cpu.dataListflo,
          }
        ]
      });

      this.chartMem = echarts.init(document.getElementById('mem'))

      this.chartMem.setOption({
        title: {
          text: resp.index_mem.indexName
        },
        tooltip: {},
        xAxis: {
          data: resp.index_mem.timeslice,
        },
        yAxis: {},
        series: [
          {
            name: resp.index_mem.indexName,
            type: 'line',
            data: resp.index_mem.dataListflo,
          }
        ]
      });

      this.chartDisk = echarts.init(document.getElementById('disk'))

      this.chartDisk.setOption({
        title: {
          text: resp.index_disk.indexName
        },
        tooltip: {},
        xAxis: {
          data: resp.index_disk.timeslice,
        },
        yAxis: {},
        series: [
          {
            name: resp.index_disk.indexName,
            type: 'line',
            data: resp.index_disk.dataListflo,
          }
        ]
      });
    },
    getChartsData(module){
      this.modal = true
      var params = new URLSearchParams();
      params.append("module", module.module);
      params.append("logicKey", this.ChartInt);
      let url;
      url = apiUrl.list.chart;

      request({
        method: "get",
        url,
        params,
      })
          .then((resp) => {
            if (resp.code === 400) {
              this.$Message.warning('数据库没有数据 T.T  请联系管理员查看 ~');
              // this.ChartInt = "6"
              // this.getChartsData(this.$route.params)
            } else {
              this.$Message.success('加载成功 ~ ~ ~ ');
              this.initCharts(resp)
            }
          })
          .finally(() => (this.modal = false));
    },
    moduleChart(){
      this.$router.push(
          {
            path: '/home/forecast/charts/' + this.$route.params.module
          }
      )
    }
  },
  watch: {
    ChartInt: {
      deep: true,
      handler: function () {
        this.getChartsData(this.$route.params)
      }
    },
  }
}
</script>

<style scoped>

</style>