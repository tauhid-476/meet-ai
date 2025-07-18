

import { getQueryClient, trpc } from '@/trpc/server'
import { dehydrate, HydrationBoundary } from '@tanstack/react-query'
import { ErrorBoundary } from 'react-error-boundary'
import { Suspense } from 'react'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import type { SearchParams } from 'nuqs'
import {
    AgentsView,
    AgentsErrorState,
    AgentsViewLoading
} from '@/modules/agents/ui/views/agents-view'
import { AgentsListHeader } from '@/modules/agents/ui/components/agents-list-header'
import { loadSearchParams } from '@/modules/agents/params'


interface Props {
    searchParams: Promise<SearchParams>
}

//this is a server components , we can fetch the data over here 
const Page = async ({ searchParams }: Props) => {
    const filters = await loadSearchParams(searchParams)

    const session = await auth.api.getSession({
        headers: await headers()
    })

    if (!session) {
        redirect("/sign-up")
    }

    // prefetch the agents data
    const queryClient = getQueryClient()
    void queryClient.prefetchQuery(trpc.agents.getMany.queryOptions({
        ...filters
    }))

    return (
        <>
            <AgentsListHeader />
            <HydrationBoundary state={dehydrate(queryClient)}>
                <Suspense fallback={<AgentsViewLoading />}>
                    <ErrorBoundary fallback={<AgentsErrorState />}>
                        <AgentsView />
                    </ErrorBoundary>
                </Suspense>
            </HydrationBoundary>
        </>
    )
}

export default Page