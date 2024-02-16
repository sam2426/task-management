import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { JwtService } from './jwt.service';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(private readonly jwt: JwtService) {}
  async use(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers['authorization'] ?? (req.headers['bearerauth'] as string);
    if (!authHeader) {
      return res.status(401).json({ success: false, message: 'Unauthorized - No Bearer token provided' });
    }

    // Checking if the Authorization header starts with "Bearer "
    const [bearer, token] = authHeader.split(' ');

    if (bearer !== 'Bearer' || !token) {
      // If the Authorization header format is not as expected.
      return res.status(401).json({ success: false, message: 'Unauthorized - Invalid Bearer token format' });
    }
    try {
      const tokenData = await this.jwt.verifyToken(token);
      res.locals.tokenData = tokenData;
      if (
        !(
          (req.baseUrl === '/user/update-password' && tokenData.sub === 'PT') ||
          (req.baseUrl !== '/user/update-password' && tokenData.sub === 'UT')
        )
      ) {
        throw new Error('Invalid token type');
      }
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
