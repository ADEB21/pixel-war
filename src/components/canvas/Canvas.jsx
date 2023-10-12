import React from "react";
import "./canvas.scss";

const Canvas = ({ width, height }) => {
  React.useEffect(() => {}, []);

  return <canvas id="canvas" width={width} height={height}></canvas>;
};

export default Canvas;
