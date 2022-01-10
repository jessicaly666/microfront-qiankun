## 简介

qiankun 是基于 single-spa 的微前端库。特性：

- 技术栈无关
- html entry 接入方式
- JS 沙箱（确保微应用之间 全局变量/事件 不冲突）
- 样式隔离（确保微应用之间样式互相不干扰）
- 资源预加载（在浏览器空闲时间预加载未打开的微应用资源，加速微应用打开速度）

## 主应用

1.安装 qiankun

```js
yarn add qiankun
```

2.入口文件，注册子应用，并启动

```js
+ 注意： 建议换一个根名称，把root改成container
import { registerMicroApps, start } from 'qiankun';

registerMicroApps([
  {
    name: '500px',
    entry: '//localhost:3001',
    container: '#container',
    activeRule: '/500px'
  }
]);
start();
```

## 子应用

1.src 目录新增 public-path.js，用于修改运行时的 publicPath

```js
if (window.__POWERED_BY_QIANKUN__) {
  // eslint-disable-next-line no-undef
  __webpack_public_path__ = window.__INJECTED_PUBLIC_PATH_BY_QIANKUN__;
}
```

2.入口文件 index.js，引入 public-path.js，并导出生命周期函数

- 导入 public-path.js
- 导出生命周期函数

```js
import React from "react";
import ReactDOM from "react-dom";

import "./public-path";
import App from "./App";

/**
 * 渲染函数
 * 两种情况：主应用生命周期钩子中运行 / 微应用单独启动时运行
 */
function render() {
  ReactDOM.render(<App />, document.getElementById("root"));
}

// 独立运行时，直接挂载应用
if (!window.__POWERED_BY_QIANKUN__) {
  render();
}

/**
 * bootstrap 只会在微应用初始化的时候调用一次，下次微应用重新进入时会直接调用 mount 钩子，不会再重复触发 bootstrap。
 * 通常我们可以在这里做一些全局变量的初始化，比如不会在 unmount 阶段被销毁的应用级别的缓存等。
 */
export async function bootstrap() {
  console.log("ReactMicroApp bootstraped");
}

/**
 * 应用每次进入都会调用 mount 方法，通常我们在这里触发应用的渲染方法
 */
export async function mount(props) {
  console.log("ReactMicroApp mount", props);
  render(props);
}

/**
 * 应用每次 切出/卸载 会调用的方法，通常在这里我们会卸载微应用的应用实例
 */
export async function unmount() {
  console.log("ReactMicroApp unmount");
  ReactDOM.unmountComponentAtNode(document.getElementById("root"));
}
```

3.微应用路由设置 basename，保证和主应用注册的`activeRule`一致

- 先安装 react-router-dom

```js
// App.js
import { BrowserRouter as Router, Switch, Link, Route } from "react-router-dom";

const BASE_NAME = window.__POWERED_BY_QIANKUN__ ? "/500px" : "";

const Home = ({ match }) => {
  return <div>500px Home {match.params.id}</div>;
};

function App() {
  return (
    <Router basename={BASE_NAME}>
      <div>
        <Switch>
          <Route path="/" exact component={Home}></Route>
        </Switch>
      </div>
    </Router>
  );
}

export default App;
```

4.子应用打包配置，允许开发环境跨域和 umd 打包。

- 先安装 `yarn add react-app-rewired`

```js
// config-overrides.js
const path = require("path");

const custom_config = () => (config) => {
  // 微应用的包名，这里与主应用中注册的微应用名称一致
  config.output.library = `500px`;
  // 将你的 library 暴露为所有的模块定义下都可运行的方式
  config.output.libraryTarget = "umd";
  // 按需加载相关，设置为 webpackJsonp_VueMicroApp 即可
  config.output.chunkLoadingGlobal = `webpackJsonp_500px`; // webpack5
  // config.output.jsonpFunction = `webpackJsonp_500px`;  // webpack4

  config.resolve.alias = {
    ...config.resolve.alias,
    "@": path.resolve(__dirname, "src"),
  };
  return config;
};

module.exports = {
  webpack: override(custom_config()),
  devServer: function (configFunction) {
    return function (proxy, allowedHost) {
      const config = configFunction(
        {
          "/": {
            target: "http://photo-test-community.shijue.me",
            changeOrigin: true,
          },
        },
        allowedHost
      );
      // 关闭主机检查，使微应用可以被 fetch (webpack5不支持disableHostCheck)
      // config.disableHostCheck = true;
      // 配置跨域请求头，解决开发环境的跨域问题
      config.headers = {
        "Access-Control-Allow-Origin": "*",
      };
      // 配置 history 模式
      config.historyApiFallback = true;

      return config;
    };
  },
};
```
