export const BookPlaceholder = ({ title, author }: { title: string; author: string }) => {
    return (
      <div className="w-32 h-48 flex-shrink-0 bg-gray-200 border border-gray-300 rounded-lg shadow-md flex items-center justify-center">
        <div className="text-center px-2">
          <div className="text-sm font-semibold text-gray-800">{title}</div>
          <div className="text-xs text-gray-600 mt-1">{author}</div>
        </div>
      </div>
    );
};

export const BookPagePlaceholder = ({ title, author }: { title: string; author: string }) => {
  return (
    <div className="w-full h-96 flex items-center justify-center bg-gray-200 border border-gray-300 rounded-lg">
      <div className="text-center px-2">
        <div className="text-sm font-semibold text-gray-800">{title}</div>
        <div className="text-xs text-gray-600 mt-1">{author}</div>
      </div>
    </div>
  );
};


export const BookCartPlaceholder = ({ title }: { title: string }) => {
  return (
    <div className="w-24 h-32 object-cover rounded-lg flex items-center justify-center bg-gray-200 border border-gray-300">
      <div className="text-center px-2">
        <div className="text-sm font-semibold text-gray-800">{title}</div>
      </div>
    </div>
  );
};
