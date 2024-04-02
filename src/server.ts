import { PrismaClient } from "@prisma/client";
import fastify from "fastify";
import z from "zod";

const app = fastify();

const prisma = new PrismaClient();

app.get("/", async () => {
  return "Hello, World!";
});

app.post("/events", async (request, reply) => {
  try {
    const createEventBody = z.object({
      title: z.string(),
      description: z.string().nullable(),
      maximumAttendees: z.number().int().min(1),
    });

    const data = createEventBody.parse(request.body);

    const event = await prisma.event.create({
      data: {
        title: data.title,
        description: data.description,
        slug: data.title.toLowerCase().replaceAll(" ", "-"),
        maximumAttendees: data.maximumAttendees,
      },
    });

    return reply.status(201).send(event);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return reply.status(400).send(error.issues);
    }
  }
});

app.listen({ port: 3000 }, (err, address) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  console.log(`Server listening at ${address}`);
});
