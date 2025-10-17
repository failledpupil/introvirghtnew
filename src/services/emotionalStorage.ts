// Encrypted storage service for emotional companion data

import type {
    EmotionalProfile,
    Conversation,
    EmotionalAnalysis,
    EmotionalPatterns,
    CompanionPreferences,
    EmotionalInsights,
    EncryptedData,
    EmotionalDataStore
} from '../types/emotional-companion';

// Simple encryption utilities (in production, use a proper crypto library)
class EncryptionService {
    private encoder = new TextEncoder();
    private decoder = new TextDecoder();

    /**
     * Generate a random salt
     */
    private generateSalt(): ArrayBuffer {
        return crypto.getRandomValues(new Uint8Array(16)).buffer;
    }

    /**
     * Generate a random IV
     */
    private generateIV(): ArrayBuffer {
        return crypto.getRandomValues(new Uint8Array(12)).buffer;
    }

    /**
     * Derive key from password and salt
     */
    private async deriveKey(password: string, salt: ArrayBuffer): Promise<CryptoKey> {
        const keyMaterial = await crypto.subtle.importKey(
            'raw',
            this.encoder.encode(password),
            'PBKDF2',
            false,
            ['deriveKey']
        );

        return crypto.subtle.deriveKey(
            {
                name: 'PBKDF2',
                salt,
                iterations: 100000,
                hash: 'SHA-256'
            },
            keyMaterial,
            { name: 'AES-GCM', length: 256 },
            false,
            ['encrypt', 'decrypt']
        );
    }

    /**
     * Encrypt data
     */
    async encrypt<T>(data: T, password: string): Promise<EncryptedData<T>> {
        const salt = this.generateSalt();
        const iv = this.generateIV();
        const key = await this.deriveKey(password, salt);

        const plaintext = this.encoder.encode(JSON.stringify(data));
        const ciphertext = await crypto.subtle.encrypt(
            { name: 'AES-GCM', iv },
            key,
            plaintext
        );

        return {
            data: this.arrayBufferToBase64(ciphertext),
            iv: this.arrayBufferToBase64(iv),
            salt: this.arrayBufferToBase64(salt),
            timestamp: new Date(),
            version: 1
        };
    }

    /**
     * Decrypt data
     */
    async decrypt<T>(encryptedData: EncryptedData<T>, password: string): Promise<T> {
        const salt = this.base64ToArrayBuffer(encryptedData.salt);
        const iv = this.base64ToArrayBuffer(encryptedData.iv);
        const ciphertext = this.base64ToArrayBuffer(encryptedData.data);

        const key = await this.deriveKey(password, salt);

        const plaintext = await crypto.subtle.decrypt(
            { name: 'AES-GCM', iv },
            key,
            ciphertext
        );

        const decryptedText = this.decoder.decode(plaintext);
        return JSON.parse(decryptedText);
    }

    /**
     * Convert ArrayBuffer to Base64
     */
    private arrayBufferToBase64(buffer: ArrayBuffer): string {
        const bytes = new Uint8Array(buffer);
        let binary = '';
        for (let i = 0; i < bytes.byteLength; i++) {
            binary += String.fromCharCode(bytes[i]);
        }
        return btoa(binary);
    }

    /**
     * Convert Base64 to ArrayBuffer
     */
    private base64ToArrayBuffer(base64: string): ArrayBuffer {
        const binary = atob(base64);
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) {
            bytes[i] = binary.charCodeAt(i);
        }
        return bytes.buffer;
    }
}

export class EmotionalStorageService {
    private encryptionService = new EncryptionService();
    private storageKey = 'emotional-companion-data';
    private defaultPassword = 'user-emotional-data'; // In production, use user-specific password

    /**
     * Get the current data store
     */
    private async getDataStore(): Promise<EmotionalDataStore> {
        try {
            const stored = localStorage.getItem(this.storageKey);
            if (!stored) {
                return this.createEmptyDataStore();
            }

            const encryptedStore: EncryptedData<EmotionalDataStore> = JSON.parse(stored);
            return await this.encryptionService.decrypt(encryptedStore, this.defaultPassword);
        } catch (error) {
            console.error('Failed to load emotional data store:', error);
            return this.createEmptyDataStore();
        }
    }

    /**
     * Save the data store
     */
    private async saveDataStore(dataStore: EmotionalDataStore): Promise<void> {
        try {
            const encrypted = await this.encryptionService.encrypt(dataStore, this.defaultPassword);
            localStorage.setItem(this.storageKey, JSON.stringify(encrypted));
        } catch (error) {
            console.error('Failed to save emotional data store:', error);
            throw new Error('Failed to save emotional data');
        }
    }

    /**
     * Create empty data store
     */
    private createEmptyDataStore(): EmotionalDataStore {
        return {
            profiles: {},
            conversations: {},
            analyses: {},
            patterns: {},
            preferences: {},
            insights: {}
        };
    }

