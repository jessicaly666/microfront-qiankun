import { BrowserRouter as Router, Switch, Route } from "react-router-dom";

const BASE_NAME = window.__POWERED_BY_QIANKUN__ ? "/list/" : "/";
function List() {
  return (
    <div>
      首页
      <a href={`${BASE_NAME}search`}>点击跳到二级</a>
    </div>
  );
}
function Search() {
  return <div>二级页面</div>;
}
function App() {
  return (
    <Router basename={BASE_NAME}>
      <Switch>
        <Route path="/" exact component={List} />
        <Route path="/search" exact component={Search} />
      </Switch>
    </Router>
  );
}

export default App;
