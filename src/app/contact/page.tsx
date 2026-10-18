import type { Metadata } from "next";
import PageHeader from "@/components/ui/PageHeader";
import { getSiteConfig } from "@/lib/settings";
import ContactForm from "./ContactForm";

export const metadata: Metadata = {
  title: "Contact",
  description: "Get in touch with the club for enquiries, sponsorships and collaborations.",
};

export const revalidate = 60;

export default async function ContactPage() {
  const config = await getSiteConfig();
  return (
    <>
      <PageHeader
        eyebrow="Contact"
        title="Get in touch"
        lead="Questions about our events, or interested in sponsoring or collaborating? We would be glad to hear from you."
      />
      <ContactForm email={config.contactEmail} phone={config.contactPhone} location={config.location} />
    </>
  );
}
