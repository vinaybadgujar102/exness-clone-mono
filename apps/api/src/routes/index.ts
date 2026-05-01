import { Router } from "express";
import authRouter from "./authRouter";
import tradeRouter from "./tradeRouter";
import { authMiddleware } from "../middlewares/authMiddleware";

const v1Router = Router();

v1Router.use("/auth", authRouter);

v1Router.use("/trade", authMiddleware, tradeRouter);

export default v1Router;
