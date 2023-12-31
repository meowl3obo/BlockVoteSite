import type { AppProps } from "next/app";
import Head from "next/head";
import MainLayout from "@/layouts/main";
import "@/style/index.scss";

export default ({ Component, pageProps }: AppProps) => {
  return (
    <>
      <Head>
        <title>Default Title</title>
      </Head>
      <MainLayout>
        <Component {...pageProps} />
      </MainLayout>
    </>
  );
};
