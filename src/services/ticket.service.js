import { TicketRepository } from '../repositories/ticket.repository.js';
import { EventRepository } from '../repositories/event.repository.js';
import crypto from 'crypto';
import { sendTicketConfirmationEmail } from '../utils/mailer.js';

export class TicketService {
  constructor() {
    this.ticketRepository = new TicketRepository();
    this.eventRepository = new EventRepository();
  }

  async createTicket(userId, eventId, quantity = 1, userDetails) {
    const qty = Number(quantity);
    if (!qty || qty < 1) {
      throw { status: 400, message: 'La cantidad debe ser un número entero mayor a 0' };
    }

    const event = await this.eventRepository.findById(eventId);
    if (!event) {
      throw { status: 404, message: 'El evento solicitado no existe' };
    }

    if (event.status !== 'published') {
      throw { status: 400, message: 'No se pueden realizar inscripciones a un evento no publicado' };
    }

    if (new Date(event.date) < new Date()) {
      throw { status: 400, message: 'El evento ya ha finalizado' };
    }

   // 4. Verificar duplicado activo
    const existingTicket = await this.ticketRepository.findByUserAndEvent(userId, eventId);
    if (existingTicket) {
      throw { status: 409, message: 'Ya tenés una inscripción activa a este evento' };
    }

    if (event.capacity < qty) {
      throw { status: 409, message: 'No hay cupo disponible para este evento' };
    }

    const reservationCode = 'EVT-' + crypto.randomBytes(3).toString('hex').toUpperCase();

    const newTicket = await this.ticketRepository.create({
      user: userId,
      event: eventId,
      quantity: qty,
      status: 'confirmed',
      reservationCode
    });

    const newCapacity = event.capacity - qty;
    await this.eventRepository.update(eventId, { capacity: newCapacity });

    if (userDetails?.email) {
      try {
        await sendTicketConfirmationEmail(
          userDetails.email,
          `${userDetails.first_name || ''} ${userDetails.last_name || ''}`.trim() || 'Usuario',
          event.title,
          reservationCode,
          qty
        );
      } catch (error) {
        console.error('Error al enviar correo de confirmación:', error.message);
      }
    }

    return newTicket;
  }

  async cancelTicket(ticketId, user) {
    const ticket = await this.ticketRepository.findById(ticketId);
    if (!ticket) {
      throw { status: 404, message: 'Ticket no encontrado' };
    }

    if (ticket.status === 'cancelled') {
      throw { status: 400, message: 'El ticket ya se encuentra cancelado' };
    }

    const isOwner = (ticket.user._id || ticket.user).toString() === (user.id || user._id).toString();
    const isAdmin = user.role === 'admin';

    if (!isOwner && !isAdmin) {
      throw { status: 403, message: 'No tienes permisos para cancelar este ticket' };
    }

    const updatedTicket = await this.ticketRepository.updateStatus(ticketId, 'cancelled');

    const event = await this.eventRepository.findById(ticket.event._id || ticket.event);
    if (event) {
      await this.eventRepository.update(event._id, { capacity: event.capacity + ticket.quantity });
    }

    return updatedTicket;
  }

  async getMyTickets(userId) {
    return await this.ticketRepository.findByUser(userId);
  }
}

// Exportación por defecto para evitar errores de importación
export default TicketService;