# Presentations Site

A modern presentation system built with Next.js, featuring real-time polling and audience interaction.

## Features

- 📊 **Real-time Polling**: Interactive polls with live vote counting
- 🎨 **Terminal Aesthetic**: Low-fi, retro-style design
- 📱 **Mobile-Friendly**: QR codes for easy audience access
- 🔄 **Live Sync**: Presenter slides sync to audience view
- 🎯 **MDX Support**: Write presentations in Markdown with React components

## Environment Setup

Create a `.env.local` file in the root directory with the following variables:

```bash
# Required for all environments
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Required for local development only (presentation management)
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

### Security Model

- **Production**: Only anonymous users can read presentations and vote in polls
- **Development**: Service role key enables presentation creation and management
- **RLS Policies**: Database access is controlled via Row Level Security

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
