

import { getQueryClient, trpc } from '@/trpc/server'
import { dehydrate, HydrationBoundary } from '@tanstack/react-query'
import { ErrorBoundary } from 'react-error-boundary'
import { Suspense } from 'react'
import {
    AgentsView,
    AgentsErrorState,
    AgentsViewLoading
} from '@/modules/agents/ui/views/agents-view'


//this is a server components , we can fetch the data over here 
const Page = async () => {
    // prefetch the agents data
    const queryClient = getQueryClient()
    void queryClient.prefetchQuery(trpc.agents.getMany.queryOptions())

    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <Suspense fallback={<AgentsViewLoading />}>
                <ErrorBoundary fallback={<AgentsErrorState />}>
                    <AgentsView />
                </ErrorBoundary>
            </Suspense>
        </HydrationBoundary>
    )
}

export default Page