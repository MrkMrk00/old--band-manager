export const metadata = {
    title: 'Login',
    description: 'Login page',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return <body>{ children }</body>;
}
