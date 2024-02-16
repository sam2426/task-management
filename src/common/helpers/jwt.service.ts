import { Injectable } from '@nestjs/common';
import { verify, sign } from 'jsonwebtoken';

type tokenPayload = {
  id: number;
  email: string;
};

// msg: create an env variable for secret
const secret = process.env.jwtSecret;

@Injectable()
export class JwtService {
  async generateToken(payload: tokenPayload, type: 'UT' | 'PT'): Promise<string> {
    const tokenExpiryTime = type === 'UT' ? '1d' : '1m';
    return new Promise((resolve, reject) => {
      sign(
        payload,
        secret,
        {
          expiresIn: tokenExpiryTime,
          subject: type,
        },
        (err, encodedToken) => {
          if (err) reject(err);
          resolve(encodedToken);
        },
      );
    });
  }

  async verifyToken(tokenData: string): Promise<any> {
    return new Promise((resolve, reject) => {
      verify(tokenData, secret, (err, decoded) => {
        if (err) reject(err);
        resolve(decoded);
      });
    });
  }
}
