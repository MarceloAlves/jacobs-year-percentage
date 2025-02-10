import { Hono } from "hono";
import type { FC } from "hono/jsx";

const app = new Hono();

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

app.get("/api", (c) => {
  const precision = c.req.query("precision");
  return c.json({ percentage: getPercentageOfYearPassed(precision) });
});

export default app;
