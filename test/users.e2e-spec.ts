import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { getConnection } from 'typeorm';

const GRAPHQL_ENDPOINT = '/graphql';

describe('UserModule (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = module.createNestApplication();
    await app.init();
  });

  //Database를 접속, drop하고 close한다.
  afterAll(async () => {
    await getConnection().dropDatabase();
    app.close();
  });

  describe('createAccount', () => {
    const EMAIL = 'nico@las.com'; //재사용하기때문에 const로 뺐다
    it('should create account', () => {
      return request(app.getHttpServer()) //1.request를 app.getHttpServer()로보냄
        .post(GRAPHQL_ENDPOINT) //2.그리고 post를 GRAPHQL_ENDPOIT로 보낸다.위에const의 URL로 posting
        .send({
          // playground 부터 가져옴.
          query: `
          mutation {
            createAccount(input: {
              email:"${EMAIL}",
              password:"12345",
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
          console.log(res.body);
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
            email:"${EMAIL}",
            password:"12345",
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
  it.todo('userProfile');
  it.todo('login');
  it.todo('me');
  it.todo('verifyEmail');
  it.todo('editProfile');
});
