const ronin = require("ronin-server");
const database = require("ronin-database");
const mocks = require("ronin-mocks");

async function main() {
  try {
    await database.connect(process.env.CONNECTIONSTRING);
    console.log(process.env.CONNECTIONSTRING, process.env.SERVER_PORT);
    const server = ronin.server({
      port: process.env.SERVER_PORT,
    });
    server.use("/foo", (req, res) => {
      return res.json({ foo: "bar" });
      // debugger;
    });
    server.use("/", mocks.server(server.Router()));
    const result = await server.start();
    console.info(result, "RESULTAD");
  } catch (error) {
    console.error(error);
  }
}

main();
