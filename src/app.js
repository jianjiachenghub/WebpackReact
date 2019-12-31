import React from "react";
import "./app.less";
import background from "../image/vscode.png";
console.log(background);

function App() {
  console.log(123)
  return (
    <div className="app">
      <h1 className="text">Hello Webpack<i className="iconfont">&#xe69b;</i></h1>
      <img className="background" src={background} alt=""/>
    </div>
  );
}

export default App;
