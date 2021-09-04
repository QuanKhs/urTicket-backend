import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import StripeService from 'src/stripe/stripe.service';
import { TicketsService } from 'src/tickets/tickets.service';
import { UsersService } from 'src/users/users.service';
import { Connection, Repository } from 'typeorm';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { Reservation } from './entities/reservation.entity';

@Injectable()
export class ReservationsService {
  constructor(
    @InjectRepository(Reservation)
    private readonly reservationRepository: Repository<Reservation>,
    private readonly connection: Connection,
    private readonly usersService: UsersService,
    private readonly stripeService: StripeService,
    private readonly ticketsService: TicketsService,
  ) {}

  async createReservation(
    userId: string,
    createReservationDto: CreateReservationDto,
  ): Promise<any> {
    const {
      paymentMethodId,
      amount,
      showtimeId,
      tickets,
      promotionId,
      product,
    } = createReservationDto;

    const user = await this.usersService.getUserById(userId);
    //charge => create reservation => update ticket => send email
    const queryRunner = this.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // execute some operations on this transaction

      // commit transaction now:
      await queryRunner.commitTransaction();
    } catch (e) {
      console.log('🚀 ~ file: reservations.service.ts ~ line 46 ~ e', e);
      // since we have errors let's rollback changes we made
      await queryRunner.rollbackTransaction();
      throw new InternalServerErrorException();
    } finally {
      // you need to release query runner which is manually created:
      await queryRunner.release();
    }
  }
}
