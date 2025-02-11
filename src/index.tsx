import { Hono } from "hono";
import type { FC } from "hono/jsx";
import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";
import { fromError } from "zod-validation-error";
import { swaggerUI } from "@hono/swagger-ui";

const app = new OpenAPIHono();

const precisionSchema = z.object({
  precision: z.coerce
    .number({ coerce: true, message: "Must be a valid number" })
    .min(0, "Must be greater than 0")
    .max(50, "Must be less than 50")
    .optional(),
});

const ErrorSchema = z.object({
  code: z.number().openapi({
    example: 400,
  }),
  message: z.string().openapi({
    example: "Bad Request",
  }),
});

const route = createRoute({
  method: "get",
  path: "/api",
  request: {
    query: precisionSchema,
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: z.object({ percentage: z.string() }),
        },
      },
      description: "Retrieve the percentage of the year passed",
    },
    400: {
      content: {
        "application/json": {
          schema: ErrorSchema,
        },
      },
      description: "Returns an error",
    },
    500: {
      description: "Internal Server Error",
    },
  },
});

function getPercentageOfYearPassed(precision: number | string | undefined = 2) {
  const precisionNumber = Number(precision);
  const now = new Date();
  const startOfYear = new Date(now.getFullYear(), 0, 1).getTime();
  const endOfYear = new Date(
    now.getFullYear(),
    11,
    31,
    23,
    59,
    59,
    999,
  ).getTime();

  const totalMillisecondsInYear = endOfYear - startOfYear;
  const elapsedMilliseconds = now.getTime() - startOfYear;

  const percentage = (elapsedMilliseconds / totalMillisecondsInYear) * 100;

  return percentage.toFixed(precisionNumber);
}

const Layout: FC = (props) => {
  return (
    <html>
      <head>
        <title>Jacob's Year Percentage</title>
        <link rel="stylesheet" href="/static/main.css" />
      </head>
      <body class="bg-gray-50 dark:bg-zinc-900 text-zinc-900 dark:text-gray-100">
        {props.children}
      </body>
    </html>
  );
};

const Content = () => {
  const yearPercentage = getPercentageOfYearPassed();

  return (
    <Layout>
      <main class="grid w-dvw h-dvh place-content-center">
        <h1 class="text-9xl tabular-nums font-bold">{yearPercentage}%</h1>
        <h2 class="text-3xl text-center text-gray-500 dark:text-gray-400 tracking-wide">
          through the year
        </h2>
        <h3 class="text-right text-md text-gray-400">- Jacob</h3>
      </main>
    </Layout>
  );
};

app.get("/", (c) => {
  return c.html(<Content />);
});

// app.get("/api", (c) => {
//   const precision = c.req.query("precision");
//   return c.json({ percentage: getPercentageOfYearPassed(precision) });
// });

app.openapi(
  route,
  (c) => {
    const { precision } = c.req.valid("query");
    return c.json({ percentage: getPercentageOfYearPassed(precision) });
  },
  (result, c) => {
    if (!result.success) {
      return c.json(
        {
          code: 400,
          message: fromError(result.error).toString(),
        },
        400,
      );
    }

    return c.text("Internal server error", 400);
  },
);

app.doc("/api/doc", {
  openapi: "3.0.0",
  info: {
    version: "0.0.1-alpha",
    title: "Jacob's Year Percentage",
  },
});

app.get("/doc", swaggerUI({ url: "/api/doc" }));

export default app;
