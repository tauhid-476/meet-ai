"use client"


import { useState } from "react"
import { PlusIcon, XCircleIcon } from "lucide-react"

import { Button } from "@/components/ui/button"

import { NewMeetingDialog } from "./new-meeting-dialog"
import { MeetingsSearchFilter } from "./meetings-search-fiter"
import { StatusFilter } from "./status-filter"
import { AgentIdfilter } from "./agent-id-filter"
import { useMeetingsFilters } from "../../hooks/use-meetings-filters"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { DEFAULT_PAGE } from "@/constants"

export const MeetingsListHeader = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [filters, setFilters] = useMeetingsFilters();

  const isAnyFiltersModified =
    !!filters.status ||
    !!filters.agentId ||
    !!filters.search

  const onClearFilters = () => {
    setFilters({
      status: null,
      agentId: "",
      search: "",
      page: DEFAULT_PAGE
    })
  }

  return (
    <>
      <NewMeetingDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
      />
      <div className="py-4 px-4 md:px-8 flex flex-col gap-y-4">
        <div className="flex items-center justify-between">
          <h5 className="font-medium text-xl">My Meetings</h5>
          <Button
            onClick={() => setIsDialogOpen(true)}
          >
            <PlusIcon />
            New Meeting
          </Button>
        </div>
        <ScrollArea>
          <div className="flex items-center gap-x-2 p-1">
            <MeetingsSearchFilter />
            <StatusFilter />
            <AgentIdfilter />
            {isAnyFiltersModified && (
              <Button
                variant="outline"
                onClick={onClearFilters}
              >
                <XCircleIcon />
                Clear
              </Button>
            )}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </div>
    </>
  )
}