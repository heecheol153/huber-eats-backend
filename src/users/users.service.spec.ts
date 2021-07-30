import { PartialType } from '@nestjs/graphql';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { JwtService } from 'src/jwt/jwt.service';
import { MailService } from 'src/mail/mail.service';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { Verification } from './entities/verification.entity';
import { UserService } from './users.service';

//fn은 mock함수를 만든다.가짜함수.
const mockRepository = {
  findOne: jest.fn(),
  save: jest.fn(),
  create: jest.fn(),
};

//jwt
const mockJwtService = {
  sign: jest.fn(),
  verify: jest.fn(),
};

//mail service
const mockMailService = {
  sendVerificationEmail: jest.fn(),
};

//Typescript요소인 Partial를 사용,Type T의 모든요소를optional하게 만든다
type MockRepository<T = any> = Partial<Record<keyof Repository<T>, jest.Mock>>;

//유저서비스를 테스트하기위한것
describe('UserService', () => {
  let service: UserService;
  let usersRepository: MockRepository<User>;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getRepositoryToken(User),
          useValue: mockRepository,
        },
        {
          provide: getRepositoryToken(Verification),
          useValue: mockRepository,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: MailService,
          useValue: mockMailService,
        },
      ],
    }).compile();
    service = module.get<UserService>(UserService);
    usersRepository = module.get(getRepositoryToken(User));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  //이것들은 그냥 빈 함수가 된다 즉 arrow function이 될것이다. 이름을 복사하여todo에 넣는다.
  //it.todo('createAccount');
  describe('createAccount', () => {
    it('should fail if user exists', () => {});
  });

  it.todo('login');
  it.todo('findById');
  it.todo('editProfile');
  it.todo('verifyEmail');
});
