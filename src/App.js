import React from "react";
import "./App.scss";
import Canvas from "./components/canvas/Canvas";
import Palette from "./components/palette/Palette";

import { initializeApp } from "firebase/app";
import { getDatabase, ref, set, child, get } from "firebase/database";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDHFb2bIg_8NeW7OO8glBX56Q30fzM2kj0",
  authDomain: "pixel-w.firebaseapp.com",
  projectId: "pixel-w",
  storageBucket: "pixel-w.appspot.com",
  messagingSenderId: "340006363641",
  appId: "1:340006363641:web:e696d2b7cc32040d6a1d28",
  databaseURL: "https://pixel-w-default-rtdb.firebaseio.com/",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

function App() {
  const [data, setData] = React.useState(null);
  const [color, setColor] = React.useState("black");
  const [pixels, setPixels] = React.useState([]);
  const gridCellSize = 10;

  React.useEffect(() => {
    fetch("/api")
      .then((res) => res.json())
      .then((data) => setData(data.message));

    const canvas = document.querySelector("#canvas");
    const cursor = document.querySelector("#cursor");

    canvas.addEventListener("mousemove", (e) => {
      const cursorLeft = e.clientX - cursor.offsetWidth / 2;
      const cursorTop = e.clientY - cursor.offsetHeight / 2;

      cursor.style.left =
        Math.floor(cursorLeft / gridCellSize) * gridCellSize + "px";
      cursor.style.top =
        Math.floor(cursorTop / gridCellSize) * gridCellSize + "px";
    });
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
        } else {
          console.log("No data available");
        }
      })
      .catch((error) => {
        console.error(error);
      });
  });

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
    const x = cursor.offsetLeft - rect.left;
    const y = cursor.offsetTop - rect.top;
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
    const ws = new WebSocket("ws://localhost:8080");
    cursor.addEventListener("click", (e) => {
      drawPixel(ctx);
      // if (ws.readyState === WebSocket.OPEN) {
      //   ws.send(JSON.stringify(data));
      // }
    });
    canvas.addEventListener("click", (e) => {
      drawPixel(ctx);
      // if (ws.readyState === WebSocket.OPEN) {
      //   ws.send(JSON.stringify(data));
      // }
    });

    // ws.onmessage = (event) => {
    //   const { action, data } = JSON.parse(event.data);
    //   if (action === "draw") {
    //     ctx.fillStyle = data.color;
    //     ctx.fillRect(data.x, data.y, gridCellSize, gridCellSize);
    //   }
    // };

    console.log("mes pixels", pixels);
    pixels.forEach((pixel) => {
      console.log(pixel);
      createPixel(ctx, pixel.color, pixel.x, pixel.y);
    });
  }, [color, pixels]);

  return (
    <div className="App">
      <p className="title">{!data ? "Loading..." : data}</p>
      <div id="cursor"></div>
      <Canvas width={800} height={500} />
      <Palette currentColor={color} setColor={setColor} />
    </div>
  );
}

export default App;
