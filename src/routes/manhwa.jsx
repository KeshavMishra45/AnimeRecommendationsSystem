import { createFileRoute } from "@tanstack/react-router";
import { TypePage, typeHead } from "@/components/kkmanime/TypePage";
const Route = createFileRoute("/manhwa")({
  head: () => typeHead(
    "Manhwa Recommendations \u2014 KKMANIME",
    "Name one manhwa you love and KKMANIME traces its genres and its protagonist's traits to find manhwa that truly echo it.",
    "/manhwa",
    { keywords: "manhwa recommendations, similar manhwa, korean webtoon recommendations" }
  ),
  component: () => <TypePage type="manhwa" />
});
export {
  Route
};
