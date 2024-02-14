import { Injectable } from '@nestjs/common';
import { genSalt, hash } from 'bcrypt';

type hashedPassword = {
  salt: string;
  passwordHash: string;
};

@Injectable()
export class CryptoService {
  async generateHash(password: string): Promise<hashedPassword> {
    try {
      const salt = await genSalt(10);
      const passwordHash = await hash(password, salt);
      return { passwordHash, salt };
    } catch (error) {
      throw new Error('Password hashing failed.');
    }
  }

  async checkPassword(inputPassword: string, storedHash: string, storedSalt: string): Promise<boolean> {
    try {
      const passwordHash = await hash(inputPassword, storedSalt);
      return passwordHash === storedHash;
    } catch (error) {
      throw new Error('Password check failed.');
    }
  }
}
