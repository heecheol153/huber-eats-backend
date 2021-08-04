import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { getConnection, getRepository, Repository } from 'typeorm';
import { User } from 'src/users/entities/user.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ok } from 'assert/strict';

jest.mock('got', () => {
  return {
    post: jest.fn(),
  };
});

const GRAPHQL_ENDPOINT = '/graphql';

const testUser = {
  email: 'hee@cheol.com',
  password: '12345',
};

describe('UserModule (e2e)', () => {
  let app: INestApplication;
  let usersRepository: Repository<User>; //1.class는 Repository이다
  let jwtToken: string; //7.

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = module.createNestApplication();
    usersRepository = module.get<Repository<User>>(getRepositoryToken(User));
    //2. 이렇게하면 user들의 repository를 받아올수있다. get에서원하는 type을 명시할수있다.(<Repository<User>>)
    //usersRepository를 가지고올수있으니,userProfile을 하기전에 DB에접속가능.
    await app.init();
  });

  //Database를 접속, drop하고 close한다.
  afterAll(async () => {
    await getConnection().dropDatabase();
    app.close();
  });

  describe('createAccount', () => {
    //const EMAIL = 'nico@las.com'; //재사용하기때문에 const로 뺐다
    //const PASSWORD = '12345';
    it('should create account', () => {
      return request(app.getHttpServer()) //1.request를 app.getHttpServer()로보냄
        .post(GRAPHQL_ENDPOINT) //2.그리고 post를 GRAPHQL_ENDPOIT로 보낸다.위에const의 URL로 posting
        .send({
          // playground 부터 가져옴.
          query: `
          mutation {
            createAccount(input: {
              email:"${testUser.email}",
              password:"${testUser.password}",
              role:Owner
            }) {
              ok
              error
            }
          }
          `,
        })
        .expect(200) //status code 200을 expect할수있다.
        .expect((res) => {
          //expect는 callback을 받고,callback은 error 나 response를 넘겨준다.
          //console.log(res.body);
          expect(res.body.data.createAccount.ok).toBe(true);
          expect(res.body.data.createAccount.error).toBe(null);
        });
    });
    //3.위의1번부터 복붙한다.
    it('should fail if account already exists', () => {
      return request(app.getHttpServer()) //1.request를 app.getHttpServer()로보냄
        .post(GRAPHQL_ENDPOINT) //2.그리고 post를 GRAPHQL_ENDPOIT로 보낸다.위에const의 URL로 posting
        .send({
          // playground 부터 가져옴.
          query: `
          mutation {
            createAccount(input: {
              email:"${testUser.email}",
              password:"${testUser.password}",
              role:Owner
            }) {
              ok
              error
            }
          }
        `,
        })
        .expect(200)
        .expect((res) => {
          // response도expect한다.
          expect(res.body.data.createAccount.ok).toBe(false);
          expect(res.body.data.createAccount.error).toBe(
            'There is a user with that email already',
          );
          //expect(res.body.data.createAccount.error).toEqual(expect.any(String)); //toEqual은 어떤string이든 expect할수있게함.
          //toBe 로도 쓸수도있다.
        });
    });
  });

  //아래순서대로 테스트를 진행한다.
  describe('login', () => {
    it('should login with correct credentials', () => {
      return request(app.getHttpServer())
        .post(GRAPHQL_ENDPOINT)
        .send({
          query: `
          mutation {
            login(input:{
              email:"${testUser.email}",
              password:"${testUser.password}",
            }) {
              ok
              error
              token
            }
          }
        `,
        })
        .expect(200)
        .expect((res) => {
          //위의 res.body보단이게낫다
          const {
            body: {
              data: { login },
            },
          } = res;
          //console.log(res);
          expect(login.ok).toBe(true);
          expect(login.error).toBe(null);
          expect(login.token).toEqual(expect.any(String));
          jwtToken = login.token;
        });
    });
    it('should not be able to login with wrong credentials', () => {
      return request(app.getHttpServer())
        .post(GRAPHQL_ENDPOINT)
        .send({
          query: `
          mutation {
            login(input:{
              email:"${testUser.email}",
              password:"xxx",
            }) {
              ok
              error
              token
            }
          }
        `,
        })
        .expect(200)
        .expect((res) => {
          //위의 res.body보단이게낫다
          const {
            body: {
              data: { login },
            },
          } = res;
          //console.log(res);
          expect(login.ok).toBe(false);
          expect(login.error).toBe('wrong password');
          expect(login.token).toBe(null);
        });
    });
  });

  //3.beforeAll과같은방식
  describe('userProfile', () => {
    let userId: number;
    //userProfile의 모든테스트이전에DB를 들어다본다.뭐가나오는지 console.log()를 실행
    beforeAll(async () => {
      //console.log(await usersRepository.find());
      const [user] = await usersRepository.find(); //배열의 첫번째요소만 뽑아낸다.
      userId = user.id;
    });
    it("should see a user's profile", () => {
      return (
        request(app.getHttpServer())
          .post(GRAPHQL_ENDPOINT)
          .set('X-JWT', jwtToken) //.post를 호출한다음 .set을 호출하자! 이게 header임. value는 token or jwtToken이라야함.
          //이것이 superTest를 사용해서header를 set하는 방법이다.
          .send({
            //graphql로 부터받은 ID가 이query를 부르는데 사용한것과 동일해야함...
            query: `
          {
            userProfile(userID:${userId}){
              ok
              error
              user {
                id
              }
            }
          }
          `,
          })
          .expect(200)
          .expect((res) => {
            const {
              body: {
                data: {
                  userProfile: {
                    ok,
                    error,
                    user: { id },
                  },
                },
              },
            } = res;
            //console.log(res.body);
            expect(ok).toBe(true);
            expect(error).toBe(null);
            expect(id).toBe(userId);
          })
      );
    });
    it('should not find a profile', () => {
      return (
        request(app.getHttpServer())
          .post(GRAPHQL_ENDPOINT)
          .set('X-JWT', jwtToken) //.post를 호출한다음 .set을 호출하자! 이게 header임. value는 token or jwtToken이라야함.
          //이것이 superTest를 사용해서header를 set하는 방법이다.
          .send({
            //graphql로 부터받은 ID가 이query를 부르는데 사용한것과 동일해야함...
            query: `
          {
            userProfile(userID:333){
              ok
              error
              user {
                id
              }
            }
          }
          `,
          })
          .expect(200)
          .expect((res) => {
            const {
              body: {
                data: {
                  userProfile: { ok, error, user },
                },
              },
            } = res;
            //console.log(res.body);
            expect(ok).toBe(false);
            expect(error).toBe('User not found');
            expect(user).toBe(null);
          })
      );
    });
  });

  describe('me', () => {
    it('should find my profile', () => {
      return request(app.getHttpServer())
        .post(GRAPHQL_ENDPOINT)
        .set('X-JWT', jwtToken)
        .send({
          query: `
          {
            me {
              email
            }
          }
        `,
        })
        .expect(200)
        .expect((res) => {
          //console.log(res.body);
          const {
            body: {
              data: {
                me: { email },
              },
            },
          } = res;
          expect(email).toBe(testUser.email);
        });
    });
    it('should not allow logged out user', () => {
      return request(app.getHttpServer())
        .post(GRAPHQL_ENDPOINT)
        .send({
          query: `
        {
          me {
            email
          }
        }
      `,
        })
        .expect(200)
        .expect((res) => {
          const {
            body: { errors },
          } = res;
          const [error] = errors;
          expect(error.message).toBe('Forbidden resource'); //message는 error message에서 복붙.
        });
    });
  });

  //#9.7
  describe('editProfile', () => {
    const NEW_EMAIL = 'nico@new.com';
    it('should change email', () => {
      return request(app.getHttpServer())
        .post(GRAPHQL_ENDPOINT)
        .set('X-JWT', jwtToken)
        .send({
          query: `
            mutation {
              editProfile(input:{
                email: "${NEW_EMAIL}"
              }) {
                ok
                error
              }
            }
        `,
        })
        .expect(200)
        .expect((res) => {
          const {
            body: {
              data: {
                editProfile: { ok, error },
              },
            },
          } = res;
          expect(ok).toBe(true);
          expect(error).toBe(null);
        })
        .then(() => {});
    });
    it('should have new email', () => {
      return request(app.getHttpServer())
        .post(GRAPHQL_ENDPOINT)
        .set('X-JWT', jwtToken)
        .send({
          query: `
          {
            me {
              email
            }
          }
        `,
        })
        .expect(200)
        .expect((res) => {
          const {
            body: {
              data: {
                me: { email },
              },
            },
          } = res;
          expect(email).toBe(NEW_EMAIL); //email이 NEW_EMAIL과동일할것으로 expect한다.
        });
    });
  });
  //DB에 access한다
  describe('verifyEmail', () => {});
});
