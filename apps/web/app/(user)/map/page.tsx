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
      ]}
    />
  );
}