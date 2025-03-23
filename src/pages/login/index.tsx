import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/auths/login`,
        { email, password },
        { withCredentials: true }
      );

      if (response.status === 200) {
        navigate("/books");
      }
    } catch (err: any) {
      console.log(err);
      toast.error(err.response?.data?.message || "Login failed.");
    }
  };

  return (
    <div className="flex flex-col md:flex-row justify-center items-center min-h-screen bg-gray-200 space-y-6 md:space-y-0 md:space-x-20 p-6">
      {/* FilkomPedia Title and Description */}
      <div className="text-center md:text-left max-w-md">
        <h1 className="text-4xl font-bold">FilkomPedia</h1>
        <p className="mt-2 text-zinc-600">
          Good to see you back! Dive into new stories, revisit old favorites, and let every page take you on a new adventure. Your next great read is just a click away!
        </p>
      </div>

      {/* Login Form */}
      <Card className="w-96 shadow-lg rounded-lg p-4 bg-gray-100">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">Login</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="border border-gray-300"
              required
            />
            <Input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="border border-gray-300"
              minLength={8}
              required
            />
            <Button type="submit" className="w-full mb-6">Login</Button>
          </form>
          <p className="text-sm text-center mt-2">
            Don't have an account yet? <a href="/register" className="text-blue-500">Register here!</a>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
