import { FC, lazy } from "react";
import { Navigate, useLocation, useRoutes } from "react-router-dom";
import Layout from "@/pages/layout/layout";
import HomeView from "../pages/home/home";
import { Button, Result } from "antd";
import { useUser } from "@/context/user";

const Login = lazy(() => import("@/pages/login/login"));
const UserSetting = lazy(() => import("@/pages/system/user"));
const MenuSetting = lazy(() => import("@/pages/system/menu"));
const Role = lazy(() => import("@/pages/system/role.tsx"));
const Dept = lazy(() => import("@/pages/system/dept.tsx"));
const Dict = lazy(() => import("@/pages/system/dict.tsx"));
const DictData = lazy(() => import("@/pages/system/dictData.tsx"));
const Post = lazy(() => import("@/pages/system/post.tsx"));
const SysConfig = lazy(() => import("@/pages/system/config.tsx"));
const SysNotice = lazy(() => import("@/pages/system/notice.tsx"));
const OperLog = lazy(() => import("@/pages/system/log/operlog.tsx"));
const LoginLog = lazy(() => import("@/pages/system/log/logininfor.tsx"));
const ToolGen = lazy(() => import("@/pages/tool/gen.tsx"));

const Router: FC = () => {
  const location = useLocation();
  const { isLogin } = useUser();

  return useRoutes(
    [
      {
        path: "/",
        element: isLogin ? <Layout /> : <Navigate to="/login" />,
        children: [
          {
            path: "",
            element: <HomeView />,
          },
          {
            path: "system/user",
            element: <UserSetting />,
          },
          {
            path: "system/role",
            element: <Role />,
          },
          {
            path: "system/menu",
            element: <MenuSetting />
          },
          {
            path: "system/dept",
            element: <Dept />
          },
          {
            path: "system/dict",
            element: <Dict />
          },
          {
            path: "system/dict/:type",
            element: <DictData />
          },
          {
            path: "system/post",
            element: <Post />
          },
          {
            path: "system/config",
            element: <SysConfig />
          },
          {
            path: "system/notice",
            element: <SysNotice />
          },
          {
            path: "system/log/operlog",
            element: <OperLog />
          },
          {
            path: "system/log/logininfor",
            element: <LoginLog />
          },
          {
            path: 'tool/gen',
            element: <ToolGen />
          }
        ],
      },
      {
        path: "/login",
        element: <Login />,
      },
      {
        path: "*",
        element: (
          <Result
            status="404"
            title="404"
            subTitle="当前页面不存在"
            extra={
              <a href="/">
                <Button type="primary">首页</Button>
              </a>
            }
          />
        ),
      },
    ],
    location
  );
};

export default Router;
