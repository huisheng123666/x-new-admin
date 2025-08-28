import {FC, useEffect} from "react";
import {Button, DatePicker, Form, Input, Select, Table, TableColumnsType} from "antd";
import useDIct from "@/hooks/useDIct.ts";
import {useContentHeight} from "@/hooks/useContentHeight.ts";
import {useTable} from "@/hooks/useTable.ts";
import TableNav from "@/components/TableNav/TableNav.tsx";
import TablePagination from "@/components/TablePagination/TablePagination.tsx";
import DictTag from "@/components/dict-tag/dict-tag.tsx";
import {formatDateRange} from "@/common/utils";
import {Dayjs} from "dayjs";

const formatData = (data: any) => {
  const params: any = {
    ...data,
    ...formatDateRange(data.dates as [Dayjs, Dayjs]),
  }
  delete params.dates
  return params
}

const LoginLogPage: FC = () => {

  useContentHeight();

  const [form] = Form.useForm()

  const { list, getList, filter, pagination, paginationChange, tableLoading, total } = useTable<LoginLog>(form, '/monitor/logininfor/list', formatData)


  const { sys_common_status } = useDIct(['sys_common_status'])

  useEffect(() => {
    getList()
  }, [getList]);

  const columns: TableColumnsType<LoginLog> = [
    {
      dataIndex: 'infoId',
      title: '访问编号'
    },
    {
      dataIndex: 'userName',
      title: '用户名称'
    },
    {
      dataIndex: 'ipaddr',
      title: '登录地址'
    },
    {
      dataIndex: 'loginLocation',
      title: '登录地点',
    },
    {
      dataIndex: 'browser',
      title: '浏览器',
    },
    {
      dataIndex: 'os',
      title: '操作系统',
    },
    {
      dataIndex: 'status',
      title: '登录状态',
      render: (value) => {
        return <DictTag options={sys_common_status} value={value.toString()} />
      }
    },
    {
      dataIndex: 'msg',
      title: '操作信息'
    },
    {
      dataIndex: 'loginTime',
      title: '登录时间'
    },
    // {
    //   title: "操作",
    //   key: "operation",
    //   fixed: "right",
    //   width: 100,
    //   // render: (_, record) => {
    //   //   return <>
    //   //   </>
    //   // },
    // },
  ]

  return <div className="page-container table-page">
    <div className="form-wrap">
      <Form layout="inline" form={form} onFinish={filter} onReset={filter}>
        <Form.Item label="登录地址" name="ipaddr">
          <Input placeholder="请输入登录地址" />
        </Form.Item>
        <Form.Item label="用户名称" name="userName">
          <Input placeholder="请输入用户名称" />
        </Form.Item>
        <Form.Item label="状态" name="status">
          <Select style={{ width: 100 }} placeholder="请选择">
            {
              sys_common_status?.map((item) => (<Select.Option value={item.value} key={item.value}>{item.label}</Select.Option>))
            }
          </Select>
        </Form.Item>
        <Form.Item label="登录时间" name="dates">
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
      <TableNav title="操作日志列表" />

      <Table
        loading={tableLoading}
        rowKey="infoId"
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
}


export default LoginLogPage
