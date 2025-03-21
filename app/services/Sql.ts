import { Config, Layer, pipe, String } from "effect";

import { SqliteClient, SqliteMigrator } from "@effect/sql-sqlite-node";

const migrations = import.meta.glob("../migrations/*.ts");

export const SqlLive = pipe(
  SqliteMigrator.layer({
    loader: SqliteMigrator.fromGlob(migrations),
  }),
  Layer.provideMerge(
    SqliteClient.layerConfig({
      filename: Config.succeed("database/db.sqlite"),
      transformQueryNames: Config.succeed(String.camelToSnake),
      transformResultNames: Config.succeed(String.snakeToCamel),
    })
  )
).pipe(Layer.orDie);
