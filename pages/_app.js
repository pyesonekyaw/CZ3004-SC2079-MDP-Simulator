import "@/styles/globals.css";
import Head from "next/head";
import Simulator from "components/Simulator";

export default function App({ Component, pageProps }) {
  return (
   <div className="bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-orange-100 via-orange-200 to-orange-300 min-h-screen overflow-auto">
      <Head>
        <title>MDP Algorithm Simulator</title>
      </Head>
      <Simulator />
    </div>
  );
}
