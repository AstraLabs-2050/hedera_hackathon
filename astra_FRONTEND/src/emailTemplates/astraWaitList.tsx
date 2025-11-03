import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Link,
  Section,
  Tailwind,
  Text,
} from "@react-email/components";

interface AstraWaitListEmailProps {
  userFullName: string;
}

export const AstraWaitListEmail = ({
  userFullName,
}: AstraWaitListEmailProps) => {
  return (
    <Html>
      <Head />
      <Tailwind>
        <Body className='mx-auto my-auto bg-black font-sans text-white'>
          <Container>
            <Section className='mt-[35px]'>
              <Img
                src='https://res.cloudinary.com/dwzznea6l/image/upload/v1753375044/astraLogo_uiprng_1_woj6o3.png'
                width='200'
                height='40'
                alt='Astra'
                className='mx-auto my-0'
              />
            </Section>

            <Section className='bg-neutral-700/50 text-white/90 px-10 py-2 mt-9'>
              <Text className='text-sm'>
                Hello <strong>{userFullName},</strong>
              </Text>
              <Text className='text-base '>
                Thank you for joining the Astra waitlist. We&apos;re excited to
                have you!
              </Text>
            </Section>

            <Section className='mt-3 px-10'>
              <Text className='text-white/60'>
                Your submission is confirmed, and you’re set to be among the
                first to experience Astra, a platform empowering makers like
                you.
              </Text>
              <Hr style={hr} />
              <Heading as='h2' className='text-white/80 text-sm'>
                What&apos;s Next:
              </Heading>
              <ul className='text-white/60 pl-2 ml-2 text-sm'>
                <li>Early access notifications</li>
                <li>Exclusive updates on our progress</li>
              </ul>

              <Text className='text-white/60 mt-9'>
                Thanks for believing in Astra.
              </Text>
            </Section>

            <Section className='mt-20 bg-neutral-700/50 text-center text-white/60 px-5 py-2'>
              <Text>
                Stay connected via our <Link>socials</Link> or{" "}
                <Link href='https://astra.dev'>website.</Link>
              </Text>

              <Text>&copy; 2025 — astra</Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

export default AstraWaitListEmail;

const hr = {
  borderColor: "#616161ff",
  margin: "24px 0",
};
