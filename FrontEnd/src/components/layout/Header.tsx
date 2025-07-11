import {Search, User, LogOut, Moon, Sun } from 'lucide-react'
import { useAuth } from '@/hooks/AuthContext'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Switch } from '../ui/switch';
import { useState } from 'react';

const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isDarkMode, setIsDarkMode] = useState(document.documentElement.classList.contains('dark'));
  

  const handleLogout = () => {
    logout();
    navigate('/login');
     toast.success("Logged out Successfull", {
      description: `Goodbye ${user?.name}`
          });
  };

   const toggleTheme = () => {
    if (isDarkMode) {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    } else {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    }
    setIsDarkMode(!isDarkMode);
  };

  return (
     <header className="bg-background border-b border-border h-16 flex items-center justify-between px-4 lg:px-6">
      <div className="flex items-center gap-2">
        <div className="relative w-full max-w-md hidden md:block">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search..."
            className="pl-8 h-9 w-full rounded-md border border-input bg-transparent py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
      
        <div className="flex items-center gap-2">
                <Sun className="h-4 w-4 text-muted-foreground" />
                <Switch
                  id="theme"
                  checked={isDarkMode}
                  onCheckedChange={toggleTheme}
                />
                <Moon className="h-4 w-4 text-muted-foreground" />
              </div>
        
        <div className="flex items-center gap-2">
          <Button 
          variant='default' 
          className="flex items-center gap-2 rounded-md hover:bg-accent hover:text-accent-foreground px-2 py-1"
          >
            <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
              <User className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="hidden md:block text-left">
              <p className="text-sm font-medium">{user?.name || 'User'}</p>
              <p className="text-xs text-muted-foreground">{user?.email || 'user@example.com'}</p>
            </div>
          </Button>
          
          <Button 
            onClick={handleLogout}
            className="h-9 w-9 rounded-md border border-input flex items-center justify-center text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            aria-label="Logout"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </header>
  )
}

export default Header