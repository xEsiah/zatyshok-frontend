/* eslint-disable prettier/prettier */
/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, JSX, ReactNode } from 'react'
import herData from '../locales/her.json'
import himData from '../locales/him.json'
import defaultData from '../locales/default.json'
import artData from '../locales/art.json'
import artDataFR from '../locales/artFR.json'

type Translation = typeof defaultData
export type Role = 'him' | 'her' | 'default' | 'art' | 'artFR'

interface UserContextType {
  userRole: Role
  setUserRole: (role: Role) => void
  t: Translation
  profilePicture: string | null
  setProfilePicture: (url: string | null) => void
  userId: string | null
  setUserId: (id: string | null) => void
}

const UserContext = createContext<UserContextType | undefined>(undefined)

const translations: Record<Role, Translation> = {
  him: himData as Translation,
  her: herData as Translation,
  default: defaultData as Translation,
  art: artData as Translation,
  artFR: artDataFR as Translation
}

export function UserProvider({ children }: { children: ReactNode }): JSX.Element {
  const [userRole, setUserRole] = useState<Role>('default')
  const [profilePicture, setProfilePicture] = useState<string | null>(null)
  const [userId, setUserId] = useState<string | null>(null)

  return (
    <UserContext.Provider
      value={{
        userRole,
        setUserRole,
        t: translations[userRole] as Translation,
        profilePicture,
        setProfilePicture,
        userId,
        setUserId
      }}
    >
      {children}
    </UserContext.Provider>
  )
}

export const useUser = (): UserContextType => {
  const context = useContext(UserContext)
  if (!context) throw new Error('useUser must be used within a UserProvider')
  return context
}
