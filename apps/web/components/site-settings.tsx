"use client";

import { EllipsisVerticalIcon, LogInIcon } from "lucide-react";
import Link from "next/link";
import { useRef, useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";

import type { VibrateIconHandle } from "@/components/animated-icons/vibrate";
import { VibrateIcon } from "@/components/animated-icons/vibrate";
import type { Volume2IconHandle } from "@/components/animated-icons/volume-2";
import { Volume2Icon } from "@/components/animated-icons/volume-2";
import { Button, buttonVariants } from "@/components/ui/button";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Kbd } from "@/components/ui/kbd";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { ROUTES } from "@/constants/routes";
import { useFeedback } from "@/hooks/use-feedback";
import { useHapticsEnabled } from "@/hooks/use-haptic-toggle";
import { useIsMac } from "@/hooks/use-is-mac";
import { useSoundEnabled } from "@/hooks/use-sound-toggle";
import { cn } from "@/lib/utils";

export const HeaderMenu = () => {
  const desktopVolumeIconRef = useRef<Volume2IconHandle>(null);
  const desktopVibrateIconRef = useRef<VibrateIconHandle>(null);
  const [desktopOpen, setDesktopOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const isMac = useIsMac();
  const [soundEnabled, setSoundEnabled] = useSoundEnabled();
  const [hapticsEnabled, setHapticsEnabled] = useHapticsEnabled();
  const playClick = useFeedback({ sound: "click" });
  const playToggleOn = useFeedback({ sound: "toggleOn" });
  const playToggleOff = useFeedback({ sound: "toggleOff" });

  useHotkeys(
    "meta+s, ctrl+s",
    () => {
      setSoundEnabled((prev) => !prev);
    },
    { preventDefault: true }
  );

  useHotkeys(
    "meta+h, ctrl+h",
    () => {
      setHapticsEnabled((prev) => !prev);
    },
    { preventDefault: true }
  );

  const handleSoundChange = (pressed: boolean) => {
    if (pressed) {
      playToggleOn();
    } else {
      playToggleOff();
    }
    setSoundEnabled(pressed);
  };

  const handleHapticsChange = (pressed: boolean) => {
    if (pressed) {
      playToggleOn();
    } else {
      playToggleOff();
    }
    setHapticsEnabled(pressed);
  };

  const menuTrigger = (
    <Button
      variant="ghost"
      size="icon"
      className="extend-touch-target size-8"
      aria-label="Open account and preferences"
    >
      <EllipsisVerticalIcon />
    </Button>
  );

  const mobilePreferences = (
    <div className="flex flex-col">
      <div className="flex min-h-11 items-center gap-3 rounded-md px-1">
        <label className="min-w-0 flex-1 text-sm" htmlFor="mobile-sound">
          Sound
        </label>
        <Volume2Icon className="text-muted-foreground size-4" />
        <Switch
          id="mobile-sound"
          checked={soundEnabled}
          onCheckedChange={handleSoundChange}
          aria-label="Toggle sound"
        />
      </div>
      <div className="flex min-h-11 items-center gap-3 rounded-md px-1">
        <label className="min-w-0 flex-1 text-sm" htmlFor="mobile-haptics">
          Haptics
        </label>
        <VibrateIcon className="text-muted-foreground size-4" />
        <Switch
          id="mobile-haptics"
          checked={hapticsEnabled}
          onCheckedChange={handleHapticsChange}
          aria-label="Toggle haptics"
        />
      </div>
    </div>
  );

  return (
    <>
      <div className="hidden xl:block">
        <DropdownMenu open={desktopOpen} onOpenChange={setDesktopOpen} sounds>
          <DropdownMenuTrigger asChild>{menuTrigger}</DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-64">
            <DropdownMenuItem asChild sound="click">
              <Link href={ROUTES.SIGN_IN} prefetch={false}>
                <LogInIcon />
                Sign in
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <div
              className="flex min-h-9 items-center gap-3 rounded-sm px-2 text-sm"
              onMouseEnter={() =>
                desktopVolumeIconRef.current?.startAnimation()
              }
              onMouseLeave={() => desktopVolumeIconRef.current?.stopAnimation()}
            >
              <label
                className="flex min-w-0 flex-1 cursor-pointer items-center gap-2"
                htmlFor="desktop-sound"
              >
                <span>Sound</span>
                <Kbd>{isMac ? "⌘" : "Ctrl"}+S</Kbd>
              </label>
              <Volume2Icon
                ref={desktopVolumeIconRef}
                className="text-muted-foreground size-4"
              />
              <Switch
                id="desktop-sound"
                checked={soundEnabled}
                onCheckedChange={handleSoundChange}
                aria-label="Toggle sound"
              />
            </div>
            <div
              className="flex min-h-9 items-center gap-3 rounded-sm px-2 text-sm"
              onMouseEnter={() =>
                desktopVibrateIconRef.current?.startAnimation()
              }
              onMouseLeave={() =>
                desktopVibrateIconRef.current?.stopAnimation()
              }
            >
              <label
                className="flex min-w-0 flex-1 cursor-pointer items-center gap-2"
                htmlFor="desktop-haptics"
              >
                <span>Haptics</span>
                <Kbd>{isMac ? "⌘" : "Ctrl"}+H</Kbd>
              </label>
              <VibrateIcon
                ref={desktopVibrateIconRef}
                className="text-muted-foreground size-4"
              />
              <Switch
                id="desktop-haptics"
                checked={hapticsEnabled}
                onCheckedChange={handleHapticsChange}
                aria-label="Toggle haptics"
              />
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="xl:hidden">
        <Drawer open={mobileOpen} onOpenChange={setMobileOpen} sounds>
          <DrawerTrigger asChild>{menuTrigger}</DrawerTrigger>
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle>Menu</DrawerTitle>
              <DrawerDescription>
                Account and site preferences
              </DrawerDescription>
            </DrawerHeader>

            <div className="space-y-4 px-4">
              <DrawerClose asChild>
                <Link
                  className={cn(
                    buttonVariants({ variant: "ghost" }),
                    "w-full justify-start"
                  )}
                  href={ROUTES.SIGN_IN}
                  onClick={playClick}
                  prefetch={false}
                >
                  <LogInIcon />
                  Sign in
                </Link>
              </DrawerClose>

              <Separator />

              <div>
                <p className="text-muted-foreground mb-2 px-1 text-xs font-medium uppercase tracking-wider">
                  Preferences
                </p>
                {mobilePreferences}
              </div>
            </div>
            <DrawerFooter>
              <DrawerClose asChild>
                <Button size="sm">Done</Button>
              </DrawerClose>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
      </div>
    </>
  );
};
