export { default } from "next-auth/middleware";

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/course/:path*",
    "/generate/:path*",
    "/reports/:path*",
    "/settings/:path*",
    "/profile/:path*",
    "/bookmarks/:path*",
    "/achievements/:path*",
    "/notifications/:path*",
    "/flashcards/:path*",
  ],
};
