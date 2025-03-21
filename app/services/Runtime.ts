import { Layer, pipe } from "effect";
import { remixRuntime } from "~/lib/effect";
import { SqlLive } from "./Sql";
import { TodoRepoLive } from "./TodoRepo";
import { TracingLive } from "./Tracing";

export const { effectLoader, effectAction } = remixRuntime(
  pipe(
    TracingLive,
    Layer.provideMerge(TodoRepoLive),
    Layer.provideMerge(SqlLive)
  )
);
