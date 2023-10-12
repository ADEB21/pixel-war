import React from "react";
import "./palette.scss";

const Palette = ({ currentColor, setColor }) => {
  const colors = [
    "black",
    "lightcoral",
    "lightblue",
    "lightgreen",
    "brown",
    "purple",
    "pink",
  ];

  return (
    <div className="color_palette">
      {colors.map((color, index) => {
        return (
          <span
            key={index}
            style={{ backgroundColor: color }}
            className={currentColor === color ? "active" : ""}
            onClick={() => setColor(color)}
          ></span>
        );
      })}
      {/* <span
        className={currentColor === "lightcoral"}
        onClick={() => setColor("lightcoral")}
      ></span>
      <span
        className={currentColor === "lightblue"}
        onClick={() => setColor("lightblue")}
      ></span>
      <span
        className={currentColor === "lightgreen"}
        onClick={() => setColor("lightgreen")}
      ></span>
      <span
        className={currentColor === "brown"}
        onClick={() => setColor("brown")}
      ></span>
      <span
        className={currentColor === "purple"}
        onClick={() => setColor("purple")}
      ></span>
      <span
        className={currentColor === "pink"}
        onClick={() => setColor("pink")}
      ></span> */}
    </div>
  );
};

export default Palette;
