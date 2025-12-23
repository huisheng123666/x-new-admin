import React, {ReactNode, useCallback, useEffect, useState} from "react";
import {ActionData} from "@/hooks/useAction.ts";
import {Form, Modal} from "antd";
import {useHttp} from "@/hooks/useHttp.ts";
import { v4 } from 'uuid'

interface Props<T> {
  children?: ReactNode;
  actionData: ActionData<T>,
  url: string,
  close: () => void,
  update?: () => void
  initFields?: boolean
  customSubmit?: (values: T) => Promise<any>
}

function ActionFrom<T>({children, actionData: { type, open, row }, url, close, update, initFields = true, customSubmit}: Props<T>) {
  const [form] = Form.useForm()

  const { httpPut, httpPost, loading } = useHttp(false)

  const [childKey, setChildKey] = useState<string>()

  useEffect(() => {
    if (row && initFields) {
      form.setFieldsValue(row)
    }
    setChildKey(v4())
  }, [form, row, initFields]);

  const submit = useCallback(async (values: T) => {
    if (customSubmit) {
      await customSubmit(values)
    } else {
      await (type === "edit" ? httpPut : httpPost)(url, {
        ...row,
        ...values,
      })
    }
    close()
    form.resetFields()
    if (update) update();
  }, [httpPut, httpPost, row, close, update, type, url, form, customSubmit])


  return <Modal
    title={type === 'edit' ? '编辑' : '添加'}
    open={open}
    onCancel={() => {
      form.resetFields()
      close()
    }}
    destroyOnHidden
    onOk={() => form.submit()}
    confirmLoading={loading}
  >
    <Form form={form} labelCol={{ span: 4 }} onFinish={submit}>
      {
        React.cloneElement(children as React.DetailedReactHTMLElement<any, HTMLElement>, { form, key: childKey })
      }
    </Form>
  </Modal>
}

export default ActionFrom;
