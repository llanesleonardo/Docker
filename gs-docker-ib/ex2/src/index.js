const ronin = require("ronin-server");
const database = require("ronin-database");
const mocks = require("ronin-mocks");

async function main() {
  try {
    await database.connect(process.env.CONNECTIONSTRING);

    const server = ronin.server({
      port: 8888,
    });

    server.use("/", mocks.server(server.Router()));

    const result = await server.start();
    console.info(result, "RESULTADO");
  } catch (error) {
    console.error(error);
  }
}

main();
