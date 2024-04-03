import { FastifyInstance } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import z from 'zod';
import { prisma } from '../lib/prisma';

export async function registerForEvent(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post(
    '/events/:eventId/register',
    {
      schema: {
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

          409: z
            .object({
              message: z.string(),
            })
            .default({ message: 'An attendee with same email already exists' }),
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
        return reply.status(409).send({
          message: 'An attendee with same email already exists',
        });
      }

      if (
        event?.maximumAttendees &&
        amountOfAttendees >= event.maximumAttendees
      ) {
        return reply.status(409).send({
          message: 'Maximum number of attendees reached',
        });
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
