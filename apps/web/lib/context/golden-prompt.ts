import type { ContextBlock } from '@cortexpath/shared';

export function buildGoldenPrompt(ctx: ContextBlock): string {
  const imports =
    ctx.imports.length > 0 ? ctx.imports.join('\n') : '(none detected)';

  const impact =
    ctx.impactedBy.length > 0
      ? ctx.impactedBy.join('\n')
      : '(requires /api/ingest to compute)';

  return `<context>
  <file name="${ctx.fileName}">
    <code>
${ctx.code}
    </code>
    <summary>${ctx.summary}</summary>
    <imports>
${imports}
    </imports>
    <impact>
${impact}
    </impact>
  </file>
</context>`;
}

export function extractImportsFromCode(code: string): string[] {
  const matches = code.matchAll(/^import\s+.*?from\s+['"](.+?)['"]/gm);
  return [...matches].map(m => m[1]);
}
