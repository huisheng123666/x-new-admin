import { FC, useCallback, useEffect, useState } from "react";
import styles from "./login.module.scss";
import { Typography, Space, Radio, Form, Input, Button } from "antd";
import { HourglassFilled, MoonFilled, SunFilled } from "@ant-design/icons";
import { useAppTheme } from "@/context/theme";
import { useHttp } from "@/hooks/useHttp";
import { setStorage } from "@/common/utils";

// import Cookies from "js-cookie"
// import { encrypt, decrypt } from '@/common/utils/encrypt.ts'

const Login: FC = () => {
  const { setAppTheme, appTheme } = useAppTheme();

  const [uuid, setUuid] = useState("");
  const [codeImg, setCodeImg] = useState("");

  const { httpGet, loading, httpPost } = useHttp();

  const getCodeImg = useCallback(() => {
    httpGet("/captchaImage").then((data: any) => {
      setUuid(data.uuid);
      setCodeImg("data:image/gif;base64," + data.img);
    });
  }, [httpGet]);

  useEffect(() => {
    getCodeImg();
  }, [getCodeImg]);

  const [form] = Form.useForm();

  const onFinish = useCallback(
    (values: any) => {
      httpPost("/login", {
        ...values,
        uuid,
      })
        .then((data: any) => {
          setStorage("token", data.token);
          // Cookies.set("Admin-Token", data.token)
          location.replace("/");
        })
        .catch(() => {
          getCodeImg();
        });
    },
    [uuid, httpPost, getCodeImg]
  );

  return (
    <div className={styles.login}>
      <div className="left">
        <h1>X-Admin</h1>
        <Space direction="vertical" align="center">
          <Typography.Title level={3}>
            开箱即用的大型中后台管理系统
          </Typography.Title>
          <Typography.Text type="secondary">
            工程化、高性能、跨组件库的前端模版
          </Typography.Text>
        </Space>
      </div>
      <div className="right">
        <div className="theme">
          <Radio.Group
            value={appTheme}
            onChange={(e) => setAppTheme(e.target.value)}
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
        </div>
        <Typography.Title level={4}>欢迎回来</Typography.Title>
        <Typography.Text type="secondary" style={{ marginBottom: 24 }}>
          请输入您的帐户信息以开始管理您的项目
        </Typography.Text>
        <Form layout="vertical" size="large" form={form} onFinish={onFinish}>
          <Form.Item
            name="username"
            label="用户名"
            rules={[{ required: true, message: "请输入用户名" }]}
            initialValue="admin"
          >
            <Input placeholder="请输入用户名" />
          </Form.Item>
          <Form.Item
            name="password"
            label="密码"
            rules={[{ required: true, message: "请输入密码" }]}
            initialValue="admin123"
          >
            <Input placeholder="请输入密码" type="password" />
          </Form.Item>
          <Form.Item
            name="code"
            label="验证码"
            rules={[{ required: true, message: "请输入验证码" }]}
          >
            <Input
              placeholder="请输入验证码"
              style={{ overflow: "hidden" }}
              addonAfter={
                <img
                  className="code-img"
                  src={codeImg}
                  alt="验证码"
                  onClick={getCodeImg}
                />
              }
            />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block loading={loading}>
              登录
            </Button>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
};

export default Login;
