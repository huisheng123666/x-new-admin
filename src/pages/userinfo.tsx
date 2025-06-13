import {FC, useCallback, useState} from "react";
import {App, Button, Card, Col, Descriptions, Form, Input, Radio, Row} from "antd";
import userinfoCover from '@/assets/img/userinfo-cover.jpg'
import defaultAvatar from '@/assets/img/avatar.jpg'
import {useUser} from "@/context/user.tsx";
import {useHttp} from "@/hooks/useHttp.ts";
import http from "@/common/utils/http.ts";
import useDict from "@/hooks/useDIct.ts";

const Userinfo: FC = () => {
  const { message } = App.useApp()

  const { userinfo, setUserinfo } = useUser()

  const { sys_user_sex } = useDict(['sys_user_sex'])

  const { httpPut, loading } = useHttp(false)

  const [avatarLoading, setAvatarLoading] = useState(false)

  const changeAvatar = useCallback(() => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    input.addEventListener('change', () => {
      const file = input.files ? input.files[0] : null
      if (!file) return
      const formData = new FormData()
      formData.append('avatarfile', file)
      setAvatarLoading(true)
      http.post<null, { imgUrl: string }>('/system/user/profile/avatar', formData)
        .then((res) => {
          setUserinfo(prevState => {
            return {
              ...prevState,
              avatar: res.imgUrl
            }
          })
        })
        .finally(() => {
          setAvatarLoading(false)
        })
    })
    input.click()
  }, [setUserinfo])

  const changeBasic = useCallback((values: any) => {
    httpPut('/system/user/profile', {
      ...values
    })
      .then(() => {
        setUserinfo(prevState => {
          return {
            ...prevState,
            ...values
          }
        })
        message.success("修改成功")
      })
  }, [httpPut, setUserinfo])

  const changePassword = useCallback((values: any) => {
    const data = {
      ...values
    }
    delete data.rawPassword
    httpPut('/system/user/profile/updatePwd', data)
      .then(() => {
        message.success("修改成功")
      })
  }, [httpPut])

  // @ts-ignore
  return <div className="userinfo">
    <Card
      hoverable
      cover={<img alt="example" src={userinfoCover} />}
      loading={avatarLoading}
    >
      <img src={userinfo?.avatar || defaultAvatar} alt="" onClick={changeAvatar} className="avatar"/>

      <Descriptions column={1}>
        <Descriptions.Item label="用户账号">{userinfo?.userName}</Descriptions.Item>
        <Descriptions.Item label="手机号码">{userinfo?.phonenumber}</Descriptions.Item>
        <Descriptions.Item label="用户邮箱">{userinfo?.email}</Descriptions.Item>
        <Descriptions.Item label="所属部门">{userinfo?.dept.deptName}</Descriptions.Item>
        <Descriptions.Item label="所属角色">{userinfo?.roles?.map(item => item.roleName).join(',')}</Descriptions.Item>
        <Descriptions.Item label="创建日期">{userinfo?.createTime}</Descriptions.Item>
      </Descriptions>
    </Card>

    <div>
      <Card title={<h6>基本设置</h6>} hoverable>
        <Form labelCol={{ span: 3 }} onFinish={changeBasic}>
          <Form.Item
            label="用户昵称"
            name="nickName"
            rules={[{ required: true, message: '请输入用户昵称' }]}
            initialValue={userinfo?.nickName}
          >
            <Input/>
          </Form.Item>
          <Form.Item
            label="手机号码"
            name="phonenumber"
            rules={[
              { required: true, message: '请输入手机号码' },
              { pattern: /^[1][0-9]{10}$/, message: '请输入正确的手机号' }
            ]}
            initialValue={userinfo?.phonenumber}
          >
            <Input/>
          </Form.Item>
          <Form.Item
            label="邮箱"
            name="email"
            rules={[
              { required: true, message: '请输入邮箱' },
              { type: 'email' },
            ]}
            initialValue={userinfo?.email}
          >
            <Input/>
          </Form.Item>
          <Form.Item label="性别" name="sex" initialValue={userinfo?.sex}>
            <Radio.Group
              options={sys_user_sex}
            />
          </Form.Item>
          <Row>
            <Col span={3}>
            </Col>
            <Col span={3}>
              <Button loading={loading} block htmlType="submit" type="primary">提交</Button>
            </Col>
          </Row>
        </Form>
      </Card>

      <Card title={<h6>更改密码</h6>} style={{marginTop: '20px' }} hoverable>
        <Form labelCol={{ span: 3 }} onFinish={changePassword}>
          <Form.Item
            label="旧密码"
            name="oldPassword"
            rules={[
              { required: true, message: '请输入旧密码' },
            ]}
          >
            <Input/>
          </Form.Item>
          <Form.Item
            label="新密码"
            name="newPassword"
            rules={[
              { required: true, message: '请输入新密码' },
            ]}
          >
            <Input/>
          </Form.Item>
          <Form.Item
            label="确认密码"
            name="rawPassword"
            rules={[
              { required: true, message: '请输入确认密码' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (getFieldValue('newPassword') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('两次输入的密码不一致'));
                },
              }),
            ]}
          >
            <Input/>
          </Form.Item>
          <Row>
            <Col span={3}>
            </Col>
            <Col span={3}>
              <Button loading={loading} block htmlType="submit" type="primary">提交</Button>
            </Col>
          </Row>
        </Form>
      </Card>
    </div>
  </div>
}

export default Userinfo