    /**
     * Store emotional profile
     */
    async storeEmotionalProfile(userId: string, profile: EmotionalProfile): Promise<void> {
        const dataStore = await this.getDataStore();
        const encrypted = await this.encryptionService.encrypt(profile, this.defaultPassword);
        dataStore.profiles[userId] = encrypted;
        await this.saveDataStore(dataStore);
    }

    /**
     * Get emotional profile
     */
    async getEmotionalProfile(userId: string): Promise<EmotionalProfile | null> {
        try {
            const dataStore = await this.getDataStore();
            const encrypted = dataStore.profiles[userId];
            if (!encrypted) return null;

            return await this.encryptionService.decrypt(encrypted, this.defaultPassword);
        } catch (error) {
            console.error('Failed to get emotional profile:', error);
            return null;
        }
    }

    /**
     * Store conversation
     */
    async storeConversation(conversation: Conversation): Promise<void> {
        const dataStore = await this.getDataStore();
        const encrypted = await this.encryptionService.encrypt(conversation, this.defaultPassword);
        dataStore.conversations[conversation.id] = encrypted;
        await this.saveDataStore(dataStore);
    }

    /**
     * Get conversation
     */
    async getConversation(conversationId: string): Promise<Conversation | null> {
        try {
            const dataStore = await this.getDataStore();
            const encrypted = dataStore.conversations[conversationId];
            if (!encrypted) return null;

            return await this.encryptionService.decrypt(encrypted, this.defaultPassword);
        } catch (error) {
            console.error('Failed to get conversation:', error);
            return null;
        }
    }

    /**
     * Get all conversations for a user
     */
    async getUserConversations(userId: string): Promise<Conversation[]> {
        try {
            const dataStore = await this.getDataStore();
            const conversations: Conversation[] = [];

            for (const [id, encrypted] of Object.entries(dataStore.conversations)) {
                try {
                    const conversation = await this.encryptionService.decrypt(encrypted, this.defaultPassword);
                    if (conversation.userId === userId) {
                        conversations.push(conversation);
                    }
                } catch (error) {
                    console.error(`Failed to decrypt conversation ${id}:`, error);
                }
            }

            return conversations.sort((a, b) => b.lastMessageAt.getTime() - a.lastMessageAt.getTime());
        } catch (error) {
            console.error('Failed to get user conversations:', error);
            return [];
        }
    }

    /**
     * Store emotional analysis
     */
    async storeEmotionalAnalysis(analysis: EmotionalAnalysis): Promise<void> {
        const dataStore = await this.getDataStore();
        const encrypted = await this.encryptionService.encrypt(analysis, this.defaultPassword);
        dataStore.analyses[analysis.id] = encrypted;
        await this.saveDataStore(dataStore);
    }

    /**
     * Get emotional analysis
     */
    async getEmotionalAnalysis(analysisId: string): Promise<EmotionalAnalysis | null> {
        try {
            const dataStore = await this.getDataStore();
            const encrypted = dataStore.analyses[analysisId];
            if (!encrypted) return null;

            return await this.encryptionService.decrypt(encrypted, this.defaultPassword);
        } catch (error) {
            console.error('Failed to get emotional analysis:', error);
            return null;
        }
    }

    /**
     * Get analyses for entry
     */
    async getAnalysesForEntry(entryId: string): Promise<EmotionalAnalysis[]> {
        try {
            const dataStore = await this.getDataStore();
            const analyses: EmotionalAnalysis[] = [];

            for (const [id, encrypted] of Object.entries(dataStore.analyses)) {
                try {
                    const analysis = await this.encryptionService.decrypt(encrypted, this.defaultPassword);
                    if (analysis.entryId === entryId) {
                        analyses.push(analysis);
                    }
                } catch (error) {
                    console.error(`Failed to decrypt analysis ${id}:`, error);
                }
            }

            return analyses.sort((a, b) => b.analyzedAt.getTime() - a.analyzedAt.getTime());
        } catch (error) {
            console.error('Failed to get analyses for entry:', error);
            return [];
        }
    }

    /**
     * Store emotional patterns
     */
    async storeEmotionalPatterns(userId: string, patterns: EmotionalPatterns): Promise<void> {
        const dataStore = await this.getDataStore();
        const encrypted = await this.encryptionService.encrypt(patterns, this.defaultPassword);
        dataStore.patterns[userId] = encrypted;
        await this.saveDataStore(dataStore);
    }

    /**
     * Get emotional patterns
     */
    async getEmotionalPatterns(userId: string): Promise<EmotionalPatterns | null> {
        try {
            const dataStore = await this.getDataStore();
            const encrypted = dataStore.patterns[userId];
            if (!encrypted) return null;

            return await this.encryptionService.decrypt(encrypted, this.defaultPassword);
        } catch (error) {
            console.error('Failed to get emotional patterns:', error);
            return null;
        }
    }

