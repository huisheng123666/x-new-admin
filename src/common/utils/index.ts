import { AppTheme } from "@/context/theme";
import { Dayjs } from "dayjs";
import { MutableRefObject } from "react";

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function setStorage(
  key: string,
  value: string | Record<string, any> | any[]
) {
  if (typeof value !== "string") {
    localStorage.setItem(key, JSON.stringify(value));
    return;
  }
  localStorage.setItem(key, value);
}

export function getStorage(key: string) {
  const value = localStorage.getItem(key);
  if (value?.indexOf("{") === 0 || value?.indexOf("[") === 0) {
    return JSON.parse(value);
  }
  return value;
}

export function animatePage(
  elInfo: any,
  theme: "dark" | "light",
  readyCallback: (theme: AppTheme) => void,
  isAnimate: MutableRefObject<boolean>
) {
  if (!document.startViewTransition) {
    document.documentElement.setAttribute("theme", theme);
    readyCallback(theme);
    return
  }
  const transition = document.startViewTransition(async () => {
    isAnimate.current = true;
    // update DOM status
    readyCallback(theme);
    document.documentElement.setAttribute("theme", theme);
    await sleep(1);
  });

  // 等待伪元素创建完成：
  transition.ready.then(() => {
    const { clientX, clientY } = elInfo;
    // 计算半径
    const radius = Math.hypot(
      Math.max(clientX, window.innerWidth - clientX),
      Math.max(clientY, window.innerHeight - clientY)
    );
    // 剪切路径
    const clipPath = [
      `circle(0% at ${clientX}px ${clientY}px)`,
      `circle(${radius}px at ${clientX}px ${clientY}px)`,
    ];

    document.documentElement.animate(
      {
        clipPath: theme === "light" ? clipPath.reverse() : clipPath,
      },
      {
        duration: 600,
        easing: "cubic-bezier(0.215, 0.61, 0.355, 1)",
        pseudoElement:
          theme === "light"
            ? "::view-transition-old(root)"
            : "::view-transition-new(root)",
      }
    );
  });

  transition.finished.finally(() => {
    isAnimate.current = false;
  });
}

export function formatDateRange(value?: [Dayjs, Dayjs]) {
  if (!value) return {};
  const params = {
    beginTime: value[0].format("YYYY-MM-DD"),
    endTime: value[1].format("YYYY-MM-DD"),
  };
  return {
    params,
  };
}

export function genTree(
  nodes: any[],
  parentId = 0,
  res: any[] = [],
  pidMap: Record<string, boolean> = {},
  fieldNames: { id: string; pid: string } = { id: "id", pid: "parentId" }
) {
  if (!Object.keys(pidMap).length) {
    nodes.forEach((item) => (pidMap[item[fieldNames.id]] = true));
  }
  const pidKey = fieldNames.pid;
  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i];
    if (node[pidKey] === parentId || !pidMap[node[pidKey]]) {
      res.push(node);
      nodes.splice(i, 1);
      i--;
    }
  }
  res.forEach((par) => {
    const children = genTree(nodes, par[fieldNames.id], [], pidMap, fieldNames);
    par.children = children.length ? children : null;
  });
  return res;
}

export function tansParams(params: Record<string, any>) {
  let result = "";
  for (const propName of Object.keys(params)) {
    const value = params[propName];
    const part = encodeURIComponent(propName) + "=";
    if (value !== null && value !== "" && typeof value !== "undefined") {
      if (typeof value === "object") {
        for (const key of Object.keys(value)) {
          if (
            value[key] !== null &&
            value[key] !== "" &&
            typeof value[key] !== "undefined"
          ) {
            const params = propName + "[" + key + "]";
            const subPart = encodeURIComponent(params) + "=";
            result += subPart + encodeURIComponent(value[key]) + "&";
          }
        }
      } else {
        result += part + encodeURIComponent(value) + "&";
      }
    }
  }
  return result;
}
