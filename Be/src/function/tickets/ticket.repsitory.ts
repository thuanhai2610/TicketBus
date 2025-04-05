// tickets/repositories/ticket.repository.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';
import { Ticket, TicketDocument } from './schemas/ticket.schema';


@Injectable()
export class TicketRepository {
  constructor(
    @InjectModel(Ticket.name) private ticketModel: Model<TicketDocument>,
  ) {}

  async create(createTicketDto: CreateTicketDto): Promise<Ticket> {
    const newTicket = new this.ticketModel(createTicketDto);
    return newTicket.save();
  }

  async findAll(): Promise<Ticket[]> {
    return this.ticketModel.find().exec();
  }

  async findOne(id: string): Promise<Ticket> {
    const ticket = await this.ticketModel.findById(id).exec();
    if (!ticket) {
      throw new NotFoundException(`Ticket with ID ${id} not found`);
    }
    return ticket;
  }

  async update(id: string, updateTicketDto: UpdateTicketDto): Promise<Ticket> {
    const updatedTicket = await this.ticketModel
      .findByIdAndUpdate(id, updateTicketDto, { new: true })
      .exec();
    
    if (!updatedTicket) {
      throw new NotFoundException(`Ticket with ID ${id} not found`);
    }
    
    return updatedTicket;
  }

  async remove(id: string): Promise<Ticket> {
    const deletedTicket = await this.ticketModel.findByIdAndDelete(id).exec();
    
    if (!deletedTicket) {
      throw new NotFoundException(`Ticket with ID ${id} not found`);
    }
    
    return deletedTicket;
  }
  async findTicketById(ticketId: string): Promise<Ticket | null> {
    return this.ticketModel.findOne({ ticketId }).exec();
  }
}