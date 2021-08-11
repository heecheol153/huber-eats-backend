import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Dish } from 'src/restaurants/entities/dish.entity';
import { Restaurant } from 'src/restaurants/entities/restaurant.entity';
import { User } from 'src/users/entities/user.entity';
import { Repository } from 'typeorm';
import { CreateOrderInput, CreateOrderOutput } from './dtos/create-order.dto';
import { OrderItem } from './entities/order-item.entity';
import { Order } from './entities/order.entity';

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(Order)
    private readonly orders: Repository<Order>,
    @InjectRepository(OrderItem)
    private readonly orderItems: Repository<OrderItem>,
    @InjectRepository(Restaurant)
    private readonly restaurants: Repository<Restaurant>,
    @InjectRepository(Dish)
    private readonly dishes: Repository<Dish>,
  ) {}

  async createOrder(
    customer: User,
    { restaurantId, items }: CreateOrderInput,
  ): Promise<CreateOrderOutput> {
    const restaurant = await this.restaurants.findOne(restaurantId);
    if (!restaurant) {
      return {
        ok: false,
        error: 'Resataurant not found',
      };
    }
    items.forEach(async (item) => {
      //console.log(item.options);
      const dish = await this.dishes.findOne(item.dishId);
      if (!dish) {
        // abort this whole thing
      }
      await this.orderItems.save(
        //dish찾으면orderItemd에dish,items을 넣는다.
        this.orderItems.create({
          dish,
          options: item.options,
        }),
      );
    });
    /* const order = await this.orders.save(
      this.orders.create({
        customer,
        restaurant,
      }),
    );
    console.log(order);*/
  }
}
