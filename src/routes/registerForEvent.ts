import { FastifyInstance } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import z from 'zod';
import { prisma } from '../lib/prisma';
import { BadRequest } from './_errors/badRequest';

export async function registerForEvent(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post(
    '/events/:eventId/register',
    {
      schema: {
        summary: 'Register an attendee for an event',
        tags: ['Events'],
        body: z.object({
          name: z.string().min(4),
          email: z.string().email(),
        }),

        params: z.object({
          eventId: z.string(),
        }),

        response: {
          201: z.object({
            attendeeId: z.number().int(),
          }),
        },
      },
    },
    async (request, reply) => {
      const { eventId } = request.params;
      const { name, email } = request.body;

      const [event, amountOfAttendees] = await Promise.all([
        prisma.event.findUnique({
          where: {
            id: eventId,
          },
        }),
        prisma.attendee.count({
          where: {
            eventId,
          },
        }),
      ]);

      const attendeeFromEmail = await prisma.attendee.findUnique({
        where: {
          email_eventId: {
            email,
            eventId,
          },
        },
      });

      if (attendeeFromEmail) {
        throw new BadRequest('Attendee already exists');
      }

      if (
        event?.maximumAttendees &&
        amountOfAttendees >= event.maximumAttendees
      ) {
        throw new BadRequest('Maximum number of attendees reached');
      }

      const attendee = await prisma.attendee.create({
        data: {
          name,
          email,
          eventId,
        },
      });

      return reply.status(201).send({
        attendeeId: attendee.id,
      });
    }
  );
}
