import {useCallback, useState} from "react";
import {App} from "antd";
import {useHttp} from "@/hooks/useHttp.ts";

export interface ActionData<T> {
  open: boolean,
  type: 'edit' | 'add',
  row?: Partial<T>
}

export function useAction<T>({ url, update }: { url?: string, update?: () => void }) {
  const { httpDelete, httpPut } = useHttp(false)
  const { modal } = App.useApp()

  const [actionData, setActionData] = useState<ActionData<T>>({
    open: false,
    type: 'add',
    row: undefined
  })

  const add = useCallback((defaultVal: Partial<T> = {}) => {
    setActionData({
      open: true,
      type: 'add',
      row: {
        ...defaultVal,
      }
    })
  }, [])

  const edit = useCallback((defaultVal: Partial<T> = {}) => {
    setActionData({
      open: true,
      type: 'edit',
      row: {
        ...defaultVal,
      }
    })
  }, [])

  const close = useCallback(() => {
    setActionData({
      open: false,
      type: 'add'
    })
  }, [])

  const remove = useCallback((ids: number[]) => {
    modal.confirm({
      title: '确认删除吗？',
      onOk: async () => {
        await httpDelete(`${url}/${ids.join(',')}`);
        if (update) update();
      }
    })
  }, [httpDelete, update, url, modal])

  const changeStatus = useCallback((record: T, status: boolean, fieldKey: { name: keyof T, id: keyof T}) => {
    modal.confirm({
      title: `确认${status ? '启用' : '停用'}“${record[fieldKey.name]}”吗?`,
      onOk: async () => {
        await httpPut(url + '/changeStatus', {
          status: Number(!status).toString(),
          [fieldKey.id]: record[fieldKey.id]
        })
        if (update) update();
      }
    })
  }, [httpPut, modal, update])

  return {actionData, setActionData, add, edit, close, remove, url, changeStatus}
}
