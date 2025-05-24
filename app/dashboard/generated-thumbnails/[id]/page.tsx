import GeneratedThumbnailsPage from "@/components/pages/GeneratedThumbnails";

export default async function GeneratedAdsRoute({
    params,
  }: {
    params: Promise<{ id: string }>
  }) {
    const {id} = await params;
    if (id) return <GeneratedThumbnailsPage id={id}/>;
    else return <div>Not Found</div>;
}
