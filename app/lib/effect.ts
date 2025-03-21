import { NodeContext } from "@effect/platform-node";
import type { ActionFunction, LoaderFunction } from "@remix-run/node";
import { Effect, Layer, ManagedRuntime, pipe } from "effect";
import { ActionContext, LoaderContext } from "~/services/Remix";

export const remixRuntime = <A, E>(
  layer: Layer.Layer<A, E, NodeContext.NodeContext>
) => {
  const run = async <A, E>(
    body: Effect.Effect<A, E, Layer.Layer.Success<typeof layer>>
  ) => {
    const runtime = ManagedRuntime.make(
      pipe(layer, Layer.provide(NodeContext.layer))
    );
    return await runtime.runPromise(body);
  };

  const effectLoader =
    <A, E>(
      body: Effect.Effect<
        A,
        E,
        Layer.Layer.Success<typeof layer> | LoaderContext
      >
    ) =>
    (...args: Parameters<LoaderFunction>): Promise<A> =>
      run(Effect.provideService(body, LoaderContext, args[0]));

  const effectAction =
    <A, E>(
      body: Effect.Effect<
        A,
        E,
        Layer.Layer.Success<typeof layer> | ActionContext
      >
    ) =>
    (...args: Parameters<ActionFunction>): Promise<A> =>
      run(Effect.provideService(body, ActionContext, args[0]));

  return {
    effectLoader,
    effectAction,
  };
};
