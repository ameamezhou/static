import axios from "axios";
import {
    Message
} from "view-design";

function request(options) {
    return axios(options).then(resp => {
        const {
            data: {
                code,
                msg,
                data
            }
        } = resp;
        if (code !== 0) {
            let content = `${msg}`;
            if (data) {
                content += ` ${data}`;
            }
            return Promise.reject({
                response: {
                    status: code,
                    statusText: content
                }
            });
        }
        return data;
    }).catch(err => {
        const {
            response: {
                status,
                statusText
            }
        } = err;
        if (status === 20002) {
            Message.warning({
                content: "实例尚未销毁，请注意",
                duration: 3
            });
        } else {
            Message.error({
                content: `${status} ${statusText}`,
                duration: 3
            });
        }
        return Promise.reject(err);
    });
}

export default request;
