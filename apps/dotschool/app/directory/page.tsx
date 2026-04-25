import { permanentRedirect } from "next/navigation";

export default function DirectoryRedirectPage() {
  permanentRedirect("/dir");
}
