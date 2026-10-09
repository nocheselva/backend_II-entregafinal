import TicketModel from '../models/ticket.model.js';

export class TicketDAO {
  async findById(id) {
    return await TicketModel.findById(id).populate('user').populate('event');
  }

async findByUserAndEvent(userId, eventId) {
    const tickets = await TicketModel.find({ 
      event: eventId, 
      status: { $ne: 'cancelled' } 
    });
    // Compara correctamente si t.user es un objeto populado o una cadena
    const existing = tickets.find(t => {
      const uId = t.user?._id ? t.user._id.toString() : t.user.toString();
      return uId === userId.toString();
    });
    return existing || null;
  }

  async findByUser(userId) {
    return await TicketModel.find({ user: userId }).populate('event').lean();
  }

  async create(ticketData) {
    return await TicketModel.create(ticketData);
  }

  async updateStatus(id, status) {
    return await TicketModel.findByIdAndUpdate(id, { status }, { new: true });
  }
}