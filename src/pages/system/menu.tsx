import {
  Button,
  Form,
  Input,
  InputNumber,
  Radio,
  Select,
  Table,
  TableColumnsType,
  TreeSelect
} from "antd";
import useDIct from "@/hooks/useDIct.ts";
import {useContentHeight} from "@/hooks/useContentHeight.ts";
import {useHttp} from "@/hooks/useHttp.ts";
import {useCallback, useEffect, useState} from "react";
import DictTag from "@/components/dict-tag/dict-tag.tsx";
import * as icons from "@ant-design/icons";
import {useAction} from "@/hooks/useAction.ts";
import ActionFrom from "@/components/ActionFrom/ActionFrom.tsx";
import PermissionWrap from "@/components/PermissionWrap/PermissionWrap.tsx";
import {genTree} from "@/common/utils";
import TableNav from "@/components/TableNav/TableNav.tsx";

const MenuSetting = () => {
  useContentHeight();
  const {sys_normal_disable} = useDIct(['sys_normal_disable'])

  const { httpGet, loading } = useHttp()

  const [list, setList] = useState<Menu[]>([])

  const [form] = Form.useForm()

  const getList = useCallback(async () => {
    const { data } = await httpGet<{ data: Menu[] }>('/system/menu/list', {...form.getFieldsValue()})
    setList(genTree(data, 0, [], {}, { id: 'menuId', pid: 'parentId' }))
  }, [httpGet, form])

  const { actionData, add, edit, close, remove } = useAction<Menu>({ url: '/system/menu', update: getList })

  const resetForm = useCallback(() => {
    form.resetFields()
    getList()
  }, [form, getList])

  const columns: TableColumnsType<Menu> = [
    {
      key: 'menuName',
      dataIndex: 'menuName',
      title: '菜单名称',
      minWidth: 150
    },
    {
      key: 'icon',
      dataIndex: 'icon',
      title: '图标',
      minWidth: 60,
      render: value => {
        const Icon = (icons as any)[value];
        if (!Icon) return ''
        return <Icon/>
      }
    },
    {
      key: 'orderNum',
      dataIndex: 'orderNum',
      title: '排序',
      minWidth: 50
    },
    {
      key: 'perms',
      dataIndex: 'perms',
      minWidth: 100,
      title: '权限标识',
    },
    {
      key: 'status',
      dataIndex: 'status',
      title: '状态',
      render: (value) => {
        return <DictTag options={sys_normal_disable} value={value} />
      }
    },
    {
      key: 'createTime',
      dataIndex: 'createTime',
      title: '创建时间',
      ellipsis: true
    },
    {
      key: 'action',
      title: '操作',
      width: 200,
      fixed: 'right',
      render: (_, record: Menu) => {
        return <div>
          <PermissionWrap perm="system:menu:edit">
            <Button type="link" data-perms="system:menu:edit" onClick={() => {
              edit(record)
            }}>修改</Button>
          </PermissionWrap>
          <PermissionWrap perm="system:menu:add">
            <Button data-perms="system:menu:add" type="link" onClick={() => {
              add({
                parentId: record.menuId,
                menuType: 'M'
              })
            }}>新增</Button>
          </PermissionWrap>
          <PermissionWrap perm="system:menu:remove">
            <Button data-perms="system:menu:remove" type="link" danger onClick={() => remove([record.menuId])}>删除</Button>
          </PermissionWrap>
        </div>
      }
    }
  ]

  useEffect(() => {
    getList()
  }, [getList]);

  return <div className="page-container">
    <div className="form-wrap">
      <Form layout="inline" onFinish={getList} form={form} onReset={resetForm}>
        <Form.Item label="菜单名称" name="menuName">
          <Input placeholder="请输入菜单名称" />
        </Form.Item>
        <Form.Item label="状态" name="status">
          <Select style={{ width: 200 }} placeholder="菜单状态" allowClear>
            {
              sys_normal_disable?.map((item) => (<Select.Option value={item.value} key={item.value}>{item.label}</Select.Option>))
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
      <TableNav title="菜单列表" add={() => add({ menuType: 'M' })} addPermission="system:menu:add" />

      <Table
        className="no-pagination"
        tableLayout="auto"
        loading={loading}
        rowKey="menuId"
        pagination={false}
        dataSource={list}
        columns={columns}
        size="middle"
        scroll={{x: '500px', y: `calc(var(--table-wrapper-height) - 120px)`}}
      />
    </div>

    <ActionFrom actionData={actionData} url="/system/menu" close={close} update={getList}>
      <MenuForm row={actionData.row}/>
    </ActionFrom>
  </div>;
};

function MenuForm({row}: { row?: Partial<Menu> }) {
  const {sys_show_hide, sys_normal_disable} = useDIct(['sys_show_hide', 'sys_normal_disable'])

  const {httpGet} = useHttp(false)

  const [menus, setMenus] = useState<Menu[]>([])

  const [menuType, setMenuType] = useState(row?.menuType || 'M')

  useEffect(() => {
    setMenuType(row?.menuType || 'M')
  }, [row]);

  useEffect(() => {
    httpGet<{ data: Menu[] }>('/system/menu/list')
    .then(res => {
      setMenus(genTree(res.data, 0, [], {}, { id: 'menuId', pid: 'parentId' }))
    })
  }, [httpGet])


  return <>
    <Form.Item label="上级菜单" name="parentId" rules={[{ required: true, message: '请选择' }]}>
      <TreeSelect
        virtual={false}
        showSearch
        placeholder="请选择"
        allowClear
        filterTreeNode
        treeNodeFilterProp={"menuName"}
        treeData={[{menuId: 0, menuName: '顶级', children: menus as any[] }]}
        fieldNames={{ label: 'menuName', value: 'menuId' }}
      />
    </Form.Item>
    <Form.Item label="菜单类型" name="menuType" rules={[{ required: true, message: '请选择' }]}>
      <Radio.Group onChange={(v) => {
        setMenuType(v.target.value)
      }}>
        <Radio value="M">目录</Radio>
        <Radio value="C">菜单</Radio>
        <Radio value="F">按钮</Radio>
      </Radio.Group>
    </Form.Item>
    <Form.Item label="菜单名称" name="menuName" rules={[{ required: true, message: '请输入菜单名称' }]}>
      <Input placeholder="请输入菜单名称" />
    </Form.Item>
    {
      menuType !== 'F' ? <Form.Item label="图标" name="icon">
        <Select showSearch placeholder="请选择图标">
          {
            Object.keys(icons).map((key) => {
              const Icon = (icons as any)[key]
              return <Select.Option key={key} value={key}>
                <Icon/>-{key}
              </Select.Option>
            })
          }
        </Select>
      </Form.Item> : ''
    }
    <Form.Item label="显示排序" name="orderNum" rules={[{ required: true, message: '请输入显示排序' }]}>
      <InputNumber placeholder="请输入显示排序" style={{ width: 200 }} />
    </Form.Item>
    {
      menuType !== 'F' ? <Form.Item label="路由地址" name="path" rules={[{ required: true, message: '请输入路由地址' }]}>
        <Input placeholder="请输入路由地址" />
      </Form.Item> : ''
    }
    {
      menuType !== 'M' ? <Form.Item label="权限字符" name="perms" rules={[{ required: true, message: '请输入权限字符' }]}>
        <Input placeholder="请输入权限字符" />
      </Form.Item> : ''
    }
    {
      menuType !== 'F' ? <Form.Item label="显示状态" name="visible" rules={[{ required: true, message: '请选择显示状态' }]}>
        <Radio.Group>
          {
            sys_show_hide.map(item => <Radio value={item.value} key={item.value}>{item.label}</Radio>)
          }
        </Radio.Group>
      </Form.Item> : ''
    }
    <Form.Item label="菜单状态" name="status" rules={[{ required: true, message: '请选择菜单状态' }]}>
      <Radio.Group>
        {
          sys_normal_disable.map(item => <Radio value={item.value} key={item.value}>{item.label}</Radio>)
        }
      </Radio.Group>
    </Form.Item>
  </>
}

export default MenuSetting;
