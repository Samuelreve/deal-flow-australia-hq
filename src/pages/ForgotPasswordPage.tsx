
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const ForgotPasswordPage = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <Card className="w-[400px]">
        <CardHeader>
          <CardTitle className="text-center">Reset Password</CardTitle>
          <CardDescription className="text-center">
            Enter your email to receive a password reset link
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" placeholder="Email" type="email" />
              </div>
              <Button className="w-full" type="submit">
                Send Reset Link
              </Button>
            </div>
          </form>
          <div className="mt-4 text-center text-sm">
            <Link to="/login" className="text-primary hover:underline">
              Back to login
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ForgotPasswordPage;
