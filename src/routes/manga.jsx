import { createFileRoute } from "@tanstack/react-router";
import { TypePage, typeHead } from "@/components/kkmanime/TypePage";
const Route = createFileRoute("/manga")({
  head: () => typeHead(
    "Manga Recommendations \u2014 KKMANIME",
    "Name one manga you love and KKMANIME traces its genres and its protagonist's traits to find manga that truly echo it.",
    "/manga",
    { keywords: "manga recommendations, similar manga, manga like, genre based manga finder" }
  ),
  component: () => <TypePage type="manga" />
});
export {
  Route
};
