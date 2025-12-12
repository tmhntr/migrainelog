import { Link, useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Menu, Brain, Home, FileText, TrendingUp, Settings, Info, LogOut } from "lucide-react";
import { useState } from "react";

/**
 * Header Component
 *
 * Responsive navigation header with menu
 * - Logo on the left
 * - Menu button on the right
 * - Mobile: Sheet (side dialog)
 * - Desktop: Dropdown menu (popover)
 */
export const Header = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    setIsSheetOpen(false);
    navigate({ to: "/about" });
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 sm:px-6 py-3 sm:py-4">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link
            to="/"
            className="text-lg flex place-items-center gap-2 sm:text-xl font-bold hover:text-primary transition-colors"
          >
            <Brain className="h-5 w-5 sm:h-6 sm:w-6" />
            Migraine Log
          </Link>

          {/* Desktop Menu - Dropdown */}
          <div className="hidden md:block">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="px-2">
                    <Menu className="h-5 w-5" />
                    <span className="sr-only">Toggle menu</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <div className="flex flex-col space-y-1">
                      <p className="text-xs text-muted-foreground">Signed in as</p>
                      <p className="text-sm font-medium truncate">{user.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/" className="flex items-center cursor-pointer">
                      <Home className="mr-2 h-4 w-4" />
                      <span>Dashboard</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/episodes" className="flex items-center cursor-pointer">
                      <FileText className="mr-2 h-4 w-4" />
                      <span>Logs</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/analysis" className="flex items-center cursor-pointer">
                      <TrendingUp className="mr-2 h-4 w-4" />
                      <span>Trends</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/settings" className="flex items-center cursor-pointer">
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Settings</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/about" className="flex items-center cursor-pointer">
                      <Info className="mr-2 h-4 w-4" />
                      <span>About</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleSignOut}
                    className="flex items-center cursor-pointer text-destructive focus:text-destructive"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button
                onClick={() => navigate({ to: "/login" })}
                variant="default"
                size="sm"
              >
                Sign In
              </Button>
            )}
          </div>

          {/* Mobile Menu - Sheet */}
          <div className="md:hidden">
            {user ? (
              <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="sm" className="px-2">
                    <Menu className="h-5 w-5" />
                    <span className="sr-only">Toggle menu</span>
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-[280px] sm:w-[320px]">
                  <SheetHeader>
                    <SheetTitle>Menu</SheetTitle>
                  </SheetHeader>
                  <div className="flex flex-col gap-4 mt-8">
                    {/* User Info */}
                    <div className="pb-4 border-b">
                      <p className="text-xs text-muted-foreground mb-1">
                        Signed in as
                      </p>
                      <p className="text-sm font-medium truncate">
                        {user.email}
                      </p>
                    </div>

                    {/* Navigation Links */}
                    <SheetClose asChild>
                      <Link
                        to="/"
                        className="flex items-center gap-3 text-base font-medium hover:text-primary transition-colors py-2"
                      >
                        <Home className="h-5 w-5" />
                        Dashboard
                      </Link>
                    </SheetClose>
                    <SheetClose asChild>
                      <Link
                        to="/episodes"
                        className="flex items-center gap-3 text-base font-medium hover:text-primary transition-colors py-2"
                      >
                        <FileText className="h-5 w-5" />
                        Logs
                      </Link>
                    </SheetClose>
                    <SheetClose asChild>
                      <Link
                        to="/analysis"
                        className="flex items-center gap-3 text-base font-medium hover:text-primary transition-colors py-2"
                      >
                        <TrendingUp className="h-5 w-5" />
                        Trends
                      </Link>
                    </SheetClose>

                    <div className="border-t pt-4">
                      <SheetClose asChild>
                        <Link
                          to="/settings"
                          className="flex items-center gap-3 text-base font-medium hover:text-primary transition-colors py-2"
                        >
                          <Settings className="h-5 w-5" />
                          Settings
                        </Link>
                      </SheetClose>
                      <SheetClose asChild>
                        <Link
                          to="/about"
                          className="flex items-center gap-3 text-base font-medium hover:text-primary transition-colors py-2"
                        >
                          <Info className="h-5 w-5" />
                          About
                        </Link>
                      </SheetClose>
                    </div>

                    {/* Sign Out Button */}
                    <div className="pt-4 border-t">
                      <Button
                        onClick={handleSignOut}
                        variant="ghost"
                        size="sm"
                        className="w-full justify-start gap-3"
                      >
                        <LogOut className="h-5 w-5" />
                        Log out
                      </Button>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            ) : (
              <Button
                onClick={() => navigate({ to: "/login" })}
                variant="default"
                size="sm"
              >
                Sign In
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
