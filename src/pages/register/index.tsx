import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

export default function LoginForm() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/auths/register`,
        { username, email, password },
      );

      if (response.status === 201) {
        await axios.post(`${import.meta.env.VITE_API_URL}/auths/send-otp`, { email });
        navigate(`/verify-otp?email=${encodeURIComponent(email)}`);
      }
    } catch (err: any) {
      console.log(err);
      toast.error(err.response?.data?.message || "Register failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col md:flex-row justify-center items-center min-h-screen bg-gray-200 space-y-10 md:space-y-0 md:space-x-20 p-6">
      {/* FilkomPedia Title and Description */}
      <div className="text-center md:text-left max-w-md">
        <h1 className="text-4xl font-bold">FilkomPedia</h1>
        <p className="mt-2 text-zinc-600">
          Become a part of our book-loving community. Discover, explore, and collect stories that inspire you. Your next adventure starts here!
        </p>
      </div>

      {/* Register Form */}
      <Card className="w-96 shadow-lg rounded-lg p-4 bg-gray-100">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">Register</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              maxLength={32}
              required
              className="border border-gray-300"
            />
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
              minLength={8}
              required
              className="border border-gray-300"
            />
            <Button type="submit" className="w-full mb-6" disabled={loading}>
              {loading ? "Registering..." : "Register"}
            </Button>
          </form>
          <p className="text-sm text-center mt-2">
            Already have an account? <a href="/login" className="text-blue-500">Login here!</a>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
