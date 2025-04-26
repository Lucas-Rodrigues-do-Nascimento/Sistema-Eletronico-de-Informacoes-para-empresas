'use client';

import * as React from 'react';
import { Command as CommandPrimitive } from 'cmdk';
import { cn } from '@/lib/utils';

const Command = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive>
>(({ className, ...props }, ref) => (
  <CommandPrimitive
    ref={ref}
    className={cn(
      'flex h-full w-full flex-col overflow-hidden rounded-md bg-white text-gray-800',
      className
    )}
    {...props}
  />
));
Command.displayName = CommandPrimitive.displayName;

export { Command, CommandPrimitive };
export { CommandInput, CommandList, CommandItem } from 'cmdk';
