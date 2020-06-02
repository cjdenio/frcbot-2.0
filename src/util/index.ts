export function parseSlashCommand(
  input: string
): { command: string; args: string[] } {
  let split = input.split(" ");
  split = split.map((i) => i.toLowerCase());

  let command = split.shift();

  return {
    command,
    args: split,
  };
}
