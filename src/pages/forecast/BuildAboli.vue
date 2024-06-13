<template>
  <Form :model="formItem" :label-width="80">
    <FormItem label="模块" prop="module">
      <Select
          v-model="formItem.module"
          filterable
          remote
          :remote-method="debouncedGetModule"
          :loading="loadingModule"
      >
        <Option v-for="item in modules" :key="item" :value="item">{{ item }}</Option>
      </Select>
    </FormItem>
    <FormItem label="日期">
        <DatePicker type="date" placeholder="Select date" v-model="formItem.date"></DatePicker>
    </FormItem>
    <FormItem label="操作">
      <RadioGroup v-model="formItem.radio">
        <Radio label="build">扩容</Radio>
        <Radio label="abolish">裁撤</Radio>
      </RadioGroup>
    </FormItem>
    <FormItem label="机器数">
      <InputNumber :max="150" :min="1" v-model="increase"></InputNumber>
    </FormItem>
    <FormItem label="预测机型">
      <Select v-model="formItem.machine">
        <Option v-for="item in machines" :key="item" :value="item">{{ item }}</Option>
      </Select>
    </FormItem>
    <FormItem label="备注">
      <Input v-model="formItem.textarea" type="textarea" :autosize="{minRows: 2,maxRows: 5}" placeholder="备注"></Input>
    </FormItem>
    <FormItem>
      <Button type="primary">Submit</Button>
      <Button style="margin-left: 8px">Cancel</Button>
    </FormItem>
  </Form>
</template>

<script>
import apiUrl from "utils/api";
import request from "utils/request";
import _ from "lodash";

export default {
  name: "Build",
  data () {
    return {
      formItem: {
        module: '',
        radio: 'build',
        date: '',
        textarea: '',
        machine:''
      },
      modules: [],
      machines: [],
      loadingModule: false,
      increase: 1
    }
  },
  mounted(){
    this.getMachine()
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
    getMachine(){
      request({
        method: "get",
        url: apiUrl.list.machine,
      })
          .then((resp) => {
            this.machines = resp.result;
          })
    }
  }
}
</script>

<style scoped>

</style>