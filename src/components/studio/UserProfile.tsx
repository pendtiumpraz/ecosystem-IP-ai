'use client';

import { useState } from 'react';
import { User, ChevronDown, LogOut, Settings, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface UserProfileProps {
  name?: string;
  email?: string;
  avatar?: string;
  tier?: string;
  credits?: number;
  onLogout?: () => void;
  onSettings?: () => void;
  onBilling?: () => void;
}

export function UserProfile({ 
  name = 'User', 
  email,
  avatar,
  tier = 'Free',
  credits,
  onLogout,
  onSettings,
  onBilling
}: UserProfileProps) {
  const initials = name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="gap-2">
          {avatar ? (
            <img 
              src={avatar} 
              alt={name} 
              className="h-8 w-8 rounded-full object-cover"
            />
          ) : (
            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white text-sm font-medium">
              {initials}
            </div>
          )}
          <span className="hidden sm:inline text-sm font-medium">{name}</span>
          <ChevronDown className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{name}</p>
            {email && (
              <p className="text-xs leading-none text-muted-foreground">{email}</p>
            )}
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {tier !== undefined && (
          <>
            <DropdownMenuItem className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <CreditCard className="h-4 w-4" />
                Plan
              </span>
              <span className="font-medium capitalize">{tier}</span>
            </DropdownMenuItem>
            {credits !== undefined && (
              <DropdownMenuItem className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4" />
                  Credits
                </span>
                <span className="font-medium">{credits}</span>
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
          </>
        )}
        
        {onSettings && (
          <DropdownMenuItem onClick={onSettings}>
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </DropdownMenuItem>
        )}
        {onBilling && (
          <DropdownMenuItem onClick={onBilling}>
            <CreditCard className="mr-2 h-4 w-4" />
            Billing
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        {onLogout && (
          <DropdownMenuItem onClick={onLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
