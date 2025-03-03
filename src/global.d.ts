interface Dict {
  label: string
  value: string
  listClass: string
}

interface Pagination {
  pageNum: number
  pageSize: number
}

interface Menu {
  menuId: number
  parentId: number
  menuType: 'M' | 'C' | 'F'
  menuName: string
  icon?: string
  orderNum: number
  path?: string
  perms?: string
  visible: string
  status: string
  children: Menu[] | null
}

interface User {
  admin: boolean
  userId: number
  userName: string
  deptId: number
  dept: {
    deptName: string
  }
  phonenumber: string
  email: string
  sex: string
  status: string
  postIds: number[] | null
  roleIds: number[] | null
}


interface Role {
  roleId: number
  roleName: string
  roleKey: string
  roleSort: number
  status: string
  remark: string
  admin: boolean
}

interface Dept {
  deptId: number
  parentId: number
  deptName: string
  leader: string
  orderNum: number
  status: string
  email: string
  phone: string
  createTime: string
  children: Dept[] | null
}

interface Dict {
  dictId: number
  dictName: string
  dictType: string
  remark: string
  status: string
  createTime: string
  createBy: string
}


interface DictData {
  dictCode: number
  dictValue: string
  dictLabel: string
  dictSort: number
  listClass: string
  status: string
  remark: string
  createBy: string
  createTime: string
}

interface Post {
  postId: number
  postName: string
  postCode: string
  createTime: string
  postSort: number
  status: string
  remark: string
}

interface SysConfig {
  configId: number
  configKey: string
  configName: string
  configType: string
  configValue: string
  createTime: string
  remark: string
}

interface SysNotice {
  noticeId: number
  noticeTitle: string
  noticeType: string
  status: string
  noticeContent: string
  createBy: string
}

interface OperationLog {
  operId: number
  title: string
  businessType: string
  operName: string
  operIp: string
  operLocation: string
  status: string
  operTime: string
  costTime: string
}


interface LoginLog {
  infoId: number
  userName: string
  ipaddr: string
  loginLocation: string
  browser: string
  os: string
  status: string
  msg: string
  loginTime: string
}

interface CodeGen {
  tableId: number
  tableName: string
  tableComment: string
  className: string
  createTime: string
  updateTime: string
  businessName: string
}

interface FieldInfo {
  columnName: string
  columnComment: string
  columnType: string
  javaType: string
  javaField: string
  isInsert: string
  isEdit: string
  isList: string
  isQuery: string
  queryType: string
  isRequired: string
  htmlType: string
  dictType: string
}
