import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useSearchParams } from "react-router-dom";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { REGEXP_ONLY_DIGITS } from "input-otp";
import { toast } from "sonner";

export default function VerifyOTP() {
  const [searchParams] = useSearchParams();
  const email = searchParams.get("email");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!email) {
      setError("There's nothing here, go back and register a real account");
    }
  }, [email]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setError("");
    setLoading(true);

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/auths/verify-otp`,
        { email, otp },
        { withCredentials: true }
      );

      if (response.status === 200) {
        navigate("/login");
      }
    } catch (err: any) {
      console.log(err);
      setError(err.response?.data?.message || "Invalid OTP.");
      toast.error("Invalid OTP, try again or resend the OTP!");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (!email) return;

    setResendLoading(true);
    setError("");

    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL}/auths/send-otp`,
        { email },
        { withCredentials: true }
      );
      toast.info("OTP resent successfully!");
    } catch (err: any) {
      console.log(err);
      setError(err.response?.data?.message || "Failed to resend OTP.");
      toast.error("Failed to resend OTP.");
    } finally {
      setResendLoading(false);
    }
  };

  if (!email) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-200 p-6">
        <p className="text-xl text-gray-700 font-semibold">{error}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col justify-center items-center min-h-screen bg-gray-200 p-6">
      <Card className="w-96 shadow-lg rounded-lg p-4 bg-gray-100">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">Verify OTP</CardTitle>
          <p className="text-center text-sm text-gray-500">Enter the 6-digit code sent to <b>{email}</b></p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6 flex flex-col items-center">
            <InputOTP
              maxLength={6}
              value={otp}
              onChange={setOtp}
              pattern={REGEXP_ONLY_DIGITS}
              className="flex justify-center"
            >
              <InputOTPGroup className="flex space-x-2">
                {Array.from({ length: 6 }).map((_, index) => (
                  <InputOTPSlot
                    key={index}
                    index={index}
                    className={`w-12 h-12 text-xl text-center border rounded-md focus:ring-2 ${error ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-blue-500"
                      }`}
                  />
                ))}
              </InputOTPGroup>
            </InputOTP>

            <Button type="submit" className="w-full" disabled={loading || otp.length !== 6}>
              {loading ? "Verifying..." : "Verify OTP"}
            </Button>

            <div className="flex flex-col w-full items-center gap-1 mt-2">
              <p className="text-sm text-center">Having trouble? Try resending the OTP!</p>
              <Button type="button" variant="outline" className="w-full" onClick={handleResendOTP} disabled={resendLoading}>
                {resendLoading ? "Resending..." : "Resend OTP"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
