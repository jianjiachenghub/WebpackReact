import React from "react";
import "./app.less";
import background from "../image/vscode.png";
import vis from "../image/可视化.png";
import video from "../video/110.mp4";

console.log(background);
const sun = (x,y)=>x+y;
class A {
    constructor(){
      this.name = 1
    }
}

function App() {
  console.log(123)
  return (
    <div className="app">
      <h1 className="text">Hello Webpack<i className="iconfont">&#xe69b;</i></h1>
      <img className="background" src={background} alt=""/>
      <img src={vis} alt=""/>
      <video src={video} controls="controls">
您的浏览器不支持 video 标签。
</video>
    </div>
  );
}

export default App;
