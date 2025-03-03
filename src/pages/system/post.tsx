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

const PostPage: FC = () => {

  useContentHeight();

  const [form] = Form.useForm()

  const { list, getList, filter, pagination, paginationChange, tableLoading, total } = useTable<Post>(form, '/system/post/list')

  const { remove, actionData, close, add, edit } = useAction<Post>({ url: '/system/post', update: getList })

  const { sys_normal_disable } = useDIct(['sys_normal_disable'])

  useEffect(() => {
    getList()
  }, [getList]);

  const columns: TableColumnsType<Post> = [
    {
      dataIndex: 'postId',
      title: '岗位编号'
    },
    {
      dataIndex: 'postCode',
      title: '岗位编码'
    },
    {
      dataIndex: 'postName',
      title: '岗位名称'
    },
    {
      dataIndex: 'postSort',
      title: '岗位排序'
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
      title: "操作",
      key: "operation",
      fixed: "right",
      width: 100,
      render: (_, record) => {
        return <>
          <PermissionWrap perm="system:post:edit">
            <Button size="small" type="link" onClick={() => edit(record)}>修改</Button>
          </PermissionWrap>
          <PermissionWrap perm="system:post:remove">
            <Button size="small" type="link" danger onClick={() => remove([record.postId])}>删除</Button>
          </PermissionWrap>
        </>
      },
    },
  ]

  return <div className="page-container">
    <div className="form-wrap">
      <Form layout="inline" form={form} onFinish={filter} onReset={filter}>
        <Form.Item label="岗位编码" name="postCode">
          <Input placeholder="请输入岗位编码" />
        </Form.Item>
        <Form.Item label="岗位名称" name="postName">
          <Input placeholder="请输入岗位名称" />
        </Form.Item>
        <Form.Item label="岗位状态" name="status">
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
      <TableNav title="岗位列表" add={() => add({status: '0'})} addPermission="system:post:add" />

      <Table
        loading={tableLoading}
        rowKey="postId"
        tableLayout="auto"
        pagination={false}
        dataSource={list}
        columns={columns}
        size="middle"
        scroll={{x: true, y: `calc(var(--table-wrapper-height) - 150px)`}}
      />

      <TablePagination pagination={pagination} total={total} paginationChange={paginationChange} />
    </div>

    <ActionFrom actionData={actionData} url="/system/post" close={close} update={getList}>
      <PostForm />
    </ActionFrom>
  </div>
}

function PostForm() {
  const { sys_normal_disable } = useDIct(['sys_normal_disable'])

  return <>
    <Form.Item label="岗位名称" name="postName" rules={[{ required: true, message: '请输入岗位名称' }]}>
      <Input placeholder="请输入岗位名称" />
    </Form.Item>
    <Form.Item label="岗位编码" name="postCode" rules={[{ required: true, message: '请输入岗位编码' }]}>
      <Input placeholder="请输入岗位编码" />
    </Form.Item>
    <Form.Item label="岗位排序" name="postSort" rules={[{ required: true, message: '请选择岗位排序' }]}>
      <InputNumber placeholder="请输入岗位排序" style={{ width: 200 }} />
    </Form.Item>
    <Form.Item label="状态" name="status" rules={[{ required: true, message: '请选择岗位状态' }]}>
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


export default PostPage
