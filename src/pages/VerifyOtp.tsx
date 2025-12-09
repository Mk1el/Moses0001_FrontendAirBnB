import {TextField, Box, Button, Container, Typography } from "@mui/material";
import Grid from "@mui/material/Grid";
import { useRef, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import { useNavigate, Link as RouterLink} from "react-router-dom";
import { getForgotEmail } from "../utils/forgotSession";
import axiosClient from "../api/axiosClient";
export default function VerifyOtp() {
    const navigate = useNavigate();
    const savedEmail = getForgotEmail();
    const [otp, setOtp] = useState<string[]>(["","","","","",""]);
    const [loading, setLoading] = useState(false);
    const inputsRef = useRef<Array<HTMLInputElement | null>>([]);
    if(!savedEmail){
        navigate("/forgot-passowrd")
    }
    const handleChange = (index: number, value: string)=>{
        if (!/^\d?$/.test(value)) return;
        const next = [...otp];
        next[index] = value;
        setOtp(next);
        if(value && index <5){
            inputsRef.current[index+1]?.focus();
        }
    };
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement|HTMLDivElement>, index: number) => {
        if(e.key === "Backspace" && !otp[index]&& index >0 ){
            const prev = inputsRef.current[index - 1];
            prev?.focus();
        }
    }
    
    const handleSubmit = async (e: React.FormEvent) =>{
        e.preventDefault();
        const code = otp.join("");
        if(code.length !== 6){
            toast.error("Please enter the six digit code!");
            return;
        }
        setLoading(true);
        try{
            await axiosClient.post("/auth/verify-otp", {email: savedEmail, otp: code});
            toast.success("OTP verified!");
            navigate("/reset-password");
        }catch(err: any){
            console.error("Verify OTP error:", err);
        }finally{setLoading(false)}
    }
     return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <Toaster />

      <div className="p-8 bg-white rounded shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold text-center mb-2">Verify OTP</h1>
        <p className="text-center mb-4 text-gray-600">
          Enter the 6-digit code sent to <strong>{savedEmail}</strong>
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex justify-center gap-2">
            {otp.map((digit, i) => (
              <input
                key={i}
                maxLength={1}
                className="w-12 h-12 text-center border rounded text-xl"
                value={digit}
                onChange={(e) => handleChange(i, e.target.value)}
                onKeyDown={(e) => handleKeyDown(e, i)}
                ref={(el) => {inputsRef.current[i] = el}}
              />
            ))}
          </div>

          <button
            type="submit"
            className="w-full p-3 bg-blue-600 text-white rounded hover:bg-blue-700"
            disabled={loading}
          >
            {loading ? "Verifying..." : "Verify OTP"}
          </button>

          <p className="text-center">
            <a href="/forgot-password" className="text-orange-600 hover:underline">
              Use a different email
            </a>
          </p>
        </form>
      </div>
    </div>
  );
}