import express from "express";
import cors from "cors";
import { listenForResponse } from "./validators/worker.ts";
import v1Router from "./routes/index.ts";
import cookieParser from "cookie-parser";
import type { PendingRequest } from "@repo/types";

const app = express();

// `origin: "*"` breaks the browser when the web app uses `credentials: "include"`.
app.use(
  cors({
    credentials: true,
    origin: ["http://localhost:3001"],
  }),
);
app.use(express.json());
app.use(cookieParser());

export const pending = new Map<string, PendingRequest>();

app.use("/api/v1", v1Router);

app.listen(3000, () => {
  console.log("app listening on 3000");
});

listenForResponse();
