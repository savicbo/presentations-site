# Presentation Site

This is a [Next.js](https://nextjs.org/) application for creating and delivering interactive presentations with live polls. It uses [MDX](https://mdxjs.com/) for slide content and [Supabase](https://supabase.io/) for the backend.

## Project Structure

The project is structured as a standard Next.js application with the following key directories:

-   `presentations/`: Contains the presentation content, with each presentation in its own subdirectory.
    -   `[presentation-slug]/`:
        -   `presentation.json`: Configuration file for the presentation (title, theme, etc.).
        -   `slides.mdx`: The slide content in MDX format. Slides are separated by `---`.
-   `src/app/`: The main application directory, following the Next.js App Router structure.
    -   `api/`: API routes for handling presentation and poll logic.
    -   `presentation/[slug]/`: The page for viewing a presentation.
    -   `vote/[shortId]/`: The page for audience members to vote on polls.
-   `src/components/`: Reusable React components.
    -   `PresentationViewer.tsx`: The core component for rendering and managing the presentation.
    -   `Poll.tsx`: The component for displaying and interacting with polls.
-   `src/lib/`: Utility functions and libraries.
    -   `presentation-helpers.ts`: Functions for interacting with the Supabase backend for presentations and polls.
    -   `supabase.ts`: Supabase client configuration.
    -   `supabase-server.ts`: Supabase admin client for server-side operations.

## How it Works

1.  **Presentation Loading**: When a user navigates to `/presentation/[slug]`, the `PresentationPage` loads the corresponding `presentation.json` and `slides.mdx` files from the `presentations` directory.
2.  **Presentation Rendering**: The `PresentationViewer` component takes the loaded configuration and slide content and renders the presentation. It parses the MDX content, splitting it into individual slides.
3.  **Supabase Integration**: The application uses Supabase for all backend functionality:
    -   **Presentations**: Presentations are stored in the `web_pres_presentations` table. This table tracks the presentation's title, short ID, and current slide.
    -   **Polls**: Polls are defined within the `slides.mdx` files using a `<Poll>` component. When a presentation is loaded, the polls are created or updated in the `web_pres_polls` and `web_pres_poll_options` tables.
    -   **Voting**: Audience members can vote on polls, and the votes are recorded in the `web_pres_votes` table. The `castVote` function uses a Supabase RPC function (`increment_vote`) to atomically update the vote count.
    -   **Real-time Updates**: The application uses Supabase Realtime to keep the presentation and polls in sync across all clients. The presenter's view and the audience's view are updated in real-time.

## Key Features

-   **MDX-based Slides**: Write presentation slides using Markdown and React components.
-   **Live Polls**: Engage the audience with interactive polls. Polls are the single source of truth from the MDX files.
-   **Real-time Sync**: The presentation state is synced in real-time between the presenter and the audience.
-   **Theming**: Presentations can be themed by specifying a theme in `presentation.json`.
-   **Slide Transitions**: Simple slide transitions are supported.
-   **QR Code**: A QR code is displayed for easy access to the voting page.

## Environment Variables

The application requires the following environment variables:

### Project Information
-   **Supabase Project ID**: `rfsyxucdttqhxgbtleab`

### Required Variables
-   `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL
-   `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anonymous/public API key
-   `SUPABASE_SERVICE_ROLE_KEY`: Your Supabase service role key (server-side only)

### Optional Feature Flags
-   `NEXT_PUBLIC_REFRESH_ENABLED`: Set to `'true'` to show the refresh polls button in the presentation viewer. Defaults to `false` if not set.

## Agentic IDE Usage

When working with this repository, keep the following in mind:

-   **Presentations are file-based**: To create or modify a presentation, edit the files in the `presentations/` directory.
-   **Polls are declarative**: To add or change a poll, edit the `<Poll>` component in the corresponding `slides.mdx` file. The `refresh-polls` API endpoint will automatically update the database.
-   **Supabase is the backend**: All data is stored in Supabase. The schema is defined by the tables mentioned above.
-   **API routes are for server-side logic**: The API routes in `src/app/api/` handle the communication between the client and Supabase.
