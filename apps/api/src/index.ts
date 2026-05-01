import express from "express";
import cors from "cors";
import { listenForResponse } from "./validators.ts/worker.ts";
import v1Router from "./routes/index.ts";

const app = express();
app.use(cors());
app.use(express.json());

export const pending = new Map();

app.use("/api/v1", v1Router);

app.listen(3000, () => {
  console.log("app listening on 3000");
});

listenForResponse();
