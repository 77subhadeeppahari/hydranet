import { Link, useParams } from "react-router-dom";
import { ArrowLeft, FileText, RefreshCcw, ShieldCheck } from "lucide-react";

const POLICIES = {
  terms: {
    eyebrow: "Customer agreement",
    title: "Terms & Conditions",
    intro: "These terms explain the rules that apply when you browse Hydranet’s website or use our broadband, entertainment, installation, and support services.",
    icon: FileText,
    sections: [
      {
        title: "1. Accepting these terms",
        paragraphs: [
          "By visiting this website, submitting an enquiry, placing an order, or using a Hydranet service, you agree to these Terms & Conditions and any plan-specific terms shown at the time of purchase. If you are acting for a business, you confirm that you are authorised to accept these terms for that business.",
        ],
      },
      {
        title: "2. Service eligibility and account information",
        paragraphs: [
          "Service is subject to network coverage, technical feasibility, local permissions, and installation availability at your address. You must provide accurate name, contact, service-address, and identity information and keep it up to date.",
          "You are responsible for keeping your customer credentials secure and for activity performed through your account. Please notify us promptly if you believe your account has been accessed without permission.",
        ],
      },
      {
        title: "3. Plans, installation, and speeds",
        paragraphs: [
          "Plan prices, taxes, validity, included benefits, fair-use limits, router terms, and installation charges are the terms displayed for the selected plan. Promotional benefits may have additional eligibility or validity conditions.",
          "Advertised speeds are maximum or plan speeds and may vary with Wi-Fi conditions, equipment, device capability, local network conditions, and content-provider limits. Hydranet may perform maintenance or upgrades to improve the network.",
        ],
      },
      {
        title: "4. Billing and payments",
        paragraphs: [
          "You agree to pay all applicable charges by the due date using an available payment method. Taxes, late charges, reconnection charges, and other applicable fees will be shown where relevant.",
          "A service may be restricted, suspended, or terminated for overdue amounts after reasonable notice, subject to applicable law. Any payment dispute should be raised with our support team as soon as possible.",
        ],
      },
      {
        title: "5. Acceptable use",
        paragraphs: [
          "You must not use the service to break the law, infringe another person’s rights, distribute malware, interfere with the network, operate unauthorised services that create a security risk, or consume the service in a way that materially harms other customers.",
          "We may investigate suspected misuse and take proportionate action, including blocking traffic, suspending an account, or cooperating with lawful requests from authorities.",
        ],
      },
      {
        title: "6. Equipment and access",
        paragraphs: [
          "Any router or other equipment supplied by Hydranet remains subject to the plan or commercial terms under which it was provided. You must take reasonable care of equipment and allow reasonable access for installation, repair, replacement, or recovery when arranged in advance.",
          "You must not tamper with network equipment, wiring, or Hydranet infrastructure. Charges may apply for avoidable damage, loss, or non-return of equipment where permitted by the applicable plan terms.",
        ],
      },
      {
        title: "7. Availability and liability",
        paragraphs: [
          "We work to provide reliable service, but continuous or fault-free availability cannot be guaranteed. Service may be affected by maintenance, power or fibre cuts, third-party networks, severe weather, or events outside our reasonable control.",
          "To the extent permitted by law, Hydranet is not responsible for indirect or consequential loss, loss of data, or business interruption arising from use or unavailability of the service. Nothing in these terms limits rights or remedies that cannot legally be excluded.",
        ],
      },
      {
        title: "8. Changes and governing law",
        paragraphs: [
          "We may update these terms when our services, technology, or legal obligations change. The current version will be published on this page. Material changes will be communicated through an appropriate customer channel where required.",
          "These terms are governed by the laws of India. Subject to applicable consumer-protection and telecommunications requirements, courts with jurisdiction over West Bengal will have jurisdiction.",
        ],
      },
    ],
  },
  privacy: {
    eyebrow: "Your information",
    title: "Privacy Policy",
    intro: "This policy describes how Hydranet Broadband collects, uses, protects, and shares information when you use our website or broadband services.",
    icon: ShieldCheck,
    sections: [
      {
        title: "1. Information we collect",
        paragraphs: [
          "We may collect your name, phone number, email address, service and billing address, identity or verification details where required, plan and account information, payment status and transaction references, and messages you send to support.",
          "When you use our website or network, we may receive technical information such as IP address, browser or device details, diagnostic information, connection events, and service-performance data. We use cookies or similar technologies needed for site functionality and preferences.",
        ],
      },
      {
        title: "2. How we use information",
        paragraphs: [
          "We use information to check coverage, process orders, install and provide connectivity, manage accounts and payments, respond to support requests, troubleshoot faults, send important service notices, prevent fraud and misuse, and improve our network and customer experience.",
          "Where permitted, we may also send service updates or relevant offers. You can opt out of promotional communications without affecting essential service messages.",
        ],
      },
      {
        title: "3. When information is shared",
        paragraphs: [
          "We may share necessary information with employees, installation and field-service partners, payment and communication providers, technology and hosting providers, and professional advisers who help us operate the service. They are expected to use information only for the relevant purpose and to protect it.",
          "We may disclose information when required by law, legal process, public authority, or to protect customers, Hydranet, our network, or other people. We do not sell personal information as a standalone product.",
        ],
      },
      {
        title: "4. Payments, links, and third parties",
        paragraphs: [
          "Payment providers may process payment details under their own privacy terms. We generally receive payment confirmation and transaction references needed to reconcile your account rather than relying on Hydranet to store full payment credentials.",
          "Our website may link to customer portals, partner services, maps, or other third-party websites. Their privacy practices are controlled by those providers, so please review their notices before submitting information.",
        ],
      },
      {
        title: "5. Retention and security",
        paragraphs: [
          "We retain information for as long as needed to provide services, manage accounts, resolve disputes, meet tax and legal obligations, enforce agreements, and maintain appropriate business records. Retention periods vary by the type and purpose of information.",
          "We use reasonable administrative, technical, and organisational safeguards. No internet transmission or storage system is completely secure, so please use strong passwords and contact us immediately if you suspect unauthorised account activity.",
        ],
      },
      {
        title: "6. Your choices and requests",
        paragraphs: [
          "You may ask us to correct inaccurate account information, explain how your information is used, or address a privacy concern, subject to identity verification and applicable law. You may also unsubscribe from promotional messages using the available instructions.",
          "To make a privacy request, contact help@hydranetbroadband.in. We may need additional details to locate your account and will respond within the period required by applicable law.",
        ],
      },
      {
        title: "7. Children and policy updates",
        paragraphs: [
          "Our services are intended to be purchased or managed by adults. We do not knowingly request personal information directly from children for independent marketing or account creation.",
          "We may update this policy as our services or legal requirements change. The revised version will be posted here with a new update date. Continued use of the service after an update means the revised policy applies to future processing.",
        ],
      },
    ],
  },
  cancellation: {
    eyebrow: "Service changes",
    title: "Cancellation Policy",
    intro: "This policy explains how to cancel or stop renewing a Hydranet broadband service and what happens to outstanding charges, equipment, and refunds.",
    icon: RefreshCcw,
    sections: [
      {
        title: "1. How to request cancellation",
        paragraphs: [
          "The account holder can request cancellation by contacting help@hydranetbroadband.in or calling +91 7864068605. Include your registered name, phone number, customer or account reference if available, service address, and requested cancellation date.",
          "For security, we may verify the account holder before accepting the request. A request is not complete until Hydranet confirms it and provides the effective date or any action still required.",
        ],
      },
      {
        title: "2. When service ends",
        paragraphs: [
          "Cancellation normally takes effect at the end of the current paid service period or on a mutually confirmed date. Access may continue until that date unless you ask us to stop it earlier or we must suspend it for a legal, safety, or security reason.",
          "Stopping a recurring payment or simply disconnecting equipment does not by itself cancel the account. Please obtain written confirmation from Hydranet to avoid further billing or recovery issues.",
        ],
      },
      {
        title: "3. Prepaid plans and refunds",
        paragraphs: [
          "Unless a plan, offer, or applicable law says otherwise, prepaid plan charges and completed installation charges are non-refundable after the service or installation has started. Cancellation stops future renewals and future billing; it does not automatically refund unused days in the current paid period.",
          "If a refund is approved, it will normally be sent to the original payment method after account reconciliation. Bank or payment-provider processing times may vary. Any refundable deposit or credit will be handled after outstanding dues, damage charges, and equipment return are checked.",
        ],
      },
      {
        title: "4. Router and equipment return",
        paragraphs: [
          "If Hydranet-owned equipment was supplied under your plan, keep it safe and arrange its return when requested. Equipment should be returned with its essential accessories in reasonable working condition, excluding ordinary wear and tear.",
          "Failure to return equipment, or returning equipment damaged beyond ordinary wear, may result in a charge where permitted by the plan terms. We will explain the applicable charge before applying it.",
        ],
      },
      {
        title: "5. Moving, changing, or pausing service",
        paragraphs: [
          "If you are moving home, changing plans, or need a temporary pause, contact support before cancelling. We will check whether relocation, plan migration, suspension, or reconnection is available at the new address and explain any applicable charges or validity changes.",
          "A new address is subject to coverage and technical feasibility. A relocation request does not automatically cancel the original service.",
        ],
      },
      {
        title: "6. Cancellation by Hydranet and complaints",
        paragraphs: [
          "Hydranet may suspend or terminate a service for material breach of the Terms & Conditions, non-payment, fraud, unsafe access, unlawful use, or network-protection reasons, subject to notice and applicable law. Amounts already due remain payable.",
          "If you believe a cancellation, charge, or refund was handled incorrectly, contact help@hydranetbroadband.in with your account details. We will review the request and explain the outcome.",
        ],
      },
    ],
  },
};

