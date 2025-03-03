import {FC, useCallback, useEffect, useState} from "react";
import {
  Button,
  Form,
  Input,
  InputNumber,
  Radio,
  Select,
  Spin,
  Table,
  TableColumnsType,
  TreeSelect,
} from "antd";
import {useContentHeight} from "@/hooks/useContentHeight.ts";
import useDIct from "@/hooks/useDIct.ts";
import {useHttp} from "@/hooks/useHttp.ts";
import {genTree} from "@/common/utils";
import PermissionWrap from "@/components/PermissionWrap/PermissionWrap.tsx";
import DictTag from "@/components/dict-tag/dict-tag.tsx";
import {useAction} from "@/hooks/useAction.ts";
import ActionFrom from "@/components/ActionFrom/ActionFrom.tsx";
import TableNav from "@/components/TableNav/TableNav.tsx";

const DeptPage: FC = () => {
  useContentHeight();
  const {sys_normal_disable} = useDIct(['sys_normal_disable'])

  const { httpGet, loading } = useHttp()

  const [list, setList] = useState<Dept[]>([])

  const [form] = Form.useForm()

  const getList = useCallback(async () => {
    const { data } = await httpGet<{ data: Menu[] }>('/system/dept/list', {...form.getFieldsValue()})
    setList(genTree(data, 0, [], {}, { id: 'deptId', pid: 'parentId' }))
  }, [httpGet, form])

  const resetForm = useCallback(() => {
    form.resetFields()
    getList()
  }, [form, getList])

  useEffect(() => {
    getList()
  }, [getList]);

  const { actionData, add, edit, close, remove } = useAction<Dept>({ url: '/system/dept', update: getList })

  const columns: TableColumnsType<Dept> = [
    {
      dataIndex: 'deptName',
      title: '部门名称'
    },
    {
      dataIndex: 'orderNum',
      title: '排序'
    },
    {
      dataIndex: 'status',
      title: '状态',
      render: (value) => {
        return <DictTag options={sys_normal_disable} value={value} />
      }
    },
    {
      dataIndex: 'createTime',
      title: '创建时间'
    },
    {
      title: '操作',
      fixed: 'right',
      width: 200,
      render: (_, record) => {
        return <>
          <PermissionWrap perm="system:dept:edit">
            <Button type="link" data-perms="system:dept:edit" onClick={() => {
              edit(record)
            }}>修改</Button>
          </PermissionWrap>
          <PermissionWrap perm="system:dept:add">
            <Button data-perms="system:dept:add" type="link" onClick={() => {
              add({
                parentId: record.deptId,
              })
            }}>新增</Button>
          </PermissionWrap>
          <PermissionWrap perm="system:dept:remove">
            <Button data-perms="system:dept:remove" type="link" danger onClick={() => remove([record.deptId])}>删除</Button>
          </PermissionWrap>
        </>
      }
    }
  ]

  return (
    <div className="page-container">
      <div className="form-wrap">
        <Form layout="inline" onFinish={getList} form={form} onReset={resetForm}>
          <Form.Item label="菜单名称" name="deptName">
            <Input placeholder="请输入菜单名称"/>
          </Form.Item>
          <Form.Item label="状态" name="status">
            <Select style={{width: 200}} placeholder="菜单状态" allowClear>
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
        <TableNav title="部门列表" add={() => add({status: '0'})} addPermission="system:dept:add" />

        {
          list.length || !loading ? <Table
            className="no-pagination"
            tableLayout="auto"
            loading={loading}
            rowKey="deptId"
            pagination={false}
            dataSource={list}
            expandable={{ defaultExpandAllRows: true }}
            columns={columns}
            size="middle"
            scroll={{x: '500px', y: `calc(var(--table-wrapper-height) - 120px)`}}
          /> : <div style={{ display: 'flex', justifyContent: 'center' }}><Spin/></div>
        }
      </div>

      <ActionFrom actionData={actionData} url="/system/dept" close={close} update={getList} initFields>
        <DeptForm row={actionData.row} />
      </ActionFrom>
    </div>
  )
}


function DeptForm({ row }: { row?: Partial<Dept> }) {
  const {sys_normal_disable} = useDIct(['sys_normal_disable'])

  const {httpGet} = useHttp(false)

  const [depts, setDepts] = useState<Dept[]>([])

  useEffect(() => {
    httpGet<{ data: Dept[] }>('/system/dept/list')
      .then(res => {
        setDepts(genTree(res.data, 0, [], {}, { id: 'deptId', pid: 'parentId' }))
      })
  }, [httpGet])


  return <>
    {
      row?.parentId === undefined || row?.parentId !== 0 ? <Form.Item label="上级部门" name="parentId" rules={[{ required: true, message: '请选择' }]}>
        <TreeSelect
          virtual={false}
          showSearch
          placeholder="请选择"
          allowClear
          filterTreeNode
          treeNodeFilterProp={"menuName"}
          treeDefaultExpandAll
          treeData={depts as any[]}
          fieldNames={{ label: 'deptName', value: 'deptId' }}
        />
      </Form.Item> : ''
    }
    <Form.Item label="部门名称" name="deptName" rules={[{ required: true, message: '请输入部门名称' }]}>
      <Input placeholder="请输入部门名称" />
    </Form.Item>
    <Form.Item label="显示排序" name="orderNum" rules={[{ required: true, message: '请输入显示排序' }]}>
      <InputNumber placeholder="请输入显示排序" style={{ width: 200 }} />
    </Form.Item>
    <Form.Item label="负责人" name="leader">
      <Input placeholder="请输入负责人" />
    </Form.Item>
    <Form.Item label="联系电话" name="phone">
      <Input placeholder="请输入联系电话" />
    </Form.Item>
    <Form.Item label="邮箱" name="email" rules={[{ type: 'email', message: '请输入正确的邮箱' }]}>
      <Input placeholder="请输入邮箱" />
    </Form.Item>
    <Form.Item label="部门状态" name="status" rules={[{ required: true, message: '请选择部门状态' }]}>
      <Radio.Group>
        {
          sys_normal_disable.map(item => <Radio value={item.value} key={item.value}>{item.label}</Radio>)
        }
      </Radio.Group>
    </Form.Item>
  </>
}

export default DeptPage;
