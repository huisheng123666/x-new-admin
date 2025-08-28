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

const SysOperationLogPage: FC = () => {

  useContentHeight();

  const [form] = Form.useForm()

  const { list, getList, filter, pagination, paginationChange, tableLoading, total } = useTable<OperationLog>(form, '/monitor/operlog/list', formatData)


  const { sys_oper_type, sys_common_status } = useDIct(['sys_oper_type', 'sys_common_status'])

  useEffect(() => {
    getList()
  }, [getList]);

  const columns: TableColumnsType<OperationLog> = [
    {
      dataIndex: 'operId',
      title: '日志编号'
    },
    {
      dataIndex: 'title',
      title: '系统模块'
    },
    {
      dataIndex: 'businessType',
      title: '操作类型',
      render: (value) => {
        return <DictTag options={sys_oper_type} value={value.toString()} />
      }
    },
    {
      dataIndex: 'operName',
      title: '操作人员',
    },
    {
      dataIndex: 'operIp',
      title: '操作地址',
    },
    {
      dataIndex: 'operLocation',
      title: '操作地点',
    },
    {
      dataIndex: 'status',
      title: '操作状态',
      render: (value) => {
        return <DictTag options={sys_common_status} value={value.toString()} />
      }
    },

    {
      dataIndex: 'operTime',
      title: '操作时间'
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
        <Form.Item label="操作地址" name="operIp">
          <Input placeholder="请输入操作地址" />
        </Form.Item>
        <Form.Item label="系统模块" name="title">
          <Input placeholder="请输入系统模块" />
        </Form.Item>
        <Form.Item label="操作人员" name="operName">
          <Input placeholder="请输入操作人员" />
        </Form.Item>
        <Form.Item label="操作类型" name="businessType">
          <Select style={{width: 100}} placeholder="请选择">
            {
              sys_oper_type?.map((item) => (
                <Select.Option value={item.value} key={item.value}>{item.label}</Select.Option>))
            }
          </Select>
        </Form.Item>
        <Form.Item label="操作状态" name="status">
          <Select style={{width: 100}} placeholder="请选择">
            {
              sys_common_status?.map((item) => (
                <Select.Option value={item.value} key={item.value}>{item.label}</Select.Option>))
            }
          </Select>
        </Form.Item>
        <Form.Item label="操作时间" name="dates">
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
        rowKey="operId"
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


export default SysOperationLogPage