export default function PolicyPage() {
  const { policy } = useParams();
  const content = POLICIES[policy] || POLICIES.terms;
  const Icon = content.icon;

  return (
    <div className="mx-auto max-w-5xl px-6 lg:px-10 pt-16 pb-24" data-testid={`${policy}-policy-page`}>
      <Link to="/" className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-[#F26B21] transition-colors">
        <ArrowLeft size={15} /> Back to Hydranet
      </Link>

      <header className="mt-12 max-w-3xl">
        <div className="flex items-center gap-3 text-[#F26B21] mb-5">
          <div className="w-11 h-11 rounded-lg grid place-items-center bg-[#F26B21]/10 border border-[#F26B21]/20">
            <Icon size={21} strokeWidth={1.5} />
          </div>
          <div className="hn-overline">{content.eyebrow}</div>
        </div>
        <h1 className="font-display text-5xl lg:text-6xl font-black tracking-tighter text-white">{content.title}</h1>
        <p className="mt-6 text-lg text-slate-300 leading-relaxed">{content.intro}</p>
        <p className="mt-4 text-xs uppercase tracking-widest font-mono-metric text-slate-500">Last updated: 11 August 2026</p>
      </header>

      <article className="mt-14 hn-card rounded-2xl p-7 sm:p-10 lg:p-14">
        <div className="space-y-10">
          {content.sections.map((section) => (
            <section key={section.title}>
              <h2 className="font-display text-2xl font-bold text-white">{section.title}</h2>
              <div className="mt-4 space-y-3 text-slate-300 leading-relaxed">
                {section.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
              </div>
            </section>
          ))}
        </div>

        <div className="mt-12 pt-8 border-t border-white/10">
          <div className="text-xs uppercase tracking-widest font-mono-metric text-[#F26B21]">Questions about this policy?</div>
          <p className="mt-3 text-slate-300">
            Contact <a href="mailto:help@hydranetbroadband.in" className="text-white hover:text-[#F26B21]">help@hydranetbroadband.in</a> or call +91 7864068605.
          </p>
        </div>
      </article>
    </div>
  );
}