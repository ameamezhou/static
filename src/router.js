import Vue from 'vue';
import VueRouter from 'vue-router';

Vue.use(VueRouter);


const routes = [{
  path: '/',
  component: () => import(/* webpackChunkName: "home" */ './App'),
  children: [{
    path: '',
    name: 'Home',
    redirect: {
      name: 'ModuleForecast',
    },
    component: () => import(/* webpackChunkName: "home" */ './pages/Home'),
    children: [{
      path: 'home',
      component: () => import(/* webpackChunkName: "forecast" */ './pages/forecast/Instance'),
      children: [{
        path: 'forecast',
        name: 'InsForecast',
        component: () => import(/* webpackChunkName: "forecast" */ './pages/forecast/Forecast'),
      },
      {
        path: 'build',
        name: 'BuildAbolish',
        component: () => import(/* webpackChunkName: "forecast" */ './pages/forecast/BuildAboli'),
      },
      {
        path: 'module',
        name: 'ModuleForecast',
        component: () => import(/* webpackChunkName: "forecast" */ './pages/forecast/ModuleForecast'),
      },
      {
        path: 'product',
        name: 'ModuleStock',
        component: () => import(/* webpackChunkName: "forecast" */ './pages/forecast/ModuleStock'),
      },
      {
        path: 'table',
        name: 'ForecastTable',
        component: () => import(/* webpackChunkName: "forecast" */ './pages/forecast/ForecastTable'),
      },
      {
        path: 'charts/:module',
        name: 'ModuleCharts',
        component: () => import(/* webpackChunkName: "forecast" */ './pages/forecast/ModuleCharts'),
      },
      {
        path: 'forecast/charts/:module',
        name: 'ForecastCharts',
        component: () => import(/* webpackChunkName: "forecast" */ './pages/forecast/ForecastCharts'),
      },
      {
        path: 'index',
        name: 'NewIndex',
        component: () => import(/* webpackChunkName: "forecast" */ './pages/forecast/NewIndex'),
      }],
    }],
  }],
}];

export default new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes,
});
