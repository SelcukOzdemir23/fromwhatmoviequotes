
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { type Question, shuffleArray } from "@/lib/data";
import { Film, RefreshCw, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import type { VariantProps } from "class-variance-authority";
import { buttonVariants } from "@/components/ui/button"; // For variant type

type ButtonVariant = VariantProps<typeof buttonVariants>["variant"];

export default function HomePage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isAnswerCorrect, setIsAnswerCorrect] = useState<boolean | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [animateKey, setAnimateKey] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [errorLoadingQuestions, setErrorLoadingQuestions] = useState<string | null>(null);

  const fetchAndSetQuestions = async () => {
    setIsLoading(true);
    setErrorLoadingQuestions(null);
    try {
      const response = await fetch('/api/questions');
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to fetch questions: ${response.statusText}`);
      }
      const data = await response.json();
      if (data.error) {
        throw new Error(data.details || data.error);
      }
      if (data.length === 0) {
        setErrorLoadingQuestions("No questions available. Try again later.");
        setQuestions([]);
      } else {
        setQuestions(shuffleArray(data));
      }
    } catch (error: any) {
      console.error("Fetch error:", error);
      setErrorLoadingQuestions(error.message || "Could not load questions. Please try again later.");
      setQuestions([]);
    } finally {
      setIsLoading(false);
      setAnimateKey(prev => prev + 1);
    }
  };

  useEffect(() => {
    fetchAndSetQuestions();
  }, []);

  const currentQuestion = questions[currentQuestionIndex];

  const handleAnswer = (answer: string) => {
    if (showFeedback) return;

    setSelectedAnswer(answer);
    const correct = answer === currentQuestion.correctAnswer;
    setIsAnswerCorrect(correct);
    if (correct) {
      setScore((prevScore) => prevScore + 1);
    }
    setShowFeedback(true);
  };

  const handleNextQuestion = () => {
    setShowFeedback(false);
    setSelectedAnswer(null);
    setIsAnswerCorrect(null);
    setAnimateKey(prev => prev + 1);

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prevIndex) => prevIndex + 1);
    } else {
      setGameOver(true);
    }
  };

  const restartGame = () => {
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setIsAnswerCorrect(null);
    setShowFeedback(false);
    setScore(0);
    setGameOver(false);
    fetchAndSetQuestions();
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <Sparkles className="w-16 h-16 text-accent animate-pulse" />
        <p className="mt-4 text-xl">Loading New Quotes...</p>
      </div>
    );
  }

  if (errorLoadingQuestions) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <Film className="w-16 h-16 text-destructive" />
        <p className="mt-4 text-xl text-center">{errorLoadingQuestions}</p>
        <Button onClick={restartGame} className="mt-4 bg-accent hover:bg-accent/90 text-accent-foreground">
          Try Again
        </Button>
      </div>
    );
  }
  
  if (questions.length === 0 && !gameOver) {
     return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <Film className="w-16 h-16 text-muted-foreground" />
        <p className="mt-4 text-xl text-center">No questions loaded. Check subtitle files or try again.</p>
        <Button onClick={restartGame} className="mt-4 bg-accent hover:bg-accent/90 text-accent-foreground">
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-4 sm:p-6 md:p-8">
      <header className="mb-10 text-center">
        <div className="flex items-center justify-center space-x-3">
          <Film className="w-12 h-12 text-accent sm:w-14 sm:h-14 md:w-16 md:h-16" />
          <h1 className="text-4xl font-bold sm:text-5xl md:text-6xl font-headline">From What Movie Quotes</h1>
        </div>
        {!gameOver && (
          <p className="mt-5 text-lg font-medium text-muted-foreground">Score: {score} {questions.length > 0 ? `/ ${questions.length}` : ''}</p>
        )}
      </header>

      {gameOver ? (
        <Card className="w-full max-w-md text-center shadow-xl bg-card">
          <CardHeader>
            <CardTitle className="text-3xl text-accent">Game Over!</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-6 text-2xl">Your final score is: {score} / {questions.length}</p>
          </CardContent>
          <CardFooter className="flex justify-center">
            <Button onClick={restartGame} size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground">
              <RefreshCw className="w-5 h-5 mr-2" />
              Play Again
            </Button>
          </CardFooter>
        </Card>
      ) : currentQuestion && (
        <Card key={animateKey} className="w-full max-w-xl shadow-xl animate-in fade-in-0 zoom-in-95 duration-500 bg-card">
          <CardHeader>
            <CardTitle className="text-2xl italic leading-relaxed text-center sm:text-3xl md:text-3xl text-foreground/90">
              "{currentQuestion.quote}"
            </CardTitle>
            <CardDescription className="pt-3 text-center text-muted-foreground">
              Which movie is this quote from?
            </CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
            {currentQuestion.options.map((option) => {
              const isCurrentSelected = selectedAnswer === option;
              const isCorrectOption = option === currentQuestion.correctAnswer;
              
              let buttonVariant: ButtonVariant = "outline";
              let customClasses = "transition-all duration-300 ease-in-out transform active:scale-95";

              if (showFeedback) {
                if (isCurrentSelected) {
                  if (isAnswerCorrect) {
                    buttonVariant = "default"; 
                    customClasses = cn(customClasses, "bg-accent hover:bg-accent/90 text-accent-foreground border-2 border-accent-foreground/80");
                  } else {
                    buttonVariant = "destructive";
                  }
                } else if (isCorrectOption) {
                  buttonVariant = "outline";
                  customClasses = cn(customClasses, "border-accent text-accent opacity-90");
                } else {
                  buttonVariant = "secondary";
                  customClasses = cn(customClasses, "opacity-60");
                }
              } else if (isCurrentSelected) {
                 buttonVariant = "default"; 
                 customClasses = cn(customClasses, "bg-primary/90 ring-2 ring-accent"); 
              }

              return (
                <Button
                  key={option}
                  onClick={() => handleAnswer(option)}
                  disabled={showFeedback}
                  className={cn("w-full h-auto min-h-[3.25rem] py-3 text-base justify-start text-left whitespace-normal", customClasses)}
                  variant={buttonVariant}
                >
                  {option}
                </Button>
              );
            })}
          </CardContent>
          {showFeedback && (
            <CardFooter className="flex flex-col items-center pt-5 space-y-4">
              <p className={cn("text-xl font-semibold", isAnswerCorrect ? "text-accent" : "text-destructive")}>
                {isAnswerCorrect ? "Correct!" : `Incorrect! The movie was ${currentQuestion.movie}.`}
              </p>
              <Button onClick={handleNextQuestion} className="w-full sm:w-auto bg-accent hover:bg-accent/90 text-accent-foreground">
                Next Quote
              </Button>
            </CardFooter>
          )}
        </Card>
      )}
    </main>
  );
}
