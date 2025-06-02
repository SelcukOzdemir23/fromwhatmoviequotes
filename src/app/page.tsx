"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { gameQuestions, type Question, shuffleArray } from "@/lib/data";
import { Film, RefreshCw, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

export default function HomePage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isAnswerCorrect, setIsAnswerCorrect] = useState<boolean | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [animateKey, setAnimateKey] = useState(0); // For triggering animations

  useEffect(() => {
    setQuestions(shuffleArray(gameQuestions));
    setAnimateKey(prev => prev + 1);
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
    setQuestions(shuffleArray(gameQuestions));
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setIsAnswerCorrect(null);
    setShowFeedback(false);
    setScore(0);
    setGameOver(false);
    setAnimateKey(prev => prev + 1);
  };

  if (questions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <Sparkles className="w-16 h-16 text-accent animate-pulse" />
        <p className="mt-4 text-xl">Loading Quotes...</p>
      </div>
    );
  }

  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-4 sm:p-6 md:p-8">
      <header className="mb-8 text-center">
        <div className="flex items-center justify-center space-x-3">
          <Film className="w-10 h-10 text-accent sm:w-12 sm:h-12" />
          <h1 className="text-4xl font-bold sm:text-5xl font-headline">Quote Flix</h1>
        </div>
        {!gameOver && (
          <p className="mt-4 text-xl text-foreground/80">Score: {score}</p>
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
            <CardTitle className="text-2xl italic leading-relaxed text-center sm:text-3xl text-foreground/90">
              "{currentQuestion.quote}"
            </CardTitle>
            <CardDescription className="pt-2 text-center text-muted-foreground">
              Which movie is this quote from?
            </CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
            {currentQuestion.options.map((option) => {
              const isSelected = selectedAnswer === option;
              const isCorrect = option === currentQuestion.correctAnswer;
              let buttonStyle = "bg-primary hover:bg-primary/90 text-primary-foreground";

              if (showFeedback) {
                if (isSelected) {
                  buttonStyle = isAnswerCorrect ? "bg-accent hover:bg-accent/90 text-accent-foreground" : "bg-destructive hover:bg-destructive/90 text-destructive-foreground";
                } else if (isCorrect) {
                  buttonStyle = "border-2 border-accent bg-card hover:bg-accent/10 text-accent";
                } else {
                  buttonStyle = "bg-secondary hover:bg-secondary/80 text-secondary-foreground opacity-70";
                }
              } else if (isSelected) {
                 buttonStyle = "bg-accent/80 hover:bg-accent/70 text-accent-foreground ring-2 ring-accent";
              }


              return (
                <Button
                  key={option}
                  onClick={() => handleAnswer(option)}
                  disabled={showFeedback}
                  className={cn("w-full h-auto min-h-[3rem] py-3 text-base justify-start text-left whitespace-normal transition-all duration-300 ease-in-out transform active:scale-95", buttonStyle)}
                  variant={showFeedback || isSelected ? "default" : "outline"}
                >
                  {option}
                </Button>
              );
            })}
          </CardContent>
          {showFeedback && (
            <CardFooter className="flex flex-col items-center pt-4 space-y-4">
              <p className={`text-xl font-semibold ${isAnswerCorrect ? "text-accent" : "text-destructive"}`}>
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
