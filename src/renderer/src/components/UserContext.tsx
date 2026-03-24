import { createContext, useContext, useState, JSX, ReactNode } from 'react'
import herData from '../locales/her.json'
import himData from '../locales/him.json'
import defaultData from '../locales/default.json'

type Translation = typeof defaultData
export type Role = 'him' | 'her' | 'default'

interface UserContextType {
  userRole: Role
  setUserRole: (role: Role) => void
  t: Translation
}

const UserContext = createContext<UserContextType | undefined>(undefined)

const translations: Record<Role, Translation> = {
  him: himData,
  her: herData,
  default: defaultData
}

export function UserProvider({ children }: { children: ReactNode }): JSX.Element {
  const [userRole, setUserRole] = useState<Role>('default')

  return (
    <UserContext.Provider value={{ userRole, setUserRole, t: translations[userRole] }}>
      {children}
    </UserContext.Provider>
  )
}
// eslint-disable-next-line react-refresh/only-export-components
export const useUser = (): UserContextType => {
  const context = useContext(UserContext)
  if (!context) throw new Error('useUser must be used within a UserProvider')
  return context
}
