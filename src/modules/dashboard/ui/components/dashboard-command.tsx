import { Dispatch, SetStateAction } from 'react';
import {  
  CommandInput, 
  CommandList, 
  CommandItem, 
  CommandResponsiveDialog
} from '@/components/ui/command'; // Adjust import path as needed

interface Props {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
}

const DashboardCommand = ({ open, setOpen }: Props) => {
  return (
    <CommandResponsiveDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Find a meeting or agent" />
      <CommandList>
        <CommandItem>
          Test
        </CommandItem>
      </CommandList>
    </CommandResponsiveDialog>
  );
};

export default DashboardCommand;