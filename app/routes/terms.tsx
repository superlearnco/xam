import type { Route } from "./+types/terms";
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
    { title: "Terms of Service | XAM" },
    {
      name: "description",
      content: "Terms of Service for XAM - AI-native assessment workspace for teachers",
    },
  ];
}

export default function TermsRoute() {
  return (
    <>
      <Navbar loaderData={{ isSignedIn: false }} />
      <main className="min-h-screen bg-background">
        <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="prose prose-slate dark:prose-invert max-w-none">
            <h1 className="text-4xl font-bold mb-8">Terms of Service</h1>
            
            <p className="text-muted-foreground mb-8">
              <strong>Last Updated:</strong> {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">1. Agreement to Terms</h2>
              <p className="mb-4">
                These Terms of Service ("Terms") constitute a legally binding agreement between you 
                ("User," "you," or "your") and Superlearn ("Company," "we," "us," or "our") 
                governing your access to and use of XAM, an AI-native assessment workspace for 
                teachers (the "Service").
              </p>
              <p className="mb-4">
                By accessing or using the Service, you agree to be bound by these Terms. If you do 
                not agree to these Terms, you may not access or use the Service. These Terms apply 
                to all users, including educators, administrators, and any other individuals who 
                access or use the Service.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">2. Description of Service</h2>
              <p className="mb-4">
                XAM is a cloud-based platform that enables educators to create, manage, and deliver 
                assessments, including tests, quizzes, and assignments. The Service includes:
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>Visual test builder for creating assessments</li>
                <li>AI-assisted question generation and content creation</li>
                <li>Flexible grading and rubric tools</li>
                <li>Student assessment delivery and tracking</li>
                <li>Collaboration features for teams</li>
                <li>Analytics and reporting capabilities</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">3. Account Registration and Security</h2>
              
              <h3 className="text-xl font-semibold mb-3">3.1 Account Creation</h3>
              <p className="mb-4">
                To use the Service, you must create an account by providing accurate, current, and 
                complete information. You are responsible for maintaining the confidentiality of 
                your account credentials and for all activities that occur under your account.
              </p>

              <h3 className="text-xl font-semibold mb-3">3.2 Account Security</h3>
              <p className="mb-4">
                You agree to:
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>Maintain the security of your account credentials</li>
                <li>Notify us immediately of any unauthorized access or use of your account</li>
                <li>Accept responsibility for all activities under your account</li>
                <li>Not share your account credentials with others</li>
                <li>Use the Service only for lawful purposes</li>
              </ul>

              <h3 className="text-xl font-semibold mb-3">3.3 Account Termination</h3>
              <p className="mb-4">
                We reserve the right to suspend or terminate your account at any time, with or 
                without notice, for violation of these Terms or for any other reason we deem 
                necessary to protect the Service or other users.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">4. Acceptable Use</h2>
              
              <h3 className="text-xl font-semibold mb-3">4.1 Permitted Uses</h3>
              <p className="mb-4">You may use the Service only for lawful educational purposes, including:</p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>Creating and managing educational assessments</li>
                <li>Delivering assessments to students</li>
                <li>Grading and providing feedback on student work</li>
                <li>Collaborating with other educators</li>
                <li>Analyzing assessment results and student performance</li>
              </ul>

              <h3 className="text-xl font-semibold mb-3">4.2 Prohibited Uses</h3>
              <p className="mb-4">You agree not to:</p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>Use the Service for any illegal or unauthorized purpose</li>
                <li>Violate any applicable laws, regulations, or third-party rights</li>
                <li>Upload, transmit, or distribute any content that is harmful, offensive, defamatory, or violates intellectual property rights</li>
                <li>Attempt to gain unauthorized access to the Service or its related systems</li>
                <li>Interfere with or disrupt the Service or servers connected to the Service</li>
                <li>Use automated systems (bots, scrapers) to access the Service without permission</li>
                <li>Reverse engineer, decompile, or disassemble any part of the Service</li>
                <li>Resell, sublicense, or redistribute the Service without our written permission</li>
                <li>Use the Service to create assessments that promote discrimination, harassment, or illegal activities</li>
                <li>Collect or harvest information about other users without their consent</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">5. User Content and Intellectual Property</h2>
              
              <h3 className="text-xl font-semibold mb-3">5.1 Your Content</h3>
              <p className="mb-4">
                You retain ownership of all content you create, upload, or submit to the Service 
                ("User Content"), including assessments, questions, rubrics, and student data. 
                By using the Service, you grant us a limited, non-exclusive, worldwide, royalty-free 
                license to use, store, and process your User Content solely for the purpose of 
                providing and improving the Service.
              </p>

              <h3 className="text-xl font-semibold mb-3">5.2 Our Intellectual Property</h3>
              <p className="mb-4">
                The Service, including its software, design, features, and functionality, is owned 
                by Superlearn and protected by copyright, trademark, and other intellectual property 
                laws. You may not copy, modify, distribute, or create derivative works based on the 
                Service without our express written permission.
              </p>

              <h3 className="text-xl font-semibold mb-3">5.3 AI-Generated Content</h3>
              <p className="mb-4">
                Content generated using our AI features may be based on training data from various 
                sources. While you own the content you create, AI-generated content may not be 
                eligible for copyright protection in some jurisdictions. We make no warranties 
                regarding the originality or uniqueness of AI-generated content.
              </p>

              <h3 className="text-xl font-semibold mb-3">5.4 Third-Party Content</h3>
              <p className="mb-4">
                The Service may contain content from third parties, including AI services provided 
                by OpenAI. Such content is subject to the respective third parties' terms and 
                conditions.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">6. Subscriptions and Payments</h2>
              
              <h3 className="text-xl font-semibold mb-3">6.1 Subscription Plans</h3>
              <p className="mb-4">
                We offer various subscription plans with different features and pricing. Current 
                plans include Starter, Scale, and Enterprise tiers. Subscription fees are billed 
                monthly or annually as specified in your chosen plan.
              </p>

              <h3 className="text-xl font-semibold mb-3">6.2 Payment Processing</h3>
              <p className="mb-4">
                Payments are processed securely through Polar.sh. By subscribing, you agree to pay 
                all fees associated with your subscription plan. All fees are non-refundable except 
                as required by law or as otherwise specified in these Terms.
              </p>

              <h3 className="text-xl font-semibold mb-3">6.3 Billing and Renewal</h3>
              <p className="mb-4">
                Subscriptions automatically renew at the end of each billing period unless you 
                cancel before the renewal date. You can cancel your subscription at any time 
                through your account settings or by contacting us. Cancellation will take effect 
                at the end of your current billing period.
              </p>

              <h3 className="text-xl font-semibold mb-3">6.4 Price Changes</h3>
              <p className="mb-4">
                We reserve the right to modify subscription prices at any time. We will provide at 
                least 30 days' notice of any price increases. Price changes will apply to your 
                next billing cycle after the notice period.
              </p>

              <h3 className="text-xl font-semibold mb-3">6.5 Refunds</h3>
              <p className="mb-4">
                Subscription fees are generally non-refundable. However, we may provide refunds 
                at our sole discretion in exceptional circumstances. If you believe you are entitled 
                to a refund, please contact us.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">7. Student Data and Privacy</h2>
              <p className="mb-4">
                If you use the Service to collect, store, or process student information, you are 
                responsible for:
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>Complying with all applicable privacy laws, including FERPA and COPPA</li>
                <li>Obtaining necessary consents from students, parents, or guardians</li>
                <li>Ensuring student data is used only for educational purposes</li>
                <li>Maintaining appropriate security measures for student information</li>
                <li>Providing students and parents with access to their data as required by law</li>
              </ul>
              <p className="mb-4">
                We act as a data processor for student information you provide. You remain the data 
                controller and are responsible for compliance with applicable privacy laws.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">8. Service Availability and Modifications</h2>
              <p className="mb-4">
                We strive to provide reliable service but do not guarantee that the Service will be 
                available at all times or free from errors, interruptions, or security issues. We 
                reserve the right to:
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>Modify, suspend, or discontinue any part of the Service at any time</li>
                <li>Perform maintenance that may temporarily interrupt service</li>
                <li>Update features, functionality, or user interfaces</li>
                <li>Impose usage limits or restrictions</li>
              </ul>
              <p className="mb-4">
                We will make reasonable efforts to notify you of significant service interruptions 
                or changes that may affect your use of the Service.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">9. Disclaimers and Limitations of Liability</h2>
              
              <h3 className="text-xl font-semibold mb-3">9.1 Service "As Is"</h3>
              <p className="mb-4">
                THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, 
                EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO WARRANTIES OF 
                MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, NON-INFRINGEMENT, OR ACCURACY. 
                WE DO NOT WARRANT THAT THE SERVICE WILL BE UNINTERRUPTED, ERROR-FREE, OR SECURE.
              </p>

              <h3 className="text-xl font-semibold mb-3">9.2 AI-Generated Content</h3>
              <p className="mb-4">
                AI-generated content is provided for assistance only. You are responsible for 
                reviewing, editing, and verifying all AI-generated content before use. We do not 
                guarantee the accuracy, completeness, or appropriateness of AI-generated content.
              </p>

              <h3 className="text-xl font-semibold mb-3">9.3 Limitation of Liability</h3>
              <p className="mb-4">
                TO THE MAXIMUM EXTENT PERMITTED BY LAW, WE SHALL NOT BE LIABLE FOR ANY INDIRECT, 
                INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING BUT NOT LIMITED 
                TO LOSS OF PROFITS, DATA, OR USE, ARISING OUT OF OR RELATED TO YOUR USE OF THE 
                SERVICE, REGARDLESS OF THE THEORY OF LIABILITY.
              </p>
              <p className="mb-4">
                OUR TOTAL LIABILITY FOR ANY CLAIMS ARISING OUT OF OR RELATED TO THESE TERMS OR THE 
                SERVICE SHALL NOT EXCEED THE AMOUNT YOU PAID US IN THE TWELVE (12) MONTHS PRIOR TO 
                THE EVENT GIVING RISE TO THE LIABILITY.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">10. Indemnification</h2>
              <p className="mb-4">
                You agree to indemnify, defend, and hold harmless Superlearn, its affiliates, 
                officers, directors, employees, and agents from and against any claims, damages, 
                losses, liabilities, costs, and expenses (including reasonable attorneys' fees) 
                arising out of or related to:
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>Your use of the Service</li>
                <li>Your violation of these Terms</li>
                <li>Your violation of any third-party rights</li>
                <li>Your User Content</li>
                <li>Your handling of student data</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">11. Termination</h2>
              <p className="mb-4">
                Either party may terminate these Terms at any time. You may terminate by canceling 
                your account and discontinuing use of the Service. We may terminate or suspend your 
                access to the Service immediately, without prior notice, for any reason, including 
                violation of these Terms.
              </p>
              <p className="mb-4">
                Upon termination:
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>Your right to use the Service will immediately cease</li>
                <li>We may delete your account and User Content, subject to our data retention policies</li>
                <li>You remain responsible for any fees incurred before termination</li>
                <li>Provisions that by their nature should survive termination will remain in effect</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">12. Governing Law and Dispute Resolution</h2>
              <p className="mb-4">
                These Terms shall be governed by and construed in accordance with the laws of the 
                jurisdiction in which Superlearn operates, without regard to its conflict of law 
                provisions.
              </p>
              <p className="mb-4">
                Any disputes arising out of or related to these Terms or the Service shall be 
                resolved through binding arbitration in accordance with the rules of a recognized 
                arbitration organization, except where prohibited by law. You waive any right to 
                participate in a class-action lawsuit or class-wide arbitration.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">13. Changes to Terms</h2>
              <p className="mb-4">
                We reserve the right to modify these Terms at any time. We will notify you of 
                material changes by posting the updated Terms on this page and updating the "Last 
                Updated" date. Your continued use of the Service after such changes constitutes 
                acceptance of the modified Terms.
              </p>
              <p className="mb-4">
                If you do not agree to the modified Terms, you must stop using the Service and may 
                cancel your account.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">14. Miscellaneous</h2>
              
              <h3 className="text-xl font-semibold mb-3">14.1 Entire Agreement</h3>
              <p className="mb-4">
                These Terms, together with our Privacy Policy, constitute the entire agreement 
                between you and us regarding the Service and supersede all prior agreements and 
                understandings.
              </p>

              <h3 className="text-xl font-semibold mb-3">14.2 Severability</h3>
              <p className="mb-4">
                If any provision of these Terms is found to be unenforceable or invalid, that 
                provision shall be limited or eliminated to the minimum extent necessary, and the 
                remaining provisions shall remain in full force and effect.
              </p>

              <h3 className="text-xl font-semibold mb-3">14.3 Waiver</h3>
              <p className="mb-4">
                Our failure to enforce any right or provision of these Terms shall not constitute 
                a waiver of such right or provision.
              </p>

              <h3 className="text-xl font-semibold mb-3">14.4 Assignment</h3>
              <p className="mb-4">
                You may not assign or transfer these Terms or your account without our prior written 
                consent. We may assign or transfer these Terms or our rights and obligations 
                hereunder without restriction.
              </p>

              <h3 className="text-xl font-semibold mb-3">14.5 Contact Information</h3>
              <p className="mb-4">
                If you have any questions about these Terms, please contact us at:
              </p>
              <p className="mb-4">
                <strong>Superlearn</strong><br />
                Email: legal@superlearn.com<br />
                Website: <a href="https://superlearn.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">https://superlearn.com</a>
              </p>
            </section>
          </div>
        </div>
      </main>
      <FooterSection />
    </>
  );
}

