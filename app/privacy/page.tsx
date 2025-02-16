import { PublicLayout } from "@/app/components/PublicLayout"

export default function PrivacyPolicy() {
  return (
    <PublicLayout>
      <div className="min-h-screen bg-background">
        <main className="container mx-auto px-4 py-12 pt-24">
          <h1 className="font-gugi text-4xl font-bold mb-8 text-rally-coral">Privacy Policy</h1>

          <div className="prose prose-gray max-w-none">
            <p className="text-lg mb-6">Last updated: January 2024</p>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">1. Information We Collect</h2>
              <p>When you use RALLY, we collect the following types of information:</p>
              <ul className="list-disc pl-6 mb-4">
                <li>Vehicle telemetry data (speed, location, energy usage)</li>
                <li>Account information (email, name)</li>
                <li>Device information</li>
                <li>Usage statistics</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">2. How We Use Your Information</h2>
              <p>We use the collected information to:</p>
              <ul className="list-disc pl-6 mb-4">
                <li>Provide and improve our services</li>
                <li>Calculate rewards</li>
                <li>Analyze driving patterns</li>
                <li>Ensure platform security</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">3. Data Protection</h2>
              <p>
                Your data is protected using industry-standard encryption and security measures. We never share your
                personal information with third parties without your explicit consent.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">4. Your Rights</h2>
              <p>You have the right to:</p>
              <ul className="list-disc pl-6 mb-4">
                <li>Access your personal data</li>
                <li>Request data deletion</li>
                <li>Opt out of data collection</li>
                <li>Export your data</li>
              </ul>
            </section>
          </div>
        </main>
      </div>
    </PublicLayout>
  )
}

