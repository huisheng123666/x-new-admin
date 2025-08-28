import {FC, useEffect} from "react";
import {Button, DatePicker, Form, Input, Radio, Select, Table, TableColumnsType} from "antd";
import {useContentHeight} from "@/hooks/useContentHeight.ts";
import useDIct from "@/hooks/useDIct.ts";
import {useTable} from "@/hooks/useTable.ts";
import {formatDateRange} from "@/common/utils";
import {Dayjs} from "dayjs";
import PermissionWrap from "@/components/PermissionWrap/PermissionWrap.tsx";
import DictTag from "@/components/dict-tag/dict-tag.tsx";
import {useAction} from "@/hooks/useAction.ts";
import ActionFrom from "@/components/ActionFrom/ActionFrom.tsx";
import {Link} from "react-router-dom";
import TableNav from "@/components/TableNav/TableNav.tsx";
import TablePagination from "@/components/TablePagination/TablePagination.tsx";

const formatData = (data: any) => {
  const params: any = {
    ...data,
    ...formatDateRange(data.dates as [Dayjs, Dayjs]),
  }
  delete params.dates
  return params
}

const DictPage: FC = () => {
  useContentHeight();

  const [form] = Form.useForm()

  const { list, getList, filter, pagination, paginationChange, tableLoading, total } = useTable<Dict>(form, '/system/dict/type/list', formatData)

  const { remove, actionData, close, add, edit } = useAction<Dict>({ url: '/system/dict/type', update: getList })

  const { sys_normal_disable } = useDIct(['sys_normal_disable'])

  useEffect(() => {
    getList()
  }, [getList]);

  const columns: TableColumnsType<Dict> = [
    {
      width: 100,
      dataIndex: 'dictId',
      title: '字典编号'
    },
    {
      dataIndex: 'dictName',
      title: '字典名称'
    },
    {
      dataIndex: 'dictType',
      title: '字典类型',
      render: (value, record) => <Link to={`/system/dict/${value}?dictName=${record.dictName}`}><Button type="link" color="primary">{value}</Button></Link>
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
            <Button size="small" type="link" danger onClick={() => remove([record.dictId])}>删除</Button>
          </PermissionWrap>
        </>
      },
    },
  ]

  return <div className="page-container table-page">
    <div className="form-wrap">
      <Form layout="inline" form={form} onFinish={filter} onReset={filter}>
        <Form.Item label="字典名称" name="dictName">
          <Input placeholder="请输入字典名称"/>
        </Form.Item>
        <Form.Item label="字典类型" name="dictType">
          <Input placeholder="请输入字典类型"/>
        </Form.Item>
        <Form.Item label="状态" name="status">
          <Select style={{width: 100}} placeholder="请选择">
            {
              sys_normal_disable?.map((item) => (
                <Select.Option value={item.value} key={item.value}>{item.label}</Select.Option>))
            }
          </Select>
        </Form.Item>
        <Form.Item label="创建时间" name="dates">
          <DatePicker.RangePicker mode={['date', 'date']} format="YYYY-MM-DD"/>
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
      <TableNav title="字典列表" add={() => add({status: '0'})} addPermission="system:dict:add" />

      <Table
        loading={tableLoading}
        rowKey="dictId"
        tableLayout="auto"
        pagination={false}
        dataSource={list}
        columns={columns}
        size="middle"
        scroll={{x: true, y: `calc(var(--table-wrapper-height) - 150px)`}}
      />

      <TablePagination pagination={pagination} total={total} paginationChange={paginationChange} />
    </div>

    <ActionFrom actionData={actionData} url="/system/dict/type" close={close} update={getList}>
      <DictForm />
    </ActionFrom>
  </div>
}


function DictForm() {
  const { sys_normal_disable } = useDIct(['sys_normal_disable'])

  return <>
    <Form.Item label="字典名称" name="dictName" rules={[{ required: true, message: '请输入字典名称' }]}>
      <Input placeholder="请输入字典名称" />
    </Form.Item>
    <Form.Item label="字典类型" name="dictType" rules={[{ required: true, message: '请输入字典类型' }]}>
      <Input placeholder="请输入字典类型" />
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

export default DictPage
