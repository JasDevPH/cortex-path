import FileMap from "@/components/map/file-map";

export default function Page() {
  return (
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
          path: "project/components/ui/navbar3.tsx",
          summary: "Navbar",
        },
         {
          path: "project/components/ui/navbarasdfasdfasdfasdfasfdasdfasdfasdfasdfasdfa4.tsx",
          summary: "Navbarasdfasdfasdfasdfasdfasdfasdfasdfasdfasfasfdasdfasdfasfasf",
        },
         {
          path: "project/components/ui/navbar5.tsx",
          summary: "Navbar",
        },
      ]}
    />
  );
}