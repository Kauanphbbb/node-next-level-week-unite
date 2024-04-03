import { FastifyInstance } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import z from 'zod';
import { prisma } from '../lib/prisma';

export async function getAttendeeBadge(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().get(
    '/attendees/:attendeeId/badge',
    {
      schema: {
        params: z.object({
          attendeeId: z.coerce.number().int(),
        }),
      },
    },
    async (request, reply) => {
      const { attendeeId } = request.params;

      const attendee = await prisma.attendee.findUnique({
        where: { id: attendeeId },
        select: {
          name: true,
          email: true,
          id: true,
          event: {
            select: {
              id: true,
              title: true,
            },
          },
        },
      });

      if (!attendee) {
        return reply.status(404).send({
          message: 'Attendee not found',
        });
      }

      return reply.send({ attendee });
    }
  );
}
