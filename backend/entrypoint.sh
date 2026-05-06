#!/bin/sh
# Force IPv4 DNS resolution for Supabase connectivity

# Execute Node with IPv4 preference
exec node --dns-result-order=ipv4first dist/server.js
