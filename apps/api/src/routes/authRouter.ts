import { publisher } from "@repo/redis";
import { AddUserSchema, JOB_KINDS, QUEUES } from "@repo/types";
import { Router, type Request, type Response } from "express";
import type z from "zod";
import { pending } from "..";
import { prisma } from "../lib/prisma";
import type { loginSchema } from "../validators/authValidator";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const authRouter = Router();

authRouter.post("/login", async (req: Request, res: Response) => {
  const { email } = req.body as z.infer<typeof loginSchema>;

  const user = await prisma.user.findFirst({
    where: {
      email,
    },
  });

  if (!user) {
    return;
  }

  const token = crypto.randomBytes(40).toString("hex");
  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

  await prisma.magicToken.deleteMany({
    where: {
      userId: user.id,
    },
  });

  const createdToken = await prisma.magicToken.create({
    data: {
      hashedToken,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      userId: user.id,
    },
  });

  const link = `http://localhost:3000/api/v1/auth/login/post?token=${token}`;

  const emailResponse = await resend.emails.send({
    from: process.env.EMAIL_FROM as string,
    to: email,
    subject: "Sign in to your account",
    html: `<p>Click <a href="${link}">here</a> to sign in to your account</p>`,
  });

  console.log(emailResponse);

  return res.json({
    message: "Check your email for a sign-in link",
    link,
  });
});

authRouter.get("/login/post", async (req: Request, res: Response) => {
  const { token: rawToken } = req.query;
  if (!rawToken) {
    return;
  }

  const hashedToken = crypto
    .createHash("sha256")
    .update(rawToken as string)
    .digest("hex");
  const stored = await prisma.magicToken.findFirst({
    where: {
      hashedToken,
    },
  });

  if (!stored) {
    return res.status(401).json({ error: "Invalid or expired link" });
  }

  if (stored.used) {
    return res.status(401).json({ error: "This link has already been used" });
  }

  // expired
  if (stored.expiresAt < new Date()) {
    await prisma.magicToken.delete({ where: { id: stored.id } });
    return res
      .status(401)
      .json({ error: "This link has expired. Please request a new one." });
  }

  const user = await prisma.user.findFirst({
    where: {
      id: stored.userId,
    },
  });

  if (!user) {
    return res.status(401).json({ error: "User no exists" });
  }

  await prisma.magicToken.update({
    where: {
      id: stored.id,
    },
    data: {
      used: true,
    },
  });

  const sessionToken = jwt.sign(
    {
      userId: stored.userId,
    },
    process.env.JWT_SECRET as string,
    {
      expiresIn: "7d",
    },
  );

  res.cookie("sessionToken", sessionToken, {
    sameSite: "strict",
    httpOnly: true,
    secure: true,
    expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
  });

  const requestId = crypto.randomUUID();

  const promise = new Promise((resolve, reject) => {
    pending.set(requestId, resolve);
  });

  const payload: z.infer<typeof AddUserSchema> = {
    kind: JOB_KINDS.ADD_USER,
    requestId,
    payload: {
      id: user.id,
    },
  };

  // create user in memory
  await publisher.xAdd(QUEUES.SEND_STREAM, "*", {
    data: JSON.stringify(payload),
  });
  const response = await promise;

  res.redirect("http://localhost:3001/webtrading");
});

authRouter.post("/logout", (req: Request, res: Response) => {
  res.clearCookie("sessionToken", {
    sameSite: "strict",
    httpOnly: true,
    secure: true,
  });

  return res.json({ message: "Logged out" });
});

authRouter.post("/signup", async (req: Request, res: Response) => {
  const { email } = req.body as z.infer<typeof loginSchema>;

  const user = await prisma.user.findFirst({
    where: {
      email,
    },
  });

  if (user) {
    console.log("user already exists");
    return res.json({
      message: "User already exists",
    });
  }

  const newUser = await prisma.user.create({
    data: {
      email,
    },
  });

  const rawMagicToken = crypto.randomBytes(40).toHex();
  const hashedMagicToken = crypto.createHash(rawMagicToken).digest("hex");
  await prisma.magicToken.deleteMany({
    where: {
      userId: newUser.id,
    },
  });

  const token = await prisma.magicToken.create({
    data: {
      userId: newUser.id,
      hashedToken: hashedMagicToken,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    },
  });

  // send token via email to signin
  const link = `http://localhost:8080/api/v1/signin/post?:${token}`;

  res.json({ message: "Check your email for a sign-in link", link });
});

export default authRouter;
