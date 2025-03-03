import { useContentHeight } from "@/hooks/useContentHeight";
import {
  Button, DatePicker,
  Form,
  Input,
  Select, Switch,
  Table,
  TableColumnsType, Tree,
  Radio, FormInstance, TreeSelect
} from "antd";
import styles from './system.module.scss'
import {useCallback, useEffect, useMemo, useState} from "react";
import {useHttp} from "@/hooks/useHttp.ts";
import {Dayjs} from "dayjs";
import {formatDateRange, genTree} from "@/common/utils";
import useDIct from "@/hooks/useDIct.ts";
import {useAction} from "@/hooks/useAction.ts";
import {useTable} from "@/hooks/useTable.ts";
import ActionFrom from "@/components/ActionFrom/ActionFrom.tsx";
import PermissionWrap from "@/components/PermissionWrap/PermissionWrap.tsx";
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

const UserSetting = () => {
  useContentHeight();

  const { httpGet } = useHttp()

  const { sys_normal_disable } = useDIct(['sys_normal_disable'])

  const [deptTree, setDeptTree] = useState<any[]>([]);

  const [form] = Form.useForm()

  const getDeptTree = useCallback(async () => {
    const { data } = await httpGet<{ data: any[] }>('/system/user/deptTree')
    setDeptTree(data)
  }, [httpGet])

  const { list, getList, filter, pagination, paginationChange, tableLoading, total } = useTable<User>(form, '/system/user/list', formatData)

  const [treeKey, setTreeKey] = useState<string>('')

  const treeNodes = useMemo(() => {
    if (!treeKey) return deptTree
    const nodes: any[] = []
    const allNodeMap: any = {}
    const deepTree = (realNodes: any[], pid = 0) => {
      realNodes?.forEach(node => {
        const newNode = {
          parentId: pid,
          ...node,
          children: null
        }
        allNodeMap[node.id] = newNode
        if (node.children && node.children.length) {
          deepTree([...node.children], node.id)
        }
        if (node.label?.includes(treeKey)) {
          nodes.push(newNode)
        }
      })
    }
    deepTree(deptTree)
    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i]
      if (allNodeMap[node.parentId]) {
        nodes.push(allNodeMap[node.parentId])
        delete allNodeMap[node.parentId]
      }
    }
    return genTree([...nodes])
  }, [treeKey, deptTree])

  useEffect(() => {
    getList()
  }, [getList])

  useEffect(() => {
    getDeptTree()
  }, [getDeptTree]);

  const { remove, actionData, close, add, edit, changeStatus } = useAction<User>({ url: '/system/user', update: getList })

  const columns: TableColumnsType<User> = [
    {
      title: "用户编号",
      dataIndex: "userId",
      minWidth: 80,
      key: "userId",
    },
    {
      title: "用户名称",
      dataIndex: "userName",
      minWidth: 80,
      key: "userName",
    },
    {
      title: "用户昵称",
      dataIndex: "nickName",
      minWidth: 80,
      key: "nickName",
    },
    {
      title: "部门",
      dataIndex: "deptName",
      minWidth: 80,
      key: "deptName",
      render: (_, record) => {
        return record.dept.deptName
      }
    },
    {
      title: "手机号码",
      dataIndex: "phonenumber",
      key: "phonenumber",
    },
    {
      title: "状态",
      dataIndex: "status",
      key: "status",
      render: (value, record) => {
        return <Switch disabled={record?.admin} size="small" value={!Number(value)} onChange={(v) => {
          changeStatus(record, v, { name: 'userName', id: 'userId' })
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
          <PermissionWrap perm="system:user:edit">
            <Button size="small" type="link" onClick={() => edit(record)}>修改</Button>
          </PermissionWrap>
          <PermissionWrap perm="system:user:remove">
            <Button size="small" type="link" danger onClick={() => remove([record.userId])}>删除</Button>
          </PermissionWrap>
        </>
      },
    },
  ];

  return (
    <div className="page-container">
      <div className="form-wrap">
        <Form layout="inline" form={form} onFinish={filter} onReset={filter}>
          <Form.Item label="用户名称" name="userName">
            <Input placeholder="请输入用户名称" />
          </Form.Item>
          <Form.Item label="手机号码" name="phonenumber">
            <Input placeholder="请输入手机号码" />
          </Form.Item>
          <Form.Item label="状态" name="status">
            <Select style={{ width: 100 }} placeholder="请选择">
              {
                sys_normal_disable?.map((item) => (<Select.Option value={item.value} key={item.value}>{item.label}</Select.Option>))
              }
            </Select>
          </Form.Item>
          <Form.Item label="创建时间" name="dates">
            <DatePicker.RangePicker mode={['date', 'date']} format="YYYY-MM-DD" />
          </Form.Item>
          <Form.Item style={{ display: 'none' }} label="部门" name="deptId">
            <Input/>
          </Form.Item>
          <Form.Item>
            <Button htmlType="submit">搜索</Button>
          </Form.Item>
          <Form.Item>
            <Button htmlType="reset">重置</Button>
          </Form.Item>
        </Form>
      </div>

      <div className={styles.userContent}>
        <div className="tree">
          <Input.Search style={{ marginBottom: 8 }} onSearch={value => setTreeKey(value)} />
          {
            deptTree.length ? <Tree
              fieldNames={{ title: 'label', key: 'id' }}
              treeData={treeNodes}
              defaultExpandAll
              onSelect={(selectedKeys) => {
                form.setFieldValue('deptId', selectedKeys[0] || '')
                filter()
              }}
            /> : ''
          }

        </div>
        <div className="table-wrapper scroll-table-wrapper">
          <TableNav title="用户列表" add={() => add({ status: '0' })} addPermission="system:user:add" />

          <Table
            loading={tableLoading}
            rowKey="userId"
            tableLayout="auto"
            pagination={false}
            dataSource={list}
            columns={columns}
            size="middle"
            scroll={{x: true, y: `calc(var(--table-wrapper-height) - 150px)`}}
          />

          <TablePagination pagination={pagination} total={total} paginationChange={paginationChange} />
        </div>
      </div>

      <ActionFrom actionData={actionData} url="/system/user" close={close} update={getList}>
        <UserForm row={actionData.row} deptTree={deptTree} />
      </ActionFrom>
    </div>
  );
};

interface UserDetail {
  data: Partial<User>
  roles: any[]
  roleIds: number[]
  postIds: number[]
  posts: any[]
}

function UserForm({ row, form, deptTree }: { row?: Partial<User>, form?: FormInstance, deptTree: any[] }) {
  const { sys_user_sex, sys_normal_disable } = useDIct(['sys_user_sex', 'sys_normal_disable'])

  const { httpGet } = useHttp()

  const [detail, setDetail] = useState<UserDetail>({
    data: {},
    roles: [],
    roleIds: [],
    postIds: [],
    posts: []
  })

  useEffect(() => {
    httpGet<UserDetail>('/system/user/' + (row?.userId || ''))
      .then(res => {
        setDetail(res)
        form?.setFieldsValue({
          ...res.data,
          roleIds: res.roleIds,
          postIds: res.postIds
        })
      })
  }, [httpGet, row, form]);

  return <>
    <Form.Item label="用户昵称" name="nickName" rules={[{ required: true, message: '请输入用户昵称' }]}>
      <Input placeholder="请输入用户昵称" />
    </Form.Item>
    <Form.Item label="归属部门" name="deptId">
      <TreeSelect
        virtual={false}
        showSearch
        placeholder="请选择"
        allowClear
        treeData={deptTree}
        filterTreeNode
        treeNodeFilterProp={"label"}
        fieldNames={{ label: 'label', value: 'id' }}
      />
    </Form.Item>
    <Form.Item label="手机号码" name="phonenumber" rules={[{ pattern: /^[1][0-9]{10}$/, message: '请输入正确的手机号' }]}>
      <Input placeholder="请输入手机号码" />
    </Form.Item>
    <Form.Item label="邮箱" name="email">
      <Input placeholder="请输入邮箱" />
    </Form.Item>
    {
      !row?.userId ? <>
        <Form.Item label="用户名称" name="userName" rules={[{ required: true, message: '请输入用户名称' }]}>
          <Input placeholder="请输入用户名称" />
        </Form.Item>
        <Form.Item label="用户密码" name="password" rules={[{ required: true, message: '请输入用户密码' }]}>
          <Input.Password placeholder="请输入用户密码" />
        </Form.Item>
      </> : ''
    }
    <Form.Item label="用户性别" name="sex">
      <Radio.Group>
        {
          sys_user_sex.map(item => <Radio key={item.value} value={item.value}>{item.label}</Radio>)
        }
      </Radio.Group>
    </Form.Item>
    <Form.Item label="状态" name="status">
      <Radio.Group>
        {
          sys_normal_disable.map(item => <Radio key={item.value} value={item.value}>{item.label}</Radio>)
        }
      </Radio.Group>
    </Form.Item>
    <Form.Item label="岗位" name="postIds">
      <Select mode="multiple">
        {
          detail.posts.map(item => {
            return <Select.Option key={item.postId} value={item.postId}>{item.postName}</Select.Option>
          })
        }
      </Select>
    </Form.Item>
    <Form.Item label="角色" name="roleIds">
      <Select mode="multiple">
        {
          detail.roles.map(item => {
            return <Select.Option key={item.roleId} value={item.roleId}>{item.roleName}</Select.Option>
          })
        }
      </Select>
    </Form.Item>
    <Form.Item label="备注" name="remark">
      <Input.TextArea placeholder="请输入备注" />
    </Form.Item>
  </>
}

export default UserSetting;
