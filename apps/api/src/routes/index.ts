import { Router } from "express";
import authRouter from "./authRouter";
import tradeRouter from "./tradeRouter";
import { authMiddleware } from "../middlewares/authMiddleware";
import chartRouter from "./chartRouter";

const v1Router = Router();

v1Router.use("/auth", authRouter);

v1Router.use("/trade", authMiddleware, tradeRouter);

v1Router.use("/chart", chartRouter);

export default v1Router;
