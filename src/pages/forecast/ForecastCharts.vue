<template>
  <div>
    <div style="margin-bottom: 20px">
      <Col span="3">预测时间长度: </Col>
      <Col>
        <RadioGroup v-model="forecastInt">
          <Radio label="3">三个月</Radio>
          <Radio label="6">六个月</Radio>
        </RadioGroup>
      </Col>
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
      forecastInt: "3",
      modal: false
    }
  },
  mounted(){
    this.getForecastChartsData(this.$route.params)
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
            data: resp.index_first.dataList,
          },
          {
            color: "red",
            name: resp.index_first.indexName + "预测",
            type: 'line',
            data: resp.index_first.dataFore,
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
            data: resp.index_second.dataList,
          },
          {
            color: "red",
            name: resp.index_second.indexName + "预测",
            type: 'line',
            data: resp.index_second.dataFore,
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
            data: resp.index_machine.dataList,
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
            data: resp.index_cpu.dataList,
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
            data: resp.index_mem.dataList,
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
            data: resp.index_disk.dataList,
          }
        ]
      });
    },
    getForecastChartsData(module){
      console.log(module.module)
      this.modal = true
      var params = new URLSearchParams();
      params.append("module", module.module);
      params.append("forecastint", parseInt(this.forecastInt))
      let url;
      url = apiUrl.list.forecastChart;

      request({
        method: "get",
        url,
        params,
      })
          .then((resp) => {
            this.initCharts(resp)
            this.$Message.success('加载完成');
          })
          .finally(() => (this.modal = false));
    },
    ok () {
      this.$Message.info('Clicked ok');
    },
    cancel () {
      this.$Message.info('Clicked cancel');
    }
  },
  watch: {
    forecastInt: {
      deep: true,
      handler: function () {
        console.log(this.forecastInt)
        this.getForecastChartsData(this.$route.params)
      },
    },
  }
}
</script>

<style scoped>

</style>