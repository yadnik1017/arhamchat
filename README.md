
# Arham Chat

A modern, real-time chat application built with React, Vite, Tailwind CSS, and Supabase. The application features user authentication using email, real-time messaging, and a beautiful UI with animations.

## ✨ Features

- **User Authentication:** Sign up, sign in, and log out with email and password.
- **Real-Time Messaging:** Instantly send and receive messages with live syncing.
- **Conversations List:** View ongoing chats with previews of the most recent message and relative timestamps.
- **Modern UI:** Styled using Tailwind CSS with beautiful interactive animations powered by Motion (Framer Motion).
- **Responsive Design:** A desktop layout with an aesthetic dark mode login panel and a clean, contrasting chat view.

## 🛠️ Tech Stack

- **Frontend:** React 19, TypeScript, Vite
- **Styling:** Tailwind CSS, `clsx`, `tailwind-merge`
- **Icons:** Lucide React
- **Animations:** Motion (Framer Motion)
- **Backend as a Service:** Supabase (Auth, Database, Realtime)

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- [Node.js](https://nodejs.org/en/) (v18 or higher recommended)
- `npm` (comes with Node.js) or `yarn` / `pnpm`
- A [Supabase](https://supabase.com/) account for backend setup.

## 🚀 Local Setup Instructions

Follow these steps to get the project up and running on your local machine.

### 1. Clone the repository

If you haven't already, clone the project locally through your terminal:

```bash
git clone <repository-url>
cd <repository-dirname>
```

### 2. Install dependencies

Install the project dependencies using your preferred package manager (npm handles this natively):

```bash
npm install
```

### 3. Setup Supabase Backend

This project relies on Supabase for Authentication and Real-time Database queries. You need to create a project on Supabase and set up the schema.

1. Go to [Supabase](https://supabase.com/) and create a new project.
2. In your Supabase dashboard, go to the **SQL Editor** and run the following queries to create the necessary tables and policies:

```sql
-- 1. Create profiles table
create table public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  email text not null,
  avatar_url text
);
alter table public.profiles enable row level security;
create policy "Public profiles are viewable by everyone." on profiles for select using (true);
create policy "Users can insert their own profile." on profiles for insert with check (auth.uid() = id);
create policy "Users can update own profile." on profiles for update using (auth.uid() = id);

-- 2. Create conversations table
create table public.conversations (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
alter table public.conversations enable row level security;
create policy "Conversations viewable by participants" on conversations for select using (
  exists (
    select 1 from conversation_participants 
    where conversation_id = conversations.id and user_id = auth.uid()
  )
);
create policy "Users can create conversations" on conversations for insert with check (auth.role() = 'authenticated');

-- 3. Create conversation_participants table
create table public.conversation_participants (
  conversation_id uuid references public.conversations on delete cascade not null,
  user_id uuid references public.profiles on delete cascade not null,
  primary key (conversation_id, user_id)
);
alter table public.conversation_participants enable row level security;
create policy "Viewable by members" on conversation_participants for select using (
  exists (
    select 1 from conversation_participants cp 
    where cp.conversation_id = conversation_participants.conversation_id and cp.user_id = auth.uid()
  )
);
create policy "Users can add participants" on conversation_participants for insert with check (auth.role() = 'authenticated');

-- 4. Create messages table
create table public.messages (
  id uuid default gen_random_uuid() primary key,
  conversation_id uuid references public.conversations on delete cascade not null,
  sender_id uuid references public.profiles on delete cascade not null,
  content text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
alter table public.messages enable row level security;
create policy "Messages viewable by conversation participants" on messages for select using (
  exists (
    select 1 from conversation_participants 
    where conversation_id = messages.conversation_id and user_id = auth.uid()
  )
);
create policy "Users can insert messages" on messages for insert with check (
  auth.uid() = sender_id and
  exists (
    select 1 from conversation_participants 
    where conversation_id = messages.conversation_id and user_id = auth.uid()
  )
);

-- Enable Replication (Realtime) manually for messages and conversations if required.
```

*(Note: Ensure you also enable real-time replication for the `messages` table in the Supabase Database settings > Replication so that chat updates instantly).*

### 4. Setup Environment Variables

1. Navigate to your project root and create a file named `.env`.
2. Add your Supabase project keys (you can find these in Project Settings -> API in your Supabase dashboard).

```env
VITE_SUPABASE_URL=YOUR_SUPABASE_PROJECT_URL
VITE_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
```

> **Warning**: Never commit your `.env` file to version control.

### 5. Run the Development Server

Start the local development server:

```bash
npm run dev
```

Open your browser and visit `http://localhost:3000` to see the application running.

## 📦 Project Scripts

In the project directory, you can run:

- **`npm run dev`**: Starts the Vite development server.
- **`npm run build`**: Builds the app for production to the `dist` folder.
- **`npm run lint`**: Checks for TypeScript errors.
- **`npm run preview`**: Serves the production build locally.

## 📂 Project Structure

```
.
├── src/
│   ├── components/       # React UI Components (LoginView, ChatView, etc.)
│   ├── lib/              # Utility libraries (Supabase client, Tailwind cn utils)
│   ├── App.tsx           # Main application entry point handling Auth/Routing
│   ├── main.tsx          # React application mounting
│   ├── index.css         # Global Styles & Tailwind Directives
│   └── types.ts          # TypeScript Definitions
├── package.json          # Project dependencies & scripts
├── vite.config.ts        # Vite configuration rules
└── README.md             # Project documentation
```

Enjoy using Arham Chat!
