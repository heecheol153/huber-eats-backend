import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateAccountInput } from './dtos/create-account.dto';
import { LoginInput } from './dtos/login.dto';
import { User } from './entities/user.entity';
import { JwtService } from 'src/jwt/jwt.service';
import { EditProfileInput } from './dtos/edit-profile.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private readonly users: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  // check new user
  // create user & hash the password
  // return ok
  async createAccount({
    email,
    password,
    role,
  }: CreateAccountInput): Promise<{ ok: boolean; error?: string }> {
    try {
      const exists = await this.users.findOne({ email });
      if (exists) {
        // make error
        return { ok: false, error: 'There is a user with that email already' };
      }
      //this.users.save하기전에 먼저 instance를 생서한다. this.users.create
      //DB에 저장하기전에 이미 instance를 가짐.
      await this.users.save(this.users.create({ email, password, role }));
      return { ok: true };
    } catch (e) {
      //make error
      return { ok: false, error: "Couldn't create account" };
    }
  }

  async login({
    email,
    password,
  }: LoginInput): Promise<{ ok: boolean; error?: string; token?: string }> {
    // find the user with the email
    // check if the password is correct
    // make a JWT and give it to the user
    try {
      const user = await this.users.findOne({ email });
      if (!user) {
        return {
          ok: false,
          error: 'User not found',
        };
      }
      const passwordCorrect = await user.checkPassword(password);
      if (!passwordCorrect) {
        return {
          ok: false,
          error: 'Wrong password',
        };
      }
      const token = this.jwtService.sign(user.id);
      return {
        ok: true,
        token, //pw가 맞는지확인위해
      };
    } catch (error) {
      return {
        ok: false,
        error,
      };
    }
  }

  async findById(id: number): Promise<User> {
    return this.users.findOne({ id });
  }
  //밑방법은 좋지 않음
  //  async editProfile(userId: number, { email, password }: EditProfileInput) {
  async editProfile(
    userId: number,
    { email, password }: EditProfileInput,
  ): Promise<User> {
    //1)console.log(userId, email, password);
    //2)console.log(editProfileInput);
    //2)return this.users.update(userId, { email, password });
    //3)console.log({ ...editProfileInput });db에 undefined데이터를 보내지 않는다.
    //return this.users.update(userId, { ...editProfileInput }); //ES6를 참조
    const user = await this.users.findOne(userId);
    if (email) {
      user.email = email;
    }
    if (password) {
      user.password = password;
    }
    return this.users.save(user); //update대신 save를 사용해야 Insert, Update해준다.
  }
}
