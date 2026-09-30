import { createFileRoute } from "@tanstack/react-router";
import { TypePage, typeHead } from "@/components/kkmanime/TypePage";
const Route = createFileRoute("/anime")({
  head: () => typeHead(
    "Anime Recommendations \u2014 KKMANIME",
    "Name one anime you love and KKMANIME traces its genres and its main character's traits to find anime that truly echo it.",
    "/anime",
    { keywords: "anime recommendations, similar anime, anime like, genre based anime finder, character based anime recommendations" }
  ),
  component: () => <TypePage type="anime" />
});
export {
  Route
};
