import express, { Application, Router, Request, Response, NextFunction } from "express";

// Middleware to set the greeting message
export const setGreetingMessage = (req: Request, res: Response, next: NextFunction) => {
  res.locals.version = '1.0';
  res.locals.greetingMessage = 'Welcome to freight API';
  next();
};

