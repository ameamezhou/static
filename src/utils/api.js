const BASE = "/wego/forecast/api";

const API_URL = {
    cmdb: {
        module: `${BASE}/cmdb/module`,
        region: `${BASE}/cmdb/region`,
        product: `${BASE}/cmdb/product`
    },
    list: {
        show: `${BASE}/list/show`,
        forecast: `${BASE}/list/forecast`,
        module: `${BASE}/list/module`,
        machine: `${BASE}/list/machine`,
        stock: `${BASE}/list/stock`,
        chart: `${BASE}/list/chart`,
        newIndex: `${BASE}/list/index`,
        getIndex: `${BASE}/list/getindex`,
        bindIndex: `${BASE}/send/bindindex`,
        showIndex: `${BASE}/list/showindex`,
        showIndexModule: `${BASE}/list/indexmodule`,
        forecastChart: `${BASE}/list/forecast/chart`,
        productype: `${BASE}/list/productype`,
        table: `${BASE}/list/table`,
        tablePost: `${BASE}/forecast/post`,
    },
};

export default API_URL;
