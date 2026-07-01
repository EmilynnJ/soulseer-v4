// About page - content to be replaced with verbatim guide text before launch
export default function About() {
  return (
    <div className="min-h-screen bg-gray-950 text-white px-4 py-16">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold text-purple-300 mb-8">About SoulSeer</h1>

        <section className="mb-10">
          <h2 className="text-2xl font-semibold text-purple-200 mb-4">Our Mission</h2>
          <p className="text-gray-300 leading-relaxed">
            SoulSeer is a live psychic reading platform dedicated to connecting seekers with gifted, verified spiritual advisors. Our mission is to make authentic, transformative guidance accessible to everyone, delivered through transparent, pay-per-minute sessions with no hidden fees.
          </p>
        </section>

        <section className="mb-10">
          <h2 className="text-2xl font-semibold text-purple-200 mb-4">Our Readers</h2>
          <p className="text-gray-300 leading-relaxed">
            Every reader on SoulSeer is personally reviewed and approved by our administrative team. We accept only genuine practitioners who demonstrate a consistent track record of accurate, compassionate guidance. Our readers specialize in tarot, astrology, mediumship, clairvoyance, energy healing, and more.
          </p>
        </section>

        <section className="mb-10">
          <h2 className="text-2xl font-semibold text-purple-200 mb-4">How We Work</h2>
          <p className="text-gray-300 leading-relaxed">
            Sessions are conducted live via chat or video call. You fund your account in advance and are charged per minute only while connected with a reader. Sessions can be ended at any time. Readers receive 60% of all session revenue; SoulSeer retains 40% to maintain and improve the platform.
          </p>
        </section>

        <section className="mb-10">
          <h2 className="text-2xl font-semibold text-purple-200 mb-4">Our Community</h2>
          <p className="text-gray-300 leading-relaxed">
            Beyond one-on-one readings, SoulSeer hosts a vibrant community forum where seekers and readers share insights, ask questions, and support one another on their spiritual journeys. We believe in the power of community as much as individual guidance.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-purple-200 mb-4">Contact Us</h2>
          <p className="text-gray-300 leading-relaxed">
            Have questions? Visit our <a href="/help" className="text-purple-400 hover:text-purple-300">Help Center</a> or reach out to our support team. We're here to ensure every experience on SoulSeer is meaningful and trustworthy.
          </p>
        </section>
      </div>
    </div>
  );
}
