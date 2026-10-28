export function initialGameMode(roomCode) {
  return /^[A-Z0-9]{4}$/.test(roomCode || '') ? 'multiplayer' : 'choice';
}
