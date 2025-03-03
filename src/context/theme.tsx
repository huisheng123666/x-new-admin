import { getStorage, setStorage } from "@/common/utils";
import { createContext, FC, ReactNode, useContext, useState } from "react";

export type AppTheme = "system" | "light" | "dark";

const ThemeContext = createContext<
  | {
      appTheme: AppTheme;
      setAppTheme: (theme: AppTheme) => void;
      slideExpand: boolean;
      setSlideExpand: (expand: boolean) => void;
    }
  | undefined
>(undefined);

ThemeContext.displayName = "ThemeContext";

export const ThemeProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [appTheme, setAppTheme] = useState<"system" | "light" | "dark">(
    getStorage("appTheme") || "system"
  );

  const [slideExpand, setSlideExpand] = useState<boolean>(true);

  setStorage("appTheme", appTheme);

  return (
    <ThemeContext.Provider
      children={children}
      value={{ appTheme, setAppTheme, slideExpand, setSlideExpand }}
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
