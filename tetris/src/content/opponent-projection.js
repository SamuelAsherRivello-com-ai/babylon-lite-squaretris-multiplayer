/** Only these two opponent signals are legal to expose to the presentation. */
export function permittedOpponentProjection(model) {
  const opponent = model?.server?.opponent ?? model?.opponent;
  if (!opponent) return null;
  return {
    aim: opponent.aim ?? null,
    height: opponent.height ?? 0,
  };
}
