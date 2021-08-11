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
    for (const item of items) {
      //이item은 유저가 보낸것이다.
      const dish = await this.dishes.findOne(item.dishId);
      if (!dish) {
        return {
          ok: false,
          error: 'Dish not found.',
        };
      }
      console.log(`Dish price: ${dish.price}`); //전체주문이 얼마인지알수있다.
      for (const itemOption of item.options) {
        const dishOption = dish.options.find(
          (dishOption) => dishOption.name === itemOption.name,
        );
        //console.log(itemOption.name, dishOption.name);
        if (dishOption) {
          if (dishOption.extra) {
            console.log(`$USD + ${dishOption.extra}`);
          } else {
            const dishOptionChoice = dishOption.choices.find(
              (optionChoice) => optionChoice.name === itemOption.choice,
            );
            //console.log(dishOptionChoice);
            if (dishOptionChoice) {
              if (dishOptionChoice.extra) {
                console.log(`$USD + ${dishOptionChoice.extra}`);
              }
            }
          }
        }
      }
      /*await this.orderItems.save(    유저가 지불해야할금액을 계산위해 Comment처리함
        this.orderItems.create({
          dish,
          options: item.optins,
        }),
      );
    });
      ); */
    }
    /* const order = await this.orders.save(
      this.orders.create({
        customer,
        restaurant,
      }),
    );
    console.log(order); */
  }
}
