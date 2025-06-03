
import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import type { Question } from '@/lib/data';
import { shuffleArray } from '@/lib/data';

// Helper function to clean movie names from file names
function cleanMovieName(fileName: string): string {
  const nameWithoutExtension = fileName.replace(/\.json$/, '');
  // Regex to capture the movie title part (possibly with dots) and the year
  const match = nameWithoutExtension.match(/^(.+?)\.(?=\d{4})([\d]{4})/);
  if (match && match[1] && match[2]) {
    const title = match[1].replace(/\./g, ' '); // Replace dots in title with spaces
    const year = match[2];
    return `${title} (${year})`;
  }
  // Fallback for names not matching the pattern (e.g. no year)
  // This tries to get a sensible name by removing file extensions and replacing dots.
  return nameWithoutExtension.replace(/\.[^.]*$/, '').replace(/\./g, ' ');
}


export async function GET() {
  try {
    const subtitlesDir = path.join(process.cwd(), 'subtitles');
    const fileNames = fs.readdirSync(subtitlesDir).filter(file => file.endsWith('.json'));

    if (fileNames.length === 0) {
      return NextResponse.json({ error: 'No subtitle files found in subtitles directory' }, { status: 500 });
    }

    const allMovieData: { movieName: string; quotes: string[] }[] = [];

    for (const fileName of fileNames) {
      const filePath = path.join(subtitlesDir, fileName);
      const fileContent = fs.readFileSync(filePath, 'utf-8');
      let parsedContent;
      try {
        parsedContent = JSON.parse(fileContent);
      } catch (e) {
        console.warn(`Skipping non-JSON file or malformed JSON: ${fileName}`);
        continue;
      }
      
      const movieName = cleanMovieName(fileName);
      
      if (parsedContent.quotes && Array.isArray(parsedContent.quotes) && parsedContent.quotes.length > 0) {
        allMovieData.push({
          movieName: movieName,
          quotes: parsedContent.quotes.filter(q => typeof q === 'string' && q.trim() !== ''), // Ensure quotes are valid strings
        });
      }
    }

    // Filter out movies that ended up with no valid quotes after cleaning
    const validMovieData = allMovieData.filter(m => m.quotes.length > 0);

    if (validMovieData.length === 0) {
      return NextResponse.json({ error: 'No movies with valid quotes found' }, { status: 500 });
    }

    const generatedQuestions: Question[] = [];
    // Generate up to 10 questions, or fewer if not enough unique quotes/movies
    const numQuestionsToGenerate = Math.min(10, validMovieData.reduce((sum, m) => sum + m.quotes.length, 0));
    
    const allAvailableMovieNames = validMovieData.map(m => m.movieName);

    if (numQuestionsToGenerate === 0) {
        return NextResponse.json([]); // Return empty if no questions can be made
    }

    // Ensure we have enough movies for options, otherwise, options might be sparse or duplicated.
    // For this example, we proceed if at least one movie is available.
    // A more robust solution for options generation is needed if validMovieData.length < 4.

    for (let i = 0; i < numQuestionsToGenerate; i++) {
      const randomMovieIndex = Math.floor(Math.random() * validMovieData.length);
      const selectedMovie = validMovieData[randomMovieIndex];
      
      const randomQuoteIndex = Math.floor(Math.random() * selectedMovie.quotes.length);
      const quote = selectedMovie.quotes[randomQuoteIndex];
      const correctAnswer = selectedMovie.movieName;

      const incorrectOptions: string[] = [];
      // Get movie names other than the correct answer for incorrect options
      let otherMovieNames = allAvailableMovieNames.filter(name => name !== correctAnswer);
      
      // Shuffle to pick random incorrect options
      otherMovieNames = shuffleArray(otherMovieNames); 

      while (incorrectOptions.length < 3 && otherMovieNames.length > 0) {
        const option = otherMovieNames.pop();
        if (option && !incorrectOptions.includes(option)) { // Ensure distinct options
             incorrectOptions.push(option);
        }
      }
      // If not enough distinct incorrect options, we might have fewer than 4 total options.
      // This is acceptable if there are fewer than 4 unique movies.

      const options = shuffleArray([correctAnswer, ...incorrectOptions]);

      generatedQuestions.push({
        id: `${Date.now()}-${i}`, // More unique ID
        quote: quote,
        options: options,
        correctAnswer: correctAnswer,
        movie: correctAnswer, 
      });
    }

    return NextResponse.json(generatedQuestions);
  } catch (error: any) {
    console.error("Error generating questions:", error);
    return NextResponse.json({ error: 'Failed to generate questions', details: error.message }, { status: 500 });
  }
}
