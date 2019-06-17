import {createContext} from 'react';

interface User {
    id: string;
    username: string;
    guilds: Guild[];
}

interface Guild {
    id: string;
    name: string;
    owner: boolean;
}

export const AuthContext = createContext<User | null>(null);

export const AuthProvider = ({children, user}) => {
    return <AuthContext.Provider value={user}>{children}</AuthContext.Provider>;
};
