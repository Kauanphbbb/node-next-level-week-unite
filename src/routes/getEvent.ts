import { FastifyInstance } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import z from 'zod';
import { prisma } from '../lib/prisma';

export async function getEvent(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().get(
    '/events/:eventId',
    {
      schema: {
        params: z.object({
          eventId: z.string(),
        }),

        response: {
          200: z.object({
            event: z.object({
              id: z.string(),
              title: z.string(),
              description: z.string().nullable(),
              slug: z.string(),
              maximumAttendees: z.number().int().nullable(),
              attendees: z.number().int(),
            }),
          }),

          404: z
            .object({
              message: z.string(),
            })
            .default({ message: 'Event not found' }),
        },
      },
    },
    async (request, reply) => {
      const { eventId } = request.params;
      const event = await prisma.event.findUnique({
        select: {
          id: true,
          title: true,
          description: true,
          slug: true,
          maximumAttendees: true,
          _count: {
            select: {
              attendees: true,
            },
          },
        },
        where: {
          id: eventId,
        },
      });

      if (!event) {
        return reply.status(404).send({
          message: 'Event not found',
        });
      }

      return reply.send({
        event: {
          id: event.id,
          title: event.title,
          description: event.description,
          slug: event.slug,
          maximumAttendees: event.maximumAttendees,
          attendees: event._count.attendees,
        },
      });
    }
  );
}
