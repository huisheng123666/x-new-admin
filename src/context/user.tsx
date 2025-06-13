import { getStorage } from "@/common/utils";
import FullPageLoading from "@/components/full-page-loading/full-page-loading";
import { useHttp } from "@/hooks/useHttp";
import {
  createContext,
  FC, MutableRefObject,
  ReactNode,
  useCallback,
  useContext,
  useLayoutEffect, useRef,
  useState,
} from "react";

export interface Userinfo {
  userId: number;
  userName: string;
  phonenumber: string;
  email: string;
  dept: Dept;
  avatar: string;
  admin: boolean;
  roles: Role[];
  createTime: string
  nickName: string
  sex: string
}

const UserContext = createContext<
  | {
      userinfo: Userinfo | undefined;
      roles: string[];
      permissions: string[];
      setUserinfo: (userinfo: (prevState: Userinfo | undefined) => any) => void;
      setRoles: (roles: string[]) => void;
      setPermissions: (permissions: string[]) => void;
      isLogin: boolean;
      setIsLogin: (isLogin: boolean) => void;
      getUserinfo: () => void;
      routes: any[];
      permissionMap: MutableRefObject<Record<string, boolean>>
      logout: () => void
    }
  | undefined
>(undefined);

UserContext.displayName = "ThemeContext";

export const UserProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [userinfo, setUserinfo] = useState<Userinfo | undefined>(undefined);
  const [roles, setRoles] = useState<string[]>([]);
  const [permissions, setPermissions] = useState<string[]>([]);
  const [isLogin, setIsLogin] = useState<boolean>(false);

  const permissionMap = useRef<Record<string, boolean>>({})

  const [routes, setRoutes] = useState<any[]>([]);

  const { httpGet, loading } = useHttp(!!getStorage("token"));

  const getUserinfo = useCallback(() => {
    httpGet<{ user: Userinfo, roles: string[], permissions: string[] }>("/getInfo", null, false).then((data) => {
      setUserinfo({
        userId: data.user.userId,
        userName: data.user.userName,
        avatar: data.user.avatar,
        admin: data.user.admin,
        phonenumber: data.user.phonenumber,
        email: data.user.email,
        dept: data.user.dept,
        roles: data.user.roles,
        createTime: data.user.createTime,
        nickName: data.user.nickName,
        sex: data.user.sex
      });
      setIsLogin(true);
      setRoles(data.roles);
      setPermissions(data.permissions);
      data.permissions.forEach((item: string) => permissionMap.current[item] = true)
    });
  }, [httpGet]);

  const getRoutes = useCallback(() => {
    httpGet("/getRouters", null, false).then((res: any) => {
      setRoutes(res.data);
    });
  }, [httpGet]);

  const logout = useCallback(() => {
    httpGet('/logout')
    localStorage.clear()
    location.replace('/login')
  }, [httpGet])

  useLayoutEffect(() => {
    const token = getStorage("token");
    if (!token) {
      return;
    }
    getUserinfo();
    getRoutes();
  }, [getUserinfo, getRoutes]);

  if (loading) {
    return <FullPageLoading />;
  }

  return (
    <UserContext.Provider
      children={children}
      value={{
        userinfo,
        setUserinfo,
        roles,
        setRoles,
        permissions,
        setPermissions,
        isLogin,
        setIsLogin,
        getUserinfo,
        routes,
        permissionMap,
        logout
      }}
    />
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser必须在UserProvider中使用");
  }
  return context;
};
