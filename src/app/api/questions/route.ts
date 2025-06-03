
import { NextResponse } from 'next/server';
import type { Question } from '@/lib/data';
import { shuffleArray } from '@/lib/data';
import { db } from '@/lib/firebase';
import { collection, getDocs, type QueryDocumentSnapshot, type DocumentData } from 'firebase/firestore';

export async function GET() {
  try {
    const quotesCollectionRef = collection(db, 'all_quotes_data');
    const querySnapshot = await getDocs(quotesCollectionRef);

    if (querySnapshot.empty) {
      return NextResponse.json({ error: 'No movie data found in Firestore collection "all_quotes_data"' }, { status: 500 });
    }

    const allMovieData: { movieName: string; quotes: string[] }[] = [];

    querySnapshot.forEach((doc: QueryDocumentSnapshot<DocumentData>) => {
      const data = doc.data();
      const movieNameFromField = data.movie_name;

      if (typeof movieNameFromField === 'string' && movieNameFromField.trim() !== '' &&
          data.quotes && Array.isArray(data.quotes) && data.quotes.length > 0) {
        
        const validQuotes = data.quotes.filter((q: unknown): q is string => typeof q === 'string' && q.trim() !== '');
        
        if (validQuotes.length > 0) {
          allMovieData.push({
            movieName: movieNameFromField.trim(),
            quotes: validQuotes,
          });
        }
      } else {
        console.warn(`Skipping document ${doc.id}: missing or invalid movie_name or quotes array.`);
      }
    });

    // Filter out movies that ended up with no valid quotes after cleaning
    const validMovieData = allMovieData.filter(m => m.quotes.length > 0);

    if (validMovieData.length === 0) {
      return NextResponse.json({ error: 'No movies with valid quotes found after processing Firestore data' }, { status: 500 });
    }

    const generatedQuestions: Question[] = [];
    // Generate up to 10 questions, or fewer if not enough unique quotes/movies
    const numQuestionsToGenerate = Math.min(10, validMovieData.reduce((sum, m) => sum + m.quotes.length, 0));
    
    const allAvailableMovieNames = validMovieData.map(m => m.movieName);

    if (numQuestionsToGenerate === 0) {
        return NextResponse.json([]); 
    }

    for (let i = 0; i < numQuestionsToGenerate; i++) {
      // Ensure we have movies to pick from
      if (validMovieData.length === 0) break; 
      
      const randomMovieIndex = Math.floor(Math.random() * validMovieData.length);
      const selectedMovie = validMovieData[randomMovieIndex];
      
      // Ensure selected movie has quotes
      if (!selectedMovie || selectedMovie.quotes.length === 0) {
        i--; // Decrement i to retry generating a question for this slot
        continue;
      }

      const randomQuoteIndex = Math.floor(Math.random() * selectedMovie.quotes.length);
      const quote = selectedMovie.quotes[randomQuoteIndex];
      const correctAnswer = selectedMovie.movieName;

      const incorrectOptions: string[] = [];
      let otherMovieNames = allAvailableMovieNames.filter(name => name !== correctAnswer);
      
      otherMovieNames = shuffleArray(otherMovieNames); 

      while (incorrectOptions.length < 3 && otherMovieNames.length > 0) {
        const option = otherMovieNames.pop();
        if (option && !incorrectOptions.includes(option)) { 
             incorrectOptions.push(option);
        }
      }
      
      // If not enough unique movies for 3 incorrect options, fill with placeholders or fewer options
      while (incorrectOptions.length < 3 && validMovieData.length > 1) {
        // This part is tricky if there are very few movies.
        // For simplicity, if we can't get 3 distinct incorrect options, the options list might be shorter.
        // Or, we could add a generic placeholder like "Another Movie" if strict 4 options are needed.
        // For now, we'll proceed with potentially fewer than 3 incorrect options if necessary.
        // A more robust solution would handle this edge case by e.g. ensuring at least 4 unique movies or using placeholders
        const randomFallbackMovieIndex = Math.floor(Math.random() * allAvailableMovieNames.length);
        const fallbackOption = allAvailableMovieNames[randomFallbackMovieIndex];
        if (fallbackOption !== correctAnswer && !incorrectOptions.includes(fallbackOption)) {
            incorrectOptions.push(fallbackOption);
        }
        if (incorrectOptions.length === 3) break; // safety break for small datasets
         // Break if we've tried to add fallbacks but can't (e.g., only 2 movies total)
        if (otherMovieNames.length === 0 && allAvailableMovieNames.filter(name => name !== correctAnswer && !incorrectOptions.includes(name)).length === 0) break;
      }


      const options = shuffleArray([correctAnswer, ...incorrectOptions]);

      // Ensure options array is not empty, which could happen with very limited data
      if (options.length === 0 && correctAnswer) {
        options.push(correctAnswer); // At least provide the correct answer if no other options
      }


      generatedQuestions.push({
        id: `${Date.now()}-${i}`, 
        quote: quote,
        options: options,
        correctAnswer: correctAnswer,
        movie: correctAnswer, 
      });
    }
    
    // If after all attempts, no questions were generated (e.g. issues with options)
    if (generatedQuestions.length === 0 && numQuestionsToGenerate > 0) {
        return NextResponse.json({ error: 'Could not generate sufficient unique questions/options from the available data.' }, { status: 500 });
    }


    return NextResponse.json(generatedQuestions);
  } catch (error: any) {
    console.error("Error generating questions from Firestore:", error);
    let errorMessage = 'Failed to generate questions from Firestore.';
    if (error.message) {
        errorMessage += ` Details: ${error.message}`;
    }
    // Check for specific Firebase errors if needed, e.g., permission denied
    if (error.code === 'permission-denied') {
        errorMessage = 'Permission denied when trying to access Firestore. Check your Firestore security rules.';
    }
    return NextResponse.json({ error: errorMessage, details: error.toString() }, { status: 500 });
  }
}
