import { useState } from 'preact/compat';

export type QuestionProps = {
  q: string;
  answers: string[];
  rightAnswer: number;
  answerDescription: string;
};

export default function Question({ q, answers, rightAnswer, answerDescription }: QuestionProps) {
  const [answer, setAnswer] = useState<number | null>(null);

  return (
    <div className="">
      <div className="mb-4">{q}</div>

      {answers.map((a, idx) => {
        return (
          <button
            className={`

              border border-rose-450 py-2 px-4 rounded mr-3 border-opacity-75
              ${idx === answer ? 'bg-rose-450' : ''}
              ${
                answer !== null && answer !== rightAnswer && idx === rightAnswer ? 'ring-rose-450 ring-2' : ''
              }
            `}
            key={idx}
            disabled={answer !== null}
            onClick={() => setAnswer((prev) => (prev === null ? idx : prev))}
          >
            {a}
          </button>
        );
      })}

      {answer !== null ? (
        <div className="mt-4">{answer === rightAnswer ? 'Correct!' : 'Bummer :('}</div>
      ) : null}
      {answer !== null && <div className="mt-4 bg-zinc-800 py-1 px-2 rounded">{answerDescription}</div>}
    </div>
  );
}
