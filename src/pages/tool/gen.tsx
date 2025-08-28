import {FC, useCallback, useEffect, useState} from "react";
import {
  App,
  Button, Col,
  Collapse, CollapseProps,
  DatePicker,
  Form,
  Input,
  Modal,
  Row, Select,
  Table,
  TableColumnsType,
  Tabs,
  TabsProps
} from "antd";
import {formatDateRange} from "@/common/utils";
import {Dayjs} from "dayjs";
import {useContentHeight} from "@/hooks/useContentHeight.ts";
import TableNav from "@/components/TableNav/TableNav.tsx";
import {useTable} from "@/hooks/useTable.ts";
import TablePagination from "@/components/TablePagination/TablePagination.tsx";
import {useAction} from "@/hooks/useAction.ts";
import ActionFrom from "@/components/ActionFrom/ActionFrom.tsx";
import {useHttp} from "@/hooks/useHttp.ts";
import copy from 'copy-to-clipboard';
import { saveAs } from 'file-saver'
import { v4 } from 'uuid'

const formatData = (data: any) => {
  const params: any = {
    ...data,
    ...formatDateRange(data.dates as [Dayjs, Dayjs]),
  }
  delete params.dates
  return params
}

const CodeGenPage: FC = () => {
  const { message, modal } = App.useApp()

  useContentHeight();

  const { httpPost, httpGet } = useHttp()

  const [form] = Form.useForm()

  const { list, getList, filter, pagination, paginationChange, tableLoading, total } = useTable<CodeGen>(form, '/tool/gen/list', formatData)

  const { remove, actionData, close, add } = useAction<CodeGen>({ url: '/tool/gen', update: getList })

  useEffect(() => {
    getList()
  }, [getList]);

  const createTable = useCallback((values: any) => {
    return httpPost('/tool/gen/createTable', {}, true, {...values})
  }, [httpPost])

  // 预览
  const [previewData, setPreviewData] = useState({
    id: 0,
    open: false
  })

  // 编辑
  const [editData, setEditData] = useState({
    id: 0,
    open: false
  })

  const syncCode = useCallback((tableName: string) => {
    modal.confirm({
      title: `确认要强制同步"${tableName}"表结构吗？`,
      onOk: async () => {
        await httpGet('/tool/gen/synchDb/' + tableName)
        message.success('同步成功')
      }
    })
  }, [modal, message, httpGet])

  const downLoadCode = useCallback(async (tableName: string) => {
    const data = await httpGet<Blob>('/tool/gen/batchGenCode?tables=' + tableName, {}, true, 'blob')
    const blob = new Blob([data])
    saveAs(blob, 'ruoyi.zip')
  }, [httpGet])

  const columns: TableColumnsType<CodeGen> = [
    {
      dataIndex: 'tableId',
      title: '序号'
    },
    {
      dataIndex: 'tableName',
      title: '表名称'
    },
    {
      dataIndex: 'tableComment',
      title: '表描述'
    },
    {
      dataIndex: 'className',
      title: '实体'
    },
    {
      dataIndex: 'createTime',
      title: '创建时间'
    },
    {
      dataIndex: 'updateTime',
      width: 150,
      title: '更新时间'
    },
    {
      title: '操作',
      fixed: 'right',
      width: 200,
      render: (_, record) => {
        return <>
          <Button type="link" color="primary" onClick={() => setPreviewData({ id: record.tableId, open: true })}>预览</Button>
          <Button type="link" color="primary" onClick={() => setEditData({ id: record.tableId, open: true })}>编辑</Button>
          <Button type="link" danger onClick={() => remove([record.tableId])}>删除</Button>
          <Button type="link" color="primary" onClick={() => syncCode(record.tableName)}>同步</Button>
          <Button type="link" color="primary" onClick={() => downLoadCode(record.tableName)}>生成代码</Button>
        </>
      }
    }
  ]

  return (
    <div className="page-container table-page">
      <div className="form-wrap">
        <Form layout="inline" form={form} onFinish={filter} onReset={filter}>
          <Form.Item label="表名" name="tableName">
            <Input placeholder="请输入表名" />
          </Form.Item>
          <Form.Item label="表描述" name="tableComment">
            <Input placeholder="请输入表描述" />
          </Form.Item>
          <Form.Item label="创建时间" name="dates">
            <DatePicker.RangePicker mode={['date', 'date']} format="YYYY-MM-DD" />
          </Form.Item>
          <Form.Item>
            <Button htmlType="submit">搜索</Button>
          </Form.Item>
          <Form.Item>
            <Button htmlType="reset">重置</Button>
          </Form.Item>
        </Form>
      </div>

      <div className="table-wrapper">
        <TableNav title="生成列表">
          <Button type="primary" size="small" onClick={() => add({})}>创建</Button>
        </TableNav>

        <Table
          loading={tableLoading}
          rowKey="tableId"
          tableLayout="auto"
          pagination={false}
          dataSource={list}
          columns={columns}
          size="middle"
          scroll={{x: true, y: `calc(var(--table-wrapper-height) - 150px)`}}
        />

        <TablePagination pagination={pagination} total={total} paginationChange={paginationChange} />
      </div>

      <ActionFrom actionData={actionData} url="/tool/gen/createTable" close={close} update={getList} customSubmit={createTable}>
        <GenForm />
      </ActionFrom>

      <PreviewCode {...previewData} close={() => setPreviewData({ id: 0, open: false })} />

      <EditTable {...editData} close={() => setEditData({ id: 0, open: false })} upDate={getList} />
    </div>
  )
}

