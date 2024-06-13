<template>
  <div class="layout">
    <Layout>
      <Header class="layout-header">
        <div class="wrapper-header-nav">
          <Menu
            :active-name="$route.name"
            mode="horizontal"
            theme="light"
            width="auto"
            class="menu"
            @on-select="handleSelect"
          >
            <MenuItem name="BuildAbolish">
              <Icon type="md-add-circle" />新建裁撤
            </MenuItem>
            <MenuItem name="InsForecast">
              <Icon type="md-list-box" />预算清单
            </MenuItem>
            <MenuItem name="ModuleForecast">
              <Icon type="ios-archive" />模块预算
            </MenuItem>
            <MenuItem name="ForecastTable">
              <Icon type="ios-calculator" />模块预测
            </MenuItem>
            <MenuItem name="NewIndex">
              <Icon type="md-add" />添加指标
            </MenuItem>
          </Menu>
        </div>
        <div class="wrapper-header-feedback">
          <div class="feedback">
            遇到问题
            <a href="wxwork://message?username=fairyzwang">
              <Icon type="ios-at-outline" class="feedback__icon" />fairyzwang
            </a>
          </div>
        </div>
      </Header>
      <Content :style="{padding: '0 100px', height: '100vh', overflow: 'scroll'}">
        <Card class="content-card">
          <div>
            <router-view></router-view>
          </div>
        </Card>
      </Content>
    </Layout>
  </div>
</template>

<script>
export default {
  data() {
    return {};
  },
  computed: {},
  methods: {
    handleSelect(name) {
      // console.log(name)
      // console.log(this.$route.name)
      if (name !== this.$route.name) {
        this.$router.push({ name: name });
      }
    },
  },
};
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}
</style>

<style  scoped>
.layout {
  background: #f5f7f9;
  position: relative;
  overflow: hidden;
}
.layout-header {
  position: fixed;
  width: 100%;
  z-index: 1;
  background: #fff;
  box-shadow: 0 1px 1px rgba(0, 0, 0, 0.1);
  height: 48px;
  line-height: 48px;
  padding: 0 80px;
}
.content-card {
  margin: 80px 0;
  z-index: 0;
}
.wrapper-header-nav {
  height: inherit;
  float: left;
}
.wrapper-header-feedback {
  height: inherit;
  float: right;
}
.feedback {
  padding: 0 20px;
}
.feedback__icon {
  padding: 0 3px;
}
.menu {
  height: inherit;
  line-height: inherit;
}
/* remove underline */
.menu:after {
  background: #fff;
}
</style>