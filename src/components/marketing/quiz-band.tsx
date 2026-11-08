"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Question = { id: string; question: string; answers: string[]; position: number };
type Outcome = { id: string; first: number; second: number; styles: string[] };

const fallbackQuestions: Question[] = [
  { id: "one", question: "What feels most like you?", answers: ["Understated and enduring", "Romantic and expressive", "Distinctly modern"], position: 0 },
  { id: "two", question: "How does your ring need to live?", answers: ["Quietly every day", "Ready for anything", "Made for a little attention"], position: 1 },
  { id: "three", question: "Choose your kind of sparkle", answers: ["A single clear point", "A halo of light", "A considered balance"], position: 2 }
];

export function QuizBand({ preview = false }: { preview?: boolean }) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [answerIndexes, setAnswerIndexes] = useState<number[]>([]);
  const [questions, setQuestions] = useState(fallbackQuestions);
  const [outcomes, setOutcomes] = useState<Outcome[]>([]);
  const [published, setPublished] = useState(true);

  useEffect(() => {
    fetch("/api/storefront/quiz")
      .then(response => response.ok ? response.json() : null)
      .then(data => {
        if (data?.questions?.length) setQuestions(data.questions as Question[]);
        if (Array.isArray(data?.outcomes)) setOutcomes(data.outcomes as Outcome[]);
        if (typeof data?.published === "boolean") setPublished(data.published);
      })
      .catch(() => undefined);
  }, []);

  if (!preview && !published) return null;
  const done = step === questions.length;
  const choose = (answer: string, index: number) => { setAnswers(current => [...current, answer]); setAnswerIndexes(current => [...current, index]); setStep(current => current + 1); };
  const matched = outcomes.find(outcome => outcome.first === answerIndexes[0] && outcome.second === answerIndexes[1]);
  const recommendations = matched?.styles?.length ? matched.styles.slice(0, 2) : answers[0]?.includes("Romantic") ? ["Halo", "Toi et Moi"] : answers[0]?.toLowerCase().includes("modern") ? ["Bezel", "East-West"] : ["Solitaire", "Bezel"];
  const restart = () => { setStep(0); setAnswers([]); setAnswerIndexes([]); };

  return <section className="quiz-band section"><div className="shell"><div className="quiz-card">{!done ? <><p className="eyebrow">Find your setting</p><h2>{questions[step].question}</h2><div className="quiz-options">{questions[step].answers.map((answer, index) => <button className="quiz-option" onClick={() => choose(answer, index)} key={answer}>{answer}</button>)}</div><p className="quiz-progress">Question {step + 1} of {questions.length}</p></> : <div className="quiz-result"><p className="eyebrow">Your considered matches</p><h2>{recommendations.join(" · ")}</h2><p className="lede">Two setting directions selected from the live outcome matrix, shaped by the answers you shared.</p><Link className="button" href={`/collections/engagement?setting=${encodeURIComponent(recommendations[0])}`}>Explore your settings</Link><button className="clear-filters" onClick={restart}>Start again</button></div>}</div></div></section>;
}
