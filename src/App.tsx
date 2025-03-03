import { BrowserRouter } from "react-router-dom";
import AppRouter from "@/router";
import { useEffect, useRef, useState } from "react";
import { ConfigProvider, App as AntdApp } from "antd";
import zhCN from "antd/locale/zh_CN";
// for date-picker i18n
import "dayjs/locale/zh-cn";
import { theme as antdTheme } from "antd";
import { useAppTheme } from "./context/theme";
import { darkStyleText, getSysTheme, setCssTheme } from "./common/config";
import {UserProvider} from "@/context/user.tsx";

function App() {
  const { appTheme } = useAppTheme();

  const styleRef = useRef<HTMLStyleElement>();

  const [theme, setTheme] = useState(() => {
    if (appTheme === "system") {
      return getSysTheme();
    } else {
      return appTheme;
    }
  });

  useEffect(() => {
    if (appTheme !== "system") {
      if (styleRef.current) document.head.removeChild(styleRef.current);
      styleRef.current = undefined;
      setTheme(appTheme);
      setCssTheme(appTheme);
      return;
    }

    const sysTheme = getSysTheme();

    if (!styleRef.current) {
      styleRef.current = document.createElement("style");
      styleRef.current.type = "text/css";
      styleRef.current.innerHTML = darkStyleText;
      document.head.appendChild(styleRef.current);
    }
    setCssTheme("light");
    const mediaQueryList = window.matchMedia("(prefers-color-scheme: dark)");
    const handleThemeChange = () => {
      setTheme(getSysTheme());
    };

    setTheme(sysTheme);

    mediaQueryList.addEventListener("change", handleThemeChange);
    return () =>
      mediaQueryList.removeEventListener("change", handleThemeChange);
  }, [appTheme]);

  return (
    <ConfigProvider
      locale={zhCN}
      theme={{
        // 1. 单独使用暗色算法
        algorithm:
          theme === "dark"
            ? antdTheme.darkAlgorithm
            : antdTheme.defaultAlgorithm,
        // 2. 组合使用暗色算法与紧凑算法
        // algorithm: [theme.darkAlgorithm, theme.compactAlgorithm],
        cssVar: true,
      }}
    >
      <AntdApp>
        <UserProvider>
          <BrowserRouter>
            <AppRouter />
          </BrowserRouter>
        </UserProvider>
      </AntdApp>
    </ConfigProvider>
  );
}

export default App;
