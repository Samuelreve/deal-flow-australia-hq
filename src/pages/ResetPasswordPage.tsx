
import React from "react";
import { Link, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const ResetPasswordPage = () => {
  const { token } = useParams();

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <Card className="w-[400px]">
        <CardHeader>
          <CardTitle className="text-center">Create New Password</CardTitle>
          <CardDescription className="text-center">
            Enter your new password below
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">New Password</Label>
                <Input id="password" placeholder="New Password" type="password" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input id="confirmPassword" placeholder="Confirm Password" type="password" />
              </div>
              <Button className="w-full" type="submit">
                Reset Password
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

export default ResetPasswordPage;
