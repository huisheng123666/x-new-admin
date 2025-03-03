import {useEffect, useState} from "react";
import {useHttp} from "@/hooks/useHttp.ts";

const cacheDict: {
  [key: string]: { label: string, value: string }[];
} = {}

type DictMap<T extends string> = Record<T, Dict[]>

function useDict<T extends string>(keys: T[]) {
  const { httpGet } = useHttp()

  const defaultDicts: DictMap<T> = {} as DictMap<T>

  keys.forEach((k) => {
    defaultDicts[k] = []
  })

  const [dicts, setDicts] = useState<DictMap<T>>(defaultDicts)


  useEffect(() => {
    keys.forEach((key) => {
      if (cacheDict[key]) {
        setDicts(prevState => {
          return {
            ...prevState,
            [key]: cacheDict[key]
          }
        })
        return
      }
      httpGet<{ data: Dict[] }>(`/system/dict/data/type/${key as string}`).then((res) => {
        const ds = res.data.map((item: any) => ({
          label: item.dictLabel as string,
          value: item.dictValue as string,
          listClass: item.listClass
        }))
        cacheDict[key] = ds
        setDicts(prevState => {
          return {
            ...prevState,
            [key]: ds
          }
        })
      })
    })
    // eslint-disable-next-line
  }, []);

  return dicts
}

export default useDict
