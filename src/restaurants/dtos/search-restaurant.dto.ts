import { Field, InputType, ObjectType } from '@nestjs/graphql';
import {
  PaginationInput,
  PaginationOutput,
} from 'src/common/dtos/pagination.dto';
import { Restaurant } from '../entities/restaurant.entity';

@InputType()
export class SearchRestaurantInput extends PaginationInput {
  @Field((type) => String) //검색할수있는 term,query,keyword가되니까...
  query: string;
}

@ObjectType() //output는 ObjectType로
export class SearchRestaurantOutput extends PaginationOutput {
  @Field((type) => [Restaurant], { nullable: true }) //배열상태로
  restaurants?: Restaurant[];
}
