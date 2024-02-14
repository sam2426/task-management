import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { JwtService } from './jwt.service';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(private readonly jwt: JwtService) {}
  async use(req: Request, res: Response, next: NextFunction) {
    if (req.headers['x-access-token']) {
      const token = <string>req.headers['x-access-token'];
      try {
        const tokenData = await this.jwt.verifyToken(token);
        res.locals.tokenData = tokenData;
      } catch (error) {
        res.status(401).send({ success: false, message: 'Failed to authenticate token' });
      }
      next();
    } else {
      res.status(401).json({
        success: false,
        message: 'Please pass Auth token.',
      });
    }
  }
}
