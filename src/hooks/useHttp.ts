import http from "@/common/utils/http";
import {useCallback, useRef, useState} from "react";
import {App} from "antd";
import { v4 } from 'uuid'
import {tansParams} from "@/common/utils";

type ResponseType =
  | 'arraybuffer'
  | 'blob'
  | 'document'
  | 'json'
  | 'text'
  | 'stream'
  | 'formdata';

type Method = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

interface Task {
  key: string
  pro: Promise<Awaited<unknown>>
}

export function useHttp(defaultLoading = true) {
  const { modal, message } = App.useApp()

  const [loading, setLoading] = useState(defaultLoading);

  const tasks = useRef<Task[]>([]);

  const addTask = useCallback(<T>(t: Promise<Awaited<T>>) => {
    setLoading(true)
    const key = v4()
    tasks.current = [...tasks.current, { key, pro: t }];
    t.then(() => {
      tasks.current = tasks.current.filter(item => item.key !== key)
      setLoading(tasks.current.length !== 0)
    })
      .catch(() => {
        tasks.current = tasks.current.filter(item => item.key !== key)
        setLoading(tasks.current.length !== 0)
      })
  }, [])

  const httpGet = useCallback(
    <T>(url: string, params?: any, toastError = true, responseType?: ResponseType) => {
      const task = request<T>({ url, params, toastError, modal, message, responseType });
      addTask(task);
      return task
    },
    [addTask, modal, message]
  );

  const httpPost = useCallback(
    <T>(url: string, data?: any, toastError = true, params?: any) => {
      const task = request<T>({ url, data, toastError, method: "POST", modal, message, params });
      addTask(task);
      return task
    },
    [addTask, modal, message]
  );

  const httpPut = useCallback(
    <T>(url: string, data?: any, toastError = true) => {
      const task = request<T>({ url, data, toastError, method: "PUT", modal, message });
      addTask(task);
      return task
    },
    [addTask, modal, message]
  );

  const httpDelete = useCallback(
    <T>(url: string, data?: any, toastError = true) => {
      const task = request<T>({ url, data, toastError, method: "DELETE", modal, message });
      addTask(task);
      return task
    },
    [addTask, modal, message]
  );

  return {
    httpGet,
    httpPost,
    httpPut,
    httpDelete,
    loading,
  };
}

interface RequestData {
  url: string,
  data?: any,
  toastError?: boolean,
  method?: Method,
  modal: any,
  message: any
  params?: Record<string, any>
  responseType?: ResponseType
}

function request<T>({url, method = 'GET', data = null, toastError = true, modal, message, params = {}, responseType}: RequestData) {
  const queryUrl = `${url}?${tansParams({ ...params })}`
  return http<any, T>({
    method,
    url: queryUrl.slice(0, -1),
    data: data,
    responseType,
  })
    .then((res) => {
      return Promise.resolve(res)
    })
    .catch(err => {
      if (toastError) {
        message.error(err.msg)
      }
      if (err.code === 401) {
        authFail(modal);
      }
      return Promise.reject(err);
    })
}

const authModelTask: any[] = []

function authFail(modal: any) {
  localStorage.removeItem("token");
  if (authModelTask.length) return
  const realModal = modal.confirm({
    title: "登录信息过期，请重新登录",
    onOk: () => {
      authModelTask.splice(0, 1)
      if (location.pathname === '/login') return
      location.href = "/login";
    },
    onCancel: () => {
      authModelTask.splice(0, 1)
    }
  });
  authModelTask.push(realModal)
}
