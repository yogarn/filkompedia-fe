import { Link, useRouteError, isRouteErrorResponse } from "react-router-dom";

const ErrorPage = () => {
  const error = useRouteError();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center">
      <h1 className="text-4xl font-bold text-red-500">404 - Page Not Found</h1>
      <p className="mt-2 text-gray-600">
        {isRouteErrorResponse(error) && error.status === 404
          ? "The page you are looking for does not exist."
          : "An unexpected error occurred."}
      </p>
      <Link to="/" className="mt-4 px-4 py-2 bg-gray-500 text-white rounded">
        Go Home
      </Link>
    </div>
  );
};

export default ErrorPage;
