import { FastifyInstance } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import z from 'zod';
import { prisma } from '../lib/prisma';
import { BadRequest } from './_errors/badRequest';

export async function getEvent(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().get(
    '/events/:eventId',
    {
      schema: {
        summary: 'Get an event',
        tags: ['Events'],
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
        throw new BadRequest('Event not found');
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
