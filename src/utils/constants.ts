const scrollbarCSS = {
  "&::-webkit-scrollbar-track": {
    backgroundColor: "#F5F5F5",
  },
  "&::-webkit-scrollbar": {
    width: "6px",
    backgroundColor: "#F5F5F5",
  },
  "&::-webkit-scrollbar-thumb": {
    backgroundColor: "grey",
  },
};

// Chatgpt generated ideas
const newNoteAdjectives: string[] = [
  "fantastic",
  "innovative",
  "trailblazing",
  "pioneering",
  "revolutionary",
  "groundbreaking",
  "unprecedented",
  "cutting-edge",
  "avant-garde",
  "fantabulous",
  "game-changing",
  "splendific",
  "wondermazing",
  "fantasmagorical",
  "majestifabulous",
  "magnifitastic",
  "earth-shattering",
  "mind-bending",
  "paradigm-shifting",
  "life-altering",
  "jaw-dropping",
  "eye-opening",
  "transformative",
  "universe-bending",
];

const getRandom = <T>(arr: T[]): T =>
  arr[Math.floor(Math.random() * arr.length)];

export { newNoteAdjectives, getRandom, scrollbarCSS };
