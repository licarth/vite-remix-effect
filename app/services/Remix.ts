import { Schema as S } from "effect";
import type { ActionFunction, LoaderFunction } from "@remix-run/node";
import { Context, Effect } from "effect";

export class LoaderContext extends Context.Tag("LoaderContext")<
  LoaderContext,
  Parameters<LoaderFunction>[0]
>() {}

export class ActionContext extends Context.Tag("@services/ActionContext")<
  ActionContext,
  Parameters<ActionFunction>[0]
>() {}

export const getFormDataEntries = ActionContext.pipe(
  Effect.flatMap(({ request }) => Effect.promise(() => request.formData())),
  Effect.map((formData) => Object.fromEntries(formData)),
  Effect.withSpan("getFormDataEntries")
);

export const getFormData = <A, I>(schema: S.Schema<A, I>) =>
  Effect.flatMap(getFormDataEntries, (entries) =>
    S.decodeUnknown(schema)(entries).pipe(Effect.withSpan("parseFormData"))
  ).pipe(Effect.withSpan("getFormData"));
