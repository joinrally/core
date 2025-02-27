import { StorageProvider } from "./types"
import { MockStorageProvider } from "./mock"

let storageProvider: StorageProvider | null = null

export function getStorageProvider(): StorageProvider {
  if (!storageProvider) {
    storageProvider = new MockStorageProvider()
  }
  return storageProvider
}

// Export the interface for type usage
export type { StorageProvider } 