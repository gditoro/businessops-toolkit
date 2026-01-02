const BEGIN = "<!-- BO:BEGIN GENERATED -->";
const END = "<!-- BO:END GENERATED -->";

export function mergeGeneratedBlock(existing: string, newlyRendered: string): string {
  const existingStart = existing.indexOf(BEGIN);
  const existingEnd = existing.indexOf(END);

  const newStart = newlyRendered.indexOf(BEGIN);
  const newEnd = newlyRendered.indexOf(END);

  // If either file is missing markers, fallback to full overwrite
  if (existingStart === -1 || existingEnd === -1 || newStart === -1 || newEnd === -1) {
    return newlyRendered;
  }

  const existingBefore = existing.slice(0, existingStart);
  const existingAfter = existing.slice(existingEnd + END.length);

  const newGenerated = newlyRendered.slice(newStart, newEnd + END.length);

  // Preserve user edits outside markers
  return `${existingBefore}${newGenerated}${existingAfter}`;
}
