import {FC, useEffect} from "react";
import {Button, Form, Input, Radio, Select, Table, TableColumnsType} from "antd";
import useDIct from "@/hooks/useDIct.ts";
import {useContentHeight} from "@/hooks/useContentHeight.ts";
import {useTable} from "@/hooks/useTable.ts";
import {useAction} from "@/hooks/useAction.ts";
import TableNav from "@/components/TableNav/TableNav.tsx";
import TablePagination from "@/components/TablePagination/TablePagination.tsx";
import DictTag from "@/components/dict-tag/dict-tag.tsx";
import PermissionWrap from "@/components/PermissionWrap/PermissionWrap.tsx";
import ActionFrom from "@/components/ActionFrom/ActionFrom.tsx";

const SysNoticePage: FC = () => {

  useContentHeight();

  const [form] = Form.useForm()

  const { list, getList, filter, pagination, paginationChange, tableLoading, total } = useTable<SysNotice>(form, '/system/notice/list')

  const { remove, actionData, close, add, edit } = useAction<SysNotice>({ url: '/system/notice', update: getList })

  const { sys_notice_type, sys_notice_status } = useDIct(['sys_notice_type', 'sys_notice_status'])

  useEffect(() => {
    getList()
  }, [getList]);

  const columns: TableColumnsType<SysNotice> = [
    {
      dataIndex: 'noticeId',
      title: '序号'
    },
    {
      dataIndex: 'noticeTitle',
      title: '公告标题'
    },
    {
      dataIndex: 'noticeType',
      title: '公告类型',
      render: (value) => {
        return <DictTag options={sys_notice_type} value={value} />
      }
    },
    {
      dataIndex: 'status',
      title: '公告状态',
      render: (value) => {
        return <DictTag options={sys_notice_status} value={value} />
      }
    },
    {
      dataIndex: 'createBy',
      title: '创建者',
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
          <PermissionWrap perm="system:notice:edit">
            <Button size="small" type="link" onClick={() => edit(record)}>修改</Button>
          </PermissionWrap>
          <PermissionWrap perm="system:notice:remove">
            <Button size="small" type="link" danger onClick={() => remove([record.noticeId])}>删除</Button>
          </PermissionWrap>
        </>
      },
    },
  ]

  return <div className="page-container">
    <div className="form-wrap">
      <Form layout="inline" form={form} onFinish={filter} onReset={filter}>
        <Form.Item label="公告标题" name="noticeTitle">
          <Input placeholder="请输入公告标题" />
        </Form.Item>
        <Form.Item label="操作人员" name="createBy">
          <Input placeholder="请输入操作人员" />
        </Form.Item>
        <Form.Item label="公告类型" name="noticeType">
          <Select style={{width: 100}} placeholder="请选择">
            {
              sys_notice_type?.map((item) => (
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
      <TableNav title="公告列表" add={() => add({noticeType: '1', status: '0'})} addPermission="system:notice:add" />

      <Table
        loading={tableLoading}
        rowKey="noticeId"
        tableLayout="auto"
        pagination={false}
        dataSource={list}
        columns={columns}
        size="middle"
        scroll={{x: true, y: `calc(var(--table-wrapper-height) - 150px)`}}
      />

      <TablePagination pagination={pagination} total={total} paginationChange={paginationChange} />
    </div>

    <ActionFrom actionData={actionData} url="/system/notice" close={close} update={getList}>
      <NoticeForm />
    </ActionFrom>
  </div>
}

function NoticeForm() {
  const { sys_notice_type, sys_notice_status } = useDIct(['sys_notice_type', 'sys_notice_status'])

  return <>
    <Form.Item label="公告标题" name="noticeTitle" rules={[{ required: true, message: '请输入公告标题' }]}>
      <Input placeholder="请输入公告标题" />
    </Form.Item>
    <Form.Item label="公告类型" name="noticeType">
      <Radio.Group>
        {
          sys_notice_type.map(item => <Radio key={item.value} value={item.value}>{item.label}</Radio>)
        }
      </Radio.Group>
    </Form.Item>
    <Form.Item label="状态" name="status">
      <Radio.Group>
        {
          sys_notice_status.map(item => <Radio key={item.value} value={item.value}>{item.label}</Radio>)
        }
      </Radio.Group>
    </Form.Item>
    <Form.Item label="内容" name="noticeContent">
      <Input.TextArea placeholder="请输入内容"  rows={10} />
    </Form.Item>
  </>
}


export default SysNoticePage
