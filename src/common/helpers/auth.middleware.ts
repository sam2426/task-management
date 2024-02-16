import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { JwtService } from './jwt.service';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(private readonly jwt: JwtService) {}
  async use(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers['authorization'] ?? (req.headers['bearerAuth'] as string);
    if (!authHeader) {
      return res.status(401).json({ success: false, message: 'Unauthorized - No Bearer token provided' });
    }

    // Checking if the Authorization header starts with "Bearer "
    const [bearer, token] = authHeader.split(' ');

    if (bearer !== 'Bearer' || !token) {
      // If the Authorization header format is not as expected.
      return res.status(401).json({ success: false, message: 'Unauthorized - Invalid Bearer token format' });
    }
    // Check here if the PT token is used for change password.
    try {
      const tokenData = await this.jwt.verifyToken(token);
      res.locals.tokenData = tokenData;
    } catch (error) {
      let message = 'Unauthorized - Failed to authenticate token';
      if (error instanceof Error && ['TokenExpiredError'].includes(error.name)) {
        message = 'Token Expired.';
      }
      return res.status(401).send({ success: false, message });
    }
    next();
  }
}