    /**
     * Store companion preferences
     */
    async storeCompanionPreferences(userId: string, preferences: CompanionPreferences): Promise<void> {
        const dataStore = await this.getDataStore();
        const encrypted = await this.encryptionService.encrypt(preferences, this.defaultPassword);
        dataStore.preferences[userId] = encrypted;
        await this.saveDataStore(dataStore);
    }

    /**
     * Get companion preferences
     */
    async getCompanionPreferences(userId: string): Promise<CompanionPreferences | null> {
        try {
            const dataStore = await this.getDataStore();
            const encrypted = dataStore.preferences[userId];
            if (!encrypted) return null;

            return await this.encryptionService.decrypt(encrypted, this.defaultPassword);
        } catch (error) {
            console.error('Failed to get companion preferences:', error);
            return null;
        }
    }

    /**
     * Store emotional insights
     */
    async storeEmotionalInsights(userId: string, insights: EmotionalInsights): Promise<void> {
        const dataStore = await this.getDataStore();
        const encrypted = await this.encryptionService.encrypt(insights, this.defaultPassword);
        dataStore.insights[userId] = encrypted;
        await this.saveDataStore(dataStore);
    }

    /**
     * Get emotional insights
     */
    async getEmotionalInsights(userId: string): Promise<EmotionalInsights | null> {
        try {
            const dataStore = await this.getDataStore();
            const encrypted = dataStore.insights[userId];
            if (!encrypted) return null;

            return await this.encryptionService.decrypt(encrypted, this.defaultPassword);
        } catch (error) {
            console.error('Failed to get emotional insights:', error);
            return null;
        }
    }

    /**
     * Delete conversation
     */
    async deleteConversation(conversationId: string): Promise<void> {
        const dataStore = await this.getDataStore();
        delete dataStore.conversations[conversationId];
        await this.saveDataStore(dataStore);
    }

    /**
     * Delete all user data
     */
    async deleteUserData(userId: string): Promise<void> {
        const dataStore = await this.getDataStore();

        // Delete profile
        delete dataStore.profiles[userId];
        delete dataStore.patterns[userId];
        delete dataStore.preferences[userId];
        delete dataStore.insights[userId];

        // Delete conversations
        const conversationsToDelete: string[] = [];
        for (const [id, encrypted] of Object.entries(dataStore.conversations)) {
            try {
                const conversation = await this.encryptionService.decrypt(encrypted, this.defaultPassword);
                if (conversation.userId === userId) {
                    conversationsToDelete.push(id);
                }
            } catch (error) {
                // If we can't decrypt, assume it might be the user's data and delete it
                conversationsToDelete.push(id);
            }
        }

        conversationsToDelete.forEach(id => {
            delete dataStore.conversations[id];
        });

        // Delete analyses (we'd need to track which analyses belong to which user)
        // For now, we'll leave analyses as they're tied to diary entries

        await this.saveDataStore(dataStore);
    }

    /**
     * Export user data
     */
    async exportUserData(userId: string): Promise<any> {
        try {
            const profile = await this.getEmotionalProfile(userId);
            const conversations = await this.getUserConversations(userId);
            const patterns = await this.getEmotionalPatterns(userId);
            const preferences = await this.getCompanionPreferences(userId);
            const insights = await this.getEmotionalInsights(userId);

            return {
                profile,
                conversations,
                patterns,
                preferences,
                insights,
                exportedAt: new Date().toISOString(),
                version: '1.0'
            };
        } catch (error) {
            console.error('Failed to export user data:', error);
            throw new Error('Failed to export emotional companion data');
        }
    }

    /**
     * Get storage statistics
     */
    async getStorageStats(): Promise<{
        totalSize: number;
        profileCount: number;
        conversationCount: number;
        analysisCount: number;
        lastUpdated: Date | null;
    }> {
        try {
            const dataStore = await this.getDataStore();
            const stored = localStorage.getItem(this.storageKey);
            const totalSize = stored ? new Blob([stored]).size : 0;

            return {
                totalSize,
                profileCount: Object.keys(dataStore.profiles).length,
                conversationCount: Object.keys(dataStore.conversations).length,
                analysisCount: Object.keys(dataStore.analyses).length,
                lastUpdated: stored ? new Date() : null
            };
        } catch (error) {
            console.error('Failed to get storage stats:', error);
            return {
                totalSize: 0,
                profileCount: 0,
                conversationCount: 0,
                analysisCount: 0,
                lastUpdated: null
            };
        }
    }

    /**
     * Clear all data (for testing or reset)
     */
    async clearAllData(): Promise<void> {
        localStorage.removeItem(this.storageKey);
    }
}

// Export singleton instance
export const emotionalStorageService = new EmotionalStorageService();