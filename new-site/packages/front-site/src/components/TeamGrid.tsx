export default function TeamGrid({ data }: { data: Record<string, Record<string, string>> }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {Object.entries(data).map(([department, members]) => (
        <div key={department}>
          <h3 className="font-semibold text-lg mb-4 text-[#115079]">{department}</h3>
          <div className="space-y-2">
            {Object.entries(members).map(([name, role]) => (
              <div key={name} className="text-sm">
                <p className="font-medium">{name}</p>
                <p className="text-gray-600">{role}</p>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
