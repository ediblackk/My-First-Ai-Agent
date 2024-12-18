import React from 'react';

const NewsComponent = () => {
  const newsItems = [
    { id: 1, title: "Dorinta implinita pentru Maria!", content: "Maria și-a dorit un laptop nou și iată că acum îl are!" },
    { id: 2, title: "Ultima dorință a lui Andrei", content: "Andrei a primit o bicicletă nouă pentru a explora orașul." },
    { id: 3, title: "Un vis devenit realitate", content: "Ioana a visat la o vacanță și a primit bilete pentru Grecia!" },
  ];

  return (
    <div className="bg-white p-8 rounded-lg shadow-lg max-w-md h-full flex flex-col">
      <h2 className="text-lg font-bold text-blue-600 mb-4 text-center">Ultimele Dorințe Împlinite</h2>
      <div className="flex-grow space-y-4">
        {newsItems.map((item) => (
          <div key={item.id} className="mb-4">
            <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
            <p className="text-gray-600">{item.content}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NewsComponent;
