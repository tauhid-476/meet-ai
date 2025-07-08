import { Dispatch, SetStateAction, useState } from 'react';
import {  
  CommandInput, 
  CommandList, 
  CommandItem, 
  CommandResponsiveDialog,
  CommandEmpty,
  CommandGroup
} from '@/components/ui/command'; // Adjust import path as needed
import { useRouter } from 'next/navigation';
import { useTRPC } from '@/trpc/client';
import { useQuery } from '@tanstack/react-query';
import GeneratedAvatar from '@/components/generated-avatar';

interface Props {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
}

const DashboardCommand = ({ open, setOpen }: Props) => {
  const router = useRouter()
  const [search, setSearch] = useState('');

  const trpc = useTRPC()
  const meetings = useQuery(
    trpc.meetings.getMany.queryOptions({
      search,
      pageSize: 100
    })
  )
  const agents = useQuery(
    trpc.agents.getMany.queryOptions({
      search,
      pageSize: 100
    })
  )

  return (
    <CommandResponsiveDialog shouldFilter={false} open={open} onOpenChange={setOpen}>
      <CommandInput
      value={search}
      onValueChange={setSearch}
      placeholder="Find a meeting or agent..." />
      <CommandList>
        <CommandGroup heading="Meetings">
          <CommandEmpty>
            <span className='text-muted-foreground text-sm'>No Meetings Found.</span>
          </CommandEmpty>
          {meetings.data?.items.map((meeting) => (
            <CommandItem
              key={meeting.id}
              onSelect={() => {
                router.push(`/meetings/${meeting.id}`);
                setOpen(false);
              }}
            >
              {meeting.name}
            </CommandItem>
          ))}
        </CommandGroup>
        <CommandGroup heading="Agents">
          <CommandEmpty>
            <span className='text-muted-foreground text-sm'>No Agents Found.</span>
          </CommandEmpty>
          {agents.data?.items.map((agent) => (
            <CommandItem
              key={agent.id}
              onSelect={() => {
                router.push(`/agents/${agent.id}`);
                setOpen(false);
              }}
            >
              <GeneratedAvatar seed={agent.name} variant="botttsNeutral" className='size-5' />
              {agent.name}
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandResponsiveDialog>
  );
};

export default DashboardCommand;