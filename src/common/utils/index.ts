import {Dayjs} from "dayjs";

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

export function animatePage() {
  const transition = document.startViewTransition(() => {
    // update DOM status
  });

  // 等待伪元素创建完成：
  transition.ready.then(() => {
    // 新视图的根元素动画
    const width = window.innerWidth;
    const height = window.innerHeight;
    const buffer = width * 0.1;
    document.documentElement.animate(
      {
        clipPath: [
          `path('M ${-width} 0 L 0,0 L ${-buffer},${height} L ${
            -width - buffer * 2
          },${height}')`,
          `path('M 0 0 L ${
            width + buffer
          },0 L ${width},${height} L ${-buffer},${height}')`,
        ],
      },
      {
        duration: 500,
        easing: "linear",
        pseudoElement: "::view-transition-new(root)",
      }
    );
  });
}

export function formatDateRange(value?: [Dayjs, Dayjs]) {
  if (!value) return {}
  const params = {
    beginTime: value[0].format('YYYY-MM-DD'),
    endTime: value[1].format('YYYY-MM-DD')
  }
  return {
    params
  }
}

export function genTree(nodes: any[], parentId = 0, res: any[] = [], pidMap: Record<string, boolean> = {}, fieldNames: { id: string, pid: string } = { id: 'id', pid: 'parentId' }) {
  if (!Object.keys(pidMap).length) {
    nodes.forEach(item => pidMap[item[fieldNames.id]] = true)
  }
  const pidKey = fieldNames.pid
  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i];
    if (node[pidKey] === parentId || !pidMap[node[pidKey]]) {
      res.push(node)
      nodes.splice(i, 1)
      i--
    }
  }
  res.forEach(par => {
    const children = genTree(nodes, par[fieldNames.id], [], pidMap, fieldNames)
    par.children = children.length ? children : null
  })
  return res
}


export function tansParams(params: Record<string, any>) {
  let result = ''
  for (const propName of Object.keys(params)) {
    const value = params[propName];
    const part = encodeURIComponent(propName) + "=";
    if (value !== null && value !== "" && typeof (value) !== "undefined") {
      if (typeof value === 'object') {
        for (const key of Object.keys(value)) {
          if (value[key] !== null && value[key] !== "" && typeof (value[key]) !== 'undefined') {
            const params = propName + '[' + key + ']';
            const subPart = encodeURIComponent(params) + "=";
            result += subPart + encodeURIComponent(value[key]) + "&";
          }
        }
      } else {
        result += part + encodeURIComponent(value) + "&";
      }
    }
  }
  return result
}
