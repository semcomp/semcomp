export default function FAQList({ faqs }: { faqs: Array<{ Q: string; A: string }> }) {
  return (
    <div>
      {faqs.map((f, i) => (
        <div key={i} className="mb-6">
          <h3 className="font-semibold">{f.Q}</h3>
          <p className="text-gray-600">{f.A}</p>
        </div>
      ))}
    </div>
  );
}
