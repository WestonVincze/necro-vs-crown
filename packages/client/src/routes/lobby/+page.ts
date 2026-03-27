import type { PageLoad } from "./$types";

export const load: PageLoad = ({ url }) => ({
  roomId: url.searchParams.get("roomId"),
});
