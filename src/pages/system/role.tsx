import {FC, useCallback, useEffect, useState} from "react";
import {
  Button,
  DatePicker,
  Form, FormInstance,
  Input, InputNumber, Radio,
  Select,
  Switch,
  Table,
  TableColumnsType, Tree
} from "antd";
import useDIct from "@/hooks/useDIct.ts";
import {useAction} from "@/hooks/useAction.ts";
import {useTable} from "@/hooks/useTable.ts";
import {formatDateRange} from "@/common/utils";
import {Dayjs} from "dayjs";
import {useContentHeight} from "@/hooks/useContentHeight.ts";
import ActionFrom from "@/components/ActionFrom/ActionFrom.tsx";
import {useHttp} from "@/hooks/useHttp.ts";
import TableNav from "@/components/TableNav/TableNav.tsx";
import TablePagination from "@/components/TablePagination/TablePagination.tsx";
import PermissionWrap from "@/components/PermissionWrap/PermissionWrap.tsx";

function formatDate(data: any) {
  const params: any = {
    ...data,
    ...formatDateRange(data.dates as [Dayjs, Dayjs]),
  }
  delete params.dates
  return params
}

const RolePage: FC = () => {
  useContentHeight()

  const { sys_normal_disable } = useDIct(['sys_normal_disable'])

  const [form] = Form.useForm()


  const { list, total, getList, filter, pagination, paginationChange, tableLoading } = useTable<Role>(form, '/system/role/list', formatDate)

  const { remove, actionData, close, add, edit, changeStatus } = useAction<Role>({ url: '/system/role', update: getList })

  useEffect(() => {
    getList()
  }, [getList]);

  const columns: TableColumnsType<Role> = [
    {
      title: '角色名称',
      dataIndex: 'roleName'
    },
    {
      title: '权限字符',
      dataIndex: 'roleKey'
    },
    {
      title: '显示顺序',
      dataIndex: 'roleSort'
    },
    {
      title: "状态",
      dataIndex: "status",
      key: "status",
      render: (value, record) => {
        return <Switch disabled={record?.admin} size="small" value={!Number(value)} onChange={(v) => {
          changeStatus(record, v, { name: 'roleName', id: 'roleId' })
        }} />
      }
    },
    {
      title: "操作",
      key: "operation",
      fixed: "right",
      width: 100,
      render: (_, record) => {
        return record.admin ? '' : <>
          <PermissionWrap perm="system:role:edit">
            <Button size="small" type="link" onClick={() => edit(record)}>修改</Button>
          </PermissionWrap>
          <PermissionWrap perm="system:role:remove">
            <Button size="small" type="link" danger onClick={() => remove([record.roleId])}>删除</Button>
          </PermissionWrap>
        </>
      },
    },
  ]

  return (
    <div className="page-container">
      <div className="form-wrap">
        <Form layout="inline" form={form} onFinish={filter} onReset={filter}>
          <Form.Item label="角色名称" name="roleName">
            <Input placeholder="请输入角色名称" />
          </Form.Item>
          <Form.Item label="权限字符" name="roleKey">
            <Input placeholder="请输入权限字符" />
          </Form.Item>
          <Form.Item label="状态" name="status">
            <Select style={{ width: 100 }} placeholder="请选择">
              {
                sys_normal_disable?.map((item) => (<Select.Option value={item.value} key={item.value}>{item.label}</Select.Option>))
              }
            </Select>
          </Form.Item>
          <Form.Item label="创建时间" name="dates">
            <DatePicker.RangePicker type="date" />
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
        <TableNav title="角色列表" add={() => add({ status: '0' })} addPermission="system:role:add" />

        <Table
          loading={tableLoading}
          rowKey="roleId"
          tableLayout="auto"
          pagination={false}
          dataSource={list}
          columns={columns}
          size="middle"
          scroll={{x: true, y: `calc(var(--table-wrapper-height) - 150px)`}}
        />

        <TablePagination pagination={pagination} total={total} paginationChange={paginationChange} />
      </div>

      <ActionFrom actionData={actionData} url="/system/role" close={close} initFields>
        <RoleForm row={actionData.row} />
      </ActionFrom>
    </div>
  )
}

function RoleForm({ row, form }: { row?: Partial<Role>, form?: FormInstance }) {
  const { sys_normal_disable } = useDIct(['sys_normal_disable'])
  const { httpGet } = useHttp()

  const [menus, setMenus] = useState<Menu[]>([])
  const [checkedKeys, setCheckedKeys] = useState<number[]>([])

  const getMenus = useCallback(() => {
    if (row && row?.roleId) {
      httpGet<{ checkedKeys: number[], menus: Menu[] }>('/system/menu/roleMenuTreeselect/' + row?.roleId)
        .then(res => {
          setCheckedKeys(res.checkedKeys)
          setMenus(res.menus)
          form?.setFieldValue('menuIds', res.checkedKeys)
        })
      return
    }
    httpGet<{ data: Menu[] }>('/system/menu/treeselect')
    .then(res => {
      setMenus(res.data)
    })
  }, [httpGet, row, form])

  const treeSelectChange = useCallback(({ checked }: any, { node, checked: nodeChecked }: any) => {
    const checkedIds = [...checked]
    const childrenIds = deepChildren(node.children || [])
    if (nodeChecked) {
      const pids = deepParent(menus, [], node.id) || []
      const ids = [...pids, ...childrenIds]
      ids.forEach(pid => {
        if (!checked.includes(pid)) {
          checkedIds.push(pid)
        }
      })
    } else {
      for (let i = 0; i < checkedIds.length; i++) {
        if (childrenIds.includes(checkedIds[i])) {
          checkedIds.splice(i, 1)
          i--
        }
      }
    }
    setCheckedKeys(checkedIds as number[])
    form?.setFieldValue('menuIds', checkedIds)
  }, [form, menus])

  useEffect(() => {
    getMenus()
  }, [getMenus]);

  return <>
    <Form.Item label="角色名称" name="roleName">
      <Input placeholder="请输入角色名称" />
    </Form.Item>
    <Form.Item label="权限字符" name="roleKey">
      <Input placeholder="请输入权限字符" />
    </Form.Item>
    <Form.Item label="角色顺序" name="roleSort">
      <InputNumber placeholder="请输入角色顺序" />
    </Form.Item>
    <Form.Item label="菜单权限" name="menuIds" initialValue={[]}>
      <Tree
        checkable
        checkStrictly
        checkedKeys={checkedKeys}
        treeData={menus}
        fieldNames={{ title: 'label', key: 'id' }}
        onCheck={treeSelectChange}
      />
    </Form.Item>
    <Form.Item label="状态" name="status">
      <Radio.Group>
        {
          sys_normal_disable.map(item => <Radio key={item.value} value={item.value}>{item.label}</Radio>)
        }
      </Radio.Group>
    </Form.Item>
    <Form.Item label="备注" name="remarks">
      <Input.TextArea placeholder="请输入备注" />
    </Form.Item>
  </>
}

function deepParent(nodes: any[], pids: number[] = [], target: number): number[] | undefined {
  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i]
    if (node.id === target) {
      return [...pids]
    }
    const currentPids = [...pids, node.id]
    if (node.children && node.children.length > 0) {
      const res = deepParent(node.children, [...currentPids], target)
      if (res) return res
    }
  }
  return undefined
}

function deepChildren(children: any[], res: number[] = []) {
  children.forEach(item => {
    res.push(item.id)
    if (item.children && item.children.length > 0) {
      deepChildren(item.children, res)
    }
  })

  return res
}

export default RolePage
