"use client"


import { ErrorState } from '@/components/error-state'
import { LoadingState } from '@/components/loading-state'
import { EmptyState } from '@/components/empty-state'
import { useTRPC } from '@/trpc/client'
import { useSuspenseQuery } from '@tanstack/react-query'
import React from 'react'
import { DataTable } from '@/components/data-table'
import { columns } from '../components/columns'
import { useAgentsFilters } from '../../hooks/use-agents-filters'
import { DataPagination } from '../components/data-pagination'
import { useRouter } from 'next/navigation'


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
    const [filters, setFilters] = useAgentsFilters()
    const router = useRouter()
    const { data } = useSuspenseQuery(trpc.agents.getMany.queryOptions({
        ...filters
    }));

    return (
        <div className='flex-1 pb-4 px-4 md:px-8 flex flex-col gap-y-4'>
            <DataTable 
            columns={columns} 
            data={data.items}
            onRowClick={(row) => router.push(`/agents/${row.id}`)}
            />
            <DataPagination
             page={filters.page}
             totalPages={data.totalPages}
             onPageChange={(page) => setFilters({ page })}
            />
            {data.items.length === 0 && (
                <EmptyState
                    title="Create Your First Agent"
                    description="Create an agent to join your meeting. Each agent will follow your instructions and can interact with participants during the call."
                />
            )}
        </div>
    )
}

export const AgentsViewLoading = () => {
    return (
        <LoadingState
            title="Loading Agents"
            description="This may take few seconds"
        />)
}

export const AgentsErrorState = () => {
    return (
        <ErrorState
            title="Error Loading Agents"
            description="Something went wrong"
        />
    )
}