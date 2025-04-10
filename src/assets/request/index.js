import axios from "axios";
import NProgress from "nprogress";
import {MessageBox, Notification} from "element-ui";
import "nprogress/nprogress.css";
import router from "@/router";

// 是否显示重新登录
export const isRelogin = {show: false}
axios.defaults.baseURL = process.env.VUE_APP_URL;
// 创建axios实例
const service = axios.create({
  timeout: 3000000, // 请求超时时间
  withCredentials: true, // 跨域请求，允许保存cookie
});

// NProgress Configuration
NProgress.configure({
  showSpinner: false
});

// 请求拦截器
service.interceptors.request.use(
  config => {
    NProgress.start();
    const token = sessionStorage.getItem("token");
    if (token) {
      config.headers["token"] = token;
    }
    config.headers["timestamp"] = Date.now().toString();
    return config;
  },
  error => {
    NProgress.done();
    return Promise.reject(error);
  }
);

// 响应拦截器
service.interceptors.response.use(
  response => {
    NProgress.done();
    const res = response.data;

    // 如果是文件下载的请求
    if (response.config?.responseType === 'blob') {
      return handleBlobResponse(response);
    }

    // 如果响应状态码不是200
    if (response.status !== 200) {
      MessageBox.alert(`服务器请求【${response.status}】异常，请联系管理员`, "系统提示", {
        confirmButtonText: "确定",
        type: "warning"
      });
      return Promise.reject(new Error('Error'));
    }

    // 处理业务状态码
    if (res.header) {
      const code = res.header.code;

      // 如果业务状态码是200，返回业务数据
      if (code === '200') {
        return Promise.resolve(res.body);
      }

      // 处理登录过期的情况
      if (code === '401') {
        if (!isRelogin.show) {
          isRelogin.show = true;
          MessageBox.confirm(
            '登录状态已过期，您可以继续留在该页面，或者重新登录',
            '系统提示',
            {
              confirmButtonText: '重新登录',
              cancelButtonText: '取消',
              type: 'warning'
            }
          ).then(() => {
            isRelogin.show = false;
            sessionStorage.clear();
            router.push({ name: 'Login' });
          }).catch(() => {
            isRelogin.show = false;
          });
        }
        return Promise.reject('登录状态已过期');
      }

      // 处理其他错误情况
      const message = res.header.message || '系统异常';
      Notification.error({
        title: '错误',
        message: message
      });
      return Promise.reject(message);
    }

    // 如果响应格式不符合预期
    return Promise.reject('响应格式错误');
  },
  error => {
    NProgress.done();
    console.log('请求错误', error);

    let message = error.message;
    if (error.response) {
      message = error.response.data.message || '系统异常';
    }

    Notification.error({
      title: '错误',
      message: message
    });

    return Promise.reject(error);
  }
);

// 处理文件下载响应
function handleBlobResponse(response) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const result = JSON.parse(reader.result);
        if (result.header && result.header.code !== '200') {
          reject(result.header.message || '下载失败');
          return;
        }
      } catch (error) {
        // 如果无法解析为JSON，说明是正常的文件内容
        downloadFile(response);
        resolve();
        return;
      }
      reject('下载失败');
    };
    reader.onerror = () => reject('文件读取失败');
    reader.readAsText(response.data);
  });
}

// 文件下载处理
function downloadFile(response) {
  const blob = new Blob([response.data], {
    type: response.headers['content-type']
  });

  const contentDisposition = response.headers['content-disposition'];
  let fileName = 'download';

  if (contentDisposition) {
    const matched = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
    if (matched && matched[1]) {
      fileName = matched[1].replace(/['"]/g, '');
      try {
        fileName = decodeURIComponent(fileName);
      } catch (e) {
        console.warn('文件名解码失败', e);
      }
    }
  }

  if (window.navigator.msSaveOrOpenBlob) {
    // IE10+
    window.navigator.msSaveOrOpenBlob(blob, fileName);
  } else {
    // 其他浏览器
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.download = fileName;
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    window.URL.revokeObjectURL(link.href);
    document.body.removeChild(link);
  }
}

export default service;
