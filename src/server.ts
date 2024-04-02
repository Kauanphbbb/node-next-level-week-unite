import fastify from "fastify";

const app = fastify();

app.get("/", async () => {
  return 'Hello, World!';
});

app.listen({ port: 3000 }, (err, address) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  console.log(`Server listening at ${address}`);
});