function GenForm() {
  return <>
    <Form.Item label="sql" name="sql" rules={[{ required: true, message: '请输入sql' }]}>
      <Input.TextArea rows={10} />
    </Form.Item>
  </>
}

function PreviewCode({ open, id, close }: { open: boolean, id: number, close: () => void }) {
  const { httpGet } = useHttp()

  const { message } = App.useApp()

  const [tabs, setTabs] = useState<TabsProps['items']>([])

  const copyCode = useCallback((text: string) => {
    const copyRes = copy(text)
    message.success(copyRes ? '复制成功' : '复制失败')
  }, [message])

  const getDetail = useCallback(async () => {
    if (!id) return
    const { data } = await httpGet<any>('/tool/gen/preview/' + id)
    const list: TabsProps['items'] = []
    for (const key in data) {
      const names = key.split('/')
      list.push({
        key: key,
        label: names[names.length - 1].replace('.vm', ''),
        children: <div>
          <Button
            size="small"
            style={{ float: 'right' }}
            onClick={() => copyCode(data[key])}
          >复制</Button>
          <pre style={{
            paddingTop: 20,
            overflow: 'hidden'
          }}>{data[key]}</pre>
        </div>
      })
    }
    setTabs(list)
  }, [id, httpGet])

  useEffect(() => {
    getDetail()
  }, [getDetail]);

  return <Modal
    title="代码预览"
    width={850}
    onCancel={close}
    open={open}
    footer={null}
  >
    <Tabs defaultActiveKey="1" items={tabs} />
  </Modal>
}

const JavaType = [
  'Long',
  'String',
  'Integer',
  'Double',
  'BigDecimal',
  'Date',
  'Boolean'
]

const QueryType = [
  {label: "=", value: "EQ" },
  {label: "!=", value: "NE" },
  {label: ">", value: "GT" },
  {label: ">=", value: "GTE" },
  {label: "<", value: "LT" },
  {label: "<=", value: "LTE" },
  {label: "LIKE", value: "LIKE" },
  {label: "BETWEEN", value: "BETWEEN" },
]

const HtmlType = [
  { label: "文本框", value: "input" },
  { label: "文本域", value: "textarea" },
  { label: "下拉框", value: "select" },
  { label: "单选框", value: "radio" },
  { label: "复选框", value: "checkbox" },
  { label: "日期控件", value: "datetime" },
  { label: "图片上传", value: "imageUpload" },
  { label: "文件上传", value: "fileUpload" },
  { label: "富文本控件", value: "editor" },
]

