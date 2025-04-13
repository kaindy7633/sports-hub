import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { UserAuth } from './entities/user-auth.entity';
import { Role } from './entities/role.entity';
import { UserRole } from './entities/user-role.entity';

describe('UsersController', () => {
  let controller: UsersController;
  let service: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            find: jest.fn(),
            findOne: jest.fn(),
            softDelete: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(UserAuth),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Role),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(UserRole),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a new user', async () => {
      const createUserDto = {
        username: 'testuser',
        password: 'password123',
        nick_name: 'Test User',
        phone: '13800138000',
      };

      const mockUser = {
        id: BigInt(1),
        ...createUserDto,
        password: 'hashedPassword',
        salt: 'salt',
        user_id: BigInt(1),
      };

      jest.spyOn(service, 'create').mockResolvedValue(mockUser as User);

      expect(await controller.create(createUserDto)).toBe(mockUser);
      expect(service.create).toHaveBeenCalledWith(createUserDto);
    });
  });

  describe('findAll', () => {
    it('should return an array of users', async () => {
      const mockUsers = [
        { id: BigInt(1), username: 'user1' },
        { id: BigInt(2), username: 'user2' },
      ];

      jest.spyOn(service, 'findAll').mockResolvedValue(mockUsers as User[]);

      expect(await controller.findAll()).toBe(mockUsers);
      expect(service.findAll).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a user by id', async () => {
      const mockUser = { id: BigInt(1), username: 'user1' };

      jest.spyOn(service, 'findOne').mockResolvedValue(mockUser as User);

      expect(await controller.findOne('1')).toBe(mockUser);
      expect(service.findOne).toHaveBeenCalledWith(1);
    });
  });
});
