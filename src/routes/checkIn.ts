import { FastifyInstance } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import z from 'zod';
import { prisma } from '../lib/prisma';

export async function checkIn(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().get(
    '/attendees/:attendeeId/check-in',
    {
      schema: {
        summary: 'Check in an attendee',
        tags: ['Attendees'],
        params: z.object({
          attendeeId: z.coerce.number().int(),
        }),
      },
    },
    async (request, reply) => {
      const { attendeeId } = request.params;

      const attendeeCheckIn = await prisma.checkIn.findUnique({
        where: {
          id: attendeeId,
        },
      });

      if (attendeeCheckIn) {
        return reply.status(409).send({
          message: 'Attendee already checked in',
        });
      }

      await prisma.checkIn.create({
        data: {
          attendeeId
        }
      });

      return reply.status(201).send();
    }
  );
}
