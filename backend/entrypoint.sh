#!/bin/sh
# Force IPv4 DNS resolution for Supabase connectivity

# Set environment variables to prefer IPv4
export NODE_OPTIONS="--dns-result-order=ipv4first"

# Also set libc DNS configuration
echo "nameserver 8.8.8.8" > /etc/resolv.conf
echo "nameserver 8.8.4.4" >> /etc/resolv.conf

# Execute Node with IPv4 preference
exec node --dns-result-order=ipv4first dist/server.js
