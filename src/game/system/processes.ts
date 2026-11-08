// Always-running system processes shown in Task Manager. Apps add their own (see `process` in apps/registry.ts).
export interface ProcessInfo {
  name: string;
  user: string;
  memK: number;
  cpu: number;
  system: boolean;
}

export const SYSTEM_PROCESSES: ProcessInfo[] = [
  { name: "System Idle Process", user: "SYSTEM", memK: 16, cpu: 0, system: true },
  { name: "System", user: "SYSTEM", memK: 236, cpu: 1, system: true },
  { name: "smss.exe", user: "SYSTEM", memK: 388, cpu: 0, system: true },
  { name: "csrss.exe", user: "SYSTEM", memK: 3512, cpu: 1, system: true },
  { name: "winlogon.exe", user: "SYSTEM", memK: 4100, cpu: 0, system: true },
  { name: "services.exe", user: "SYSTEM", memK: 3280, cpu: 0, system: true },
  { name: "lsass.exe", user: "SYSTEM", memK: 1460, cpu: 0, system: true },
  { name: "svchost.exe", user: "SYSTEM", memK: 5020, cpu: 1, system: true },
  { name: "svchost.exe", user: "NETWORK SERVICE", memK: 18770, cpu: 0, system: true },
  { name: "spoolsv.exe", user: "SYSTEM", memK: 4880, cpu: 0, system: true },
  { name: "explorer.exe", user: "User", memK: 21004, cpu: 2, system: true },
];
