import {useCallback, useState} from "react";
import {useHttp} from "@/hooks/useHttp.ts";
import {FormInstance} from "antd";
import {useLocation, useNavigate} from "react-router-dom";

export function useTable<T>(form: FormInstance, url: string, formatParams?: (params: unknown) => unknown) {
  const navigate = useNavigate();
  const location = useLocation();

  const { httpGet, loading } = useHttp()

  const [list, setList] = useState<T[]>([]);

  const [pagination, setPagination] = useState<Pagination>({
    pageNum: location.state?.pageNum || 1,
    pageSize: 10,
  })

  const [total, setTotal] = useState<number>(0)

  const getList = useCallback(() => {
    const formVals = form.getFieldsValue()
    console.log(formVals)
    let params: any = {...formVals, ...pagination}
    if (formatParams) {
      params = formatParams(params)
    }
    httpGet<{ rows: T[], total: number }>(url, params)
      .then(res => {
        setList(res.rows)
        setTotal(res.total)
        if (pagination.pageNum > 1 && pagination.pageNum * pagination.pageSize > res.total) {
          navigate(window.location.pathname + window.location.search, { replace: true, state: { pageNum: pagination.pageNum - 1 } })
        }
      })
  }, [httpGet, form, url, formatParams, pagination, navigate])

  const filter = useCallback(() => {
    setPagination({
      pageNum: 1,
      pageSize: 10,
    })
    navigate(location.pathname, { replace: true, state: { pageNum: 1 } })
  }, [navigate, location])

  const paginationChange = useCallback((pageNum: number, pageSize: number) => {
    setPagination({
      pageNum,
      pageSize
    })
    navigate(location.pathname, { replace: true, state: { pageNum } })
  }, [navigate, location])

  return {
    list,
    total,
    pagination,
    getList,
    filter,
    setPagination,
    paginationChange,
    tableLoading: loading
  }
}
