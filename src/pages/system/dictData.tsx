import {FC, useEffect} from "react";
import {
  Button,
  Form,
  Input,
  InputNumber,
  Radio,
  Select,
  Table,
  TableColumnsType,
  Tag,
} from "antd";
import useDIct from "@/hooks/useDIct.ts";
import {useParams, useSearchParams} from "react-router-dom";
import {useContentHeight} from "@/hooks/useContentHeight.ts";
import {useTable} from "@/hooks/useTable.ts";
import {useAction} from "@/hooks/useAction.ts";
import PermissionWrap from "@/components/PermissionWrap/PermissionWrap.tsx";
import DictTag from "@/components/dict-tag/dict-tag.tsx";
import ActionFrom from "@/components/ActionFrom/ActionFrom.tsx";
import TableNav from "@/components/TableNav/TableNav.tsx";
import TablePagination from "@/components/TablePagination/TablePagination.tsx";

const DictDataPage: FC = () => {
  const params = useParams()
  const [searchParams] = useSearchParams()

  useContentHeight();

  const [form] = Form.useForm()

  const { list, getList, filter, pagination, paginationChange, tableLoading, total } = useTable<DictData>(form, '/system/dict/data/list')

  const { remove, actionData, close, add, edit } = useAction<DictData>({ url: '/system/dict/data', update: getList })

  const { sys_normal_disable } = useDIct(['sys_normal_disable'])

  useEffect(() => {
    getList()
  }, [getList]);

  const columns: TableColumnsType<DictData> = [
    {
      minWidth: 100,
      dataIndex: 'dictCode',
      title: '字典编码'
    },
    {
      minWidth: 100,
      dataIndex: 'dictLabel',
      title: '字典标签'
    },
    {
      minWidth: 100,
      dataIndex: 'dictValue',
      title: '字典标签'
    },
    {
      minWidth: 100,
      dataIndex: 'dictSort',
      title: '字典排序'
    },
    {
      dataIndex: 'status',
      title: '状态',
      render: (value) => {
        return <DictTag options={sys_normal_disable} value={value} />
      }
    },
    {
      dataIndex: 'remark',
      title: '备注'
    },
    {
      dataIndex: 'createTime',
      title: '创建时间'
    },
    {
      title: "操作",
      key: "operation",
      fixed: "right",
      width: 100,
      render: (_, record) => {
        return <>
          <PermissionWrap perm="system:dict:edit">
            <Button size="small" type="link" onClick={() => edit(record)}>修改</Button>
          </PermissionWrap>
          <PermissionWrap perm="system:dict:remove">
            <Button size="small" type="link" danger onClick={() => remove([record.dictCode])}>删除</Button>
          </PermissionWrap>
        </>
      },
    },
  ]

  return (
    <div className="page-container table-page">
      <div className="form-wrap">
        <Form layout="inline" form={form} onFinish={filter} onReset={filter}>
          <Form.Item label="字典名称">
            <Input value={searchParams.get('dictName') as string} disabled />
          </Form.Item>
          <Form.Item label="字典类型" name="dictType" initialValue={params.type} style={{ display: 'none' }}>
            <Input placeholder="请输入字典类型" />
          </Form.Item>
          <Form.Item label="字典标签">
            <Input placeholder="请输入字典标签" />
          </Form.Item>
          <Form.Item label="状态" name="status">
            <Select style={{width: 100}} placeholder="请选择">
              {
                sys_normal_disable?.map((item) => (
                  <Select.Option value={item.value} key={item.value}>{item.label}</Select.Option>))
              }
            </Select>
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
        <TableNav title="字典数据列表" add={() => add({status: '0'})} addPermission="system:dict:add" />

        <Table
          loading={tableLoading}
          rowKey="dictCode"
          tableLayout="auto"
          pagination={false}
          dataSource={list}
          columns={columns}
          size="middle"
          scroll={{x: true, y: `calc(var(--table-wrapper-height) - 150px)`}}
        />

        <TablePagination pagination={pagination} total={total} paginationChange={paginationChange} />
      </div>

      <ActionFrom actionData={actionData} url="/system/dict/data" close={close} update={getList}>
        <DictDataForm />
      </ActionFrom>
    </div>
  )
}

function DictDataForm() {
  const params = useParams()
  const { sys_normal_disable } = useDIct(['sys_normal_disable'])

  return <>
    <Form.Item label="字典类型" initialValue={params.type} name="dictType">
      <Input disabled  value={params.type} />
    </Form.Item>
    <Form.Item label="数据标签" name="dictLabel" rules={[{ required: true, message: '请输入数据标签' }]}>
      <Input placeholder="请输入数据标签" />
    </Form.Item>
    <Form.Item label="数据键值" name="dictValue" rules={[{ required: true, message: '请输入数据键值' }]}>
      <Input placeholder="请输入数据键值" />
    </Form.Item>
    <Form.Item label="显示排序" name="dictSort" rules={[{ required: true, message: '请输入显示排序' }]}>
      <InputNumber placeholder="请输入显示排序" style={{ width: 200 }} />
    </Form.Item>
    <Form.Item label="回显样式" name="listClass">
      <Select placeholder="请选择回显样式">
        <Select.Option value="success">
          <Tag color="success">success</Tag>
        </Select.Option>
        <Select.Option value="processing">
          <Tag color="processing">processing</Tag>
        </Select.Option>
        <Select.Option value="error">
          <Tag color="error">error</Tag>
        </Select.Option>
        <Select.Option value="warning">
          <Tag color="warning">warning</Tag>
        </Select.Option>
        <Select.Option value="default">
          <Tag color="default">default</Tag>
        </Select.Option>
      </Select>
    </Form.Item>
    <Form.Item label="状态" name="status">
      <Radio.Group>
        {
          sys_normal_disable.map(item => <Radio key={item.value} value={item.value}>{item.label}</Radio>)
        }
      </Radio.Group>
    </Form.Item>
    <Form.Item label="备注" name="remark">
      <Input.TextArea placeholder="请输入字典备注" />
    </Form.Item>
  </>
}

export default DictDataPage
