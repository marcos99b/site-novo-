#!/bin/zsh
set -euo pipefail

OUT_DIR="${PWD}/diagnostics/system-$(date +%Y%m%d-%H%M%S)"
mkdir -p "$OUT_DIR"

# Duplicar saída para arquivo e stdout
exec > >(tee "$OUT_DIR/summary.txt") 2> >(tee "$OUT_DIR/errors.txt" >&2)

echo "=== BASIC INFO ==="
sw_vers | sed 's/^/  /'
sysctl -n machdep.cpu.brand_string | sed 's/^/  CPU: /'
system_profiler SPHardwareDataType 2>/dev/null | awk '/Memory:|Chip:|Processor Name:|Model Identifier:/{print "  "$0}' || true
echo

echo "=== UPTIME & LOAD ==="
uptime || true
echo

echo "=== TOP CPU PROCESSES ==="
top -l 1 -n 0 -stats pid,command,cpu,threads,state,time -o cpu | head -n 25 || true
echo

echo "=== TOP MEMORY PROCESSES ==="
top -l 1 -n 0 -stats pid,command,mem,physmem,virtmemory -o mem | head -n 25 || true
echo

echo "=== MEMORY PRESSURE ==="
memory_pressure -Q || true
echo

echo "=== VM STAT ==="
vm_stat || true
echo

echo "=== DISK USAGE ==="
df -h | sed 's/^/  /' || true
echo

echo "=== DISK I/O (iostat) ==="
iostat -d -w 1 3 || true
echo

echo "=== POWER & BATTERY ==="
pmset -g batt || true
echo
echo "=== POWER ASSERTIONS (top offenders) ==="
pmset -g assertions || true
echo

echo "=== SPOTLIGHT INDEXING STATUS ==="
mdutil -s / 2>&1 || true
echo

echo "=== THERMAL LOG (last 200 lines) ==="
pmset -g thermlog 2>&1 | tail -n 200 || true
echo

echo "=== RUNNING NODE PROCESSES ==="
ps aux | grep -i '[n]ode' | awk '{printf "%-8s %-6s %-5s %-5s %s\n",$1,$2,$3,$4,substr($0,index($0,$11))}' || true
echo

echo "=== BROWSER HELPER PROCESSES (Chrome/Safari/Edge) ==="
ps aux | egrep -i 'chrome helper|safari web|safari services|edge helper' | egrep -v egrep | awk '{printf "%-8s %-6s %-5s %-5s %s\n",$1,$2,$3,$4,substr($0,index($0,$11))}' || true
echo

echo "=== SYSTEM DAEMONS OF INTEREST ==="
ps aux | egrep 'WindowServer|Dock|syspolicyd|soagent|photoanalysisd|mds|mds_stores|backupd|backupd-helper' | egrep -v egrep || true
echo

echo "Diagnostics saved to: $OUT_DIR"



