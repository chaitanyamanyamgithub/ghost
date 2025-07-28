import { collection, doc, onSnapshot, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { FIRESTORE_COLLECTION } from '@/config';

export interface ConnectionStatus {
  isConnected: boolean;
  lastSeen: Date;
  connectionQuality: 'excellent' | 'good' | 'poor' | 'disconnected';
  latency: number;
}

export class RealTimeConnectionMonitor {
  private unsubscribe: (() => void) | null = null;
  private pingInterval: NodeJS.Timeout | null = null;
  private connectionStatusCallbacks: ((status: ConnectionStatus) => void)[] = [];
  private currentStatus: ConnectionStatus = {
    isConnected: false,
    lastSeen: new Date(),
    connectionQuality: 'disconnected',
    latency: 0
  };

  constructor(private sessionId: string) {}

  startMonitoring() {
    // Monitor Firestore connection with a test document
    const testDocRef = doc(collection(db, FIRESTORE_COLLECTION), `connection_test_${this.sessionId}`);
    
    this.unsubscribe = onSnapshot(
      testDocRef,
      (doc) => {
        const now = new Date();
        this.currentStatus = {
          isConnected: true,
          lastSeen: now,
          connectionQuality: this.calculateConnectionQuality(),
          latency: this.measureLatency()
        };
        this.notifyStatusChange();
      },
      (error) => {
        console.error('Firebase connection lost:', error);
        this.currentStatus = {
          isConnected: false,
          lastSeen: new Date(),
          connectionQuality: 'disconnected',
          latency: 0
        };
        this.notifyStatusChange();
      }
    );

    // Start ping test for latency measurement
    this.startPingTest();
  }

  stopMonitoring() {
    if (this.unsubscribe) {
      this.unsubscribe();
      this.unsubscribe = null;
    }
    
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
  }

  onStatusChange(callback: (status: ConnectionStatus) => void) {
    this.connectionStatusCallbacks.push(callback);
  }

  getCurrentStatus(): ConnectionStatus {
    return { ...this.currentStatus };
  }

  private startPingTest() {
    this.pingInterval = setInterval(async () => {
      const startTime = Date.now();
      
      try {
        const testDocRef = doc(collection(db, FIRESTORE_COLLECTION), `ping_test_${this.sessionId}`);
        await updateDoc(testDocRef, {
          timestamp: serverTimestamp(),
          pingTime: startTime
        });
        
        const latency = Date.now() - startTime;
        this.currentStatus.latency = latency;
        this.currentStatus.connectionQuality = this.calculateConnectionQuality();
        this.notifyStatusChange();
        
      } catch (error) {
        console.error('Ping test failed:', error);
        this.currentStatus.isConnected = false;
        this.currentStatus.connectionQuality = 'disconnected';
        this.notifyStatusChange();
      }
    }, 10000); // Ping every 10 seconds
  }

  private calculateConnectionQuality(): 'excellent' | 'good' | 'poor' | 'disconnected' {
    if (!this.currentStatus.isConnected) return 'disconnected';
    
    if (this.currentStatus.latency < 100) return 'excellent';
    if (this.currentStatus.latency < 300) return 'good';
    return 'poor';
  }

  private measureLatency(): number {
    // This is a simple implementation - in a real app you'd measure actual round-trip time
    return this.currentStatus.latency || 0;
  }

  private notifyStatusChange() {
    this.connectionStatusCallbacks.forEach(callback => {
      try {
        callback(this.currentStatus);
      } catch (error) {
        console.error('Error in connection status callback:', error);
      }
    });
  }
}

// Global connection manager
let globalConnectionMonitor: RealTimeConnectionMonitor | null = null;

export function getConnectionMonitor(sessionId: string): RealTimeConnectionMonitor {
  if (!globalConnectionMonitor || globalConnectionMonitor['sessionId'] !== sessionId) {
    if (globalConnectionMonitor) {
      globalConnectionMonitor.stopMonitoring();
    }
    globalConnectionMonitor = new RealTimeConnectionMonitor(sessionId);
  }
  return globalConnectionMonitor;
}

export function cleanup() {
  if (globalConnectionMonitor) {
    globalConnectionMonitor.stopMonitoring();
    globalConnectionMonitor = null;
  }
}