function EditTable({id, open, close, upDate}: { id: number, open: boolean, close: () => void, upDate: () => void }) {
  const {httpGet, loading, httpPut} = useHttp()


  const [form] = Form.useForm()

  const [detail, setDetail] = useState<any>({
    info: {},
    rows: []
  })

  const [dicts, setDicts] = useState<Dict[]>([])

  const getDicts = useCallback(() => {
    httpGet<{data: Dict[]}>('/system/dict/type/optionselect')
      .then(res => {
        setDicts(res.data)
      })
  }, [httpGet])

  const getDetail = useCallback(async () => {
    if (!id) return
    const {data} = await httpGet<any>('/tool/gen/' + id)
    setDetail(data)
    form.setFieldsValue(data.info)
  }, [id, httpGet, form])

  const [putLoading, setPutLoading] = useState<boolean>(false)

  const submit = useCallback(async (values: any) => {
    setPutLoading(true)
    const data = { ...detail.info }
    data.columns = data.columns.map((item: any, index: number) => {
      return {
        ...item,
        ...values.columns[index]
      }
    })
    delete values.columns
    try {
      await httpPut('/tool/gen', { ...data, ...values })
      upDate()
      close()
      setPutLoading(false)
    } catch (_) {
      setPutLoading(false)
    }
  }, [httpPut, detail, upDate, close])

  useEffect(() => {
    getDetail()
    getDicts()
  }, [getDetail, getDicts]);

  const columns: TableColumnsType<FieldInfo> = [
    {
      title: '字段列名',
      dataIndex: 'columnName'
    },
    {
      title: '字段描述',
      dataIndex: 'columnComment',
      render: (value, _, index) => {
        return <Form.Item style={{ marginBottom: 0 }} initialValue={value} name={['columns', index, 'columnComment']}>
          <Input size="small" style={{ width: 100 }} />
        </Form.Item>
      }
    },
    {
      title: '物理类型',
      dataIndex: 'columnType',
    },
    {
      title: 'Java类型',
      dataIndex: 'javaType',
      render: (value, _, index) => {
        return <Form.Item style={{ marginBottom: 0 }} initialValue={value} name={['columns', index, 'javaType']}>
          <Select size="small" style={{ width: 100 }}>
            {
              JavaType.map(item => <Select.Option key={v4()} value={item}>{item}</Select.Option>)
            }
          </Select>
        </Form.Item>
      }
    },
    {
      title: 'java属性',
      dataIndex: 'javaField',
      render: (value, _, index) => {
        return <Form.Item style={{ marginBottom: 0 }} initialValue={value} name={['columns', index, 'javaField']}>
          <Input size="small" style={{ width: 100 }} />
        </Form.Item>
      }
    },
    {
      title: '插入',
      dataIndex: 'isInsert',
      render: (value, _, index) => {
        return <Form.Item style={{ marginBottom: 0 }} initialValue={value} name={['columns', index, 'isInsert']}>
          <Select size="small" style={{ width: 60 }}>
            <Select.Option value="1">是</Select.Option>
            <Select.Option value="0">否</Select.Option>
          </Select>
        </Form.Item>
      }
    },
    {
      title: '编辑',
      dataIndex: 'isEdit',
      render: (value, _, index) => {
        return <Form.Item style={{ marginBottom: 0 }} initialValue={value} name={['columns', index, 'isEdit']}>
          <Select size="small" style={{ width: 60 }}>
            <Select.Option value="1">是</Select.Option>
            <Select.Option value="0">否</Select.Option>
          </Select>
        </Form.Item>
      }
    },
    {
      title: '列表',
      dataIndex: 'isList',
      render: (value, _, index) => {
        return <Form.Item style={{ marginBottom: 0 }} initialValue={value} name={['columns', index, 'isList']}>
          <Select size="small" style={{ width: 60 }}>
            <Select.Option value="1">是</Select.Option>
            <Select.Option value="0">否</Select.Option>
          </Select>
        </Form.Item>
      }
    },
    {
      title: '查询',
      dataIndex: 'isQuery',
      render: (value, _, index) => {
        return <Form.Item style={{ marginBottom: 0 }} initialValue={value} name={['columns', index, 'isQuery']}>
          <Select size="small" style={{ width: 60 }}>
            <Select.Option value="1">是</Select.Option>
            <Select.Option value="0">否</Select.Option>
          </Select>
        </Form.Item>
      }
    },
    {
      title: '查询方式',
      dataIndex: 'queryType',
      render: (value, _, index) => {
        return <Form.Item style={{ marginBottom: 0 }} initialValue={value} name={['columns', index, 'queryType']}>
          <Select size="small" style={{ width: 80 }}>
            {
              QueryType.map(item => <Select.Option key={v4()} value={item.value}>{item.label}</Select.Option>)
            }
          </Select>
        </Form.Item>
      }
    },
    {
      title: '必填',
      dataIndex: 'isRequired',
      render: (value, _, index) => {
        return <Form.Item style={{ marginBottom: 0 }} initialValue={value} name={['columns', index, 'isRequired']}>
          <Select size="small" style={{ width: 60 }}>
            <Select.Option value="1">是</Select.Option>
            <Select.Option value="0">否</Select.Option>
          </Select>
        </Form.Item>
      }
    },
    {
      title: '显示类型',
      dataIndex: 'htmlType',
      render: (value, _, index) => {
        return <Form.Item style={{ marginBottom: 0 }} initialValue={value} name={['columns', index, 'htmlType']}>
          <Select size="small" style={{ width: 100 }}>
            {
              HtmlType.map(item => <Select.Option key={v4()} value={item.value}>{item.label}</Select.Option>)
            }
          </Select>
        </Form.Item>
      }
    },
    {
      title: '字典类型',
      dataIndex: 'dictType',
      render: (value, _, index) => {
        return <Form.Item style={{ marginBottom: 0 }} initialValue={value} name={['columns', index, 'dictType']}>
          <Select size="small" style={{ width: 100 }}>
            {
              dicts.map(item => <Select.Option key={v4()} value={item.dictType}>{item.dictName}</Select.Option>)
            }
          </Select>
        </Form.Item>
      }
    },
  ]

  const items: CollapseProps["items"] = [
    {
      key: '1',
      label: '基本信息',
      children: <>
        <Row>
          <Col span={12}>
            <Form.Item label="表名称" name="tableName" initialValue={detail.info.tableName} rules={[{ required: true, message: '请输入表名称' }]}>
              <Input placeholder="请输入表名称" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="表描述" name="tableComment" initialValue={detail.info.tableComment} rules={[{ required: true, message: '请输入表描述' }]}>
              <Input placeholder="请输入表描述" />
            </Form.Item>
          </Col>
        </Row>
        <Row>
          <Col span={12}>
            <Form.Item label="实体类名称" name="className" initialValue={detail.info.className} rules={[{ required: true, message: '请输入实体类名称' }]}>
              <Input placeholder="请输入实体类名称" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="作者" name="functionAuthor" initialValue={detail.info.functionAuthor} rules={[{ required: true, message: '请输入作者' }]}>
              <Input placeholder="请输入作者" />
            </Form.Item>
          </Col>
        </Row>
        <Row>
          <Col span={12}>
            <Form.Item label="备注" name="remark" initialValue={detail.info.remark || ''}>
              <Input placeholder="请输入备注" />
            </Form.Item>
          </Col>
        </Row>
      </>,
    },
    {
      key: '2',
      label: '字段信息',
      children: <Table
        loading={loading}
        size="small"
        columns={columns}
        rowKey="columnId"
        dataSource={detail.rows}
        scroll={{x: true}}
        pagination={false}
      />,
    },
  ]

  return <Modal
    title="修改生成配置"
    open={open}
    onCancel={close}
    width="60%"
    onOk={() => {
      form.submit()
    }}
    confirmLoading={putLoading}
  >
    <Form labelCol={{ span: 6 }} form={form} onFinish={submit}>
      <Collapse defaultActiveKey={2} items={items} />
    </Form>
  </Modal>
}

export default CodeGenPage
