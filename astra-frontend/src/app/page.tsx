"use client";

import Navbar from "@/components/common/navbar";
import JoinAsMakerForm from "@/components/forms/JoinAsMakerForm";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { BsStars } from "react-icons/bs";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import Footer from "@/components/common/Footer";
import { sponsors, steps } from "@/lib/constants";
import Link from "next/link";

// Utility class for repeated gradient border
const gradientBorderClass =
  "relative z-10 overflow-hidden rounded-2xl border-l border-white/40 border-t border-b-0 border-r-0 before:absolute before:bottom-0 before:left-0 before:h-px before:w-full before:bg-gradient-to-r before:from-white/20 before:to-white/10 after:absolute after:top-0 after:right-0 after:w-px after:h-full after:bg-gradient-to-b after:from-white/20 after:to-white/10 before:content-[''] after:content-['']";

const LandingPage = () => {
  const gradientHeadingClass =
    "text-3xl font-bold font-helvetica text-center bg-gradient-to-b from-primary/50 to-white bg-clip-text text-transparent";

  return (
    <main className='dark bg-background text-foreground font-sans relative'>
      <Navbar />

      {/* Hero Section */}
      <section
        id='home'
        className='relative min-h-[500px] h-[80vh] md:h-screen mx-6 md:mx-5 overflow-hidden rounded-t-2xl'>
        <Image
          src='/hero_img.png'
          alt='Fashion design showcase with vibrant fabrics'
          fill
          className='object-cover object-top rounded-t-2xl'
          priority
          sizes='100vw'
          placeholder='blur'
          blurDataURL='/hero_img_placeholder.jpg'
        />
        <div className='absolute inset-0 bg-gradient-to-b from-black/5 via-black/5 to-background/60 md:to-background opacity-100'></div>
        <div className='relative z-20 flex flex-col gap-5 items-center justify-center text-center max-w-2xl h-full mx-auto text-primary px-4'>
          <h1 className='text-5xl md:text-6xl font-semibold font-helvetica bg-gradient-to-b from-primary/40 to-primary bg-clip-text text-transparent leading-tight md:leading-[1.2]'>
            Bring Your Fashion Ideas to Life
          </h1>
          <p className='text-lg text-primary/80'>
            Turn your fashion ideas into custom outfits, made just for you.
          </p>
          <Link
            href='/dashboard/aiagent/chat'
            className='w-52 py-3 bg-white text-black rounded-full mt-5 font-semibold'
            aria-label='Start creating your custom outfit'>
            Start Creating
          </Link>
        </div>
      </section>

      {/* Supported by */}
      <section className='my-32 px-6 md:px-24 md:my-24'>
        <h2 className={gradientHeadingClass}>Supported by</h2>
        <div className='grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-5 items-center justify-center mt-10'>
          {sponsors.map((src) => (
            <figure
              key={src}
              className='relative flex justify-center items-center w-full h-[150px] md:h-[180px] p-6 rounded-xl overflow-hidden hover:scale-105 transition-transform duration-300 border border-neutral-900/90 bg-neutral-900/50 shadow-md'>
              <div className='absolute top-0 right-0 w-full h-full bg-[radial-gradient(ellipse_at_top_right,_rgba(255,255,255,0.07),_transparent)] pointer-events-none z-0' />
              <BsStars
                size={90}
                className='absolute -top-2 -left-2 text-neutral-700/60 z-10'
                aria-hidden='true'
              />
              <Image
                src={src}
                alt={`Logo of sponsor ${src.split("/supported_")[1]?.replace(".png", "")}`}
                width={120}
                height={40}
                className='object-contain z-20 w-auto'
                onError={() =>
                  console.warn(`Failed to load sponsor image: ${src}`)
                }
              />
            </figure>
          ))}
        </div>
      </section>

      {/* How it Works */}
      <section id='how-it-works' className='mb-32 px-6 md:px-20 md:mb-24'>
        <h2 className={gradientHeadingClass}>How It Works</h2>
        <div className='grid md:grid-cols-3 gap-7 md:gap-5 mt-10'>
          {steps.map((step) => (
            <article
              key={step.id}
              className='relative bg-neutral-900 rounded-2xl px-6 py-7 overflow-hidden border border-white/10 hover:shadow-lg transition duration-300 w-full max-w-md mx-auto'>
              <div className='absolute top-0 left-0 right-0 h-56 z-0 pointer-events-none bg-[linear-gradient(to_right,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[length:40px_100%]' />
              <div className='relative z-10 flex flex-col'>
                <figure className='w-full h-72 md:h-56 rounded-lg overflow-hidden mb-8 relative'>
                  <Image
                    src={step.image}
                    alt={step.title}
                    fill
                    className='object-cover object-top'
                    sizes='(max-width: 768px) 100vw, 33vw'
                    onError={() =>
                      console.warn(`Failed to load step image: ${step.image}`)
                    }
                  />
                </figure>
                <div className='space-y-3 text-white'>
                  <h3 className='text-lg font-semibold'>
                    {step.id}. {step.title}
                  </h3>
                  <p className='text-sm text-gray-300'>{step.description}</p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Our Innovation */}
      <section id='innovation' className='mb-32 px-6 md:px-20 md:mb-24'>
        <h2 className={gradientHeadingClass}>Our Innovation</h2>
        <div
          className={`${gradientBorderClass} px-7 py-9 md:p-20 bg-[url('/innovation_bg.jpg')] bg-cover bg-top text-left mt-10`}>
          <div className='relative flex flex-col md:flex-row justify-center items-center gap-8 md:gap-8'>
            <figure className='flex-1 space-y-3 bg-black rounded-xl p-4'>
              <div className='flex justify-center'>
                <Image
                  src='/innovation_starIcon.png'
                  alt='Star icon representing innovation'
                  width={60}
                  height={70}
                  className='h-16 w-auto'
                />
              </div>
              <Image
                src='/innovation_frame.png'
                alt='Blockchain-secured design process illustration'
                width={400}
                height={350}
                className='rounded-lg object-contain w-auto'
                sizes='(max-width: 768px) 100vw, 50vw'
              />
            </figure>
            <div className='flex-1 text-white/70 text-center md:text-left'>
              <p className='md:text-lg leading-relaxed'>
                With Astra on Source, your design is securely stored on the
                blockchain. Payment is released only when milestones are met.
              </p>
              <p className='mt-4 text-base'>
                No middlemen. Just trust, transparency, and tailor-made fashion.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Join The Waitlist */}
      <section id='join' className='relative mb-32 px-6 md:px-20 md:mb-24'>
        <div className='absolute inset-0 -z-10'>
          <Image
            src='/planet_bg.png'
            alt='Decorative planet background'
            fill
            className='opacity-70 object-cover w-auto'
            sizes='100vw'
            placeholder='blur'
            blurDataURL='/planet_bg_placeholder.jpg'
          />
        </div>
        <div className='mb-12 md:mb-10 space-y-5 text-center'>
          <h2 className={gradientHeadingClass}>Join Astra as a Maker</h2>
          <p className='text-white/70 max-w-xl mx-auto'>
            Are you skilled at turning ideas into reality? Join Astra as a maker
            and get daily job opportunities.
          </p>
        </div>
        <div className='flex justify-center'>
          <JoinAsMakerForm />
        </div>
      </section>

      {/* Create Your Own Clothes */}
      <section id='create' className='mb-32 px-6 md:px-20 md:mb-24'>
        <div
          className={`${gradientBorderClass} w-full h-[60vh] md:h-[90vh] bg-[url('/banner.jpg')] bg-cover bg-center`}>
          <div className='absolute inset-0 bg-gradient-to-b from-black/40 to-background/50 opacity-100 rounded-2xl'></div>
          <div className='relative z-20 flex flex-col gap-5 items-center justify-center text-center max-w-3xl h-full mx-auto text-primary px-4'>
            <h2 className='text-4xl md:text-5xl font-semibold font-helvetica bg-gradient-to-b from-primary/70 to-primary/90 bg-clip-text text-transparent leading-tight md:leading-[1.2]'>
              Create Your Own Clothes for Any Special Occasion
            </h2>
            <p className='text-lg text-primary/80 tracking-wide'>
              From weddings to special moments, make something unforgettable.
            </p>
            <Link
              href='/dashboard/aiagent/chat'
              className='w-52 py-3 bg-white text-black rounded-full mt-5 font-semibold'
              aria-label='Start creating custom clothes'>
              Start Creating
            </Link>
          </div>
        </div>
      </section>

      {/* Powered by Astra Token */}
      <section id='presale' className='mb-32 px-6 md:px-20 md:mb-24'>
        <div className="flex flex-col justify-center items-center bg-[url('/bg_stars.png')] bg-cover bg-center">
          <Image
            src='/astra_coin.png'
            alt='Astra utility token illustration'
            width={240}
            height={240}
            className='mb-6 w-auto'
            sizes='(max-width: 768px) 100vw, 240px'
          />
        </div>
        <div className='flex flex-col gap-5 items-center justify-center max-w-2xl h-full mx-auto text-primary px-4 text-center'>
          <h2
            className={`${gradientHeadingClass} leading-tight md:leading-[1.2]`}>
            Powered by the Astra Token
          </h2>
          <p className='text-sm text-primary/80 tracking-wide'>
            A utility token for generating unique designs with AI and voting on
            platform features. Want to be an early investor?
          </p>
          <Button
            size='lg'
            className='md:w-52 py-7 md:py-5 rounded-full mt-5 font-semibold'
            aria-label='Join the Astra token presale'>
            Join Token Presale
          </Button>
        </div>
      </section>

      {/* Frequently Asked Questions */}
      <section id='faq' className='mb-32 px-6 md:px-20'>
        <div
          className={`${gradientBorderClass} flex justify-between items-start flex-wrap gap-12 md:gap-8 px-8 py-12 md:p-20 bg-[url('/innovation_bg.jpg')] bg-cover bg-top`}>
          <h2 className={gradientHeadingClass}>Frequently Asked Questions</h2>
          <Accordion
            type='single'
            collapsible
            className='w-full border-t border-white/20 text-white/50 max-w-md'
            defaultValue='item-1'>
            <AccordionItem value='item-1' className='border-white/20'>
              <AccordionTrigger className='text-white hover:text-white/80'>
                Who owns designs made?
              </AccordionTrigger>
              <AccordionContent className='flex flex-col gap-4 text-balance text-white/70'>
                <p>
                  Design ownership depends on the agreement between the Maker
                  and the project. By default, the Maker retains rights until
                  ownership is transferred through payment or a formal handover.
                </p>
                <p>We encourage clear terms upfront to protect both parties.</p>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value='item-2' className='border-white/20'>
              <AccordionTrigger className='text-white hover:text-white/80'>
                How do you vet Makers?
              </AccordionTrigger>
              <AccordionContent className='flex flex-col gap-4 text-balance text-white/70'>
                <p>
                  Makers undergo a review process checking portfolio links,
                  social presence, and work history to ensure quality and
                  originality.
                </p>
                <p>
                  Our goal is to maintain authenticity without gatekeeping
                  creativity.
                </p>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value='item-3' className='border-white/20'>
              <AccordionTrigger className='text-white hover:text-white/80'>
                What blockchain is used?
              </AccordionTrigger>
              <AccordionContent className='flex flex-col gap-4 text-balance text-white/70'>
                <p>
                  Astra is blockchain-agnostic, supporting Ethereum, Solana,
                  Base, TON, and more. We focus on connecting good design with
                  great ideas, regardless of the chain.
                </p>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </section>

      <Footer />
    </main>
  );
};

export default LandingPage;
