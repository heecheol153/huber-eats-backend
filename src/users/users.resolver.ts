import { UseGuards } from '@nestjs/common';
import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { AuthUser } from 'src/auth/auth-user.decorator';
import { AuthGuard } from 'src/auth/auth.guard';
import { Role } from 'src/auth/role.decorator';
import {
  CreateAccountInput,
  CreateAccountOutput,
} from './dtos/create-account.dto';
import { EditProfileInput, EditProfileOutput } from './dtos/edit-profile.dto';
import { LoginInput, LoginOutput } from './dtos/login.dto';
import { UserProfileInput, UserProfileOutput } from './dtos/user-profile.dto';
import { VerifyEmailInput, VerifyEmailOutput } from './dtos/verify-email.dto';
import { User } from './entities/user.entity';
import { UserService } from './users.service';

@Resolver((of) => User)
export class UserResolver {
  constructor(private readonly usersService: UserService) {}

  //이것없으면 Query root type must be provided.에러발생함.
  //@Query(() => Boolean)
  //hi() {
  //  return true;
  //}

  //public resolever이기때문에 여기엔 metadata가없다.login도 마찬가지.
  @Mutation((returns) => CreateAccountOutput)
  //@Role(['Delivery'])  잠시test용
  async createAccount(
    @Args('input') createAccountInput: CreateAccountInput,
  ): Promise<CreateAccountOutput> {
    return this.usersService.createAccount(createAccountInput);
  }

  //CreateAccountInput이라고 했던것처럼
  @Mutation((returns) => LoginOutput)
  //async login(@Args('input') loginInput: LoginInput) {}
  //마지막에 아래처럼 수정하고마침
  async login(@Args('input') loginInput: LoginInput): Promise<LoginOutput> {
    return this.usersService.login(loginInput);
  }

  //여기me에선 metadata를 사용한다.
  @Query((returns) => User)
  @Role(['Any']) //모든user는 자신의 profile볼수있고(anybody)
  me(@AuthUser() authUser: User) {
    //console.log(authUser);
    return authUser;
  }

  @Query((returns) => UserProfileOutput)
  @Role(['Any']) //userProfile에서도 자신의 프로필접근가능.
  async userProfile(
    @Args() userProfileInput: UserProfileInput,
  ): Promise<UserProfileOutput> {
    return this.usersService.findById(userProfileInput.userId);
  }

  @Mutation((returns) => EditProfileOutput)
  @Role(['Any'])
  async editProfile(
    @AuthUser() authUser: User,
    @Args('input') editProfileInput: EditProfileInput,
  ): Promise<EditProfileOutput> {
    return this.usersService.editProfile(authUser.id, editProfileInput);
  }

  @Mutation((returns) => VerifyEmailOutput)
  verifyEmail(
    @Args('input') { code }: VerifyEmailInput,
  ): Promise<VerifyEmailOutput> {
    return this.usersService.verifyEmail(code);
  }
}
