import { prisma } from '../src/lib/prisma';

async function seed() {
  await prisma.event.create({
    data: {
      id: '4e7c867d-bf4f-404b-a6c2-c6f63dd77a9c',
      title: 'My first event',
      slug: 'my-first-event',
      description: 'My first event description',
      maximumAttendees: 10,
    },
  });
}

seed().then(() => {
  console.log('Seeded');
  prisma.$disconnect();
});
