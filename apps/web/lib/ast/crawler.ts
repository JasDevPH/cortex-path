import { Project } from "ts-morph";

export const initCortexParser = (fileContent: string, filePath: string) => {
  const project = new Project({ useInMemoryFileSystem: true });
  const sourceFile = project.createSourceFile(filePath, fileContent);

  const imports = sourceFile
    .getImportDeclarations()
    .map((imp) => imp.getModuleSpecifierValue());
  return { imports };
};
