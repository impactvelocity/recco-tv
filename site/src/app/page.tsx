import { Film } from "@/components/film";
import { Hero, Nav } from "@/components/hero";
import { Journey } from "@/components/journey";
import { Demo, Footer, Why } from "@/components/why";

export default function Home() {
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <Film />
        <Journey />
        <Why />
        <Demo />
      </main>
      <Footer />
    </>
  );
}
