import {FC, ReactNode} from "react";
import {Button, Typography} from "antd";
import PermissionWrap from "@/components/PermissionWrap/PermissionWrap.tsx";

const TableNav: FC<{ title: string, add?: <T>(row: T) => void, addPermission?: string, children?: ReactNode}> = ({ title, add, addPermission, children }) => {
  return (
    <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10}}>
      <Typography.Title style={{paddingBottom: 0, marginBottom: 0}} level={5}>
        {title}
      </Typography.Title>
      <div>
        {
          add ? <PermissionWrap perm={addPermission!}>
            <Button size="small" type="primary" onClick={add}>新增</Button>
          </PermissionWrap> : ''
        }
        {children}
      </div>
    </div>
  )
}

export default TableNav;
