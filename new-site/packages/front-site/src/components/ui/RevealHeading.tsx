export type RevealWord = {
  text: string;
  gradient?: boolean;
};

type Props = {
  words: RevealWord[];
  plainClass?: string;
  gradientClass?: string;
  className?: string;
  triggerStart?: string;
};

export default function RevealHeading({ words, plainClass = '', gradientClass = '', className = '' }: Props) {
  return (
    <h2 className={className}>
      {words.map((word, i) => (
        <span key={i}>
          {i > 0 && ' '}
          <span className={`font-extrabold ${word.gradient ? `bg-clip-text text-transparent ${gradientClass}` : plainClass}`}>
            {word.text}
          </span>
        </span>
      ))}
    </h2>
  );
}
