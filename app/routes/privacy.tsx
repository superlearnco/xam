import type { Route } from "./+types/privacy";
import { Navbar } from "~/components/homepage/navbar";
import FooterSection from "~/components/homepage/footer";
import { getAuth } from "@clerk/react-router/ssr.server";

export async function loader(args: Route.LoaderArgs) {
  const { userId } = await getAuth(args);

  return {
    isSignedIn: Boolean(userId),
  };
}

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Privacy Policy | XAM" },
    {
      name: "description",
      content:
        "Privacy Policy for XAM - AI-native assessment workspace for teachers",
    },
  ];
}

export default function PrivacyRoute() {
  return (
    <>
      <Navbar loaderData={{ isSignedIn: false }} />
      <main className="min-h-screen bg-background">
        <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="prose prose-slate dark:prose-invert max-w-none">
            <h1 className="text-4xl font-bold mb-8">Privacy Policy</h1>

            <p className="text-muted-foreground mb-8">
              <strong>Last Updated:</strong>{" "}
              {new Date().toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">1. Introduction</h2>
              <p className="mb-4">
                Welcome to XAM ("we," "our," or "us"), an AI-native assessment
                workspace for teachers operated by Superlearn. We are committed
                to protecting your privacy and ensuring the security of your
                personal information. This Privacy Policy explains how we
                collect, use, disclose, and safeguard your information when you
                use our service.
              </p>
              <p className="mb-4">
                By accessing or using XAM, you agree to the collection and use
                of information in accordance with this Privacy Policy. If you do
                not agree with our policies and practices, please do not use our
                service.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">
                2. Information We Collect
              </h2>

              <h3 className="text-xl font-semibold mb-3">
                2.1 Information You Provide
              </h3>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>
                  <strong>Account Information:</strong> When you create an
                  account, we collect your name, email address, and
                  authentication credentials through our authentication
                  provider, Clerk.
                </li>
                <li>
                  <strong>Profile Information:</strong> Any additional profile
                  information you choose to provide, such as your organization
                  name or role.
                </li>
                <li>
                  <strong>Assessment Data:</strong> Tests, quizzes, assignments,
                  questions, rubrics, and other educational content you create
                  using our platform.
                </li>
                <li>
                  <strong>Student Data:</strong> Information about students that
                  you input into the system, including names, email addresses,
                  and assessment submissions.
                </li>
                <li>
                  <strong>Payment Information:</strong> When you subscribe to a
                  paid plan, payment information is processed securely through
                  Polar.sh. We do not store your full payment card details on
                  our servers.
                </li>
                <li>
                  <strong>Communications:</strong> Any messages, feedback, or
                  correspondence you send to us.
                </li>
              </ul>

              <h3 className="text-xl font-semibold mb-3">
                2.2 Automatically Collected Information
              </h3>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>
                  <strong>Usage Data:</strong> Information about how you
                  interact with our service, including pages visited, features
                  used, and time spent on the platform.
                </li>
                <li>
                  <strong>Device Information:</strong> Browser type, device
                  type, operating system, IP address, and other technical
                  information.
                </li>
                <li>
                  <strong>Log Data:</strong> Server logs, error reports, and
                  diagnostic information collected through Sentry for error
                  tracking and debugging.
                </li>
                <li>
                  <strong>Analytics Data:</strong> We use DataBuddy and Vercel
                  Analytics to understand how users interact with our platform,
                  including page views, user flows, and feature usage.
                </li>
              </ul>

              <h3 className="text-xl font-semibold mb-3">
                2.3 AI-Generated Content
              </h3>
              <p className="mb-4">
                When you use our AI-assisted features, we may process your
                content through OpenAI's services to generate questions,
                rubrics, and other educational materials. This content is
                processed in accordance with OpenAI's privacy policies and our
                data processing agreements.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">
                3. How We Use Your Information
              </h2>
              <p className="mb-4">
                We use the information we collect for the following purposes:
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>To provide, maintain, and improve our service</li>
                <li>
                  To process your subscriptions and manage billing through
                  Polar.sh
                </li>
                <li>
                  To authenticate your identity and secure your account through
                  Clerk
                </li>
                <li>
                  To store and manage your assessments and data using Convex
                </li>
                <li>
                  To provide AI-powered features and generate educational
                  content
                </li>
                <li>
                  To send you service-related communications, including updates,
                  security alerts, and support messages
                </li>
                <li>
                  To analyze usage patterns and improve our platform's
                  functionality
                </li>
                <li>
                  To detect, prevent, and address technical issues and security
                  threats
                </li>
                <li>
                  To comply with legal obligations and enforce our Terms of
                  Service
                </li>
                <li>
                  To personalize your experience and provide relevant features
                </li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">
                4. Third-Party Services
              </h2>
              <p className="mb-4">
                We use several third-party services to provide our platform.
                Each service has its own privacy policy governing how they
                handle your data:
              </p>

              <h3 className="text-xl font-semibold mb-3">
                4.1 Authentication (Clerk)
              </h3>
              <p className="mb-4">
                We use Clerk for user authentication and account management.
                Clerk processes your authentication credentials and profile
                information. Please review Clerk's Privacy Policy at{" "}
                <a
                  href="https://clerk.com/privacy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  https://clerk.com/privacy
                </a>
                .
              </p>

              <h3 className="text-xl font-semibold mb-3">
                4.2 Database and Backend (Convex)
              </h3>
              <p className="mb-4">
                We use Convex to store and manage your assessments, user data,
                and application information. Please review Convex's Privacy
                Policy at{" "}
                <a
                  href="https://www.convex.dev/privacy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  https://www.convex.dev/privacy
                </a>
                .
              </p>

              <h3 className="text-xl font-semibold mb-3">
                4.3 Payments (Polar.sh)
              </h3>
              <p className="mb-4">
                We use Polar.sh to process subscription payments and manage
                billing. Payment information is handled securely by Polar.sh.
                Please review Polar.sh's Privacy Policy at{" "}
                <a
                  href="https://polar.sh/privacy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  https://polar.sh/privacy
                </a>
                .
              </p>

              <h3 className="text-xl font-semibold mb-3">
                4.4 AI Services (Vercel & xAI)
              </h3>
              <p className="mb-4">
                We use Vercel as our AI provider, and xAI models for our
                AI-assisted features. Please review Vercel's Privacy Policy at{" "}
                <a
                  href="https://vercel.com/legal/privacy-policy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  https://vercel.com/legal/privacy-policy
                </a>
                .
              </p>

              <h3 className="text-xl font-semibold mb-3">
                4.5 Analytics (DataBuddy & Vercel Analytics)
              </h3>
              <p className="mb-4">
                We use DataBuddy and Vercel Analytics to understand how users
                interact with our platform. These services collect usage data to
                help us improve our service. Please review their privacy
                policies:
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>
                  DataBuddy:{" "}
                  <a
                    href="https://www.databuddy.cc/privacy"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    https://www.databuddy.cc/privacy
                  </a>
                </li>
                <li>
                  Vercel Analytics:{" "}
                  <a
                    href="https://vercel.com/legal/privacy-policy"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    https://vercel.com/legal/privacy-policy
                  </a>
                </li>
              </ul>

              <h3 className="text-xl font-semibold mb-3">
                4.6 Error Tracking (Sentry)
              </h3>
              <p className="mb-4">
                We use Sentry to track and diagnose errors in our application.
                Sentry may collect error logs and diagnostic information. Please
                review Sentry's Privacy Policy at
                <a
                  href="https://sentry.io/privacy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  {" "}
                  https://sentry.io/privacy
                </a>
                .
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">5. Data Security</h2>
              <p className="mb-4">
                We implement appropriate technical and organizational measures
                to protect your information against unauthorized access,
                alteration, disclosure, or destruction. These measures include:
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>Encryption of data in transit using TLS/SSL</li>
                <li>Secure authentication and authorization mechanisms</li>
                <li>Regular security assessments and updates</li>
                <li>Access controls and authentication requirements</li>
                <li>Secure data storage through our third-party providers</li>
              </ul>
              <p className="mb-4">
                However, no method of transmission over the Internet or
                electronic storage is 100% secure. While we strive to use
                commercially acceptable means to protect your information, we
                cannot guarantee absolute security.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">6. Data Retention</h2>
              <p className="mb-4">
                We retain your information for as long as necessary to provide
                our services and fulfill the purposes outlined in this Privacy
                Policy, unless a longer retention period is required or
                permitted by law. When you delete your account, we will delete
                or anonymize your personal information, except where we are
                required to retain it for legal, regulatory, or legitimate
                business purposes.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">
                7. Your Rights and Choices
              </h2>
              <p className="mb-4">
                Depending on your location, you may have certain rights
                regarding your personal information:
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>
                  <strong>Access:</strong> You can access and review your
                  personal information through your account settings
                </li>
                <li>
                  <strong>Correction:</strong> You can update or correct your
                  information at any time through your account settings
                </li>
                <li>
                  <strong>Deletion:</strong> You can request deletion of your
                  account and associated data by contacting us
                </li>
                <li>
                  <strong>Data Portability:</strong> You can export your
                  assessment data through our platform
                </li>
                <li>
                  <strong>Opt-Out:</strong> You can opt out of certain analytics
                  and marketing communications
                </li>
                <li>
                  <strong>Objection:</strong> You can object to certain
                  processing of your information
                </li>
              </ul>
              <p className="mb-4">
                To exercise these rights, please contact us at the email address
                provided in the "Contact Us" section below.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">
                8. Children's Privacy
              </h2>
              <p className="mb-4">
                XAM is designed for use by educators and educational
                institutions. While our platform may be used to manage student
                information, we do not knowingly collect personal information
                directly from children under the age of 13. If you are a parent
                or guardian and believe your child has provided us with personal
                information, please contact us immediately so we can delete such
                information.
              </p>
              <p className="mb-4">
                Educational institutions using our platform are responsible for
                ensuring compliance with applicable laws, including the Family
                Educational Rights and Privacy Act (FERPA) and the Children's
                Online Privacy Protection Act (COPPA).
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">
                9. International Data Transfers
              </h2>
              <p className="mb-4">
                Your information may be transferred to and processed in
                countries other than your country of residence. These countries
                may have data protection laws that differ from those in your
                country. By using our service, you consent to the transfer of
                your information to these countries. We ensure appropriate
                safeguards are in place to protect your information in
                accordance with this Privacy Policy.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">
                10. Changes to This Privacy Policy
              </h2>
              <p className="mb-4">
                We may update this Privacy Policy from time to time. We will
                notify you of any material changes by posting the new Privacy
                Policy on this page and updating the "Last Updated" date. We
                encourage you to review this Privacy Policy periodically to stay
                informed about how we protect your information.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">11. Contact Us</h2>
              <p className="mb-4">
                If you have any questions, concerns, or requests regarding this
                Privacy Policy or our data practices, please contact us at:
              </p>
              <p className="mb-4">
                <strong>Superlearn</strong>
                <br />
                Support Email:{" "}
                <a
                  href="mailto:support@superlearn.cc"
                  className="text-primary hover:underline"
                >
                  support@superlearn.cc
                </a>
                <br />
                Privacy Email: privacy@superlearn.com
                <br />
                Website:{" "}
                <a
                  href="https://superlearn.cc"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  https://superlearn.cc
                </a>
              </p>
            </section>
          </div>
        </div>
      </main>
      <FooterSection />
    </>
  );
}
