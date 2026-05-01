import express from "express";
import cors from "cors";
import { listenForResponse } from "./validators/worker.ts";
import v1Router from "./routes/index.ts";

const app = express();

// `origin: "*"` breaks the browser when the web app uses `credentials: "include"`.
app.use(
  cors({
    credentials: true,
    origin: ["http://localhost:3001"],
  }),
);
app.use(express.json());

export const pending = new Map();

app.use("/api/v1", v1Router);

app.listen(3000, () => {
  console.log("app listening on 3000");
});

listenForResponse();
