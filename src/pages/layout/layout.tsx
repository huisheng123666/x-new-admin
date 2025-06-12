import {FC, Suspense, useCallback, useEffect, useRef, useState} from "react";
import styles from "./layout.module.scss";
import { useLocation, useOutlet } from "react-router-dom";
import Slider from "./slider";
import { Breadcrumb, Button, Dropdown, Radio } from "antd";
import {
  UserOutlined,
  MoonFilled,
  SunFilled,
  HourglassFilled,
  UnorderedListOutlined,
} from "@ant-design/icons";
import { useAppTheme } from "@/context/theme";
import { CSSTransition, SwitchTransition } from "react-transition-group";
import PageLoading from "@/components/page-loading/page-loading";
import {useUser} from "@/context/user.tsx";
import {animatePage} from "@/common/utils";
import {getSysTheme} from "@/common/config";

const Layout: FC = () => {
  const { setAppTheme, appTheme, slideExpand, setSlideExpand } = useAppTheme();
  const location = useLocation();

  const { logout } = useUser()

  const { routes } = useUser()

  const [breadItems, setBreadItems] = useState<{ title: string }[]>([])

  const currentOutlet = useOutlet();

  const nodeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (location.pathname === '/') {
      setBreadItems([{ title: '首页' }])
      return
    }
    setBreadItems(deepMenu(routes, location.pathname, []))
  }, [routes, location]);

  const changeTheme = useCallback((e: any) => {
    const sysTheme = getSysTheme()
    if (appTheme === 'system' && e.target.value === sysTheme) {
      setAppTheme(e.target.value)
      return
    }
    if (e.target.value === 'system') {
      console.log(appTheme, sysTheme)
      if (appTheme !== 'system' && sysTheme !== appTheme) {
        animatePage(e.nativeEvent, sysTheme)
      }
      // console.log(sysTheme, appTheme)
    } else {
      animatePage(e.nativeEvent, e.target.value)
    }
    setTimeout(() => {
      setAppTheme(e.target.value)
    }, 1)
    // console.log(e.nativeEvent)
  }, [appTheme, setAppTheme])

  return (
    <div className={styles.layout}>
      <Slider />
      <div className="top-dock">
        <Button
          type="text"
          icon={<UnorderedListOutlined />}
          onClick={() => setSlideExpand(!slideExpand)}
        />
        <Breadcrumb
          items={breadItems}
        />
        <Radio.Group
          value={appTheme}
          onChange={changeTheme}
          size="small"
          buttonStyle="solid"
        >
          <Radio.Button value="system">
            <HourglassFilled />
          </Radio.Button>
          <Radio.Button value="dark">
            <MoonFilled />
          </Radio.Button>
          <Radio.Button value="light">
            <SunFilled />
          </Radio.Button>
        </Radio.Group>
        <Dropdown
          menu={{
            items: [
              {
                key: "1",
                label: <p>个人中心</p>,
              },
              {
                key: "2",
                label: <p onClick={logout}>退出登录</p>,
              },
            ],
          }}
        >
          <Button type="text" icon={<UserOutlined />}></Button>
        </Dropdown>
      </div>
      <div className="content">
        <Suspense fallback={<PageLoading />}>
          <SwitchTransition>
            <CSSTransition
              key={location.pathname}
              timeout={300}
              classNames="fade"
              nodeRef={nodeRef}
            >
              <div style={{ height: "100%" }} ref={nodeRef}>
                {currentOutlet}
              </div>
            </CSSTransition>
          </SwitchTransition>
        </Suspense>
      </div>
    </div>
  );
};

function deepMenu(routes: any[], path: string, res: { title: string }[] = [], prev = '') {
  routes.some(item => {
    if (path.startsWith(prev + item.path)) {
      res.push({
        title: item.meta.title,
      })
      if (item.children && item.children.length) {
        deepMenu(item.children, path, res, prev + item.path + '/')
      }
      return true
    }
  })
  return res
}

export default Layout;
