import { Field, InputType, Int, ObjectType, PickType } from '@nestjs/graphql';
import { CoreOutput } from 'src/common/dtos/output.dto';
import { Dish } from '../entities/dish.entity';

@InputType()
export class CreateDishInput extends PickType(Dish, [
  //PickType으로property를 고른다.
  'name',
  'price',
  'description',
  'options',
]) {
  @Field((type) => Int)
  restaurantId: number; //dish를 어느restaurant에 생성할지 알기위해..
}

@ObjectType()
export class CreateDishOutput extends CoreOutput {}
