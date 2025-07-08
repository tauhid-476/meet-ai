"use client";

import { ErrorState } from "@/components/error-state";
import { LoadingState } from "@/components/loading-state";
import { useTRPC } from "@/trpc/client";
import { useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { MeetingIdViewHeader } from "../components/meeting-id-view-header";
import { useRouter } from "next/navigation";
import { useConfirm } from "@/hooks/use-confirm";
import { useState } from "react";

import { UpdateMeetingDialog } from "../components/update-meeting-dialog";
import { UpcomingState } from "../components/upcoming-state";
import { ActiveState } from "../components/active-state";
import { CancelledState } from "../components/cancelled-state";
import { ProcessingState } from "../components/processing-state";
import { CompletedState } from "../components/completed-state";



interface Props {
    meetingId: string;
}

export const MeetingIdView = ({ meetingId }: Props) => {
    const [updateMeetingDialogOpen, setUpdateMeetingDialogOpen] = useState(false);


    const queryClient = useQueryClient();
    const trpc = useTRPC();
    const router = useRouter();

    const [RemoveConfirmation, confirmRemove] = useConfirm(
        "Remove Meeting",
        "Are you sure you want to remove this meeting? This action cannot be undone."
    )

    const { data } = useSuspenseQuery(
        trpc.meetings.getOne.queryOptions({ id: meetingId })
    )

    const removeMeeting = useMutation(
        trpc.meetings.remove.mutationOptions({
            onSuccess: async () => {
                await queryClient.invalidateQueries(trpc.meetings.getMany.queryOptions({}));
                await queryClient.invalidateQueries(
                    trpc.premium.getFreeUsage.queryOptions()
                );
                router.push("/meetings");
            }
        })
    )

    const handleRemoveMeeting = async () => {
        const ok = await confirmRemove();
        if (!ok) return;
        await removeMeeting.mutate({ id: meetingId });
    }

    const isActive = data.status === "active"
    const isUpcoming = data.status === "upcoming"
    const isCancelled = data.status === "cancelled"
    const isCompleted = data.status === "completed"
    const isProcessing = data.status === "processing"


    return (
        <>
            <UpdateMeetingDialog
                open={updateMeetingDialogOpen}
                onOpenChange={setUpdateMeetingDialogOpen}
                initialValues={data}
            />
            <RemoveConfirmation />
            <div className="flex-1 py-4 px-4 md:px-8 flex flex-col gap-y-4">
                <MeetingIdViewHeader
                    meetingId={data.id}
                    meetingName={data.name}
                    onEdit={() => { setUpdateMeetingDialogOpen(true) }}
                    onRemove={handleRemoveMeeting}
                />
                {isCancelled && <CancelledState />}
                {isCompleted && <CompletedState data={data} />}
                {isActive && (
                    <ActiveState
                        meetingId={data.id}
                    />
                )}
                {isProcessing && <ProcessingState />}
                {isUpcoming && (
                    <UpcomingState
                        meetingId={data.id}
                    />
                )}
            </div>
        </>
    )
}


export const MeetingIdViewLoading = () => {
    return (
        <LoadingState
            title="Loading Meeting"
            description="This may take few seconds"
        />)
}

export const MeetingIdViewError = () => {
    return (
        <ErrorState
            title="Error Loading meeting"
            description="Please try again later."
        />
    )
}