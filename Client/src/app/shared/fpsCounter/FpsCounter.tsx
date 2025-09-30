import { useEffect, useRef, useState } from 'react';
import './style/fpsCounter.css';

interface FpsCounterProps {
    position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
    showDetails?: boolean;
    updateInterval?: number;
}

interface PerformanceMetrics {
    fps: number;
    frameTime: number;
    minFps: number;
    maxFps: number;
    avgFps: number;
    jank: number; // Frames over 16.67ms
    cpuUsage: number;
    memoryUsage: number;
    renderTime: number;
    idleTime: number;
    frameDrops: number;
    stability: number; // FPS stability percentage
}

export default function FpsCounter({ 
    position = 'top-right', 
    showDetails = false,
    updateInterval = 1000
}: FpsCounterProps) {
    const [metrics, setMetrics] = useState<PerformanceMetrics>({
        fps: 0,
        frameTime: 0,
        minFps: Infinity,
        maxFps: 0,
        avgFps: 0,
        jank: 0,
        cpuUsage: 0,
        memoryUsage: 0,
        renderTime: 0,
        idleTime: 0,
        frameDrops: 0,
        stability: 100
    });
    
    const frameCountRef = useRef(0);
    const lastTimeRef = useRef(performance.now());
    const animationFrameRef = useRef<number>(0);
    const fpsHistoryRef = useRef<number[]>([]);
    const frameTimesRef = useRef<number[]>([]);
    const jankFramesRef = useRef(0);
    const totalFramesRef = useRef(0);
    const cpuStartTimeRef = useRef(performance.now());
    const busyTimeRef = useRef(0);

    useEffect(() => {
        let lastFrameTime = performance.now();

        const updateFps = (currentTime: number) => {
            const frameStartTime = performance.now();
            
            frameCountRef.current++;
            totalFramesRef.current++;
            
            const frameTime = currentTime - lastFrameTime;
            frameTimesRef.current.push(frameTime);
            
            // Track jank (frames over 16.67ms for 60fps)
            if (frameTime > 16.67) {
                jankFramesRef.current++;
            }
            
            const deltaTime = currentTime - lastTimeRef.current;
            
            if (deltaTime >= updateInterval) {
                const currentFps = Math.round((frameCountRef.current * 1000) / deltaTime);
                const avgFrameTime = frameTimesRef.current.reduce((a, b) => a + b, 0) / frameTimesRef.current.length;
                
                // Calculate CPU usage based on actual processing time vs available time
                const totalElapsedTime = currentTime - cpuStartTimeRef.current;
                const cpuUsagePercentage = totalElapsedTime > 0 
                    ? Math.min(100, (busyTimeRef.current / totalElapsedTime) * 100)
                    : 0;
                
                // Memory usage (if available)
                let memoryUsage = 0;
                if ('memory' in performance) {
                    const memory = (performance as any).memory;
                    memoryUsage = Math.round(memory.usedJSHeapSize / 1024 / 1024); // in MB
                }
                
                // Calculate frame drops
                const expectedFrames = Math.round(deltaTime / 16.67);
                const frameDrops = Math.max(0, expectedFrames - frameCountRef.current);
                
                // Calculate FPS stability (lower variance = higher stability)
                const fpsVariance = fpsHistoryRef.current.length > 1 
                    ? calculateVariance(fpsHistoryRef.current) 
                    : 0;
                const stability = Math.max(0, 100 - (fpsVariance / Math.max(currentFps, 1)) * 100);
                
                // Average FPS calculation
                fpsHistoryRef.current.push(currentFps);
                if (fpsHistoryRef.current.length > 60) {
                    fpsHistoryRef.current.shift();
                }
                
                const avgFps = fpsHistoryRef.current.length > 0 
                    ? Math.round(fpsHistoryRef.current.reduce((a, b) => a + b, 0) / fpsHistoryRef.current.length)
                    : currentFps;

                // Jank percentage
                const jankPercentage = totalFramesRef.current > 0 
                    ? (jankFramesRef.current / totalFramesRef.current) * 100 
                    : 0;

                setMetrics(prev => ({
                    fps: currentFps,
                    frameTime: avgFrameTime,
                    minFps: Math.min(prev.minFps === Infinity ? currentFps : prev.minFps, currentFps),
                    maxFps: Math.max(prev.maxFps, currentFps),
                    avgFps,
                    jank: jankPercentage,
                    cpuUsage: Math.round(cpuUsagePercentage),
                    memoryUsage,
                    renderTime: avgFrameTime,
                    idleTime: Math.max(0, 16.67 - avgFrameTime),
                    frameDrops,
                    stability: Math.round(stability)
                }));
                
                // Reset counters
                frameCountRef.current = 0;
                frameTimesRef.current = [];
                lastTimeRef.current = currentTime;
                cpuStartTimeRef.current = currentTime;
                busyTimeRef.current = 0;
            }
            
            // Track busy time for CPU usage calculation
            const frameProcessingTime = performance.now() - frameStartTime;
            busyTimeRef.current += frameProcessingTime;
            
            lastFrameTime = currentTime;
            animationFrameRef.current = requestAnimationFrame(updateFps);
        };

        animationFrameRef.current = requestAnimationFrame(updateFps);

        return () => {
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
        };
    }, [updateInterval]);

    const calculateVariance = (numbers: number[]): number => {
        if (numbers.length === 0) return 0;
        const mean = numbers.reduce((a, b) => a + b, 0) / numbers.length;
        const squaredDiffs = numbers.map(n => Math.pow(n - mean, 2));
        return squaredDiffs.reduce((a, b) => a + b, 0) / numbers.length;
    };

    const resetStats = () => {
        setMetrics(prev => ({
            ...prev,
            minFps: prev.fps,
            maxFps: prev.fps,
            jank: 0,
            frameDrops: 0,
            stability: 100,
            cpuUsage: 0
        }));
        fpsHistoryRef.current = [];
        jankFramesRef.current = 0;
        totalFramesRef.current = 0;
        cpuStartTimeRef.current = performance.now();
        busyTimeRef.current = 0;
    };

    const getFpsColor = (fps: number) => {
        if (fps >= 60) return '#00ff00';
        if (fps >= 45) return '#9acd32';
        if (fps >= 30) return '#ffff00';
        if (fps >= 15) return '#ff8c00';
        return '#ff0000';
    };

    const getPerformanceColor = (value: number, threshold: { good: number; ok: number }) => {
        if (value <= threshold.good) return '#00ff00';
        if (value <= threshold.ok) return '#ffff00';
        return '#ff0000';
    };

    const getMemoryColor = (usage: number) => {
        if (usage < 70) return '#00ff00';
        if (usage < 85) return '#ffff00';
        return '#ff0000';
    };

    return (
        <div className={`fps-counter fps-counter--${position}`}>
            <div className="fps-display">
                <span 
                    className="fps-value" 
                    style={{ color: getFpsColor(metrics.fps) }}
                >
                    {metrics.fps}
                </span>
                <span className="fps-label">FPS</span>
            </div>
            
            {showDetails && (
                <div className="fps-details">
                    <div className="performance-grid">
                        <div className="fps-stat">
                            <span className="fps-stat-label">Avg:</span>
                            <span className="fps-stat-value" style={{ color: getFpsColor(metrics.avgFps) }}>
                                {metrics.avgFps}
                            </span>
                        </div>
                        
                        <div className="fps-stat">
                            <span className="fps-stat-label">Min:</span>
                            <span className="fps-stat-value" style={{ color: getFpsColor(metrics.minFps) }}>
                                {metrics.minFps === Infinity ? metrics.fps : metrics.minFps}
                            </span>
                        </div>
                        
                        <div className="fps-stat">
                            <span className="fps-stat-label">Max:</span>
                            <span className="fps-stat-value" style={{ color: getFpsColor(metrics.maxFps) }}>
                                {metrics.maxFps}
                            </span>
                        </div>

                        <div className="fps-stat">
                            <span className="fps-stat-label">Stability:</span>
                            <span className="fps-stat-value" style={{ color: getPerformanceColor(100 - metrics.stability, { good: 10, ok: 25 }) }}>
                                {metrics.stability}%
                            </span>
                        </div>
                        
                        <div className="fps-stat">
                            <span className="fps-stat-label">Frame:</span>
                            <span className="fps-stat-value" style={{ color: getPerformanceColor(metrics.frameTime, { good: 16.67, ok: 33.33 }) }}>
                                {metrics.frameTime.toFixed(2)}ms
                            </span>
                        </div>
                        
                        <div className="fps-stat">
                            <span className="fps-stat-label">Jank:</span>
                            <span className="fps-stat-value" style={{ color: getPerformanceColor(metrics.jank, { good: 5, ok: 15 }) }}>
                                {metrics.jank.toFixed(1)}%
                            </span>
                        </div>

                        <div className="fps-stat">
                            <span className="fps-stat-label">Drops:</span>
                            <span className="fps-stat-value" style={{ color: getPerformanceColor(metrics.frameDrops, { good: 0, ok: 5 }) }}>
                                {metrics.frameDrops}
                            </span>
                        </div>

                        <div className="fps-stat">
                            <span className="fps-stat-label">Idle:</span>
                            <span className="fps-stat-value" style={{ color: getPerformanceColor(16.67 - metrics.idleTime, { good: 8, ok: 12 }) }}>
                                {metrics.idleTime.toFixed(1)}ms
                            </span>
                        </div>

                        <div className="fps-stat">
                            <span className="fps-stat-label">CPU:</span>
                            <span className="fps-stat-value" style={{ color: getPerformanceColor(metrics.cpuUsage, { good: 50, ok: 80 }) }}>
                                {metrics.cpuUsage}%
                            </span>
                        </div>

                        {metrics.memoryUsage > 0 && (
                            <div className="fps-stat">
                                <span className="fps-stat-label">Memory:</span>
                                <span className="fps-stat-value" style={{ color: getMemoryColor(metrics.memoryUsage) }}>
                                    {metrics.memoryUsage} MB
                                </span>
                            </div>
                        )}

                        <div className="fps-stat">
                            <span className="fps-stat-label">Target:</span>
                            <span className="fps-stat-value" style={{ color: metrics.fps >= 60 ? '#00ff00' : '#ff8c00' }}>
                                60fps
                            </span>
                        </div>
                    </div>

                    <div className="performance-bars">
                        <div className="perf-bar">
                            <span className="perf-bar-label">Performance</span>
                            <div className="perf-bar-container">
                                <div 
                                    className="perf-bar-fill" 
                                    style={{ 
                                        width: `${Math.min(100, (metrics.fps / 60) * 100)}%`,
                                        backgroundColor: getFpsColor(metrics.fps)
                                    }}
                                />
                            </div>
                            <span className="perf-bar-value">{Math.round((metrics.fps / 60) * 100)}%</span>
                        </div>

                        <div className="perf-bar">
                            <span className="perf-bar-label">Stability</span>
                            <div className="perf-bar-container">
                                <div 
                                    className="perf-bar-fill" 
                                    style={{ 
                                        width: `${metrics.stability}%`,
                                        backgroundColor: getPerformanceColor(100 - metrics.stability, { good: 10, ok: 25 })
                                    }}
                                />
                            </div>
                            <span className="perf-bar-value">{metrics.stability}%</span>
                        </div>
                    </div>
                    
                    <div className="fps-actions">
                        <button 
                            className="fps-reset" 
                            onClick={resetStats}
                            title="Reset Statistics"
                        >
                            Reset Stats
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}