import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import useAuth from "@/hooks/use-auth";
import { Share2, ChevronDown, LogOut } from "lucide-react";
import { Avatar } from "./ui/avatar";

export default function Header() {
  const { user, logout } = useAuth();

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/">
            <div className="flex items-center space-x-3 cursor-pointer">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Share2 size={16} className="text-white" />
              </div>
              <h1 className="text-xl font-bold text-gray-900">FileShare</h1>
            </div>
          </Link>

          {!!user && (
            <nav className=" md:flex items-center space-x-8">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="flex items-center space-x-2"
                  >
                    {user?.profilePic ? (
                      <img
                        src={user.profilePic}
                        alt="Profile"
                        className="w-8 h-8 rounded-full object-cover"
                      />
                    ) : (
                      <Avatar
                        size="sm"
                        className="bg-gray-200 flex items-center justify-center font-semibold text-gray-700 uppercase"
                      >
                        {user?.name?.[0] || user?.email?.[0] || "U"}
                      </Avatar>
                      // <UserCircle className="w-8 h-8 text-gray-600" />
                    )}
                    <span className="font-medium">
                      {user?.name || user?.email || "User"}
                    </span>
                    <ChevronDown size={14} className="text-gray-600" />
                  </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem onClick={logout} className="text-danger">
                    <LogOut className="w-4 h-4 mr-2" /> Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </nav>
          )}
        </div>
      </div>
    </header>
  );
}
