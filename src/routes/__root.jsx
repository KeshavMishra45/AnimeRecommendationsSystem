import { QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts
} from "@tanstack/react-router";
import { useEffect } from "react";
import appCss from "../styles.css?url";
import { Shell } from "@/components/kkmanime/Shell";
import { TitleDialogProvider } from "@/components/kkmanime/dialog-context";
import { AuthProvider } from "@/lib/auth-context";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { getCatalog } from "@/lib/catalog.functions";
import { setCatalog } from "@/lib/catalog-store";
function NotFoundComponent() {
  return <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
    to="/"
    className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
  >
            Go home
          </Link>
        </div>
      </div>
    </div>;
}
function ErrorComponent({ error, reset }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);
  return <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
    onClick={() => {
      router.invalidate();
      reset();
    }}
    className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
  >
            Try again
          </button>
          <a
    href="/"
    className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
  >
            Go home
          </a>
        </div>
      </div>
    </div>;
}
const Route = createRootRouteWithContext()({
  loader: async () => {
    const db = await getCatalog();
    setCatalog(db);
    return { db };
  },
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1, viewport-fit=cover"
      },
      { title: "KKMANIME — Anime, Manga, Manhwa & Movie Recommendations" },
      {
        name: "description",
        content:
          "KKMANIME recommends anime, manga, manhwa and films by tracing the genres and the lead character's traits of a title you already love."
      },
      { name: "author", content: "KKMANIME" },
      { name: "application-name", content: "KKMANIME" },
      { name: "theme-color", content: "#040a1f" },
      { name: "color-scheme", content: "dark" },
      { name: "robots", content: "index, follow, max-image-preview:large, max-snippet:-1" },
      { property: "og:site_name", content: "KKMANIME" },
      { property: "og:locale", content: "en_US" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" }
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss
      },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Orbitron:wght@700;900&family=Rajdhani:wght@300;400;500;600;700&family=Bebas+Neue&family=Outfit:wght@300;400;600;700;800&display=swap"
      },
      { rel: "icon", href: "/favicon.ico", type: "image/x-icon" }
    ]
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent
});
function RootShell({ children }) {
  return <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>;
}
function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const loaderData = Route.useLoaderData() ?? {};
  // Keep the catalog store in sync on both the server render and the client
  // (the loader result is dehydrated, so it does not re-run on hydration).
  if (loaderData.db) setCatalog(loaderData.db);

  return <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TitleDialogProvider>
          <Shell>
            {
    /* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */
  }
            <Outlet />
          </Shell>
        </TitleDialogProvider>
      </AuthProvider>
    </QueryClientProvider>;
}
export {
  Route
};
