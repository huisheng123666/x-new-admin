import {FC, ReactNode} from "react";
import {useUser} from "@/context/user.tsx";

const PermissionWrap: FC<{ children: ReactNode, perm: string }> = ({children, perm}) => {
  const { permissionMap, roles } = useUser()

  if (roles.includes('admin') || permissionMap.current[perm]) return children;

  return ''
}

export default PermissionWrap;
