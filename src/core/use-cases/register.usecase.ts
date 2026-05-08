import { UserRepository } from '../../infrastructure/database/user.repository';
import { hashPassword } from '../../infrastructure//security/bcrypt';


const repo = new UserRepository();

export class RegisterUseCase {
  async execute(email: string, password: string, roleId: string) {
    const exist = await repo.findByEmail(email);
    if (exist) throw new Error('User exists');

    const hashed = await hashPassword(password);

    return repo.create({
      email,
      password: hashed,
      roleId,
    });
  }
}