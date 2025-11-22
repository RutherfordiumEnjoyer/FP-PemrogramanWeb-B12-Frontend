import { Button } from "@/components/ui/button";
import { useNavigate, useParams } from "react-router-dom";
import api from "@/api/axios";
import { useState, useEffect } from "react";
import * as Progress from "@radix-ui/react-progress";
import { Typography } from "@/components/ui/typography";
import { ArrowLeft, Trophy } from "lucide-react";

interface Answer {
  is_correct: boolean;
  answer_text: string;
}

interface Question {
  question_text: string;
  question_image: string | null;
  answers: Answer[];
}

interface QuizData {
  id: string;
  name: string;
  description: string;
  thumbnail_image: string | null;
  is_published: boolean;
  game_json: {
    questions: Question[];
    score_per_question: number;
    is_answer_randomized: boolean;
    is_question_randomized: boolean;
  };
}

function Quiz() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [quiz, setQuiz] = useState<QuizData | null>(null);

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [userAnswers, setUserAnswers] = useState<
    { question: string; answer: string; isCorrect: boolean }[]
  >([]);
  const [finished, setFinished] = useState(false);

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/api/game/game-type/quiz/${id}`);
        setQuiz(response.data.data);
      } catch (err) {
        setError("Failed to load quiz.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchQuiz();
  }, [id]);

  if (!quiz) return null;
  const questions = quiz.game_json.questions;
  const isLastQuestion = currentQuestion === questions.length - 1;
  const isFirstQuestion = currentQuestion === 0;
  const progress = ((currentQuestion + 1) / questions.length) * 100;

  const handleNext = () => {
    if (!selectedAnswer) return;

    const correctAnswer = questions[currentQuestion].answers.find(
      (a) => a.is_correct,
    )?.answer_text;
    setUserAnswers((prev) => [
      ...prev,
      {
        question: questions[currentQuestion].question_text,
        answer: selectedAnswer,
        isCorrect: selectedAnswer === correctAnswer,
      },
    ]);

    if (!isLastQuestion) {
      setCurrentQuestion((prev) => prev + 1);
      setSelectedAnswer(null);
    } else {
      setFinished(true);
    }
  };

  const score = userAnswers.filter((a) => a.isCorrect).length;

  if (loading) {
    return (
      <div className="w-full h-screen flex justify-center items-center">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-gray-300 border-t-black"></div>
      </div>
    );
  }

  if (error || !quiz) {
    return (
      <div className="w-full h-screen flex flex-col justify-center items-center gap-4">
        <Typography variant="p">{error ?? "Quiz not found"}</Typography>
        <Button onClick={() => navigate(-1)}>Go Back</Button>
      </div>
    );
  }

  const currentQ = questions[currentQuestion];

  if (finished) {
    const percentage = Math.round((score / questions.length) * 100);
    const starCount = (score / questions.length) * 5; // bisa pecahan, misal 2.5
    const fullStars = Math.floor(starCount);
    const halfStar = starCount - fullStars >= 0.5;
    const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);

    // Tentukan feedback teks
    let feedbackText = "Good Effort!";
    if (percentage === 100) feedbackText = "Perfect Score! Great Job!";
    else if (percentage >= 80) feedbackText = "Great Job!";
    else if (percentage >= 50) feedbackText = "Good Effort!";
    else feedbackText = "Better Luck Next Time!";

    return (
      <div className="w-full h-screen flex justify-center items-center">
        <div className="bg-white rounded-xl p-10 text-center max-w-sm w-full space-y-6 shadow-lg">
          <Trophy className="mx-auto text-yellow-400" size={72} />
          <Typography variant="h4">{feedbackText}</Typography>
          <Typography variant="h2">
            {score}/{questions.length}
          </Typography>
          <Typography variant="p">{percentage}%</Typography>
          <div className="flex justify-center gap-1 text-yellow-400 text-xl">
            {Array.from({ length: fullStars }).map((_, idx) => (
              <span key={`full-${idx}`}>★</span>
            ))}
            {halfStar && <span>☆</span>}
            {Array.from({ length: emptyStars }).map((_, idx) => (
              <span key={`empty-${idx}`} className="text-gray-300">
                ★
              </span>
            ))}
          </div>
          <Button
            className="w-full"
            onClick={() => {
              setFinished(false);
              setCurrentQuestion(0);
              setSelectedAnswer(null);
              setUserAnswers([]);
            }}
          >
            Play Again
          </Button>
          <Button
            variant="outline"
            className="w-full"
            onClick={() => navigate("/my-projects")}
          >
            Exit
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-slate-50 min-h-screen flex flex-col">
      <div className="bg-white h-fit w-full flex justify-between items-center px-8 py-4 shadow-sm">
        <div>
          <Button
            size="sm"
            variant="ghost"
            className="hidden md:flex"
            onClick={() => navigate("/my-projects")}
          >
            <ArrowLeft /> Exit Game
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="block md:hidden"
            onClick={() => navigate("/my-projects")}
          >
            <ArrowLeft />
          </Button>
        </div>
        <div>
          <Typography variant="p">Time Left: 20s</Typography>
        </div>
      </div>
      <div className="w-full h-full p-8 flex justify-center items-center">
        <div className="max-w-3xl w-full space-y-6">
          <div className="flex w-full mb-4 justify-between items-center">
            <Typography variant="p">
              Question {currentQuestion + 1} of {questions.length}
            </Typography>
            <Typography variant="p">{Math.round(progress)}%</Typography>
          </div>
          <Progress.Root
            className="w-full h-3 bg-slate-300 rounded overflow-hidden"
            value={progress}
          >
            <Progress.Indicator
              className="h-full bg-slate-800 transition-all"
              style={{ width: `${progress}%` }}
            />
          </Progress.Root>

          <div className="bg-white w-full p-8 text-center space-y-6 rounded-xl border shadow-sm">
            <Typography variant="p">{currentQ.question_text}</Typography>

            {currentQ.question_image && (
              <img
                src={`${import.meta.env.VITE_API_URL}/${currentQ.question_image}`}
                alt="Question"
                className="mx-auto max-h-64 object-contain rounded-md"
              />
            )}

            <div className="grid grid-cols-1 gap-4">
              {currentQ.answers.map((opt, idx) => {
                const letter = ["A", "B", "C", "D"][idx];
                const isSelected = selectedAnswer === opt.answer_text;
                return (
                  <Button
                    key={idx}
                    variant="outline"
                    className={`w-full justify-start p-7 gap-2 transition ${
                      isSelected ? "bg-primary text-white" : ""
                    }`}
                    onClick={() => setSelectedAnswer(opt.answer_text)}
                  >
                    <span
                      className={`w-7 h-7 rounded-full flex items-center justify-center ${
                        isSelected
                          ? "bg-white text-primary"
                          : "bg-gray-100 text-black"
                      }`}
                    >
                      {letter}
                    </span>
                    <span>{opt.answer_text}</span>
                  </Button>
                );
              })}
            </div>
            <div
              className={`mt-6 flex w-full ${
                isFirstQuestion ? "justify-end" : "justify-between"
              }`}
            >
              {!isFirstQuestion && (
                <Button
                  onClick={() => {
                    setCurrentQuestion((prev) => prev - 1);
                    setSelectedAnswer(null);
                  }}
                >
                  <ArrowLeft className="mr-1" /> Previous
                </Button>
              )}
              <Button disabled={!selectedAnswer} onClick={handleNext}>
                {isLastQuestion ? "Submit Quiz" : "Next Question"}
                {!isLastQuestion && <ArrowLeft className="rotate-180 ml-1" />}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Quiz;
