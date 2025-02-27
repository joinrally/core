import { PublicLayout } from "@/app/(marketing)/_components/PublicLayout"

export default function TermsOfService() {
  return (
    <PublicLayout>
      <div className="min-h-screen bg-background">
        <main className="container mx-auto px-4 py-12 pt-24">
          <h1 className="font-gugi text-4xl font-bold mb-8 text-rally-coral">Terms of Service</h1>

          <div className="prose prose-gray max-w-none">
            <p className="text-lg mb-6">Last updated: January 2024</p>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">1. Acceptance of Terms</h2>
              <p>
                By accessing or using RALLY, you agree to be bound by these Terms of Service and all applicable laws and
                regulations.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">2. Service Description</h2>
              <p>
                RALLY is a platform that rewards users for sharing their vehicle data. Users can earn cryptocurrency
                rewards for contributing to the RALLY ecosystem.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">3. User Responsibilities</h2>
              <ul className="list-disc pl-6 mb-4">
                <li>Provide accurate information</li>
                <li>Maintain account security</li>
                <li>Comply with all applicable laws</li>
                <li>Not misuse the service</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">4. Rewards Program</h2>
              <p>Rewards are distributed based on:</p>
              <ul className="list-disc pl-6 mb-4">
                <li>Quality of data provided</li>
                <li>Frequency of participation</li>
                <li>Compliance with platform rules</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">5. Termination</h2>
              <p>
                We reserve the right to terminate or suspend access to our service immediately, without prior notice or
                liability, for any reason whatsoever.
              </p>
            </section>
          </div>
        </main>
      </div>
    </PublicLayout>
  )
}

