
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const LoginPage = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <Card className="w-[400px]">
        <CardHeader>
          <CardTitle className="text-center">Login</CardTitle>
        </CardHeader>
        <CardContent>
          <form>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" placeholder="Email" type="email" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" placeholder="Password" type="password" />
              </div>
              <Button className="w-full" type="submit">
                Login
              </Button>
            </div>
          </form>
          <div className="mt-4 text-center text-sm">
            <Link to="/forgot-password" className="text-primary hover:underline">
              Forgot password?
            </Link>
          </div>
          <div className="mt-4 text-center text-sm">
            Don't have an account?{" "}
            <Link to="/register" className="text-primary hover:underline">
              Create an account
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginPage;
