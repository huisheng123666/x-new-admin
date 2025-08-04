import { FC, useCallback, useMemo, useState, ReactElement } from "react";
import { Menu, Typography } from "antd";
import { useLocation, useNavigate } from "react-router-dom";
import { useAppTheme } from "@/context/theme";
import { useUser } from "@/context/user";
import * as icons from '@ant-design/icons';
import logo from './x.png'


interface MenuItem {
  key: string;
  icon: ReactElement;
  label: string;
  children?: MenuItem[];
}

function genMenus(routes: any[], menus: MenuItem[] = [], prevPath = "") {
  routes.forEach((route: any) => {
    if (route.hidden) return;
    if (!route.meta) {
      route = route.children[0];
    }
    const Icon = (icons as any)[route.meta?.icon]
    const menu: MenuItem = {
      key: prevPath + route.path,
      icon: Icon ? <Icon/> : <></>,
      label: route.meta?.title,
      children: [],
    };
    if (route.children && route.children.length > 0) {
      menu.children = [];
      genMenus(route.children, menu.children, prevPath + route.path + "/");
    } else {
      delete menu.children;
    }
    menus.push(menu);
  });
  return menus;
}

const Slider: FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const { slideExpand } = useAppTheme();

  const { routes } = useUser();

  const [isScroll, setIsScroll] = useState(false);

  const menus = useMemo(() => {
    return genMenus(routes, [
      {
        key: "/",
        icon: <icons.HomeOutlined />,
        label: "首页",
      },
    ]);
  }, [routes]);

  const openKeys = useMemo(() => {
    if (location.pathname === "/") return ["/"];
    const keys: string[] = [];
    const deepMenus = (menus: MenuItem[]) => {
      menus.some((menu) => {
        if (location.pathname.startsWith(menu!.key as string)) {
          keys.push(menu?.key as string);
        }
        if (location.pathname.endsWith(menu!.key as string)) {
          return true
        }
        if (menu.children?.length) {
          deepMenus(menu.children);
        }
      });
    };
    deepMenus(menus.slice(1));
    return keys;
  }, [location, menus]);

  const menuScroll = useCallback((e: any) => {
    setIsScroll(e.target.scrollTop > 0);
  }, []);

  return (
    <div className="slider" style={{ width: slideExpand ? 220 : 79 }}>
      <a href="/" className={isScroll ? "border" : ""}>
        <img
          src={logo}
          alt=""
        />
        {slideExpand ? (
          <Typography.Title style={{ paddingLeft: 0, marginBottom: 0 }} level={4}>
            X-Admin
          </Typography.Title>
        ) : (
          ""
        )}
      </a>

      <div className="menus" onScroll={menuScroll}>
        <Menu
          selectedKeys={[location.pathname.includes('/system/dict') ? '/system/dict' : location.pathname]}
          items={menus as any}
          theme="light"
          defaultOpenKeys={openKeys}
          subMenuOpenDelay={0.3}
          style={{ background: "inherit" }}
          mode="inline"
          inlineCollapsed={!slideExpand}
          onClick={(item) => {
            if (location.pathname === item.key) return;
            navigate(item.key as string);
          }}
        />
      </div>
    </div>
  );
};

export default Slider;
