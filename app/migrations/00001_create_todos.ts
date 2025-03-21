import { SqlClient } from "@effect/sql";
import * as Effect from "effect/Effect";

export default Effect.gen(function* ($) {
  const sql = yield* SqlClient.SqlClient;

  yield* $(sql`
    CREATE TABLE todos (
        id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
        title VARCHAR(255) NOT NULL,
        created_at datetime NOT NULL DEFAULT current_timestamp
    )`);
});
