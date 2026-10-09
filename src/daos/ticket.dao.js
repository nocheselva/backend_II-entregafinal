import TicketModel from '../models/ticket.model.js';

export class TicketDAO {
  async findById(id) {
    return await TicketModel.findById(id).populate('user').populate('event');
  }

 async findByUserAndEvent(userId, eventId) {
    // Buscamos los tickets de este evento que no estén cancelados
    const tickets = await TicketModel.find({ 
      event: eventId, 
      status: { $ne: 'cancelled' } 
    });

    // Filtramos para encontrar si coincide con el ID del usuario
    const existing = tickets.find(t => t.user.toString() === userId.toString());
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