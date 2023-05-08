import { Roboto_Flex } from 'next/font/google';

const font = Roboto_Flex({ subsets: ['latin-ext']});

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return <body className={font.className}>{children}</body>;
}
