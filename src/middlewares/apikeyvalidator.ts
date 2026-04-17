// apikeyMiddleware.js

import { NextFunction, Request, Response } from "express";

const API_KEY = "123@edgeofwaresports.com";  // Replace this with your actual API key

// Middleware function to check API key
function validateapikey(req: Request, res: Response, next: NextFunction) {
  const apiKey = req.headers['apikey'];

  if (!apiKey) {
    return res.status(400).json({ success: false, error: 'API key is missing' });
  }

  if (apiKey !== API_KEY) {
    return res.status(403).json({ success: false, error: 'Forbidden: Invalid API key' });
  }

  next();  // If the key is valid, pass control to the next middleware/route handler
}

export default validateapikey;
