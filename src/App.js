import './App.css';
import React from 'react';
import ImageLabelingApp from './ImageLabelingApp';
import { PlusSquareOutlined, FolderOutlined,StarOutlined } from '@ant-design/icons';
import { Layout, Menu, theme, Typography } from 'antd';

const { Header, Content, Footer, Sider } = Layout;
const { Title } = Typography;

const items = [
  { key: '1', icon: <PlusSquareOutlined /> , label: 'Create Project' },
  { key: '2', icon: <FolderOutlined />, label: 'Projects' },
];

const App = () => {
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  return (
    <div>
      <Header style = {{padding:10}}>
          <Title style={{ color: 'white' }} level={9}>
            <StarOutlined /> ImageLabeling
          </Title>
        </Header>
      <Layout>
      <Sider
        style={{ height: '1000px', overflow: 'auto' }}
        breakpoint="lg"
        collapsedWidth="0"
        onBreakpoint={(broken) => {
          console.log(broken);
        }}
        onCollapse={(collapsed, type) => {
          console.log(collapsed, type);
        }}
      >
        <Header style = {{padding:50}}>
          <Title style={{ color: 'white' }} level={5}>
              Dashboard
          </Title>
        </Header>
        <div className="demo-logo-vertical" />
        <Menu
          theme="dark"
          mode="inline"
          defaultSelectedKeys={['4']}
          items={items}
        />
      </Sider>
      <Layout>
        <Header
          style={{
            padding: 0,
            background: colorBgContainer,
          }}
        />
        <Content
          style={{
            margin: '24px 16px 0',
          }}
        >
          <div
            style={{
              padding: 24,
              minHeight: 720,
              background: colorBgContainer,
              borderRadius: borderRadiusLG,
            }}
          >
            <ImageLabelingApp/>
          </div>
        </Content>
        <Footer
          style={{
            textAlign: 'center',
          }}
        >
          Ant Design ©{new Date().getFullYear()} Created by Ant UED
        </Footer>
      </Layout>
    </Layout>
    </div>
    
  );
};

export default App;

