import type { MetaFunction } from "@remix-run/node";
import { useFetcher, useLoaderData } from "@remix-run/react";
import { Effect, Schema } from "effect";
import { useEffect, useRef } from "react";
import { getFormData } from "~/services/Remix";
import { effectAction, effectLoader } from "~/services/Runtime";
import type { Todo } from "~/services/TodoRepo";
import { TodoArray, TodoRepo } from "~/services/TodoRepo";

const ActionInput = Schema.Union(
  Schema.Struct({
    _tag: Schema.Literal("AddTodo"),
    title: Schema.String,
  }),
  Schema.Struct({
    _tag: Schema.Literal("DeleteTodo"),
    id: Schema.NumberFromString,
  })
);

export const action = effectAction(
  Effect.gen(function* ($) {
    const { addTodo, deleteTodo } = yield* TodoRepo;
    const input = yield* $(getFormData(ActionInput));
    switch (input._tag) {
      case "AddTodo": {
        yield* $(addTodo(input.title));
        break;
      }
      case "DeleteTodo": {
        yield* $(deleteTodo(input.id));
        break;
      }
    }
    return input._tag;
  }).pipe(Effect.withSpan("indexAction"))
);

export const loader = effectLoader(
  Effect.gen(function* ($) {
    const { getAllTodos } = yield* $(TodoRepo);
    const result = yield* $(getAllTodos);
    return yield* $(
      result,
      Schema.encode(TodoArray),
      Effect.withSpan("encodeResponse")
    );
  }).pipe(Effect.withSpan("indexLoader"))
);

export const meta: MetaFunction = () => {
  return [
    { title: "Remixing Effect" },
    {
      name: "description",
      content: "Integrate Effect & Remix for the greater good!",
    },
  ];
};

function TodoRow({ todo }: { todo: Schema.Schema.Encoded<typeof Todo> }) {
  const fetcher = useFetcher<typeof action>();
  const deleteTodoForm = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (fetcher.state === "idle" && fetcher.data) {
      switch (fetcher.data) {
        case "DeleteTodo": {
          deleteTodoForm.current?.reset();
          break;
        }
      }
    }
  }, [fetcher.state, fetcher.data]);

  return (
    <li>
      <div className="flex gap-2">
        <div>
          {todo.title} ({todo.createdAt})
        </div>
        <div>
          <fetcher.Form method="post" ref={deleteTodoForm} action="?index">
            <input type="hidden" name="_tag" value="DeleteTodo" />
            <input type="hidden" name="id" value={todo.id} />
            <button
              type="submit"
              className="rounded bg-slate-200 px-2 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700"
            >
              Done
            </button>
          </fetcher.Form>
        </div>
      </div>
    </li>
  );
}

export default function Index() {
  const todos = useLoaderData<typeof loader>();
  const fetcher = useFetcher<typeof action>();
  const addTodoForm = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (fetcher.state === "idle" && fetcher.data) {
      switch (fetcher.data) {
        case "AddTodo": {
          addTodoForm.current?.reset();
          break;
        }
      }
    }
  }, [fetcher.state, fetcher.data]);

  return (
    <div className="flex flex-col font-sans leading-8 m-8">
      <header className="flex justify-center items-center gap-9 flex-wrap mb-8">
        <div className="h-[100px] shrink-0">
          <img
            src="/logo-light.png"
            alt="Remix"
            className="h-full block dark:hidden"
          />
          <img
            src="/logo-dark.png"
            alt="Remix"
            className="h-full hidden dark:block"
          />
        </div>
        <span className="text-4xl font-extralight">x</span>
        <div className="h-[85px] shrink-0">
          <img
            src="/logo-effect-dark.svg"
            alt="Effect"
            className="h-full block w-full invert dark:invert-0"
          />
        </div>
      </header>
      <h1>Todos</h1>
      <ul className="flex flex-col gap-2 ml-4">
        {todos.map((todo) => (
          <TodoRow todo={todo} key={todo.id} />
        ))}
      </ul>
      <h2 className="mt-8">Add New Todo</h2>
      <fetcher.Form
        method="post"
        ref={addTodoForm}
        action="?index"
        style={{ display: "flex", gap: "0.5em" }}
      >
        <input type="hidden" name="_tag" value="AddTodo" />
        <input
          type="text"
          size={50}
          name="title"
          className="border-2 border-gray-300 rounded-md px-2"
        />
        <button
          type="submit"
          className="rounded bg-slate-200 px-2 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700"
        >
          Create Todo
        </button>
      </fetcher.Form>
    </div>
  );
}
