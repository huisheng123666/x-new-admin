import { getSysTheme } from "@/common/config";
import { animatePage, getStorage, setRootTheme, setStorage } from "@/common/utils";
import { createContext, FC, ReactNode, useContext, useEffect, useRef, useState, useSyncExternalStore } from "react";

export type AppTheme = "system" | "light" | "dark";

const ThemeContext = createContext<
  | {
      appTheme: AppTheme;
      orgSysTheme: AppTheme;
      setAppTheme: (theme: AppTheme) => void;
      slideExpand: boolean;
      setSlideExpand: (expand: boolean) => void;
      primaryColor: string;
      setPrimaryColor: (color: string) => void;
      changeTheme: (e: any) => void;
    }
  | undefined
>(undefined);

ThemeContext.displayName = "ThemeContext";

function subscribe(callback: () => void) {
  const mediaQueryList = window.matchMedia("(prefers-color-scheme: dark)");

  mediaQueryList.addEventListener("change", callback);

  return () => {
    mediaQueryList.removeEventListener("change", callback);
  };
}

export const ThemeProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [appTheme, setAppTheme] = useState<"system" | "light" | "dark">(
    getStorage("appTheme") || "system"
  );

  const [primaryColor, setPrimaryColor] = useState(getStorage('primaryColor') || '#1677ff');

  const [slideExpand, setSlideExpand] = useState<boolean>(true);

  setStorage("appTheme", appTheme);

  setStorage("primaryColor", primaryColor)
  
  const appThemePromise = useRef<(() => void) | null>(null);

  const orgSysTheme = useSyncExternalStore(subscribe, () => {
    if (appTheme === "system") {
      setRootTheme(getSysTheme());
    }
    return getSysTheme();
  })

  const changeAppTheme = (value: AppTheme) => {    
    setAppTheme(value);
    return new Promise<void>((resolve) => {
      appThemePromise.current = resolve;
    });
  }

  const isAnimate = useRef(false);

  const changeTheme = (e: any) => {            
      if (isAnimate.current) return;
      const sysTheme = getSysTheme();
      const value = e.target.value;      
      
      if (appTheme === "system" && value === sysTheme) {
        changeAppTheme(value);
        return;
      }
      if (value === "system") {
        if (sysTheme !== appTheme) {
          animatePage(e.nativeEvent, sysTheme, () => changeAppTheme(value), isAnimate);
        } else {
          changeAppTheme(value);
        }
        return;
      }
      animatePage(e.nativeEvent, e.target.value, changeAppTheme, isAnimate);
    }

    useEffect(() => {
      setRootTheme(appTheme === "system" ? getSysTheme() : appTheme);
      appThemePromise.current?.();
    }, [appTheme]);

  return (
    <ThemeContext.Provider
      children={children}
      value={{ appTheme, setAppTheme, slideExpand, setSlideExpand, primaryColor, setPrimaryColor, changeTheme, orgSysTheme }}
    />
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAppTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useAppTheme必须在ThemeProvider中使用");
  }
  return context;
};
