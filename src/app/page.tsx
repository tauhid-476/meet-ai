"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { authClient } from "@/lib/auth-client";


export default function Home() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { data: session } = authClient.useSession()

  const onSubmit = () => {
    authClient.signUp.email({
      email,
      password,
      name
    }, {
      onSuccess: () => {
        window.alert("User created successfully!");
      },
      onError: () => {
        window.alert("Failed to create user. Please try again.");
      }
    })
  }

  const onLogin = () => {
    authClient.signIn.email({
      email,
      password
    }, {
      onSuccess: () => {
        window.alert("User created successfully!");
      },
      onError: () => {
        window.alert("Failed to create user. Please try again.");
      }
    })
  }


  if (session) {
    return (
      <div>
        <h1 className="text-2xl font-bold">Welcome, {session.user.name}!</h1>
        <p className="mt-2">You are logged in with email: {session.user.email}</p>
        <Button onClick={() => authClient.signOut()}>Sign Out</Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-y-10">
      <div className="p-4 flex flex-col gap-y-4">
        <Input
          placeholder="Enter your name"
          value={name}
          onChange={(e) => setName(e.target.value)} />
        <Input
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)} />
        <Input
          placeholder="Enter your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)} />

        <Button onClick={onSubmit} >
          Create User
        </Button>
      </div>


      <div className="p-4 flex flex-col gap-y-4">
        <Input
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)} />
        <Input
          placeholder="Enter your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)} />

        <Button onClick={onLogin} >
          Login
        </Button>


      </div>
    </div>
  )
}
