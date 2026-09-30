import { createFileRoute } from "@tanstack/react-router";
import { TypePage, typeHead } from "@/components/kkmanime/TypePage";
const Route = createFileRoute("/movies")({
  head: () => typeHead(
    "Anime Movies & Series Recommendations \u2014 KKMANIME",
    "Name one anime film or series you love and KKMANIME traces its genres and its lead character's traits to find titles that truly echo it.",
    "/movies",
    { keywords: "anime movie recommendations, similar anime films, anime film finder" }
  ),
  component: () => <TypePage type="movie" />
});
export {
  Route
};
