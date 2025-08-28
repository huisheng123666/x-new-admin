import {FC, useEffect} from "react";
import {Button, Form, Input, InputNumber, Radio, Select, Table, TableColumnsType} from "antd";
import useDIct from "@/hooks/useDIct.ts";
import {useContentHeight} from "@/hooks/useContentHeight.ts";
import {useTable} from "@/hooks/useTable.ts";
import {useAction} from "@/hooks/useAction.ts";
import TableNav from "@/components/TableNav/TableNav.tsx";
import TablePagination from "@/components/TablePagination/TablePagination.tsx";
import DictTag from "@/components/dict-tag/dict-tag.tsx";
import PermissionWrap from "@/components/PermissionWrap/PermissionWrap.tsx";
import ActionFrom from "@/components/ActionFrom/ActionFrom.tsx";

const SysConfigPage: FC = () => {

  useContentHeight();

  const [form] = Form.useForm()

  const { list, getList, filter, pagination, paginationChange, tableLoading, total } = useTable<SysConfig>(form, '/system/config/list')

  const { remove, actionData, close, add, edit } = useAction<SysConfig>({ url: '/system/config', update: getList })

  const { sys_yes_no } = useDIct(['sys_yes_no'])

  useEffect(() => {
    getList()
  }, [getList]);

  const columns: TableColumnsType<SysConfig> = [
    {
      dataIndex: 'configId',
      title: '参数主键'
    },
    {
      dataIndex: 'configName',
      title: '参数名称'
    },
    {
      dataIndex: 'configKey',
      title: '参数键名'
    },
    {
      dataIndex: 'configValue',
      title: '参数键值'
    },
    {
      dataIndex: 'configType',
      title: '系统内置',
      render: (value) => {
        return <DictTag options={sys_yes_no} value={value} />
      }
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
          <PermissionWrap perm="system:conifg:edit">
            <Button size="small" type="link" onClick={() => edit(record)}>修改</Button>
          </PermissionWrap>
          <PermissionWrap perm="system:conifg:remove">
            <Button size="small" type="link" danger onClick={() => remove([record.configId])}>删除</Button>
          </PermissionWrap>
        </>
      },
    },
  ]

  return <div className="page-container table-page">
    <div className="form-wrap">
      <Form layout="inline" form={form} onFinish={filter} onReset={filter}>
        <Form.Item label="参数名称" name="configName">
          <Input placeholder="请输入参数名称" />
        </Form.Item>
        <Form.Item label="参数键名" name="configKey">
          <Input placeholder="请输入参数键名" />
        </Form.Item>
        <Form.Item label="系统内置" name="configType">
          <Select style={{width: 100}} placeholder="请选择">
            {
              sys_yes_no?.map((item) => (
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
      <TableNav title="参数列表" add={() => add({configType: 'Y'})} addPermission="system:config:add" />

      <Table
        loading={tableLoading}
        rowKey="configId"
        tableLayout="auto"
        pagination={false}
        dataSource={list}
        columns={columns}
        size="middle"
        scroll={{x: true, y: `calc(var(--table-wrapper-height) - 150px)`}}
      />

      <TablePagination pagination={pagination} total={total} paginationChange={paginationChange} />
    </div>

    <ActionFrom actionData={actionData} url="/system/config" close={close} update={getList}>
      <ConfigForm />
    </ActionFrom>
  </div>
}

function ConfigForm() {
  const { sys_yes_no } = useDIct(['sys_yes_no'])

  return <>
    <Form.Item label="参数名称" name="configName" rules={[{ required: true, message: '请输入参数名称' }]}>
      <Input placeholder="请输入参数名称" />
    </Form.Item>
    <Form.Item label="参数键名" name="configKey" rules={[{ required: true, message: '请输入参数键名' }]}>
      <Input placeholder="请输入参数键名" />
    </Form.Item>
    <Form.Item label="参数键值" name="configValue" rules={[{ required: true, message: '请选择参数键值' }]}>
      <InputNumber placeholder="请输入参数键值" style={{ width: 200 }} />
    </Form.Item>
    <Form.Item label="系统内置" name="configType">
      <Radio.Group>
        {
          sys_yes_no.map(item => <Radio key={item.value} value={item.value}>{item.label}</Radio>)
        }
      </Radio.Group>
    </Form.Item>
    <Form.Item label="备注" name="remark">
      <Input.TextArea placeholder="请输入字典备注" />
    </Form.Item>
  </>
}


export default SysConfigPage
