import { Router } from "express";
import authRouter from "./authRouter";
import tradeRouter from "./tradeRouter";

const v1Router = Router();

v1Router.use("/auth", authRouter);

v1Router.use("/trade", tradeRouter);

export default v1Router;
