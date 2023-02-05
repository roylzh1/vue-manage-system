import axios, {AxiosInstance, AxiosError, AxiosResponse, AxiosRequestConfig} from 'axios';
import { ElMessage } from 'element-plus';
import router from '../router/index';
const service:AxiosInstance = axios.create({
    timeout: 5000
});
service.defaults.baseURL = "https://localhost:7140/api/";
service.interceptors.request.use(
    (config: AxiosRequestConfig) => {
      if(config.method ==='get'){
        config.data = true;
      }else if(config.method ==='post'){
        config.data = JSON.stringify(config.data);
      }
      let token = localStorage.getItem("ms_userToken");
      if(token && config.headers){
        config.headers["Authorization"] = 'Bearer '+ token;
      }
      if(config.headers)
        config.headers["Content-Type"] = "application/json";
        return config;
    },
    (error: AxiosError) => {
        console.log(error);
        return Promise.reject();
    }
);

service.interceptors.response.use(
    (response: AxiosResponse) => {
        if (response.status === 200) {
            return response;
        } else {
            Promise.reject();
        }
    },
    async(error: AxiosError) => {
      if(error.response?.status === 401){
        ElMessage.error("令牌过期,请重新登录");
        router.push('/login');
      }
        return Promise.reject(error.response);
    }
);

export default service;
