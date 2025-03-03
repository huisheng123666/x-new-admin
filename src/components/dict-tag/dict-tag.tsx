import {FC, useMemo} from "react";
import {Tag} from "antd";

const DictTag: FC<{ options: Dict[], value: string }> = ({ options, value }) => {
  const item = useMemo(() => {
    return options.find(item => item.value === value)
  }, [options, value])

  return <Tag color={item?.listClass || 'default'}>{item?.label}</Tag>
}

export default DictTag
