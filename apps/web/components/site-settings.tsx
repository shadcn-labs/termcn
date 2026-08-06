"use client";

import { SettingsIcon } from "lucide-react";
import { useState } from "react";

import { HapticsSwitcher } from "@/components/haptics-switcher";
import { ModeSwitcher } from "@/components/mode-switcher";
import { SoundSwitcher } from "@/components/sound-switcher";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Kbd } from "@/components/ui/kbd";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useHapticsToggle } from "@/hooks/use-haptic-toggle";
import { useIsMobile } from "@/hooks/use-mobile";
import { useSoundToggle } from "@/hooks/use-sound-toggle";
import { useThemeToggle } from "@/hooks/use-theme-toggle";

export const SiteSettings = () => {
  const [isOpen, setIsOpen] = useState(false);
  const isMobile = useIsMobile();

  // Hotkeys must stay mounted outside the popover content.
  useThemeToggle();
  useSoundToggle();
  useHapticsToggle();

  const trigger = (
    <Button
      variant="ghost"
      size="icon"
      className="group/settings extend-touch-target size-8"
      aria-label="Settings"
    >
      <SettingsIcon />
    </Button>
  );

  const content = (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="w-12 text-sm">Theme</span>
          {!isMobile && <Kbd>D</Kbd>}
        </div>
        <ModeSwitcher />
      </div>
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="w-12 text-sm">Sound</span>
          {!isMobile && <Kbd>S</Kbd>}
        </div>
        <SoundSwitcher />
      </div>
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="w-12 text-sm">Haptics</span>
          {!isMobile && <Kbd>H</Kbd>}
        </div>
        <HapticsSwitcher />
      </div>
    </div>
  );

  return (
    <>
      {isMobile ? (
        <Drawer open={isOpen} onOpenChange={setIsOpen} sounds>
          <DrawerTrigger asChild>{trigger}</DrawerTrigger>
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle>Settings</DrawerTitle>
              <DrawerDescription>Manage site preferences</DrawerDescription>
            </DrawerHeader>
            <div className="px-4">{content}</div>
            <DrawerFooter>
              <DrawerClose asChild>
                <Button size="sm">Done</Button>
              </DrawerClose>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
      ) : (
        <Popover open={isOpen} onOpenChange={setIsOpen} sounds>
          <PopoverTrigger asChild>{trigger}</PopoverTrigger>
          <PopoverContent
            align="end"
            className="w-56 p-2 data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-100 data-[state=open]:fade-in-0 data-[state=open]:zoom-in-100 dark:bg-black"
            onOpenAutoFocus={(event) => event.preventDefault()}
          >
            {content}
          </PopoverContent>
        </Popover>
      )}
    </>
  );
};
