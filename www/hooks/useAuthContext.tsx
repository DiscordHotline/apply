import {createContext} from 'react';

interface User {
    id: string;
    username: string;
}

export const AuthContext = createContext<User | null>(null);

export const AuthProvider = ({children, user}) => {
    return <AuthContext.Provider value={user}>{children}</AuthContext.Provider>;
};
