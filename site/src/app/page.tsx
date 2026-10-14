import { Agent, Measured, SendAnything } from "@/components/agent";
import { BuiltWith, Closing, Footer, Privacy } from "@/components/closing";
import { Film } from "@/components/film";
import { Evening, Hero, Nav } from "@/components/hero";
import { Seasons } from "@/components/seasons";
import { Steps } from "@/components/steps";

export default function Home() {
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <Evening />
        <Film />
        <Steps />
        <SendAnything />
        <Agent />
        <Measured />
        <Seasons />
        <Privacy />
        <BuiltWith />
        <Closing />
      </main>
      <Footer />
    </>
  );
}
