// Mock AstraDB service for development
// This is a simplified version to prevent import errors

export interface DiaryEntry {
  id: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

class MockAstraService {
  async saveEntry(entry: DiaryEntry): Promise<void> {
    console.log('Mock: Saving entry to AstraDB', entry.id);
    // In a real implementation, this would save to AstraDB
    return Promise.resolve();
  }

  async updateEntry(entry: DiaryEntry): Promise<void> {
    console.log('Mock: Updating entry in AstraDB', entry.id);
    // In a real implementation, this would update in AstraDB
    return Promise.resolve();
  }

  async getEntries(): Promise<DiaryEntry[]> {
    console.log('Mock: Getting entries from AstraDB');
    // In a real implementation, this would fetch from AstraDB
    return Promise.resolve([]);
  }

  async deleteEntry(id: string): Promise<void> {
    console.log('Mock: Deleting entry from AstraDB', id);
    // In a real implementation, this would delete from AstraDB
    return Promise.resolve();
  }
}

export const astraServiceDirect = new MockAstraService();