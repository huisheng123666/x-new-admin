import {FC} from "react";
import {Pagination} from "antd";

interface TablePaginationProps {
  pagination: Partial<Pagination>
  total: number
  paginationChange: (page: number, pageSize: number) => void
}

const TablePagination: FC<TablePaginationProps> = ({ paginationChange, total, pagination }) => {

  return <div className="pagination">
    <Pagination
      current={pagination.pageNum}
      pageSize={pagination.pageSize}
      total={total}
      size="small"
      showTotal={(total) => (
        <span className="pagination-total">{`共 ${total}条`}</span>
      )}
      onChange={paginationChange}
    />
  </div>
}

export default TablePagination
