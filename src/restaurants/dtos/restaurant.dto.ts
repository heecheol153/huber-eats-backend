import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { CoreOutput } from 'src/common/dtos/output.dto';
import { Restaurant } from '../entities/restaurant.entity';

@InputType()
export class RestaurantInput {
  @Field((type) => Number)
  restaurantId: number;
}
//output으로는ObjectType
@ObjectType()
export class RestaurantOutput extends CoreOutput {
  @Field((type) => Restaurant, { nullable: true })
  restaurant?: Restaurant; //찾을수도못찾을수도있으니까?를
}
