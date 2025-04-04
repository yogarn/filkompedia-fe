import { Link, useNavigate } from 'react-router-dom';
import {
    NavigationMenu,
    NavigationMenuItem,
    NavigationMenuLink,
    NavigationMenuList,
    navigationMenuTriggerStyle,
} from '@/components/ui/navigation-menu';
import { toast } from 'sonner';

export function NavBar() {
    const navigate = useNavigate();

    async function logout() {
        const logoutResponse = await fetch(`${import.meta.env.VITE_API_URL}/auths/logout`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
        });

        if (logoutResponse.ok) {
            console.log('User logged out successfully');
            toast.info("Successfully logged out.");
            navigate("/login");
        } else {
            console.error('Logout failed');
            toast.error("Failed to log out.");
        }
    }

    return (
        <NavigationMenu>
            <NavigationMenuList>
                <NavigationMenuItem>
                    <NavigationMenuLink asChild className={navigationMenuTriggerStyle()}>
                        <Link to="/books">Books</Link>
                    </NavigationMenuLink>
                </NavigationMenuItem>
                <NavigationMenuItem>
                    <NavigationMenuLink asChild className={navigationMenuTriggerStyle()}>
                        <Link to="/carts">Cart</Link>
                    </NavigationMenuLink>
                </NavigationMenuItem>
                <NavigationMenuItem>
                    <NavigationMenuLink asChild className={navigationMenuTriggerStyle()}>
                        <Link to="/checkouts">Checkouts</Link>
                    </NavigationMenuLink>
                </NavigationMenuItem>
                <NavigationMenuItem>
                    <NavigationMenuLink asChild className={navigationMenuTriggerStyle()}>
                        <Link to="/profile">Account</Link>
                    </NavigationMenuLink>
                </NavigationMenuItem>
                <NavigationMenuItem>
                    <button onClick={logout} className={navigationMenuTriggerStyle()}>
                        Logout
                    </button>
                </NavigationMenuItem>
            </NavigationMenuList>
        </NavigationMenu>
    );
}

export function AdminNavBar() {
    const navigate = useNavigate();

    async function logout() {
        const logoutResponse = await fetch(`${import.meta.env.VITE_API_URL}/auths/logout`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
        });

        if (logoutResponse.ok) {
            console.log('User logged out successfully');
            toast.info("Successfully logged out.");
            navigate("/login");
        } else {
            console.error('Logout failed');
            toast.error("Failed to log out.");
        }
    }

    return (
        <NavigationMenu>
            <NavigationMenuList>
                <NavigationMenuItem>
                    <NavigationMenuLink asChild className={navigationMenuTriggerStyle()}>
                        <Link to="/admin">Dashboard</Link>
                    </NavigationMenuLink>
                </NavigationMenuItem>
                <NavigationMenuItem>
                    <NavigationMenuLink asChild className={navigationMenuTriggerStyle()}>
                        <Link to="/admin/books">Manage Books</Link>
                    </NavigationMenuLink>
                </NavigationMenuItem>
                <NavigationMenuItem>
                    <NavigationMenuLink asChild className={navigationMenuTriggerStyle()}>
                        <Link to="/admin/users">Manage Users</Link>
                    </NavigationMenuLink>
                </NavigationMenuItem>
                <NavigationMenuItem>
                    <button onClick={logout} className={navigationMenuTriggerStyle()}>
                        Logout
                    </button>
                </NavigationMenuItem>
            </NavigationMenuList>
        </NavigationMenu>
    );
}
