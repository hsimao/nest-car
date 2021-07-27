import { Test } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from './users.service';
import { User } from './user.entity';

describe('AuthService', () => {
  let service: AuthService;
  let fakeUsersService: Partial<UsersService>;

  beforeEach(async () => {
    // Create a fake copy of the users service
    const users: User[] = [];
    fakeUsersService = {
      find: (email: string) => {
        const filteredUsers = users.filter((user) => user.email === email);
        return Promise.resolve(filteredUsers);
      },
      create: (email: string, password: string) => {
        const user = {
          id: Math.floor(Math.random() * 99999),
          email,
          password,
        } as User;
        users.push(user);
        return Promise.resolve(user);
      },
    };

    const module = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: fakeUsersService },
      ],
    }).compile();

    service = module.get(AuthService);
  });

  it('can create an instance of auth service', async () => {
    expect(service).toBeDefined();
  });

  it('creates a new user with a salted and hashed password', async () => {
    const user = await service.signup('test@gmail.com', '123456');

    expect(user.password).not.toEqual('123456');
    const [salt, hash] = user.password.split('.');
    expect(salt).toBeDefined();
    expect(hash).toBeDefined();
  });

  it('throws an error if user signs up with email that is in use', async () => {
    await service.signup('test@gmail.com', '12345');

    await expect(service.signup('test@gmail.com', '123456')).rejects.toThrow(
      'email in use',
    );
  });

  it('throws if signin is called with an unused email', async () => {
    await expect(service.signin('123@gmail.com', 'sdfg')).rejects.toThrow(
      'user not found',
    );
  });

  it('throws if am invalid password is provided', async () => {
    await service.signup('mars@gmail.com', '123456');

    await expect(service.signin('mars@gmail.com', '1234567')).rejects.toThrow(
      'bad password',
    );
  });

  it('returns a user if correct password is provided', async () => {
    await service.signup('mars@gmail.com', '123456');

    const user = await service.signin('mars@gmail.com', '123456');
    expect(user).toBeDefined();
  });
});
