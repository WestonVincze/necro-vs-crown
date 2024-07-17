class Profiler {
  private measurements: Map<string, number[]> = new Map();

  start(label: string) {
    performance.mark(`${label}-start`);
  }

  end(label: string) {
    performance.mark(`${label}-end`);
    performance.measure(label, `${label}-start`, `${label}-end`);

    const measure = performance.getEntriesByName(label).pop();
    if (measure) {
      if (!this.measurements.has(label)) {
        this.measurements.set(label, []);
      }
      this.measurements.get(label)!.push(measure.duration);
    }

    performance.clearMarks(`${label}-start`);
    performance.clearMarks(`${label}-end`);
    performance.clearMeasures(label);
  }

  getAverageTime(label: string): number {
    const times = this.measurements.get(label);
    if (!times || times.length === 0) return 0;
    return times.reduce((sum, time) => sum + time, 0) / times.length;
  }

  reset() {
    this.measurements.clear();
  }

  logResults() {
    console.log("Profiling Results:");
    for (const [label, times] of this.measurements.entries()) {
      const avg = this.getAverageTime(label);
      console.log(
        `${label}: Avg ${avg.toFixed(2)}ms over ${times.length} calls`,
      );
    }
  }
}

export const profiler = new Profiler();
