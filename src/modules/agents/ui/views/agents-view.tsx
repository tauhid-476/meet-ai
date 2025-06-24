"use client"


import { ErrorState } from '@/components/error-state'
import { LoadingState } from '@/components/loading-state'
import { useTRPC } from '@/trpc/client'
import { useSuspenseQuery } from '@tanstack/react-query'
import React from 'react'


export const AgentsView = () => {
    const trpc = useTRPC()
    // const { data, isLoading, isError } = useQuery(trpc.agents.getMany.queryOptions());
    //since we are prefetching the data in the server component , we use useSuspenseQuery instead of useQuery
    // no need of these , it's handled by server component
    // if (isLoading) {
    //     return (
    //         <LoadingState
    //             title="Loading Agents"
    //             description="This may take few seconds, please wait..."
    //         />)
    // }
    // if (isError) {
    //     return (
    //         <ErrorState
    //             title="Error Loading Agents"
    //             description="Please try again later"
    //         />
    //     )
    // }
    const { data } = useSuspenseQuery(trpc.agents.getMany.queryOptions());

    return (
        <div>
            {JSON.stringify(data, null, 2)}
        </div>
    )
}

export const AgentsViewLoading = () => {
    return (
        <LoadingState
            title="Loading Agents"
            description="This may take few seconds, please wait..."
        />)
}

export const AgentsErrorState = () => {
    return (
        <ErrorState
            title="Error Loading Agents"
            description="Please try again later"
        />
    )
}