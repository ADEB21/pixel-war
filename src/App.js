import React from "react";
import "./App.scss";
import Canvas from "./components/canvas/Canvas";
import Palette from "./components/palette/Palette";

import { initializeApp } from "firebase/app";
import { getDatabase, ref, set, child, get } from "firebase/database";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_APIKEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTHDOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECTID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGEBUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGINGSENDERID,
  appId: process.env.REACT_APP_FIREBASE_APPID,
  databaseURL: process.env.REACT_APP_FIREBASE_DATABASEURL,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

function App() {
  const [data, setData] = React.useState(null);
  const [color, setColor] = React.useState("black");
  const [pixels, setPixels] = React.useState([]);
  const gridCellSize = 10;

  const getExistingPixels = (ctx) => {
    const childObjects = [];
    const dbRef = ref(getDatabase());
    get(child(dbRef, `pixels/`))
      .then((snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.val();
          for (const key in data) {
            if (data.hasOwnProperty(key)) {
              childObjects.push(data[key]);
            }
          }
          setPixels(childObjects);
          setPixels((value) => {
            value.forEach((pixel) => {
              createPixel(ctx, pixel.color, pixel.x, pixel.y);
            });
            return value;
          });
        }
      })
      .catch((error) => {
        console.error(error);
      });
  };

  const drawGrid = (ctx, width, height, cellWidth, cellHeight) => {
    ctx.beginPath();
    ctx.strokeStyle = "#ccc";

    for (let i = 0; i < width; i++) {
      ctx.moveTo(i * cellWidth, 0);
      ctx.lineTo(i * cellWidth, height);
    }
    for (let i = 0; i < height; i++) {
      ctx.moveTo(0, i * cellHeight);
      ctx.lineTo(width, i * cellHeight);
    }
    ctx.stroke();
  };

  const createPixel = (ctx, color, x, y) => {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, gridCellSize, gridCellSize);
  };

  const drawPixel = (ctx) => {
    const cursor = document.querySelector("#cursor");
    const canvas = document.querySelector("#canvas");
    const rect = canvas.getBoundingClientRect();
    const x = Math.round(cursor.offsetLeft - rect.left);
    const y = Math.round(cursor.offsetTop - rect.top);
    const id = `${x},${y}`;
    const data = { action: "draw", id, x, y, color: color };
    createPixel(ctx, data.color, data.x, data.y);
    const pixels = {
      x,
      y,
      color,
    };
    const db = getDatabase();
    set(
      ref(db, `pixels/${pixels.x}-${pixels.y}`),
      {
        x,
        y,
        color,
      },
      { merge: true }
    );
  };

  React.useEffect(() => {
    const cursor = document.querySelector("#cursor");
    const canvas = document.querySelector("#canvas");
    const ctx = canvas.getContext("2d");
    const gridCtx = canvas.getContext("2d");
    drawGrid(gridCtx, canvas.width, canvas.height, gridCellSize, gridCellSize);
    cursor.addEventListener("click", (e) => {
      drawPixel(ctx);
    });
    canvas.addEventListener("click", (e) => {
      drawPixel(ctx);
    });
    canvas.addEventListener("mousemove", (e) => {
      const cursorLeft = e.clientX - cursor.offsetWidth / 2;
      const cursorTop = e.clientY - cursor.offsetHeight / 2;

      cursor.style.left =
        Math.floor(cursorLeft / gridCellSize) * gridCellSize + "px";
      cursor.style.top =
        Math.floor(cursorTop / gridCellSize) * gridCellSize + "px";
    });
    getExistingPixels(ctx);
  }, [color, pixels]);

  return (
    <div className="App">
      <div id="cursor"></div>
      <Canvas width={800} height={500} />
      <Palette currentColor={color} setColor={setColor} />
    </div>
  );
}

export default App;
