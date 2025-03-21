import { SqlClient } from "@effect/sql";
import * as Effect from "effect/Effect";

export default Effect.gen(function* ($) {
  const sql = yield* SqlClient.SqlClient;

  yield* $(sql`INSERT INTO todos (title) VALUES ('Try Remix with Vite')`);
  yield* $(sql`INSERT INTO todos (title) VALUES ('Integrate Effect')`);
  yield* $(sql`INSERT INTO todos (title) VALUES ('Integrate OpenTelemetry')`);
});
