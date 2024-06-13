import Vue from 'vue';
import App from './App.vue';
import router from './router';
import {
  Layout,
  Sider,
  Menu,
  MenuGroup,
  MenuItem,
  Icon,
  Content,
  Header,
  Form,
  FormItem,
  Select,
  Option,
  Input,
  Button,
  Row,
  Col,
  Table,
  Page,
  RadioGroup,
  Radio,
  Divider,
  Message,
  Modal,
  Card,
  Tooltip,
  DatePicker,
  Slider,
  InputNumber,
  CheckboxGroup,
  Checkbox,
  Tabs,
  TabPane,
  Poptip
} from 'view-design';
import 'view-design/dist/styles/iview.css';
import JsonExcel from 'vue-json-excel';


Vue.config.productionTip = false;
Vue.component('Layout', Layout);
Vue.component('Sider', Sider);
Vue.component('Slider', Slider);
Vue.component('Menu', Menu);
Vue.component('MenuGroup', MenuGroup);
Vue.component('MenuItem', MenuItem);
Vue.component('Icon', Icon);
Vue.component('Content', Content);
Vue.component('Header', Header);
Vue.component('Form', Form);
Vue.component('FormItem', FormItem);
Vue.component('Select', Select);
Vue.component('Option', Option);
Vue.component('Input', Input);
Vue.component('Button', Button);
Vue.component('Row', Row);
Vue.component('Col', Col);
Vue.component('Table', Table);
Vue.component('Page', Page);
Vue.component('RadioGroup', RadioGroup);
Vue.component('Radio', Radio);
Vue.component('Divider', Divider);
Vue.component('Modal', Modal);
Vue.component('Card', Card);
Vue.component('Tooltip', Tooltip);
Vue.component('DatePicker', DatePicker);
Vue.component('InputNumber', InputNumber);
Vue.component('CheckboxGroup', CheckboxGroup);
Vue.component('Checkbox', Checkbox);
Vue.component('Tabs', Tabs);
Vue.component('TabPane', TabPane);
Vue.component('Poptip', Poptip);
Vue.component('downloadExcel', JsonExcel);

Vue.prototype.$Message = Message;
Vue.prototype.$Modal = Modal;

new Vue({
  router,
  render: h => h(App),
}).$mount('#app');
