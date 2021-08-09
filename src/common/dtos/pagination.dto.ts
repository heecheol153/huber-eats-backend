import { ArgsType, Field, InputType, Int, ObjectType } from '@nestjs/graphql';
import { CoreOutput } from './output.dto';

@InputType()
export class PaginationInput {
  @Field((type) => Int, { defaultValue: 1 })
  page: number;
}

@ObjectType()
export class PaginationOutput extends CoreOutput {
  //CoreOutput으로 extends하면 ok,error,totalPages,category를 쓸수있다.
  @Field((type) => Int, { nullable: true }) //에러가생길수있으니nullable로
  totalPages?: number;

  @Field((type) => Int, { nullable: true })
  totalResults?: number;
}
