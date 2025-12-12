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
import { Menu } from "lucide-react";
import { useState } from "react";
import { Brain } from "lucide-react";
/**
 * Header Component
 *
 * Responsive navigation header with user menu
 * Mobile: Hamburger menu with slide-out navigation
 * Desktop: Inline navigation links
 * Shows sign in button for unauthenticated users
 * Shows navigation and logout button for authenticated users
 */
export const Header = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    setIsOpen(false);
    navigate({ to: "/about" });
  };

  const handleNavigation = (to: string) => {
    setIsOpen(false);
    navigate({ to });
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
            <Brain /> Migraine Log
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-4 lg:gap-6">
            {user ? (
              <>
                <Link
                  to="/"
                  className="text-sm font-medium hover:text-primary transition-colors"
                  activeProps={{ className: "text-primary font-semibold" }}
                >
                  Dashboard
                </Link>
                <Link
                  to="/episodes"
                  className="text-sm font-medium hover:text-primary transition-colors"
                  activeProps={{ className: "text-primary font-semibold" }}
                >
                  Episodes
                </Link>
                <Link
                  to="/analysis"
                  className="text-sm font-medium hover:text-primary transition-colors"
                  activeProps={{ className: "text-primary font-semibold" }}
                >
                  Analysis
                </Link>

                <div className="flex items-center gap-3 ml-2">
                  <span className="text-xs sm:text-sm text-muted-foreground max-w-[150px] truncate">
                    {user.email}
                  </span>
                  <Button
                    onClick={handleSignOut}
                    variant="ghost"
                    size="sm"
                    className=""
                  >
                    Sign Out
                  </Button>
                </div>
              </>
            ) : (
              <Button
                onClick={() => navigate({ to: "/login" })}
                variant="default"
                size="sm"
              >
                Sign In
              </Button>
            )}
          </nav>

          {/* Mobile Navigation */}
          <div className="md:hidden">
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
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
                  {user ? (
                    <>
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
                          className="text-base font-medium hover:text-primary transition-colors py-2"
                          activeProps={{
                            className: "text-primary font-semibold",
                          }}
                        >
                          Dashboard
                        </Link>
                      </SheetClose>
                      <SheetClose asChild>
                        <Link
                          to="/episodes"
                          className="text-base font-medium hover:text-primary transition-colors py-2"
                          activeProps={{
                            className: "text-primary font-semibold",
                          }}
                        >
                          Episodes
                        </Link>
                      </SheetClose>
                      <SheetClose asChild>
                        <Link
                          to="/analysis"
                          className="text-base font-medium hover:text-primary transition-colors py-2"
                          activeProps={{
                            className: "text-primary font-semibold",
                          }}
                        >
                          Analysis
                        </Link>
                      </SheetClose>

                      {/* Sign Out Button */}
                      <div className="pt-4 border-t">
                        <Button
                          onClick={handleSignOut}
                          variant="ghost"
                          size="sm"
                          className="w-full bg-accent"
                        >
                          Sign Out
                        </Button>
                      </div>
                    </>
                  ) : (
                    <Button
                      onClick={() => handleNavigation("/login")}
                      variant="default"
                      className="w-full"
                    >
                      Sign In
                    </Button>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
};
