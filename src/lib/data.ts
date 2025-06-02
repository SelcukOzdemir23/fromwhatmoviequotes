export type Question = {
  id: string;
  quote: string;
  options: string[];
  correctAnswer: string;
  movie: string;
};

export const gameQuestions: Question[] = [
  {
    id: "1",
    quote: "Frankly, my dear, I don't give a damn.",
    options: ["Casablanca", "Gone with the Wind", "The Maltese Falcon", "Citizen Kane"],
    correctAnswer: "Gone with the Wind",
    movie: "Gone with the Wind (1939)",
  },
  {
    id: "2",
    quote: "Here's looking at you, kid.",
    options: ["The Big Sleep", "To Have and Have Not", "Casablanca", "Key Largo"],
    correctAnswer: "Casablanca",
    movie: "Casablanca (1942)",
  },
  {
    id: "3",
    quote: "May the Force be with you.",
    options: ["Star Trek: The Motion Picture", "Close Encounters of the Third Kind", "Blade Runner", "Star Wars: A New Hope"],
    correctAnswer: "Star Wars: A New Hope",
    movie: "Star Wars: A New Hope (1977)",
  },
  {
    id: "4",
    quote: "I'll be back.",
    options: ["Predator", "Commando", "The Terminator", "Total Recall"],
    correctAnswer: "The Terminator",
    movie: "The Terminator (1984)",
  },
  {
    id: "5",
    quote: "You can't handle the truth!",
    options: ["A Few Good Men", "Crimson Tide", "The Firm", "Disclosure"],
    correctAnswer: "A Few Good Men",
    movie: "A Few Good Men (1992)",
  },
  {
    id: "6",
    quote: "Houston, we have a problem.",
    options: ["Armageddon", "Apollo 13", "Deep Impact", "The Right Stuff"],
    correctAnswer: "Apollo 13",
    movie: "Apollo 13 (1995)",
  },
  {
    id: "7",
    quote: "There's no place like home.",
    options: ["The Wizard of Oz", "Alice in Wonderland", "Peter Pan", "Cinderella"],
    correctAnswer: "The Wizard of Oz",
    movie: "The Wizard of Oz (1939)",
  },
  {
    id: "8",
    quote: "Keep your friends close, but your enemies closer.",
    options: ["The Godfather Part II", "Scarface", "Goodfellas", "The Departed"],
    correctAnswer: "The Godfather Part II",
    movie: "The Godfather Part II (1974)",
  },
];

export function shuffleArray<T>(array: T[]): T[] {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}
