# Shopdeck — Growth Consultant & Seller Mapping Intelligence

A high-performance analytics dashboard designed for Shopdeck to monitor Growth Consultants (GCs), Growth Managers (GMs), Key Account Managers (KAMs), and their mapped seller portfolios from Metabase hits intelligence.

## Features
- **Metabase Hits Synced**: Direct integration with Metabase BigQuery dataset (`hits_seller_gc_mapping`).
- **Supabase Cloud Sync**: Live cloud database hosted on PostgreSQL for real-time querying.
- **Interactive Workload Analytics**: Visualizes GC portfolio capacity, seller counts, and team assignments.
- **Search & Filters**: Instant multi-attribute search by Seller Name, Seller ID, GC, GM, KAM, or WhatsApp Group ID.
- **GC Portfolio Inspector**: Deep-dive modal drawer showing all mapped merchants for each consultant.
- **CSV Data Export**: One-click export for operational reporting.

## Tech Stack
- React 18 + Vite 5
- Supabase Cloud
- Metabase Analytics API
- Lucide Icons
- Deployed on Vercel