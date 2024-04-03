import { FastifyInstance } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import z from 'zod';
import { prisma } from '../lib/prisma';
import { generateSlug } from '../utils/generateSlug';

export async function createEvent(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post(
    '/events',
    {
      schema: {
        body: z.object({
          title: z.string(),
          description: z.string().nullable(),
          maximumAttendees: z.number().int().min(1),
        }),

        response: {
          201: z.object({
            id: z.string(),
          }),

          409: z
            .object({
              message: z.string(),
            })
            .default({ message: 'An event with same slug already exists' }),
        },
      },
    },
    async (request, reply) => {
      try {
        const data = request.body;

        const slug = generateSlug(data.title);

        const eventWithSameSlug = await prisma.event.findUnique({
          where: {
            slug,
          },
        });

        if (eventWithSameSlug) {
          return reply
            .status(409)
            .send({ message: 'An event with same slug already exists' });
        }

        const event = await prisma.event.create({
          data: {
            title: data.title,
            description: data.description,
            slug,
            maximumAttendees: data.maximumAttendees,
          },
        });

        return reply.status(201).send({
          id: event.id,
        });
      } catch (error) {
        return reply.status(500).send({
          message: 'Internal server error',
        });
      }
    }
  );
}
