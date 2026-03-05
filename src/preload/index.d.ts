import { ElectronAPI } from '@electron-toolkit/preload'

declare global {
  interface Window {
    electron: ElectronAPI
    api: {
      setStoreValue: (key: string, value: string) => void
      getStoreValue: (key: string) => Promise<unknown>
      deleteStoreValue: (key: string) => void
    }
  }
}
