import { BrowserRouter } from "react-router-dom";
import AppRouter from "@/router";
import { useMemo } from "react";
import { ConfigProvider, App as AntdApp } from "antd";
import zhCN from "antd/locale/zh_CN";
// for date-picker i18n
import "dayjs/locale/zh-cn";
import { theme as antdTheme } from "antd";
import { useAppTheme } from "./context/theme";
import { UserProvider } from "@/context/user.tsx";

function App() {
  const { appTheme, primaryColor, orgSysTheme, displaySize } = useAppTheme();

  const theme = useMemo(() => {
    const current = appTheme === "system" ? orgSysTheme : appTheme;
    const orgTheme = current === "dark" ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm
    if (displaySize === 'compact') {
      return [orgTheme, antdTheme.compactAlgorithm];
    }
    return orgTheme
  }, [appTheme, orgSysTheme, displaySize]);

  return (
    <ConfigProvider
      locale={zhCN}
      theme={{
        // 1. 单独使用暗色算法
        algorithm: theme,
        // 2. 组合使用暗色算法与紧凑算法
        // algorithm: [theme.darkAlgorithm, theme.compactAlgorithm],
        cssVar: true,
        token: {
          colorPrimary: primaryColor,
        },
      }}
    >
      <AntdApp>
        <UserProvider>
          <BrowserRouter
            future={{
              v7_startTransition: true,
              v7_relativeSplatPath: true,
            }}
          >
            <AppRouter />
          </BrowserRouter>
        </UserProvider>
      </AntdApp>
    </ConfigProvider>
  );
}

export default App;
