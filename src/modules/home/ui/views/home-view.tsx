
"use client"
import { Button } from '@/components/ui/button'
import { authClient } from '@/lib/auth-client'
import { useRouter } from 'next/navigation'
import React from 'react'

const HomeView = () => {
    const { data: session } = authClient.useSession()
    const router = useRouter()

    if (!session) {
        return <div>Loading...</div>
    }

    return (
        <div>
            <h1 className="text-2xl font-bold">Welcome, {session?.user.name}!</h1>
            <p className="mt-2">You are logged in with email: {session?.user.email}</p>
            <Button
                onClick={() => authClient.signOut({
                    fetchOptions: {
                        onSuccess: () => router.push("/sign-in")
                    }
                })}
            >Sign Out
            </Button>
        </div>
    )
}

export default HomeView