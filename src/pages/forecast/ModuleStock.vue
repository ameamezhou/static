<template>
  <Tabs>
    <TabPane label="产品预算" icon="ios-cog-outline">
      <Form :model="productFormItem" :label-width="80">
        <FormItem label="开始时间">
          <DatePicker type="year" placeholder="Select year" v-model="productFormItem.startime"></DatePicker>
        </FormItem>
        <FormItem label="截止时间">
          <DatePicker type="year" placeholder="Select year" v-model="productFormItem.stoptime"></DatePicker>
        </FormItem>
        <FormItem label="所属产品">
          <RadioGroup v-model="productBorder" type="button">
            <Radio label="全部" style="width: 160px"></Radio>
            <Radio v-for="item in productBorderlist" :label="item" :key="item" style="width: 160px"></Radio>
          </RadioGroup>
        </FormItem>
        <div v-for="item in productlist" :key="item">
          <FormItem :label="item.productName" label-width="150">
            <Table border
                   :columns="productColumns"
                   :data="item.productDatas"
                   width="460"></Table>
          </FormItem>
        </div>
      </Form>
    </TabPane>
    <TabPane label="小组预算" icon="md-cog">
      <Form :model="groupFormItem" :label-width="80">
        <FormItem label="开始时间">
          <DatePicker type="year" placeholder="Select year" v-model="groupFormItem.startime"></DatePicker>
        </FormItem>
        <FormItem label="截止时间">
          <DatePicker type="year" placeholder="Select year" v-model="groupFormItem.stoptime"></DatePicker>
        </FormItem>
        <FormItem label="所属小组">
          <RadioGroup v-model="groupBorder" type="button">
            <Radio label="全部" style="width: 160px"></Radio>
            <Radio v-for="item in groupBorderlist" :label="item" :key="item" style="width: 160px"></Radio>
          </RadioGroup>
        </FormItem>
        <div v-for="item in grouplist" :key="item">
          <FormItem :label="item.productName" label-width="150">
            <Table border
                   :columns="productColumns"
                   :data="item.productDatas"
                   width="460"></Table>
          </FormItem>
        </div>
      </Form>
    </TabPane>
  </Tabs>
</template>

<script>
import apiUrl from "utils/api";
import request from "utils/request";

export default {
  name: "ModuleStock",
  data () {
    return {
      productFormItem: {
        startime: '',
        stoptime: '',
      },
      groupFormItem: {
        startime: '',
        stoptime: '',
      },
      productBorder: '全部',
      productBorderlist: [],
      groupBorder: '全部',
      groupBorderlist: [],
      productColumns: [
        {
          title: '资源类型',
          key: 'resourceType',
          minWidth: 100,
        },
        {
          title: 'CPU核数',
          key: 'cpuNum',
          minWidth: 120
        },
        {
          title: '内存GB',
          key: 'memNum',
          minWidth: 120
        },
        {
          title: 'SSD储存块',
          key: 'SSDNum',
          minWidth: 120
        }
      ],
      productlist: [],
      grouplist: [],
      stopKey: 0,
      stopGroup: 0
    }
  },
  beforeMount(){
    const startTime = new Date()
    startTime.setFullYear(startTime.getFullYear()-1)
    const stopTime = new Date()
    this.productFormItem.startime = startTime
    this.productFormItem.stoptime = stopTime
    this.groupFormItem.startime = startTime
    this.groupFormItem.stoptime = stopTime
  },
  mounted(){
    this.getProductType()
    this.getGroupType()
    this.getForecastProductData()
    this.getGroupData()
  },
  methods: {
    getProductType(){
      var params = new URLSearchParams();
      params.append("logicKey", "classify")
      request({
        method: "get",
        url: apiUrl.list.productype,
        params,
      })
          .then((resp) => {
            this.productBorderlist = resp.result;
          })
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
    getForecastProductData(){
      var params = new URLSearchParams();
      params.append("logicKey", "products")
      params.append("startime", this.productFormItem.startime.getFullYear());
      params.append("stoptime", this.productFormItem.stoptime.getFullYear());
      if (this.productBorder !== "全部"){
        params.append("classify", this.productBorder)
      }

      let url;
      url = apiUrl.list.productype;

      request({
        method: "get",
        url,
        params,
      })
          .then((resp) => {
            this.productlist = resp.result;
            this.total = resp.total
          })
          .finally(() => (this.loading = false));
    },
    getGroupData(){
      var params = new URLSearchParams();
      params.append("logicKey", "groupdata")
      params.append("startime", this.groupFormItem.startime.getFullYear());
      params.append("stoptime", this.groupFormItem.stoptime.getFullYear());
      if (this.groupBorder !== "全部"){
        params.append("group", this.groupBorder)
      }

      let url;
      url = apiUrl.list.productype;

      request({
        method: "get",
        url,
        params,
      })
          .then((resp) => {
            this.grouplist = resp.result;
            this.total = resp.total
          })
          .finally(() => (this.loading = false));
    }
  },
  watch: {
    productBorder: {
      deep: true,
      handler: function () {
        this.getForecastProductData()
      }
    },
    groupBorder: {
      deep: true,
      handler: function () {
        this.getGroupData()
      }
    },
    productFormItem: {
      deep: true,
      handler: function () {
        const startTime = new Date()
        startTime.setFullYear(startTime.getFullYear() - 1)
        const stopTime = new Date()
        if (this.productFormItem.startime.getFullYear() > this.productFormItem.stoptime.getFullYear()) {
          this.$Message.warning('开始时间要小于截止时间');
          this.productFormItem.startime = startTime
          this.productFormItem.stoptime = stopTime
          return
        }
        if (this.stopKey === 0) {
          this.stopKey = 1
          return
        }
        this.getForecastProductData()
      }
    },
    groupFormItem: {
      deep: true,
      handler: function () {
        const startTime = new Date()
        startTime.setFullYear(startTime.getFullYear() - 1)
        const stopTime = new Date()
        if (this.productFormItem.startime.getFullYear() > this.productFormItem.stoptime.getFullYear()) {
          this.$Message.warning('开始时间要小于截止时间');
          this.productFormItem.startime = startTime
          this.productFormItem.stoptime = stopTime
          return
        }
        if (this.stopGroup === 0) {
          this.stopGroup = 1
          return
        }
        this.getGroupData()
      }
    },
  }
}
</script>

<style scoped>

</style>