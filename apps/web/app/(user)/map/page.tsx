import FileMap from "@/components/map/file-map";
import MapClient from "./client";

export default function Page() {
  return (
    <div className="relative">
      <MapClient />
      <FileMap 
        files={[
            {
              path: "project/app/page.tsx",
              summary: "Main page",
            },
            {
              path: "project/components/ui/navbar.tsx",
              summary: "Navbar",
            },
            {
              path: "project/components/ui/navbar2.tsx",
              summary: "Navbar",
            },
            {
              path: "project/components/ui/navbarasdfasdfasdfasdfasfdasdfasdfasdfasdfasdfa4.tsx",
              summary: "Navbarasdfasdfasdfasdfasdfasdfasdfasdfasdfasfasfdasdfasdfasfasf",
            },
          ]} 
          />
    </div>
  );
}